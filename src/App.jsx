import React, { useState, useMemo, useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/dashboard/Dashboard';
import DailyCheckIn from './components/checkin/DailyCheckIn';
import HistoryView from './components/history/HistoryView';
import ReflectionPrompts from './components/reflection/ReflectionPrompts';
import SupportResources from './components/resources/SupportResources';
import PrivacyNotice from './components/privacy/PrivacyNotice';
import WellnessChat from './components/chat/WellnessChat';
import { INITIAL_SYNTHETIC_CHECKINS } from './data/mockData';
import { getTodayDateString } from './utils/dateUtils';

function getInitialTheme() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('hostelwell-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Ignore read errors
    }
  }
  return 'dark';
}

function getInitialCalmMode() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('hostelwell-calm-mode');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
      }
    } catch {
      // Ignore read errors
    }
  }
  return false;
}

export default function App() {
  // Navigation state: determines which page/tab is currently visible
  const [activeTab, setActiveTab] = useState('dashboard');

  // Theme state: defaults to dark for cinematic aesthetic
  const [theme, setTheme] = useState(getInitialTheme);

  // User-controlled Calm Mode: softens motion, reduces glow, stills parallax
  const [calmMode, setCalmMode] = useState(getInitialCalmMode);

  // Sync theme attribute on <html> and persist to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('hostelwell-theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Sync calm mode attribute on <html> and persist to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-calm-mode', calmMode ? 'true' : 'false');
    try {
      localStorage.setItem('hostelwell-calm-mode', calmMode ? 'true' : 'false');
    } catch {
      // Ignore storage errors
    }
  }, [calmMode]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleCalmMode = () => {
    setCalmMode((prev) => !prev);
  };

  // Lenis smooth scrolling integration with active resize handling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let lenisInstance;
    let rafId;

    try {
      lenisInstance = new Lenis({
        duration: 0.95,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        syncTouch: false, // NEVER hijack mobile/trackpad touch gestures
      });

      const raf = (time) => {
        lenisInstance.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      // Re-calculate page scroll height as cards, 3D orb, and content expand
      const handleResize = () => {
        if (lenisInstance) lenisInstance.resize();
      };

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(document.body);

      const timer = setTimeout(handleResize, 150);
      const timer2 = setTimeout(handleResize, 600);

      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        resizeObserver.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        if (lenisInstance) lenisInstance.destroy();
      };
    } catch (e) {
      console.warn('Lenis smooth scrolling bypassed:', e);
    }
  }, [activeTab]);

  // Application data state: initialized with our 6 synthetic past demo check-ins
  const [checkIns, setCheckIns] = useState(INITIAL_SYNTHETIC_CHECKINS);

  /**
   * Derived State: Find if there is an existing check-in matching today's local date.
   */
  const todayCheckIn = useMemo(() => {
    const currentLocalDate = getTodayDateString();
    return checkIns.find((item) => item.date === currentLocalDate);
  }, [checkIns]);

  /**
   * Save Handler Callback:
   */
  const handleSaveCheckIn = (newRecord) => {
    setCheckIns((previousList) => {
      const existingIndex = previousList.findIndex((item) => item.date === newRecord.date);

      if (existingIndex >= 0) {
        const updatedList = [...previousList];
        updatedList[existingIndex] = newRecord;
        return updatedList;
      } else {
        return [...previousList, newRecord];
      }
    });
  };

  return (
    <div className="app-container">
      {/* Immersive Midnight Sanctuary background layers */}
      <div className="app-ambient-background" aria-hidden="true">
        <div className="ambient-nebula-top" />
        <div className="ambient-nebula-bottom" />
        <div className="ambient-celestial-dust" />
      </div>

      {/* Floating Oval Glass Navbar with Calm Mode and Theme Toggles */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        hasCheckedInToday={Boolean(todayCheckIn)} 
        theme={theme}
        toggleTheme={toggleTheme}
        calmMode={calmMode}
        toggleCalmMode={toggleCalmMode}
      />

      {/* Main Content Area */}
      <main className="main-content" id="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            checkIns={checkIns} 
            todayCheckIn={todayCheckIn} 
            setActiveTab={setActiveTab} 
            calmMode={calmMode}
          />
        )}

        {activeTab === 'checkin' && (
          <DailyCheckIn 
            todayCheckIn={todayCheckIn} 
            onSaveCheckIn={handleSaveCheckIn} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'chat' && (
          <WellnessChat setActiveTab={setActiveTab} />
        )}

        {activeTab === 'history' && (
          <HistoryView 
            checkIns={checkIns} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'reflections' && (
          <ReflectionPrompts />
        )}

        {activeTab === 'support' && (
          <SupportResources />
        )}

        {activeTab === 'privacy' && (
          <PrivacyNotice />
        )}
      </main>

      {/* Refined Midnight Glass Footer with Calm Mode Status */}
      <Footer 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        calmMode={calmMode}
        toggleCalmMode={toggleCalmMode}
      />
    </div>
  );
}
