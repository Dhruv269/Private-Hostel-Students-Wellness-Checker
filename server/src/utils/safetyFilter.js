/**
 * safetyFilter.js - Deterministic Crisis Screening & Emergency Guidance Layer
 * 
 * IMPORTANT SAFETY LIMITATIONS & DISCLOSURE:
 * - Keyword and pattern screening is NOT a certified clinical diagnostic tool.
 * - Pattern matching can produce false negatives (missing implicit distress or nuanced phrasing)
 *   and false positives (flagging benign academic or artistic expressions).
 * - This layer provides defense-in-depth: if immediate self-harm or danger keywords are detected,
 *   we immediately prioritize connecting the student to verified human support and emergency numbers,
 *   rather than relying solely on AI model generation.
 * - This software is an informational reflection prototype and NOT a replacement for human crisis intervention.
 */

// Patterns indicating acute suicidal ideation, intentional self-harm, or severe medical crisis
const CRISIS_PATTERNS = [
  /\b(kill\s+(myself|me)|want\s+to\s+die|commit\s+suicide|end\s+(my\s+life|it\s+all))\b/i,
  /\b(suicidal|suicide\s+(thoughts|plan)|hanging\s+myself|cutting\s+myself)\b/i,
  /\b(better\s+off\s+dead|don'?t\s+want\s+to\s+wake\s+up|no\s+reason\s+to\s+live)\b/i,
  /\b(take\s+all\s+(my\s+)?pills|overdose)\b/i
];

/**
 * Verified Indian Crisis & Emergency Resources (Synced with frontend data)
 */
export const VERIFIED_EMERGENCY_RESOURCES = [
  {
    name: 'Tele-MANAS (Govt of India 24/7 Mental Health)',
    phone: '14416',
    altPhone: '1800 891 4416',
    cost: 'Free & Toll-Free',
    languages: '20+ Indian Languages'
  },
  {
    name: 'KIRAN Mental Health Helpline (Govt of India)',
    phone: '1800-599-0019',
    cost: 'Free & Toll-Free',
    languages: 'Hindi, English, and regional languages'
  },
  {
    name: 'National Emergency Response System',
    phone: '112',
    cost: 'Free Emergency Toll-Free',
    languages: 'Nationwide All-in-One Emergency'
  }
];

/**
 * Screens a user message text for acute crisis indicators.
 * 
 * @param {string} text - The student's chat message
 * @returns {Object} { isCrisis: boolean, matchedPattern: string|null, response: string|null, resources: Array|null }
 */
export function checkCrisisSafety(text) {
  if (!text || typeof text !== 'string') {
    return { isCrisis: false, matchedPattern: null, response: null, resources: null };
  }

  const normalized = text.toLowerCase();

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isCrisis: true,
        matchedPattern: pattern.toString(),
        response: (
          "I hear how much pain and exhaustion you are carrying right now, but please know you do not have to be alone through this. " +
          "HostelWell is only a reflection companion and cannot provide emergency help or reach out on your behalf. " +
          "Please reach out right now to a roommate, hostel warden, trusted family member, or a trained counselor who can be there for you."
        ),
        resources: VERIFIED_EMERGENCY_RESOURCES
      };
    }
  }

  return { isCrisis: false, matchedPattern: null, response: null, resources: null };
}
