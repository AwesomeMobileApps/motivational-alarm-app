import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Switch,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlarmSettings, COLORS, DAYS, SOUND_OPTIONS, ALARM_CATEGORIES, DIFFICULTY_LEVELS } from '../types';
import { getRandomMotivationalQuote, getMotivationalQuoteForCategory } from '../utils/alarmUtils';
import { Audio } from 'expo-av';

interface AlarmEditScreenProps {
  alarm: AlarmSettings;
  onSave: (alarm: AlarmSettings) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

/**
 * Screen for creating/editing alarm settings
 */
export const AlarmEditScreen: React.FC<AlarmEditScreenProps> = ({
  alarm,
  onSave,
  onDelete,
  onCancel,
}) => {
  // Local state to track changes to the alarm
  const [editedAlarm, setEditedAlarm] = useState<AlarmSettings>({ ...alarm });

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Sound preview state
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle time selection
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // Only hide on Android

    if (selectedDate) {
      setEditedAlarm(prev => ({
        ...prev,
        time: selectedDate,
      }));
    }
  };

  // Toggle day selection
  const toggleDay = (dayIndex: number) => {
    setEditedAlarm(prev => {
      if (prev.days.includes(dayIndex)) {
        // Remove the day if already selected
        return {
          ...prev,
          days: prev.days.filter(day => day !== dayIndex),
        };
      }
      // Add the day if not selected
      return {
        ...prev,
        days: [...prev.days, dayIndex].sort((a, b) => a - b),
      };
    });
  };

  // Update label text
  const updateLabel = (text: string) => {
    setEditedAlarm(prev => ({
      ...prev,
      label: text,
    }));
  };

  // Regenerate motivational message
  const regenerateMessage = () => {
    const newMessage = editedAlarm.category ? 
      getMotivationalQuoteForCategory(editedAlarm.category) : 
      getRandomMotivationalQuote();
    
    setEditedAlarm(prev => ({
      ...prev,
      motivationalMessage: newMessage,
    }));
  };

  // Select alarm category
  const selectCategory = (categoryId: string) => {
    const category = ALARM_CATEGORIES.find(cat => cat.id === categoryId);
    setEditedAlarm(prev => ({
      ...prev,
      category: categoryId as any,
      motivationalMessage: category ? getMotivationalQuoteForCategory(categoryId) : prev.motivationalMessage,
      soundFile: category ? category.defaultSound : prev.soundFile,
    }));
  };

  // Select difficulty level
  const selectDifficulty = (difficultyId: string) => {
    setEditedAlarm(prev => ({
      ...prev,
      difficulty: difficultyId as any,
    }));
  };

  // Update volume
  const updateVolume = (volume: number) => {
    setEditedAlarm(prev => ({
      ...prev,
      volume,
    }));
  };

  // Update fade-in duration
  const updateFadeInDuration = (duration: number) => {
    setEditedAlarm(prev => ({
      ...prev,
      fadeInDuration: duration,
    }));
  };

  // Update snooze settings
  const updateSnoozeEnabled = (enabled: boolean) => {
    setEditedAlarm(prev => ({
      ...prev,
      snoozeEnabled: enabled,
    }));
  };

  const updateSnoozeDuration = (duration: number) => {
    setEditedAlarm(prev => ({
      ...prev,
      snoozeDuration: duration,
    }));
  };

  const updateMaxSnoozes = (max: number) => {
    setEditedAlarm(prev => ({
      ...prev,
      maxSnoozes: max,
    }));
  };

  // Update vibration
  const updateVibrationEnabled = (enabled: boolean) => {
    setEditedAlarm(prev => ({
      ...prev,
      vibrationEnabled: enabled,
    }));
  };

  // Select a sound file
  const selectSound = (soundFile: string) => {
    setEditedAlarm(prev => ({
      ...prev,
      soundFile,
    }));
  };

