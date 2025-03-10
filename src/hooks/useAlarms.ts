import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlarmSettings } from '../types';
import { createDefaultAlarm } from '../utils/alarmUtils';

const STORAGE_KEY = '@motivational_alarms';

/**
 * Custom hook for managing alarm data and persistence
 */
export const useAlarms = () => {
  const [alarms, setAlarms] = useState<AlarmSettings[]>([]);
  const [loading, setLoading] = useState(true);

  // Load alarms from storage on startup
  useEffect(() => {
    const loadAlarms = async () => {
      try {
        const savedAlarmsString = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedAlarmsString) {
          // Convert string dates back to Date objects
          const parsedAlarms: AlarmSettings[] = JSON.parse(savedAlarmsString);
          const alarmsWithDateObjects = parsedAlarms.map(alarm => ({
            ...alarm,
            time: new Date(alarm.time)
          }));
          setAlarms(alarmsWithDateObjects);
        } else {
          // Create a default alarm if none exist
          setAlarms([createDefaultAlarm()]);
        }
      } catch (error) {
        console.error('Failed to load alarms:', error);
        // Create a default alarm if loading fails
        setAlarms([createDefaultAlarm()]);
      } finally {
        setLoading(false);
      }
    };

    loadAlarms();
  }, []);

  // Save alarms whenever they change
  useEffect(() => {
    const saveAlarms = async () => {
      if (!loading) {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
        } catch (error) {
          console.error('Failed to save alarms:', error);
        }
      }
    };

    saveAlarms();
  }, [alarms, loading]);

  // Add a new alarm
  const addAlarm = useCallback(() => {
    const newAlarm = createDefaultAlarm();
    setAlarms(prev => [...prev, newAlarm]);
    return newAlarm;
  }, []);

  // Update an existing alarm
  const updateAlarm = useCallback((updatedAlarm: AlarmSettings) => {
    setAlarms(prev => 
      prev.map(alarm => 
        alarm.id === updatedAlarm.id ? updatedAlarm : alarm
      )
    );
  }, []);

  // Delete an alarm
  const deleteAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  }, []);

  // Toggle alarm enabled status
  const toggleAlarmEnabled = useCallback((id: string) => {
    setAlarms(prev => 
      prev.map(alarm => 
        alarm.id === id ? { ...alarm, isEnabled: !alarm.isEnabled } : alarm
      )
    );
  }, []);

  return {
    alarms,
    loading,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarmEnabled
  };
}; 