import { AlarmSettings, MOTIVATIONAL_QUOTES, ALARM_CATEGORIES } from '../types';

/**
 * Formats a Date object to a readable time string (HH:MM AM/PM)
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formats day array to readable string (e.g., "Mon, Wed, Fri")
 */
export const formatDays = (days: number[]): string => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (days.length === 7) return 'Every day';
  if (days.length === 0) return 'Once';
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
  
  return days.map(day => dayNames[day]).join(', ');
};

/**
 * Get motivational quote based on alarm category
 */
export const getMotivationalQuoteForCategory = (category: string): string => {
  const categoryData = ALARM_CATEGORIES.find(cat => cat.id === category);
  if (categoryData && categoryData.quotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * categoryData.quotes.length);
    return categoryData.quotes[randomIndex];
  }
  return getRandomMotivationalQuote();
};

/**
 * Generate a simple math problem for hard difficulty alarms
 */
export const generateMathProblem = (): { question: string; answer: number } => {
  const operations = ['+', '-', '×'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1, num2, answer;
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 10;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * (num1 - 10)) + 1;
      answer = num1 - num2;
      break;
    case '×':
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
      answer = num1 * num2;
      break;
    default:
      num1 = 5;
      num2 = 5;
      answer = 10;
  }
  
  return {
    question: `${num1} ${operation} ${num2} = ?`,
    answer
  };
};

/**
 * Get time until next alarm in human readable format
 */
export const getTimeUntilAlarm = (alarmTime: Date): string => {
  const now = new Date();
  const timeDiff = alarmTime.getTime() - now.getTime();
  
  if (timeDiff <= 0) return 'Now';
  
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Calculates the next time this alarm will ring
 * Returns Date object of next alarm time
 */
export const getNextAlarmTime = (alarm: AlarmSettings): Date | null => {
  if (!alarm.isEnabled) return null;
  
  const now = new Date();
  const alarmTime = new Date(alarm.time);
  
  // If no specific days are set, the alarm is a one-time alarm
  if (alarm.days.length === 0) {
    if (alarmTime > now) return alarmTime;
    return null; // Alarm time is in the past
  }
  
  // Create a date object for each possible alarm day in the next week
  const possibleAlarms: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + i);
    
    const futureDayOfWeek = futureDate.getDay();
    
    // If this day is in our alarm days
    if (alarm.days.includes(futureDayOfWeek)) {
      const alarmDate = new Date(futureDate);
      alarmDate.setHours(alarmTime.getHours());
      alarmDate.setMinutes(alarmTime.getMinutes());
      alarmDate.setSeconds(0);
      
      // Only include future alarms
      if (alarmDate > now) {
        possibleAlarms.push(alarmDate);
      }
    }
  }
  
  // Sort and take the nearest future alarm
  if (possibleAlarms.length === 0) return null;
  return possibleAlarms.sort((a, b) => a.getTime() - b.getTime())[0];
};

/**
 * Returns a random motivational quote
 */
export const getRandomMotivationalQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[randomIndex];
};

/**
 * Creates a new alarm with default settings
 */
export const createDefaultAlarm = (): AlarmSettings => {
  const defaultTime = new Date();
  defaultTime.setHours(7);
  defaultTime.setMinutes(0);
  defaultTime.setSeconds(0);
  
  return {
    id: Date.now().toString(),
    time: defaultTime,
    isEnabled: true,
    days: [1, 2, 3, 4, 5], // Monday to Friday
    label: 'Wake Up!',
    soundFile: 'motivational-speech.mp3',
    motivationalMessage: getRandomMotivationalQuote(),
    volume: 0.8,
    fadeInDuration: 30,
    vibrationEnabled: true,
    snoozeEnabled: false,
    snoozeDuration: 9,
    maxSnoozes: 3,
    category: 'general',
    difficulty: 'easy',
  };
}; 
