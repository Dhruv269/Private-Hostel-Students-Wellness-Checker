import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * WellnessOrb3D - Futuristic Interactive 3D Centerpiece using Three.js
 * 
 * Visual Architecture:
 * - Electric Blue (#1677FF) & Bright Cyan (#00C2FF) luminous physical sphere
 * - Precision dual gyroscopic orbital rings with planetary tilt
 * - Luminous floating particle constellation responding to idle rotation
 * - Subtle pointer-tracking parallax: orb gracefully responds to cursor position
 * - IntersectionObserver to pause rendering when scrolled off-screen (0% GPU idle)
 * - Full prefers-reduced-motion support (renders stationary beauty frame)
 * - Complete resource disposal on unmount (geometries, materials, renderer)
 */
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

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 340;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.9;

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

    // Group to hold all objects for unified cursor parallax
    const visualGroup = new THREE.Group();
    scene.add(visualGroup);

    // 2. Geometries & Materials
    // Central Physical Glass Wellness Core (Bright Cyan with Electric Blue Emissive)
    const sphereGeo = new THREE.IcosahedronGeometry(1.15, 4);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x00c2ff,
      emissive: 0x081e42,
      emissiveIntensity: 0.8,
      roughness: 0.18,
      metalness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: 0.90
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    visualGroup.add(coreSphere);

    // Inner Geometric Wireframe Lattice (Electric Blue Structure)
    const wireGeo = new THREE.IcosahedronGeometry(1.22, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1677ff,
      wireframe: true,
      transparent: true,
      opacity: 0.38
    });
    const wireCage = new THREE.Mesh(wireGeo, wireMat);
    visualGroup.add(wireCage);

    // Primary Gyroscopic Orbital Ring (Bright Cyan Harmony Ring)
    const ringGeo1 = new THREE.TorusGeometry(1.9, 0.04, 16, 120);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x00c2ff,
      emissive: 0x063060,
      roughness: 0.22,
      metalness: 0.82
    });
    const orbitalRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    orbitalRing1.rotation.x = Math.PI / 3.2;
    orbitalRing1.rotation.y = Math.PI / 6.5;
    visualGroup.add(orbitalRing1);

    // Secondary Orbital Counter-Ring (Electric Blue Balance Ring)
    const ringGeo2 = new THREE.TorusGeometry(2.15, 0.022, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x1677ff,
      emissive: 0x051a3d,
      roughness: 0.28,
      metalness: 0.75,
      transparent: true,
      opacity: 0.75
    });
    const orbitalRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    orbitalRing2.rotation.x = -Math.PI / 4.2;
    orbitalRing2.rotation.y = -Math.PI / 5.5;
    visualGroup.add(orbitalRing2);

    // Floating Orbital Particle Constellation
    const particleCount = 48;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 1.7 + Math.random() * 0.7;

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00c2ff,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    visualGroup.add(particleCloud);

    // 3. Cinematic Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0x080b12, 1.5);
    scene.add(ambientLight);

    const electricBlueLight = new THREE.PointLight(0x1677ff, 4.5, 14);
    electricBlueLight.position.set(3.5, 3.5, 4.0);
    scene.add(electricBlueLight);

    const cyanLight = new THREE.PointLight(0x00c2ff, 3.8, 12);
    cyanLight.position.set(-3.5, -2.5, -2.0);
    scene.add(cyanLight);

    const softBlueFill = new THREE.PointLight(0x60a5fa, 1.8, 10);
    softBlueFill.position.set(0.0, -3.0, 3.0);
    scene.add(softBlueFill);

    // 4. Motion Preferences, Mouse Parallax & Intersection Observer
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isVisible = true;
    let animationFrameId;

    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (
        clientX >= rect.left - 150 &&
        clientX <= rect.right + 150 &&
        clientY >= rect.top - 150 &&
        clientY <= rect.bottom + 150
      ) {
        const x = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const y = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        targetRotY = x * 0.45;
        targetRotX = -y * 0.35;
      } else {
        targetRotX = 0;
        targetRotY = 0;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const renderFrame = () => {
      renderer.render(scene, camera);
    };

    let clockTime = 0;

    const animate = () => {
      if (isVisible && !prefersReducedMotion) {
        clockTime += 0.015;

        // Smooth breathing rotation
        coreSphere.rotation.y += 0.0035;
        coreSphere.rotation.x += 0.0018;

        wireCage.rotation.y -= 0.0022;
        wireCage.rotation.z += 0.0015;

        orbitalRing1.rotation.z += 0.0042;
        orbitalRing1.rotation.x += 0.0012;

        orbitalRing2.rotation.z -= 0.0034;
        orbitalRing2.rotation.y += 0.0018;

        particleCloud.rotation.y += 0.0015;

        // Subtle organic breathing scale
        const breath = 1.0 + Math.sin(clockTime * 0.8) * 0.025;
        coreSphere.scale.set(breath, breath, breath);

        // Smooth pointer tracking interpolation
        visualGroup.rotation.y += (targetRotY - visualGroup.rotation.y) * 0.06;
        visualGroup.rotation.x += (targetRotX - visualGroup.rotation.x) * 0.06;

        renderFrame();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    // Render initial stationary frame
    renderFrame();

    if (!prefersReducedMotion) {
      animate();
    }

    // Pause loop when scrolled out of view to consume 0% GPU idle
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Responsive Canvas Resize
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

    // 5. Clean Resource Disposal on Unmount
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      sphereGeo.dispose();
      sphereMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
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
      aria-label="Interactive 3D electric blue wellness orb symbolizing quiet balance"
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
