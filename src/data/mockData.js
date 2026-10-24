/**
 * Static Data & Verified Indian Resources
 * 
 * WHY THIS FILE EXISTS:
 * During Stage 2 (Frontend Foundation), we do not have a live database or AI backend.
 * This file provides:
 * 1. Standard definitions for moods, stress, and energy scales.
 * 2. Realistic synthetic past check-ins so students can immediately see the history and trend charts working.
 * 3. Pre-written reflection prompts (crafted specifically for student/hostel life).
 * 4. Real, verified Indian mental health helplines (accurate numbers to ensure student safety).
 */

import { getPastDateString } from '../utils/dateUtils';

// ============================================================================
// 1. Scale Definitions (Mood, Stress, Energy)
// ============================================================================

/**
 * 5 discrete mood options designed to avoid medicalized or diagnostic language.
 * Each has an emoji for quick recognition and a short description to guide self-reflection.
 */
export const MOOD_DEFINITIONS = [
  { id: 'great', label: 'Great', emoji: '🌟', description: 'Feeling upbeat, accomplished, or energized' },
  { id: 'good', label: 'Good', emoji: '😊', description: 'Calm, steady, and generally content' },
  { id: 'okay', label: 'Okay', emoji: '😐', description: 'Neutral day, going through the daily routine' },
  { id: 'low', label: 'Low', emoji: '🌧️', description: 'Drained, tired, or feeling disconnected' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😣', description: 'Under heavy stress, deadlines, or pressure' }
];

/**
 * Helper function to look up a mood object by its ID string.
 * Example: getMoodById('good') returns { id: 'good', label: 'Good', emoji: '😊', ... }
 * If the mood is not found, returns null safely.
 */
export function getMoodById(moodId) {
  return MOOD_DEFINITIONS.find((item) => item.id === moodId) || null;
}

/**
 * 1 to 5 scale for academic and life stress.
 * Level 1 is very low pressure, while Level 5 indicates severe tension or overload.
 */
export const STRESS_LEVELS = [
  { level: 1, label: 'Very Low', hint: 'Relaxed and peaceful' },
  { level: 2, label: 'Manageable', hint: 'Light workload, handling things fine' },
  { level: 3, label: 'Moderate', hint: 'Noticeable pressure or deadlines' },
  { level: 4, label: 'High', hint: 'Feeling tense or finding it hard to unwind' },
  { level: 5, label: 'Extreme', hint: 'Overstretched, need immediate pause' }
];

/**
 * 1 to 5 scale for physical and mental stamina.
 * Level 1 is exhausted, while Level 5 is fully energized and alert.
 */
export const ENERGY_LEVELS = [
  { level: 1, label: 'Exhausted', hint: 'Barely staying awake, battery on empty' },
  { level: 2, label: 'Low', hint: 'Tired, moving slowly through tasks' },
  { level: 3, label: 'Moderate', hint: 'Enough energy for normal classes/study' },
  { level: 4, label: 'Good', hint: 'Active, focused, and alert' },
  { level: 5, label: 'High', hint: 'Full battery, vibrant and motivated' }
];

// ============================================================================
// 2. Synthetic Demo Check-Ins
// ============================================================================

/**
 * Realistic past check-in records spanning the prior 6 days.
 * Notice the 'isSynthetic: true' flag: this allows the UI to visibly label
 * sample entries vs. check-ins the student actually logged during their session.
 */
export const INITIAL_SYNTHETIC_CHECKINS = [
  {
    id: 'demo-1',
    date: getPastDateString(6),
    mood: 'good',
    moodLabel: 'Good',
    stress: 2,
    energy: 4,
    note: 'Weekend was quiet. Caught up on laundry and had chai with hostel friends.',
    isSynthetic: true
  },
  {
    id: 'demo-2',
    date: getPastDateString(5),
    mood: 'okay',
    moodLabel: 'Okay',
    stress: 3,
    energy: 3,
    note: 'First day of the week. Back-to-back lectures and lab submission announced.',
    isSynthetic: true
  },
  {
    id: 'demo-3',
    date: getPastDateString(4),
    mood: 'low',
    moodLabel: 'Low',
    stress: 4,
    energy: 2,
    note: 'Noisy corridor kept me awake till 2 AM. Mess food was uninspiring today.',
    isSynthetic: true
  },
  {
    id: 'demo-4',
    date: getPastDateString(3),
    mood: 'overwhelmed',
    moodLabel: 'Overwhelmed',
    stress: 5,
    energy: 2,
    note: 'Mid-sem project evaluation due tomorrow morning. Group project sync took forever.',
    isSynthetic: true
  },
  {
    id: 'demo-5',
    date: getPastDateString(2),
    mood: 'okay',
    moodLabel: 'Okay',
    stress: 3,
    energy: 3,
    note: 'Evaluation finished. Prof gave decent feedback. Slept for an hour in the evening.',
    isSynthetic: true
  },
  {
    id: 'demo-6',
    date: getPastDateString(1),
    mood: 'good',
    moodLabel: 'Good',
    stress: 2,
    energy: 4,
    note: 'Went for a 20-minute walk around campus grounds. Called parents after dinner.',
    isSynthetic: true
  }
];

// ============================================================================
// 3. Pre-Written Reflection Prompts
// ============================================================================

/**
 * Curated, non-diagnostic prompts addressing common hostel experiences:
 * personal space, academic pacing, physical rest, and social connection.
 * IMPORTANT: These are static writing prompts, NOT outputs from an AI API.
 */
export const STATIC_REFLECTION_PROMPTS = [
  {
    id: 'prompt-1',
    category: 'Hostel Routine',
    prompt: 'Hostel life is often busy and shared. What is one small space or moment of quiet you can claim just for yourself today?',
    tag: 'Boundaries & Space'
  },
  {
    id: 'prompt-2',
    category: 'Academic Pacing',
    prompt: 'When assignments or exams pile up, it is easy to forget rest. What is one low-stakes task you can wrap up to give your brain a pause?',
    tag: 'Academic Balance'
  },
  {
    id: 'prompt-3',
    category: 'Rest & Recovery',
    prompt: 'Notice your energy level right now. If your body could ask for one restorative thing before sleep tonight, what would it be?',
    tag: 'Rest'
  },
  {
    id: 'prompt-4',
    category: 'Social Connection',
    prompt: 'Hostels can feel crowded yet lonely at the same time. Is there a peer, roommate, or family member you could share a simple 5-minute conversation with today?',
    tag: 'Community'
  },
  {
    id: 'prompt-5',
    category: 'Self-Compassion',
    prompt: 'Remind yourself: You are balancing studies, independent living, and personal growth all at once. What went reasonably well today, even if small?',
    tag: 'Mindset'
  }
];

// ============================================================================
// 4. Verified Indian Support Resources
// ============================================================================

/**
 * Real, official mental health helplines in India.
 * Never invent helpline numbers or URLs.
 */
export const VERIFIED_INDIAN_RESOURCES = [
  {
    id: 'tele-manas',
    name: 'Tele-MANAS (Govt of India)',
    type: 'National Mental Health Programme',
    phone: '14416',
    altPhone: '1800 891 4416',
    availability: '24 hours / 7 days a week',
    cost: 'Free & Toll-Free',
    languages: 'Available in 20+ regional Indian languages',
    description: 'The National Tele Mental Health Programme by the Ministry of Health & Family Welfare, Government of India. Provides free, confidential, 24/7 counseling with trained psychologists.',
    officialLink: 'https://telemanas.mohfw.gov.in'
  },
  {
    id: 'kiran',
    name: 'KIRAN Helpline (Govt of India)',
    type: 'Psychosocial Support Helpline',
    phone: '1800-599-0019',
    availability: '24 hours / 7 days a week',
    cost: 'Free & Toll-Free',
    languages: 'Hindi, English, and 11 regional languages',
    description: 'Launched by the Ministry of Social Justice and Empowerment to offer early screening, psychological first aid, and distress management.',
    officialLink: 'https://disabilityaffairs.gov.in'
  },
  {
    id: 'vandrevala',
    name: 'Vandrevala Foundation',
    type: 'Non-profit Mental Health Helpline',
    phone: '+91 9999 666 555',
    availability: '24/7 Telephonic Support & WhatsApp',
    cost: 'Free support',
    languages: 'English, Hindi, and regional languages',
    description: 'A pioneer 24/7 mental health counseling organization in India with experienced clinical psychologists and counselors.',
    officialLink: 'https://www.vandrevalafoundation.com'
  },
  {
    id: 'nimhans',
    name: 'NIMHANS Psychosocial Support',
    type: 'National Premier Medical Institute',
    phone: '080-46110007',
    availability: 'Standard operating hours',
    cost: 'Institutional helpline',
    languages: 'English, Hindi, Kannada, Tamil, Telugu, and more',
    description: 'National Institute of Mental Health and Neurosciences (Bengaluru) offers dedicated counseling and mental healthcare guidance.',
    officialLink: 'https://nimhans.ac.in'
  },
  {
    id: 'emergency-112',
    name: 'National Emergency Helpline (India)',
    type: 'All-in-One Emergency Services',
    phone: '112',
    availability: '24/7 Immediate Response',
    cost: 'Emergency Toll-Free',
    languages: 'Nationwide',
    description: 'Single emergency number for police, medical, and fire emergency response across all Indian states and Union Territories.'
  }
];

export const CAMPUS_SUPPORT_GUIDANCE = [
  {
    title: 'Your Campus Health Centre / Dispensary',
    detail: 'Most university campuses in India have a resident Medical Officer (MO) or visiting physician who can assist with sleep disturbances, anxiety, or physical fatigue.'
  },
  {
    title: 'Hostel Warden & Chief Warden Office',
    detail: 'If you or your roommate are experiencing a medical or environmental hostel emergency (e.g., severe water/food hygiene issue, fever, or acute crisis), notify the hostel assistant warden or security desk immediately.'
  },
  {
    title: 'Student Counseling Cell / Dean of Student Welfare (DSW)',
    detail: 'Check your institute notice board or student intranet for designated counselors. Sessions with campus counselors are usually confidential and cost-free for enrolled students.'
  }
];
