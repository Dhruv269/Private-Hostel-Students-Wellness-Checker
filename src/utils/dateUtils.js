/**
 * Date Utility Functions
 * 
 * Centralized date helpers for consistent date formatting across the app.
 * All functions expect or return dates in the standard ISO date string format: 'YYYY-MM-DD'
 * Example: '2026-10-24'
 * 
 * WHY LOCAL TIMEZONE MATTERS:
 * In previous versions, `new Date().toISOString().split('T')[0]` was used.
 * However, `.toISOString()` converts time to UTC. In India (UTC+05:30), late at night
 * between 12:00 AM midnight and 5:30 AM, UTC is still on the previous calendar day!
 * 
 * To ensure hostel students checking in late at night have their check-in recorded on
 * their actual local calendar day, these functions extract the local year, month, and date
 * using JavaScript's local date methods (`getFullYear()`, `getMonth()`, `getDate()`).
 */

/**
 * Helper to format a Date instance into a local 'YYYY-MM-DD' string.
 * Uses local calendar date instead of UTC to avoid timezone rollback errors.
 * 
 * @param {Date} [dateObj=new Date()] - JavaScript Date instance
 * @returns {string} e.g. "2026-10-24"
 */
function formatToLocalDateString(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  // Months are 0-indexed in JavaScript (0 = January, 11 = December), so we add 1
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in the user's local timezone as a 'YYYY-MM-DD' string.
 * Used when saving a new check-in and verifying if today was already recorded.
 * 
 * @returns {string} e.g. "2026-10-24"
 */
export function getTodayDateString() {
  return formatToLocalDateString(new Date());
}

/**
 * Generates a local date string for a given number of days in the past.
 * Used primarily for generating realistic synthetic dates for past demo check-ins.
 * 
 * @param {number} daysAgo - How many days back from today (e.g. 1 for yesterday)
 * @returns {string} e.g. "2026-10-23"
 */
export function getPastDateString(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatToLocalDateString(date);
}

/**
 * Helper to safely parse a 'YYYY-MM-DD' string into a local Date instance.
 * Parsing via numeric components avoids browser-specific string parsing quirks.
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {Date}
 */
function parseLocalDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a 'YYYY-MM-DD' date string into a friendly, readable format for students.
 * Example: '2026-10-24' -> "24 Oct 2026"
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string} e.g. "24 Oct 2026"
 */
export function formatDisplayDate(dateStr) {
  try {
    const date = parseLocalDateString(dateStr);
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
 * Used for horizontal axis labels on the trend bar charts.
 * Example: '2026-10-24' -> "Sat"
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string} e.g. "Mon", "Tue", "Wed"
 */
export function getShortDayName(dateStr) {
  try {
    const date = parseLocalDateString(dateStr);
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  } catch {
    return dateStr;
  }
}
