import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { AlarmSettings } from '../types';
import { generateMathProblem } from '../utils/alarmUtils';

interface DismissalChallengeProps {
  alarm: AlarmSettings;
  onDismiss: () => void;
  onSnooze?: () => void;
}

export const DismissalChallenge: React.FC<DismissalChallengeProps> = ({
  alarm,
  onDismiss,
  onSnooze,
}) => {
  const [mathProblem, setMathProblem] = useState(generateMathProblem());
  const [userAnswer, setUserAnswer] = useState('');
  const [swipeProgress, setSwipeProgress] = useState(new Animated.Value(0));
  const [shakeCount, setShakeCount] = useState(0);
  const [error, setError] = useState('');

  const screenWidth = Dimensions.get('window').width;
  const requiredShakes = 10;

  useEffect(() => {
    if (alarm.difficulty === 'hard') {
      setMathProblem(generateMathProblem());
    }
  }, [alarm.difficulty]);

  const handleEasyDismiss = () => {
    onDismiss();
  };

  const handleMathSubmit = () => {
    const answer = parseInt(userAnswer);
    if (answer === mathProblem.answer) {
      onDismiss();
    } else {
      setError('Wrong answer! Try again.');
      setUserAnswer('');
      // Generate new problem after wrong answer
      setTimeout(() => {
        setMathProblem(generateMathProblem());
        setError('');
      }, 1500);
    }
  };

  const handleSwipeGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    const progress = Math.abs(translationX) / (screenWidth * 0.7);
    
    if (progress >= 1) {
      onDismiss();
    } else {
      swipeProgress.setValue(progress);
    }
  };

  const handleShake = () => {
    const newShakeCount = shakeCount + 1;
    setShakeCount(newShakeCount);
    
    if (newShakeCount >= requiredShakes) {
      onDismiss();
    }
  };

  const renderEasyChallenge = () => (
    <View style={styles.challengeContainer}>
      <Text style={styles.challengeTitle}>Ready to start your day?</Text>
      <TouchableOpacity style={styles.dismissButton} onPress={handleEasyDismiss}>
        <Text style={styles.dismissText}>I'M AWAKE!</Text>
      </TouchableOpacity>
      {alarm.snoozeEnabled && onSnooze && (
        <TouchableOpacity style={styles.snoozeButton} onPress={onSnooze}>
          <Text style={styles.snoozeText}>Snooze ({alarm.snoozeDuration}m)</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMediumChallenge = () => (
    <GestureHandlerRootView style={styles.challengeContainer}>
      <Text style={styles.challengeTitle}>Swipe to prove you're awake!</Text>
      <Text style={styles.challengeSubtitle}>Drag the slider all the way across</Text>
      
      <PanGestureHandler onGestureEvent={handleSwipeGesture}>
        <View style={styles.swipeContainer}>
          <View style={styles.swipeTrack}>
            <Animated.View 
              style={[
                styles.swipeHandle,
                {
                  transform: [{
                    translateX: swipeProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, screenWidth * 0.6],
                      extrapolate: 'clamp',
                    })
                  }]
                }
              ]}
            />
          </View>
          <Text style={styles.swipeText}>Swipe to dismiss</Text>
        </View>
      </PanGestureHandler>
      
      {alarm.snoozeEnabled && onSnooze && (
        <TouchableOpacity style={styles.snoozeButton} onPress={onSnooze}>
          <Text style={styles.snoozeText}>Snooze ({alarm.snoozeDuration}m)</Text>
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );

  const renderHardChallenge = () => (
    <View style={styles.challengeContainer}>
      <Text style={styles.challengeTitle}>Solve this to prove you're awake!</Text>
      <Text style={styles.mathProblem}>{mathProblem.question}</Text>
      
      <TextInput
        style={styles.mathInput}
        value={userAnswer}
        onChangeText={setUserAnswer}
        placeholder="Your answer"
        keyboardType="numeric"
        placeholderTextColor="#999"
        autoFocus
      />
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TouchableOpacity 
        style={[styles.submitButton, userAnswer ? {} : styles.disabledButton]} 
        onPress={handleMathSubmit}
        disabled={!userAnswer}
      >
        <Text style={styles.submitText}>Submit Answer</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.newProblemButton} onPress={() => setMathProblem(generateMathProblem())}>
        <Text style={styles.newProblemText}>New Problem</Text>
      </TouchableOpacity>
    </View>
  );

  const renderShakeChallenge = () => (
    <View style={styles.challengeContainer}>
      <Text style={styles.challengeTitle}>Shake your phone to wake up!</Text>
      <Text style={styles.challengeSubtitle}>
        Shake {requiredShakes - shakeCount} more times
      </Text>
      
      <TouchableOpacity style={styles.shakeButton} onPress={handleShake}>
        <Text style={styles.shakeText}>🔄</Text>
        <Text style={styles.shakeButtonText}>TAP TO SHAKE</Text>
      </TouchableOpacity>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(shakeCount / requiredShakes) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{shakeCount} / {requiredShakes}</Text>
    </View>
  );

  const renderChallenge = () => {
    switch (alarm.difficulty) {
      case 'easy':
        return renderEasyChallenge();
      case 'medium':
        return renderMediumChallenge();
      case 'hard':
        return renderHardChallenge();
      default:
        return renderEasyChallenge();
    }
  };

  return (
    <View style={styles.container}>
      {renderChallenge()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  challengeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  challengeSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 30,
  },
  dismissButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  dismissText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  snoozeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  snoozeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  swipeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  swipeTrack: {
    width: '80%',
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    marginBottom: 10,
  },
  swipeHandle: {
    width: 50,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    marginLeft: 5,
  },
  swipeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mathProblem: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  mathInput: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    minWidth: 150,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newProblemButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  newProblemText: {
    color: 'white',
    fontSize: 14,
  },
  shakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  shakeText: {
    fontSize: 40,
    marginBottom: 5,
  },
  shakeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
