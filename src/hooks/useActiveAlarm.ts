import { useState, useEffect, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import { AlarmSettings } from '../types';
import { getNextAlarmTime } from '../utils/alarmUtils';

/**
 * Hook to manage active alarms and determine when they should trigger
 */
export const useActiveAlarm = (alarms: AlarmSettings[]) => {
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<AlarmSettings | null>(null);
  const [nextAlarmTime, setNextAlarmTime] = useState<Date | null>(null);
  const [timerId, setTimerId] = useState<ReturnType<typeof setInterval> | null>(null);

  // Find the next alarm that should ring
  const calculateNextAlarm = useCallback(() => {
    // Only consider enabled alarms
    const enabledAlarms = alarms.filter(alarm => alarm.isEnabled);
    if (enabledAlarms.length === 0) {
      setNextAlarmTime(null);
      return null;
    }

    // Find the next time each alarm will ring
    const alarmsWithNextTime = enabledAlarms.map(alarm => ({
      alarm,
      nextTime: getNextAlarmTime(alarm)
    })).filter(item => item.nextTime !== null);

    // Sort by time and get the first one
    if (alarmsWithNextTime.length === 0) {
      setNextAlarmTime(null);
      return null;
    }

    // Sort alarms by next ring time
    const sortedAlarms = alarmsWithNextTime.sort(
      (a, b) => (a.nextTime?.getTime() || 0) - (b.nextTime?.getTime() || 0)
    );

    const nextAlarm = sortedAlarms[0];
    setNextAlarmTime(nextAlarm.nextTime);
    return nextAlarm;
  }, [alarms]);

  // Check if any alarm should be ringing
  const checkAlarms = useCallback(() => {
    const now = new Date();
    
    // If an alarm is already ringing, don't trigger another
    if (isAlarmRinging) return;
    
    // Calculate the next alarm if we don't have one
    const next = calculateNextAlarm();
    
    if (next && next.nextTime) {
      // If the next alarm time is within the last minute, trigger it
      const timeDiff = next.nextTime.getTime() - now.getTime();
      if (timeDiff <= 0 && timeDiff > -60000) { // Within the last minute
        setActiveAlarm(next.alarm);
        setIsAlarmRinging(true);
      }
    }
  }, [calculateNextAlarm, isAlarmRinging]);

  // Schedule the next alarm check
  const scheduleNextCheck = useCallback(() => {
    // Clear any existing timer
    if (timerId) {
      clearTimeout(timerId);
    }

    // Check immediately 
    checkAlarms();
    
    // Set up a timer to check every minute
    const newTimerId = setInterval(checkAlarms, 60000); // Check every minute
    setTimerId(newTimerId);
    
    return () => {
      if (newTimerId) clearInterval(newTimerId);
    };
  }, [checkAlarms, timerId]);

  // Recalculate next alarm time when alarms change or app state changes
  useEffect(() => {
    calculateNextAlarm();
  }, [alarms, calculateNextAlarm]);

  // Re-schedule when alarms or next alarm time changes
  useEffect(() => {
    return scheduleNextCheck();
  }, [alarms, nextAlarmTime, scheduleNextCheck]);

  // Monitor app state changes to refresh alarm schedules
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground - recalculate alarms
        calculateNextAlarm();
        scheduleNextCheck();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [calculateNextAlarm, scheduleNextCheck]);

  // Function to dismiss the currently ringing alarm
  const dismissAlarm = useCallback(() => {
    setIsAlarmRinging(false);
    setActiveAlarm(null);
    // Recalculate to set up the next alarm
    calculateNextAlarm();
  }, [calculateNextAlarm]);

  // Return the alarm state and control functions
  return {
    isAlarmRinging,
    activeAlarm,
    nextAlarmTime,
    dismissAlarm
  };
}; 