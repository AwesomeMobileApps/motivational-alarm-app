import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { AlarmSettings, COLORS } from '../types';
import { getRandomMotivationalQuote } from '../utils/alarmUtils';
import { useAlarmSound } from '../hooks/useAlarmSound';

interface MotivationalAlarmScreenProps {
  alarm: AlarmSettings;
  onDismiss: () => void;
}

/**
 * Visually stimulating screen with motivational content displayed when alarm triggers
 */
export const MotivationalAlarmScreen: React.FC<MotivationalAlarmScreenProps> = ({ 
  alarm, 
  onDismiss 
}) => {
  // Set up animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Get a random quote if the alarm doesn't have one specified
  const quote = alarm.motivationalMessage || getRandomMotivationalQuote();
  
  // Initialize sound playback
  const { isPlaying, playSound, stopSound } = useAlarmSound(alarm.soundFile);
  
  // Start animations and sound when screen appears
  useEffect(() => {
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
    
    // Play the alarm sound
    playSound();
    
    // Clean up when component unmounts
    return () => {
      stopSound();
    };
  }, [fadeAnim, scaleAnim, pulseAnim, playSound, stopSound]);
  
  // Handle dismissing the alarm
  const handleDismiss = () => {
    stopSound();
    onDismiss();
  };
  
  // Get screen dimensions for responsive layout
  const { width, height } = Dimensions.get('window');
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View 
        style={[
          styles.container, 
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.timeText}>{new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
          })}</Text>
          
          <Text style={styles.label}>{alarm.label}</Text>
          
          {/* Sun rays background effect */}
          <View style={styles.sunRaysContainer}>
            {[...Array(12)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.sunRay, 
                  { transform: [{ rotate: `${i * 30}deg` }] }
                ]} 
              />
            ))}
          </View>
          
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>{quote}</Text>
          </View>
          
          <Text style={styles.motivationalText}>
            TODAY IS YOUR DAY TO SHINE!
          </Text>
          
          <Text style={styles.subText}>
            Get up now and make today amazing!
          </Text>
        </View>
        
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissText}>I'M AWAKE & READY!</Text>
          </TouchableOpacity>
        </Animated.View>
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
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  sunRaysContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
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
  },
  quoteText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 32,
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
  subText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
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
  },
  dismissText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 