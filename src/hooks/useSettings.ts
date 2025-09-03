import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  theme: 'default' | 'sunrise' | 'ocean' | 'forest';
  snoozeEnabled: boolean;
  snoozeDuration: number; // in minutes
  fadeInDuration: number; // in seconds
  vibrationEnabled: boolean;
  gradualVolumeIncrease: boolean;
  motivationalQuoteInterval: number; // in seconds
  nightMode: boolean;
  soundVolume: number; // 0-1
}

const defaultSettings: AppSettings = {
  theme: 'default',
  snoozeEnabled: false,
  snoozeDuration: 9,
  fadeInDuration: 30,
  vibrationEnabled: true,
  gradualVolumeIncrease: true,
  motivationalQuoteInterval: 5,
  nightMode: false,
  soundVolume: 0.8,
};

const SETTINGS_STORAGE_KEY = '@motivational_alarm_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings on startup
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      if (!loading) {
        try {
          await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
          console.error('Failed to save settings:', error);
        }
      }
    };

    saveSettings();
  }, [settings, loading]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    resetSettings,
  };
};