  // Preview a sound
  const previewSoundFile = async (soundFile: string) => {
    try {
      // Stop any currently playing sound
      if (previewSound) {
        await previewSound.stopAsync();
        await previewSound.unloadAsync();
        setPreviewSound(null);
        setIsPlaying(false);
      }

      // If we're already playing this sound, just stop it
      const isSameSongAlreadyPlaying = isPlaying && editedAlarm.soundFile === soundFile
      if (isSameSongAlreadyPlaying) {
        return;
      }

      // Map the sound file name to the appropriate require statement
      let soundSource;
      switch (soundFile) {
        case 'motivational-speech.mp3':
          soundSource = require('../../assets/sounds/motivational-speech.mp3');
          break;
        case 'energy-boost.mp3':
          soundSource = require('../../assets/sounds/energy-boost.mp3');
          break;
        case 'rise-and-shine.mp3':
          soundSource = require('../../assets/sounds/rise-and-shine.mp3');
          break;
        case 'seize-the-day.mp3':
          soundSource = require('../../assets/sounds/seize-the-day.mp3');
          break;
        case 'success-awaits.mp3':
          soundSource = require('../../assets/sounds/success-awaits.mp3');
          break;
        default:
          soundSource = require('../../assets/sounds/motivational-speech.mp3');
      }

      // Otherwise load and play the new sound
      const { sound } = await Audio.Sound.createAsync(
        soundSource,
        { shouldPlay: true, volume: 1.0 }
      );

      setPreviewSound(sound);
      setIsPlaying(true);

      // Cleanup when done playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play sound preview', error);
    }
  };

  // Format time for display
  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle save button
  const handleSave = () => {
    onSave(editedAlarm);
  };

  // Handle delete button
  const handleDelete = () => {
    onDelete(editedAlarm.id);
  };

