/**
 * Date Utility Functions
 * 
 * Centralized date helpers for consistent date formatting across the app.
 * All functions expect or return dates in the standard ISO date string format: 'YYYY-MM-DD'
 * Example: '2026-10-24'
 */

/**
 * Returns today's date formatted as a 'YYYY-MM-DD' string.
 * Used when recording new check-ins and checking if the user already checked in today.
 * 
 * @returns {string} e.g. "2026-10-24"
 */
export function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Generates a date string for a given number of days in the past.
 * Used primarily for generating realistic synthetic dates for past demo check-ins.
 * 
 * @param {number} daysAgo - How many days back from today (e.g. 1 for yesterday)
 * @returns {string} e.g. "2026-10-23"
 */
export function getPastDateString(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Formats a 'YYYY-MM-DD' date string into a friendly, readable format for students.
 * Appending 'T00:00:00' prevents timezone shifts when parsing ISO date strings.
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string} e.g. "24 Oct 2026"
 */
export function formatDisplayDate(dateStr) {
  try {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Returns the short 3-letter weekday name for a 'YYYY-MM-DD' date string.
 * Used for the horizontal axis labels on the 7-day trend charts.
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string} e.g. "Mon", "Tue", "Wed"
 */
export function getShortDayName(dateStr) {
  try {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  } catch {
    return dateStr;
  }
}
