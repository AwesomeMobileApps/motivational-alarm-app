export interface AlarmSettings {
  id: string;
  time: Date;
  isEnabled: boolean;
  days: number[]; // 0-6, where 0 is Sunday
  label: string;
  soundFile: string;
  motivationalMessage: string;
  volume: number; // 0-1
  fadeInDuration: number; // in seconds
  vibrationEnabled: boolean;
  snoozeEnabled: boolean;
  snoozeDuration: number; // in minutes
  maxSnoozes: number;
  category: 'work' | 'exercise' | 'meditation' | 'general';
  difficulty: 'easy' | 'medium' | 'hard'; // affects how easy it is to dismiss
}

export interface AppState {
  alarms: AlarmSettings[];
  currentAlarm: AlarmSettings | null;
  isAlarmRinging: boolean;
}

// Theme type definitions
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  error: string;
  cardBackground: string;
  borderColor: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  isDark: boolean;
}

// Default theme - bright and motivational
export const DEFAULT_THEME: Theme = {
  name: 'default',
  colors: {
    primary: '#FFD700', // Gold/Yellow as the primary color
    secondary: '#FF6347', // Tomato (reddish) as secondary
    accent: '#4CAF50', // Green as accent
    background: '#FFF9C4', // Light yellow background
    text: '#333333', // Dark text for readability
    success: '#4CAF50', // Green for success messages
    error: '#F44336', // Red for errors
    cardBackground: '#FFFFFF',
    borderColor: '#E0E0E0',
    gradientStart: '#FFD700',
    gradientEnd: '#FFA000',
  },
  isDark: false,
};

// Sunrise theme - warm oranges and pinks
export const SUNRISE_THEME: Theme = {
  name: 'sunrise',
  colors: {
    primary: '#FF6B35', // Warm orange
    secondary: '#F7931E', // Lighter orange
    accent: '#FF1744', // Vibrant red-pink
    background: '#FFF3E0', // Very light orange
    text: '#2E2E2E',
    success: '#4CAF50',
    error: '#F44336',
    cardBackground: '#FFFFFF',
    borderColor: '#FFCC80',
    gradientStart: '#FF6B35',
    gradientEnd: '#FF8A65',
  },
  isDark: false,
};

// Ocean theme - blues and teals
export const OCEAN_THEME: Theme = {
  name: 'ocean',
  colors: {
    primary: '#00BCD4', // Cyan
    secondary: '#0097A7', // Dark cyan
    accent: '#FF4081', // Pink accent
    background: '#E0F2F1', // Very light teal
    text: '#263238',
    success: '#4CAF50',
    error: '#F44336',
    cardBackground: '#FFFFFF',
    borderColor: '#B2DFDB',
    gradientStart: '#00BCD4',
    gradientEnd: '#00ACC1',
  },
  isDark: false,
};

// Forest theme - greens and earth tones
export const FOREST_THEME: Theme = {
  name: 'forest',
  colors: {
    primary: '#66BB6A', // Light green
    secondary: '#388E3C', // Dark green
    accent: '#FFC107', // Amber accent
    background: '#F1F8E9', // Very light green
    text: '#1B5E20',
    success: '#4CAF50',
    error: '#F44336',
    cardBackground: '#FFFFFF',
    borderColor: '#C8E6C9',
    gradientStart: '#66BB6A',
    gradientEnd: '#4CAF50',
  },
  isDark: false,
};

export const THEMES = {
  default: DEFAULT_THEME,
  sunrise: SUNRISE_THEME,
  ocean: OCEAN_THEME,
  forest: FOREST_THEME,
};

// Backward compatibility
export const COLORS: ThemeColors = DEFAULT_THEME.colors;

// Alarm categories with specific motivational content
export interface AlarmCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  quotes: string[];
  defaultSound: string;
}

