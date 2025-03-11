export interface AlarmSettings {
  id: string;
  time: Date;
  isEnabled: boolean;
  days: number[]; // 0-6, where 0 is Sunday
  label: string;
  soundFile: string;
  motivationalMessage: string;
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
}

// Use bright, motivational colors
export const COLORS: ThemeColors = {
  primary: '#FFD700', // Gold/Yellow as the primary color
  secondary: '#FF6347', // Tomato (reddish) as secondary
  accent: '#4CAF50', // Green as accent
  background: '#FFF9C4', // Light yellow background
  text: '#333333', // Dark text for readability
  success: '#4CAF50', // Green for success messages
  error: '#F44336', // Red for errors
};

// Day names for the UI
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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