import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AlarmStats {
  totalAlarms: number;
  alarmsThisWeek: number;
  onTimeWakeups: number;
  snoozeCount: number;
  averageWakeUpTime: string;
  streakDays: number;
  favoriteAlarmCategory: string;
  motivationalQuotesShown: number;
  lastAlarmDate: Date | null;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD format
  alarmTime: Date;
  actualWakeTime: Date;
  snoozes: number;
  category: string;
  onTime: boolean;
}

const defaultStats: AlarmStats = {
  totalAlarms: 0,
  alarmsThisWeek: 0,
  onTimeWakeups: 0,
  snoozeCount: 0,
  averageWakeUpTime: '7:00 AM',
  streakDays: 0,
  favoriteAlarmCategory: 'general',
  motivationalQuotesShown: 0,
  lastAlarmDate: null,
};

const STATS_STORAGE_KEY = '@motivational_alarm_stats';
const RECORDS_STORAGE_KEY = '@motivational_alarm_records';

export const useAlarmStats = () => {
  const [stats, setStats] = useState<AlarmStats>(defaultStats);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stats and records on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedStats, savedRecords] = await Promise.all([
          AsyncStorage.getItem(STATS_STORAGE_KEY),
          AsyncStorage.getItem(RECORDS_STORAGE_KEY),
        ]);

        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          // Convert lastAlarmDate back to Date object
          if (parsed.lastAlarmDate) {
            parsed.lastAlarmDate = new Date(parsed.lastAlarmDate);
          }
          setStats({ ...defaultStats, ...parsed });
        }

        if (savedRecords) {
          const parsed = JSON.parse(savedRecords);
          // Convert date strings back to Date objects
          const recordsWithDates = parsed.map((record: any) => ({
            ...record,
            alarmTime: new Date(record.alarmTime),
            actualWakeTime: new Date(record.actualWakeTime),
          }));
          setDailyRecords(recordsWithDates);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save stats when they change
  useEffect(() => {
    const saveStats = async () => {
      if (!loading) {
        try {
          await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
        } catch (error) {
          console.error('Failed to save stats:', error);
        }
      }
    };

    saveStats();
  }, [stats, loading]);

  // Save records when they change
  useEffect(() => {
    const saveRecords = async () => {
      if (!loading) {
        try {
          await AsyncStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(dailyRecords));
        } catch (error) {
          console.error('Failed to save records:', error);
        }
      }
    };

    saveRecords();
  }, [dailyRecords, loading]);

  // Record a new alarm interaction
  const recordAlarmInteraction = useCallback((
    alarmTime: Date,
    actualWakeTime: Date,
    snoozes: number,
    category: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const onTime = snoozes === 0;
    
    const newRecord: DailyRecord = {
      date: today,
      alarmTime,
      actualWakeTime,
      snoozes,
      category,
      onTime,
    };

    // Add to daily records
    setDailyRecords(prev => {
      // Remove any existing record for today and add the new one
      const filtered = prev.filter(record => record.date !== today);
      return [...filtered, newRecord];
    });

    // Update stats
    setStats(prev => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Calculate new streak
      let newStreak = prev.streakDays;
      if (onTime) {
        if (prev.lastAlarmDate) {
          const lastDate = new Date(prev.lastAlarmDate);
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          // If last alarm was yesterday and on time, continue streak
          if (lastDate.toDateString() === yesterday.toDateString()) {
            newStreak++;
          } else {
            newStreak = 1; // Start new streak
          }
        } else {
          newStreak = 1; // First alarm
        }
      } else {
        newStreak = 0; // Break streak
      }

      return {
        ...prev,
        totalAlarms: prev.totalAlarms + 1,
        alarmsThisWeek: prev.alarmsThisWeek + 1,
        onTimeWakeups: prev.onTimeWakeups + (onTime ? 1 : 0),
        snoozeCount: prev.snoozeCount + snoozes,
        streakDays: newStreak,
        lastAlarmDate: now,
        motivationalQuotesShown: prev.motivationalQuotesShown + 3, // Assuming 3 quotes per session
      };
    });
  }, []);

  // Record that a quote was shown
  const recordQuoteShown = useCallback(() => {
    setStats(prev => ({
      ...prev,
      motivationalQuotesShown: prev.motivationalQuotesShown + 1,
    }));
  }, []);

  // Get streak status
  const getStreakStatus = useCallback(() => {
    if (stats.streakDays === 0) return 'No streak';
    if (stats.streakDays === 1) return '1 day streak! Keep it up!';
    if (stats.streakDays < 7) return `${stats.streakDays} day streak! 🔥`;
    if (stats.streakDays < 30) return `${stats.streakDays} day streak! You're on fire! 🔥🔥`;
    return `${stats.streakDays} day streak! You're unstoppable! 🔥🔥🔥`;
  }, [stats.streakDays]);

  // Get this week's performance
  const getWeeklyPerformance = useCallback(() => {
    const thisWeek = dailyRecords.filter(record => {
      const recordDate = new Date(record.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    });

    const onTimeCount = thisWeek.filter(record => record.onTime).length;
    const percentage = thisWeek.length > 0 ? Math.round((onTimeCount / thisWeek.length) * 100) : 0;

    return {
      totalDays: thisWeek.length,
      onTimeDays: onTimeCount,
      percentage,
    };
  }, [dailyRecords]);

  // Reset all stats
  const resetStats = useCallback(() => {
    setStats(defaultStats);
    setDailyRecords([]);
  }, []);

  return {
    stats,
    dailyRecords,
    loading,
    recordAlarmInteraction,
    recordQuoteShown,
    getStreakStatus,
    getWeeklyPerformance,
    resetStats,
  };
};