export const ALARM_CATEGORIES: AlarmCategory[] = [
  {
    id: 'work',
    name: 'Work & Productivity',
    icon: '💼',
    color: '#2196F3',
    quotes: [
      "Time to make your mark on the world!",
      "Your career breakthrough starts today!",
      "Success is calling - time to answer!",
      "Today's work shapes tomorrow's success!",
      "Be the professional you aspire to be!"
    ],
    defaultSound: 'success-awaits.mp3'
  },
  {
    id: 'exercise',
    name: 'Fitness & Health',
    icon: '💪',
    color: '#FF5722',
    quotes: [
      "Your body is your temple - time to worship!",
      "Stronger than yesterday, better than before!",
      "Every workout brings you closer to your goals!",
      "Your health is your wealth - invest now!",
      "Champions are made in the morning!"
    ],
    defaultSound: 'energy-boost.mp3'
  },
  {
    id: 'meditation',
    name: 'Mindfulness & Peace',
    icon: '🧘',
    color: '#9C27B0',
    quotes: [
      "Find your center and embrace the day!",
      "Peace begins with a mindful morning!",
      "Breathe in possibility, breathe out doubt!",
      "Your inner wisdom awaits your attention!",
      "Start with stillness, create with clarity!"
    ],
    defaultSound: 'rise-and-shine.mp3'
  },
  {
    id: 'general',
    name: 'General Motivation',
    icon: '⭐',
    color: '#FFD700',
    quotes: [
      "Today is your day to shine!",
      "Make today amazing!",
      "Your future starts now!",
      "Believe in yourself and magic happens!",
      "Great days start with great mornings!"
    ],
    defaultSound: 'motivational-speech.mp3'
  }
];

// Available motivational sounds
export interface SoundOption {
  id: string;
  name: string;
  file: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { 
    id: '1', 
    name: 'Morning Motivation', 
    file: 'motivational-speech.mp3' 
  },
  { 
    id: '2', 
    name: 'Energy Boost', 
    file: 'energy-boost.mp3' 
  },
  { 
    id: '3', 
    name: 'Rise and Shine', 
    file: 'rise-and-shine.mp3' 
  },
  { 
    id: '4', 
    name: 'Seize the Day', 
    file: 'seize-the-day.mp3' 
  },
  { 
    id: '5', 
    name: 'Success Awaits', 
    file: 'success-awaits.mp3' 
  }
];

// Motivational quotes to display on alarm screen
export const MOTIVATIONAL_QUOTES = [
  "Your future is created by what you do today, not tomorrow!",
  "The only way to do great work is to love what you do!",
  "Believe you can and you're halfway there!",
  "Dreams don't work unless you do!",
  "The best way to predict the future is to create it!",
  "Every morning is a new chance to become the best version of yourself!",
  "Today is your opportunity to build the tomorrow you want!",
  "Action is the foundational key to all success!",
  "Make today amazing - it's a gift that's why it's called the present!",
  "Success doesn't just find you. You have to go out and get it!",
  "Wake up with determination, go to bed with satisfaction!",
  "Your body can stand almost anything. It's your mind that you have to convince!",
  "The difference between who you are and who you want to be is what you do!",
  "You are capable of amazing things. Today is your day to prove it!",
  "Happiness is not something ready-made. It comes from your own actions!",
  "Push yourself, because no one else is going to do it for you!",
  "Your time is limited, don't waste it living someone else's life!",
  "Small steps every day lead to big results over time!",
  "You are one decision away from a totally different life!",
  "The journey of a thousand miles begins with one step - take it now!"
];

// Day names for the UI
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Difficulty levels affect how the alarm can be dismissed
export interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
  dismissMethod: 'tap' | 'swipe' | 'math' | 'shake' | 'scan';
  color: string;
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    id: 'easy',
    name: 'Easy Wake',
    description: 'Simple tap to dismiss',
    dismissMethod: 'tap',
    color: '#4CAF50'
  },
  {
    id: 'medium',
    name: 'Medium Challenge',
    description: 'Swipe pattern or simple math',
    dismissMethod: 'swipe',
    color: '#FF9800'
  },
  {
    id: 'hard',
    name: 'Hard Core',
    description: 'Math problem or QR code scan',
    dismissMethod: 'math',
    color: '#F44336'
  }
];