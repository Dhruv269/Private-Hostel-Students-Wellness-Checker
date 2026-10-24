/**
 * App.jsx - Main Application Shell & State Container
 * 
 * HOW THIS FILE WORKS:
 * In React, state is typically kept at the highest common parent of the components
 * that need it. This pattern is known as "Lifting State Up".
 * 
 * Here, App.jsx manages:
 * 1. `activeTab` - which screen the student is currently viewing ('dashboard', 'checkin', etc.)
 * 2. `checkIns` - the in-memory array of all past and newly submitted check-ins
 * 3. `handleSaveCheckIn` - the function that receives a new check-in from DailyCheckIn.jsx
 *    and adds or updates it in the array.
 * 
 * When `checkIns` updates, React automatically re-renders App.jsx and recalculates
 * `todayCheckIn`, instantly updating both the Dashboard and the History view!
 */

import React, { useState, useMemo } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/dashboard/Dashboard';
import DailyCheckIn from './components/checkin/DailyCheckIn';
import HistoryView from './components/history/HistoryView';
import ReflectionPrompts from './components/reflection/ReflectionPrompts';
import SupportResources from './components/resources/SupportResources';
import PrivacyNotice from './components/privacy/PrivacyNotice';
import { INITIAL_SYNTHETIC_CHECKINS } from './data/mockData';
import { getTodayDateString } from './utils/dateUtils';

export default function App() {
  // Navigation state: determines which page/tab is currently visible
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application data state: initialized with our 6 synthetic past demo check-ins
  const [checkIns, setCheckIns] = useState(INITIAL_SYNTHETIC_CHECKINS);

  // Today's date string ('YYYY-MM-DD'). Stored in state to keep rendering pure.
  const [todayDate] = useState(() => getTodayDateString());

  /**
   * Derived State: Find if there is an existing check-in matching today's date.
   * `useMemo` caches this result so we only search the array when `checkIns` changes.
   * Returns: the check-in object if found, or undefined if not yet recorded today.
   */
  const todayCheckIn = useMemo(() => {
    return checkIns.find((item) => item.date === todayDate);
  }, [checkIns, todayDate]);

  /**
   * Save Handler Callback:
   * Passed down to DailyCheckIn.jsx as the `onSaveCheckIn` prop.
   * When the student submits the form:
   * 1. If a check-in for today already exists, we replace it (updating their log).
   * 2. If it's a new check-in, we append it to the existing array.
   * 
   * @param {Object} newRecord - The check-in object containing mood, stress, energy, note, etc.
   */
  const handleSaveCheckIn = (newRecord) => {
    setCheckIns((previousList) => {
      const existingIndex = previousList.findIndex((item) => item.date === newRecord.date);

      if (existingIndex >= 0) {
        // Today was already recorded: create a copy of the array and update the record
        const updatedList = [...previousList];
        updatedList[existingIndex] = newRecord;
        return updatedList;
      } else {
        // First check-in today: add the new record to the list
        return [...previousList, newRecord];
      }
    });
  };

  return (
    <div className="app-container">
      {/* 
        Navbar receives:
        - activeTab & setActiveTab to display active links and switch screens
        - hasCheckedInToday to show a "Pending" badge on the Daily Check-In tab if needed
      */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        hasCheckedInToday={Boolean(todayCheckIn)} 
      />

      {/* Main Content Area: Conditionally renders the active view based on activeTab */}
      <main className="main-content" id="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            checkIns={checkIns} 
            todayCheckIn={todayCheckIn} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'checkin' && (
          <DailyCheckIn 
            todayCheckIn={todayCheckIn} 
            onSaveCheckIn={handleSaveCheckIn} 
            setActiveTab={setActiveTab} 
          />
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

      {/* Accessible Footer with emergency contacts and quick navigation */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
