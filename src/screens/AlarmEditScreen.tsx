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
import { AlarmSettings, COLORS, DAYS, SOUND_OPTIONS } from '../types';
import { getRandomMotivationalQuote } from '../utils/alarmUtils';
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
    setEditedAlarm(prev => ({
      ...prev,
      motivationalMessage: getRandomMotivationalQuote(),
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
}); 