  // Cleanup sound on unmount
  React.useEffect(() => {
    return () => {
      if (previewSound) {
        previewSound.unloadAsync();
      }
    };
  }, [previewSound]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {alarm.id ? 'Edit Alarm' : 'Create Alarm'}
        </Text>

        {/* Time Picker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {formatTimeForDisplay(editedAlarm.time)}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={editedAlarm.time}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Days Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repeat</Text>
          <View style={styles.daysContainer}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  editedAlarm.days.includes(index) && styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(index)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    editedAlarm.days.includes(index) && styles.dayButtonTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Label Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Label</Text>
          <TextInput
            style={styles.input}
            value={editedAlarm.label}
            onChangeText={updateLabel}
            placeholder="Alarm label"
            placeholderTextColor="#999"
            maxLength={30}
          />
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alarm Category</Text>
          <Text style={styles.sectionDescription}>Choose the type of motivation you need</Text>
          <View style={styles.categoryContainer}>
            {ALARM_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  { borderColor: category.color },
                  editedAlarm.category === category.id && { backgroundColor: category.color }
                ]}
                onPress={() => selectCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  editedAlarm.category === category.id && { color: 'white' }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wake-up Difficulty</Text>
          <Text style={styles.sectionDescription}>How challenging should it be to dismiss the alarm?</Text>
          <View style={styles.difficultyContainer}>
            {DIFFICULTY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.difficultyOption,
                  { borderColor: level.color },
                  editedAlarm.difficulty === level.id && { backgroundColor: level.color }
                ]}
                onPress={() => selectDifficulty(level.id)}
              >
                <Text style={[
                  styles.difficultyName,
                  editedAlarm.difficulty === level.id && { color: 'white' }
                ]}>
                  {level.name}
                </Text>
                <Text style={[
                  styles.difficultyDescription,
                  editedAlarm.difficulty === level.id && { color: 'white', opacity: 0.9 }
                ]}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Volume and Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Volume: {Math.round(editedAlarm.volume * 100)}%</Text>
            <View style={styles.volumeButtons}>
              {[0.3, 0.5, 0.8, 1.0].map(vol => (
                <TouchableOpacity
                  key={vol}
                  style={[
                    styles.volumeButton,
                    editedAlarm.volume === vol && styles.volumeButtonActive
                  ]}
                  onPress={() => updateVolume(vol)}
                >
                  <Text style={[
                    styles.volumeButtonText,
                    editedAlarm.volume === vol && styles.volumeButtonTextActive
                  ]}>
                    {Math.round(vol * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Fade-in Duration: {editedAlarm.fadeInDuration}s</Text>
            <View style={styles.durationButtons}>
              {[0, 15, 30, 60].map(duration => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    editedAlarm.fadeInDuration === duration && styles.durationButtonActive
                  ]}
                  onPress={() => updateFadeInDuration(duration)}
                >
                  <Text style={[
                    styles.durationButtonText,
                    editedAlarm.fadeInDuration === duration && styles.durationButtonTextActive
                  ]}>
                    {duration}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDescription}>Vibrate when alarm rings</Text>
            </View>
            <Switch
              value={editedAlarm.vibrationEnabled}
              onValueChange={updateVibrationEnabled}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={editedAlarm.vibrationEnabled ? COLORS.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Snooze Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snooze Settings</Text>
          <Text style={styles.sectionDescription}>Not recommended for maximum motivation!</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Snooze</Text>
              <Text style={styles.settingDescription}>Allow snoozing this alarm</Text>
            </View>
            <Switch
              value={editedAlarm.snoozeEnabled}
              onValueChange={updateSnoozeEnabled}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={editedAlarm.snoozeEnabled ? COLORS.accent : '#f4f3f4'}
            />
          </View>

          {editedAlarm.snoozeEnabled && (
            <>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Snooze Duration: {editedAlarm.snoozeDuration} minutes</Text>
                <View style={styles.durationButtons}>
                  {[5, 9, 15, 20].map(duration => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationButton,
                        editedAlarm.snoozeDuration === duration && styles.durationButtonActive
                      ]}
                      onPress={() => updateSnoozeDuration(duration)}
                    >
                      <Text style={[
                        styles.durationButtonText,
                        editedAlarm.snoozeDuration === duration && styles.durationButtonTextActive
                      ]}>
                        {duration}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Max Snoozes: {editedAlarm.maxSnoozes}</Text>
                <View style={styles.durationButtons}>
                  {[1, 3, 5, 10].map(max => (
                    <TouchableOpacity
                      key={max}
                      style={[
                        styles.durationButton,
                        editedAlarm.maxSnoozes === max && styles.durationButtonActive
                      ]}
                      onPress={() => updateMaxSnoozes(max)}
                    >
                      <Text style={[
                        styles.durationButtonText,
                        editedAlarm.maxSnoozes === max && styles.durationButtonTextActive
                      ]}>
                        {max}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Sound Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motivational Sound</Text>
          <FlatList
            data={SOUND_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.soundOption,
                  editedAlarm.soundFile === item.file && styles.soundOptionSelected,
                ]}
                onPress={() => selectSound(item.file)}
              >
                <Text style={styles.soundName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => previewSoundFile(item.file)}
                >
                  <Text style={styles.previewButtonText}>
                    {isPlaying && editedAlarm.soundFile === item.file
                      ? 'Stop'
                      : 'Preview'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Motivational Message Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Motivational Message</Text>
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={regenerateMessage}
            >
              <Text style={styles.regenerateButtonText}>Regenerate</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{editedAlarm.motivationalMessage}</Text>
          </View>
        </View>

        {/* Active Switch */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Alarm active</Text>
          <Switch
            value={editedAlarm.isEnabled}
            onValueChange={(value) =>
              setEditedAlarm(prev => ({ ...prev, isEnabled: value }))
            }
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={editedAlarm.isEnabled ? COLORS.accent : '#f4f3f4'}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {alarm.id && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 25,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  dayButtonActive: {
    backgroundColor: COLORS.primary,
  },
  dayButtonText: {
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextActive: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  soundOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  soundOptionSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  soundName: {
    fontSize: 16,
    color: COLORS.text,
  },
  previewButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  previewButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  regenerateButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  regenerateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switchLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'white',
    minWidth: '45%',
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  difficultyContainer: {
    gap: 10,
  },
  difficultyOption: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  difficultyDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  volumeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  volumeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    minWidth: 50,
    alignItems: 'center',
  },
  volumeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  volumeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  volumeButtonTextActive: {
    color: 'white',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  durationButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    minWidth: 50,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: COLORS.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  durationButtonTextActive: {
    color: 'white',
  },
}); 