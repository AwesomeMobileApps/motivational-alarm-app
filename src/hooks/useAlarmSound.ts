import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * Custom hook for managing alarm sound playback
 */
export const useAlarmSound = (soundFile: string) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Load sound
  const loadSound = async () => {
    try {
      // Unload any existing sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Configure audio settings for alarms
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true, // Allow playing when device is on silent
        staysActiveInBackground: true, // Continue in background
        shouldDuckAndroid: true, // Lower volume of other apps on Android
      });

      // Check if the sound file exists in assets or use a URI
      let soundSource;
      if (soundFile.startsWith('http')) {
        // For network resources
        soundSource = { uri: soundFile };
      } else {
        // For local resources bundled with the app
        // Note: This is a simplified approach. In a real app, you'd need to handle 
        // the correct require for each possible sound file.
        soundSource = require('../../src/assets/sounds/motivational-speech.mp3');
      }

      // Load sound file
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundSource,
        { shouldPlay: false, isLooping: true, volume: 1.0 }
      );

      setSound(newSound);
      return newSound;
    } catch (error) {
      console.error('Failed to load sound', error);
      return null;
    }
  };

  // Play sound
  const playSound = async () => {
    try {
      let currentSound = sound;
      
      // If no sound is loaded, load it first
      if (!currentSound) {
        currentSound = await loadSound();
        if (!currentSound) return;
      }
      
      // Ensure it's at the beginning and set to loop
      await currentSound.setIsLoopingAsync(true);
      await currentSound.setPositionAsync(0);
      await currentSound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  };

  // Pause sound
  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Stop sound completely
  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    playSound,
    pauseSound,
    stopSound,
    loadSound
  };
}; 