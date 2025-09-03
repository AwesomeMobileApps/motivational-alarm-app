import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { COLORS, THEMES } from '../types';
import { useSettings } from '../hooks/useSettings';

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings();

  const renderThemeOption = (themeKey: keyof typeof THEMES) => {
    const theme = THEMES[themeKey];
    return (
      <TouchableOpacity
        key={themeKey}
        style={[
          styles.themeOption,
          { backgroundColor: theme.colors.primary },
          settings.theme === themeKey && styles.selectedTheme
        ]}
        onPress={() => updateSetting('theme', themeKey)}
      >
        <Text style={styles.themeText}>{theme.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Theme Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <Text style={styles.sectionDescription}>Choose your preferred theme</Text>
            <View style={styles.themeContainer}>
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(renderThemeOption)}
            </View>
          </View>

          {/* General Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Night Mode</Text>
                <Text style={styles.settingDescription}>Darker interface for nighttime</Text>
              </View>
              <Switch
                value={settings.nightMode}
                onValueChange={(value) => updateSetting('nightMode', value)}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={settings.nightMode ? COLORS.accent : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Vibration</Text>
                <Text style={styles.settingDescription}>Vibrate when alarms trigger</Text>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) => updateSetting('vibrationEnabled', value)}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={settings.vibrationEnabled ? COLORS.accent : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Gradual Volume Increase</Text>
                <Text style={styles.settingDescription}>Slowly increase alarm volume</Text>
              </View>
              <Switch
                value={settings.gradualVolumeIncrease}
                onValueChange={(value) => updateSetting('gradualVolumeIncrease', value)}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={settings.gradualVolumeIncrease ? COLORS.accent : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Snooze Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Snooze Options</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Snooze</Text>
                <Text style={styles.settingDescription}>Allow snoozing alarms (not recommended for motivation!)</Text>
              </View>
              <Switch
                value={settings.snoozeEnabled}
                onValueChange={(value) => updateSetting('snoozeEnabled', value)}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={settings.snoozeEnabled ? COLORS.accent : '#f4f3f4'}
              />
            </View>

            {settings.snoozeEnabled && (
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Snooze Duration</Text>
                  <Text style={styles.settingDescription}>{settings.snoozeDuration} minutes</Text>
                </View>
                <View style={styles.durationButtons}>
                  {[5, 9, 15, 30].map(duration => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationButton,
                        settings.snoozeDuration === duration && styles.selectedDuration
                      ]}
                      onPress={() => updateSetting('snoozeDuration', duration)}
                    >
                      <Text style={[
                        styles.durationText,
                        settings.snoozeDuration === duration && styles.selectedDurationText
                      ]}>
                        {duration}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Audio Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Fade-in Duration</Text>
                <Text style={styles.settingDescription}>{settings.fadeInDuration} seconds</Text>
              </View>
              <View style={styles.durationButtons}>
                {[0, 15, 30, 60].map(duration => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      settings.fadeInDuration === duration && styles.selectedDuration
                    ]}
                    onPress={() => updateSetting('fadeInDuration', duration)}
                  >
                    <Text style={[
                      styles.durationText,
                      settings.fadeInDuration === duration && styles.selectedDurationText
                    ]}>
                      {duration}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Quote Change Interval</Text>
                <Text style={styles.settingDescription}>{settings.motivationalQuoteInterval} seconds</Text>
              </View>
              <View style={styles.durationButtons}>
                {[3, 5, 10, 15].map(interval => (
                  <TouchableOpacity
                    key={interval}
                    style={[
                      styles.durationButton,
                      settings.motivationalQuoteInterval === interval && styles.selectedDuration
                    ]}
                    onPress={() => updateSetting('motivationalQuoteInterval', interval)}
                  >
                    <Text style={[
                      styles.durationText,
                      settings.motivationalQuoteInterval === interval && styles.selectedDurationText
                    ]}>
                      {interval}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Reset Button */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
              <Text style={styles.resetText}>Reset to Defaults</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 15,
  },
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTheme: {
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  themeText: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.6,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
  },
  selectedDuration: {
    backgroundColor: COLORS.primary,
  },
  durationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  selectedDurationText: {
    color: 'white',
  },
  resetButton: {
    backgroundColor: COLORS.error,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
