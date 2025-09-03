import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Vibration,
} from 'react-native';
import { AlarmSettings, COLORS } from '../types';
import { getRandomMotivationalQuote, getMotivationalQuoteForCategory } from '../utils/alarmUtils';
import { useAlarmSound } from '../hooks/useAlarmSound';
import { useSettings } from '../hooks/useSettings';
import { DismissalChallenge } from './DismissalChallenge';

interface MotivationalAlarmScreenProps {
  alarm: AlarmSettings;
  onDismiss: () => void;
  onSnooze?: () => void;
  snoozeCount?: number;
}

/**
 * Visually stimulating screen with motivational content displayed when alarm triggers
 */
export const MotivationalAlarmScreen: React.FC<MotivationalAlarmScreenProps> = ({ 
  alarm, 
  onDismiss,
  onSnooze,
  snoozeCount = 0
}) => {
  // Get app settings
  const { settings } = useSettings();
  
  // Set up animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateText = useRef(new Animated.Value(0)).current;

  // For quotes rotation
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const quotes = [
    alarm.motivationalMessage || getMotivationalQuoteForCategory(alarm.category),
    getMotivationalQuoteForCategory(alarm.category),
    getRandomMotivationalQuote(),
  ];
  
  // Initialize sound playback
  const { isPlaying, playSound, stopSound } = useAlarmSound(alarm.soundFile);
  
  // Create a recurring vibration pattern
  const startVibration = () => {
    if (settings.vibrationEnabled && alarm.vibrationEnabled) {
      // Vibration pattern: wait 500ms, vibrate for 500ms, wait 500ms, etc.
      const pattern = [500, 500, 500, 500, 500, 500];
      Vibration.vibrate(pattern, true);
    }
  };

  // Stop vibration on cleanup
  const stopVibration = () => {
    Vibration.cancel();
  };
  
  // Cycle through motivational quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, settings.motivationalQuoteInterval * 1000); // Use settings for interval

    return () => clearInterval(interval);
  }, [settings.motivationalQuoteInterval]);

  // Start animations and sound when screen appears
  useEffect(() => {
    // Start vibration
    startVibration();
    
    // Fade in the screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Scale up the content
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Create a pulsing effect for the dismiss button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Create a rotating sun effect
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000, // 10 seconds per rotation
        useNativeDriver: true,
      })
    ).start();

    // Create subtle text animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateText, {
          toValue: 0.02, // Subtle rotation
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateText, {
          toValue: -0.02,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Play the alarm sound
    playSound();
    
    // Clean up when component unmounts
    return () => {
      stopSound();
      stopVibration();
    };
  }, [fadeAnim, scaleAnim, pulseAnim, rotateAnim, rotateText, playSound, stopSound]);
  
  // Handle dismissing the alarm
  const handleDismiss = () => {
    stopSound();
    stopVibration();
    onDismiss();
  };
  
  // Get screen dimensions for responsive layout
  const { width, height } = Dimensions.get('window');

  // Interpolate rotation for sun animation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Interpolate subtle text animation
  const textRotate = rotateText.interpolate({
    inputRange: [-0.02, 0.02],
    outputRange: ['-2deg', '2deg'],
  });
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View 
        style={[
          styles.container, 
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Animated sun background */}
        <Animated.View style={[styles.sunBackground, { transform: [{ rotate: spin }] }]}>
          {[...Array(12)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.sunRay,
                { transform: [{ rotate: `${i * 30}deg` }] }
              ]}
            />
          ))}
        </Animated.View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.timeText}>{new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
          })}</Text>
          
          <Text style={styles.label}>{alarm.label}</Text>
          
          {/* Quote container with animated text */}
          <Animated.View 
            style={[
              styles.quoteContainer,
              { transform: [{ rotate: textRotate }] }
            ]}
          >
            <Text style={styles.quoteText}>{quotes[currentQuoteIndex]}</Text>
          </Animated.View>
          
          <Animated.Text 
            style={[
              styles.motivationalText,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            TODAY IS YOUR DAY TO SHINE!
          </Animated.Text>
          
          <View style={styles.motivationContainer}>
            <Text style={styles.subText}>
              Get up now and make today amazing!
            </Text>
            <Text style={styles.subText}>
              Your dreams are waiting for you to chase them.
            </Text>
          </View>
          
          {/* Warning about snooze */}
          {snoozeCount > 0 && (
            <View style={styles.snoozeWarning}>
              <Text style={styles.snoozeWarningText}>
                You've snoozed {snoozeCount} time{snoozeCount > 1 ? 's' : ''}!
              </Text>
              <Text style={styles.snoozeWarningSubtext}>
                Time to get up and seize the day!
              </Text>
            </View>
          )}
        </View>
        
        {/* Dismissal Challenge */}
        <DismissalChallenge
          alarm={alarm}
          onDismiss={handleDismiss}
          onSnooze={alarm.snoozeEnabled && snoozeCount < alarm.maxSnoozes ? onSnooze : undefined}
        />

        <View style={styles.additionalMotivation}>
          <Text style={styles.additionalText}>TODAY WILL BE YOUR BEST DAY YET!</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    overflow: 'hidden', // Ensure rays don't spill out
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2, // Above background
  },
  timeText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  label: {
    fontSize: 24,
    color: 'white',
    marginBottom: 30,
  },
  sunBackground: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  sunRay: {
    position: 'absolute',
    width: 280,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 5,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
    maxWidth: 500,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  quoteText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  motivationalText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  motivationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 30,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  dismissText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  additionalMotivation: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  additionalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  snoozeWarning: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  snoozeWarningText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  snoozeWarningSubtext: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
}); 