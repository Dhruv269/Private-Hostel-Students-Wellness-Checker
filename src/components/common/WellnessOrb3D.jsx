import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * WellnessOrb3D - Lightweight 3D Centerpiece using Three.js
 * 
 * Features:
 * - Serene, slowly rotating emerald glass orb and sculptural orbital ring
 * - Lightweight geometry and custom lighting (ambient + emerald point lights)
 * - IntersectionObserver to pause rendering when scrolled off-screen (0% GPU idle)
 * - Respects prefers-reduced-motion (renders static frame without continuous animation)
 * - Graceful CSS 3D fallback if WebGL is unavailable
 * - Full memory disposal on unmount (geometries, materials, renderer)
 */
// Detect WebGL capability safely outside component render
function checkWebGLCapability() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function WellnessOrb3D({ className = '' }) {
  const mountRef = useRef(null);
  const [webGLSupported] = useState(checkWebGLCapability);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webGLSupported) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.8;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power'
      });
    } catch (e) {
      console.warn('WebGLRenderer initialization failed:', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // 2. Geometries & Materials
    // Central Emerald Wellness Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(1.15, 3);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x7ddfb3,
      emissive: 0x0a281c,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      wireframe: false,
      transparent: true,
      opacity: 0.88
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(coreSphere);

    // Inner subtle wireframe cage to evoke mindful structure
    const wireGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xa7f3d0,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const wireCage = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireCage);

    // Outer Sculptural Orbital Ring (representing harmony & balance)
    const ringGeo = new THREE.TorusGeometry(1.85, 0.045, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x7ddfb3,
      emissive: 0x064e3b,
      roughness: 0.3,
      metalness: 0.6
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 3;
    orbitalRing.rotation.y = Math.PI / 6;
    scene.add(orbitalRing);

    // Secondary subtle counter-ring
    const ringGeo2 = new THREE.TorusGeometry(2.05, 0.02, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.35
    });
    const counterRing = new THREE.Mesh(ringGeo2, ringMat2);
    counterRing.rotation.x = -Math.PI / 4;
    counterRing.rotation.y = -Math.PI / 5;
    scene.add(counterRing);

    // 3. Subtle Lighting
    const ambientLight = new THREE.AmbientLight(0x12191b, 1.2);
    scene.add(ambientLight);

    const emeraldLight = new THREE.PointLight(0x7ddfb3, 3.5, 12);
    emeraldLight.position.set(3, 3, 4);
    scene.add(emeraldLight);

    const tealLight = new THREE.PointLight(0x2dd4bf, 2.0, 10);
    tealLight.position.set(-3, -2, -2);
    scene.add(tealLight);

    // 4. Motion Preferences & Intersection Observer
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isVisible = true;
    let animationFrameId;

    const renderFrame = () => {
      renderer.render(scene, camera);
    };

    const animate = () => {
      if (isVisible && !prefersReducedMotion) {
        // Slow, organic breathing rotation
        coreSphere.rotation.y += 0.0035;
        coreSphere.rotation.x += 0.0018;

        wireCage.rotation.y -= 0.002;
        wireCage.rotation.z += 0.0015;

        orbitalRing.rotation.z += 0.004;
        orbitalRing.rotation.x += 0.001;

        counterRing.rotation.z -= 0.003;

        renderFrame();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    // Render initial frame
    renderFrame();

    // Only run continuous loop if motion is preferred
    if (!prefersReducedMotion) {
      animate();
    }

    // Pause loop when scrolled off-screen to preserve CPU/GPU
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
        renderFrame();
      }
    };
    window.addEventListener('resize', handleResize);

    // 5. Cleanup on unmount
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js resources
      sphereGeo.dispose();
      sphereMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [webGLSupported]);

  return (
    <div 
      className={`wellness-orb-container ${className}`} 
      ref={mountRef}
      role="img"
      aria-label="3D emerald wellness orb representing balance and inner calm"
    >
      {!webGLSupported && (
        <div className="wellness-orb-fallback">
          <div className="fallback-orb-glow" />
          <div className="fallback-orb-core" />
          <div className="fallback-orb-ring" />
        </div>
      )}
    </div>
  );
}
