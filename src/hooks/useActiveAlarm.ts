import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { AlarmSettings } from '../types';
import { getNextAlarmTime } from '../utils/alarmUtils';

/**
 * Hook to manage active alarms and determine when they should trigger
 */
export const useActiveAlarm = (alarms: AlarmSettings[]) => {
  // States that need to trigger UI updates
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<AlarmSettings | null>(null);
  const [nextAlarmTime, setNextAlarmTime] = useState<Date | null>(null);
  
  // Refs for internal state that shouldn't trigger re-renders
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmsRef = useRef(alarms);
  const isInitializedRef = useRef(false);
  
  // Update the alarms ref when alarms change
  useEffect(() => {
    alarmsRef.current = alarms;
    // Only recalculate if we've already initialized to prevent loops during setup
    if (isInitializedRef.current) {
      calculateNextAlarmInternal();
    }
  }, [alarms]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Internal function to calculate next alarm - doesn't need to be memoized
  const calculateNextAlarmInternal = () => {
    // Only consider enabled alarms
    const enabledAlarms = alarmsRef.current.filter(alarm => alarm.isEnabled);
    
    if (enabledAlarms.length === 0) {
      setNextAlarmTime(null);
      return null;
    }

    // Find the next time each alarm will ring
    const alarmsWithNextTime = enabledAlarms
      .map(alarm => ({
        alarm,
        nextTime: getNextAlarmTime(alarm)
      }))
      .filter(item => item.nextTime !== null);

    if (alarmsWithNextTime.length === 0) {
      setNextAlarmTime(null);
      return null;
    }

    // Sort alarms by next ring time
    const sortedAlarms = alarmsWithNextTime.sort(
      (a, b) => (a.nextTime?.getTime() || 0) - (b.nextTime?.getTime() || 0)
    );

    const nextAlarm = sortedAlarms[0];
    
    // Only update if the time has changed to prevent unnecessary re-renders
    if (!nextAlarmTime || 
        nextAlarm.nextTime?.getTime() !== nextAlarmTime.getTime()) {
      setNextAlarmTime(nextAlarm.nextTime);
    }
    
    return nextAlarm;
  };
  
  // Internal function to check alarms - doesn't need to be memoized
  const checkAlarmsInternal = () => {
    // Don't trigger another alarm if one is already ringing
    if (isAlarmRinging) return;
    
    const now = new Date();
    const next = calculateNextAlarmInternal();
    
    if (next && next.nextTime) {
      const timeDiff = next.nextTime.getTime() - now.getTime();
      
      // If alarm time is within the last minute, trigger it
      if (timeDiff <= 0 && timeDiff > -60000) {
        setActiveAlarm(next.alarm);
        setIsAlarmRinging(true);
      }
    }
  };

  // Set up the interval only once
  useEffect(() => {
    // Check immediately on first render
    checkAlarmsInternal();
    isInitializedRef.current = true;
    
    // Set up recurring checks
    timerRef.current = setInterval(checkAlarmsInternal, 60000);
    
    // Set up app state listener
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground - check alarms right away
        checkAlarmsInternal();
      }
    });
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      subscription.remove();
    };
  }, []); // Empty dependency array - only runs once on mount

  // Exposed function to dismiss the alarm
  const dismissAlarm = useCallback(() => {
    setIsAlarmRinging(false);
    setActiveAlarm(null);
    // Schedule a check for the next alarm
    setTimeout(checkAlarmsInternal, 1000);
  }, []);

  return {
    isAlarmRinging,
    activeAlarm,
    nextAlarmTime,
    dismissAlarm
  };
}; 