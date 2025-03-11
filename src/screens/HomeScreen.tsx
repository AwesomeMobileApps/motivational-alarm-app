import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { AlarmSettings, COLORS } from '../types';
import { AlarmListItem } from '../components/AlarmListItem';
import { AlarmEditScreen } from './AlarmEditScreen';
import { MotivationalAlarmScreen } from '../components/MotivationalAlarmScreen';
import { useAlarms } from '../hooks/useAlarms';
import { useActiveAlarm } from '../hooks/useActiveAlarm';
import { getNextAlarmTime, formatTime } from '../utils/alarmUtils';

/**
 * Main home screen of the app - displays alarm list and manages screens
 */
export const HomeScreen: React.FC = () => {
  // States for managing screens
  const [showEditScreen, setShowEditScreen] = useState(false);
  const [currentEditAlarm, setCurrentEditAlarm] = useState<AlarmSettings | null>(null);

  // Load alarms from storage
  const { 
    alarms,
    loading,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarmEnabled
  } = useAlarms();

  // Memoize the alarms array to prevent infinite re-renders
  const memoizedAlarms = useCallback(() => alarms, [alarms]);

  // Track active alarms with memoized alarms array
  const {
    isAlarmRinging,
    activeAlarm,
    nextAlarmTime,
    dismissAlarm
  } = useActiveAlarm(memoizedAlarms());

  // Handle creating a new alarm
  const handleAddAlarm = useCallback(() => {
    const newAlarm = addAlarm();
    setCurrentEditAlarm(newAlarm);
    setShowEditScreen(true);
  }, [addAlarm]);

  // Handle editing an existing alarm
  const handleEditAlarm = useCallback((alarm: AlarmSettings) => {
    setCurrentEditAlarm(alarm);
    setShowEditScreen(true);
  }, []);

  // Save alarm changes
  const handleSaveAlarm = useCallback((alarm: AlarmSettings) => {
    updateAlarm(alarm);
    setShowEditScreen(false);
    setCurrentEditAlarm(null);
  }, [updateAlarm]);

  // Delete an alarm
  const handleDeleteAlarm = useCallback((id: string) => {
    deleteAlarm(id);
    setShowEditScreen(false);
    setCurrentEditAlarm(null);
  }, [deleteAlarm]);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setShowEditScreen(false);
    setCurrentEditAlarm(null);
  }, []);

  // Render empty state when no alarms
  const renderEmptyState = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Alarms Yet</Text>
        <Text style={styles.emptyText}>
          Tap the + button to create your first motivational alarm!
        </Text>
      </View>
    );
  }, []);

  // Determine what screen to show
  if (isAlarmRinging && activeAlarm) {
    return (
      <MotivationalAlarmScreen 
        alarm={activeAlarm} 
        onDismiss={dismissAlarm} 
      />
    );
  }

  if (showEditScreen && currentEditAlarm) {
    return (
      <AlarmEditScreen
        alarm={currentEditAlarm}
        onSave={handleSaveAlarm}
        onDelete={handleDeleteAlarm}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Motivational Alarm</Text>
          {nextAlarmTime && (
            <Text style={styles.nextAlarmText}>
              Next alarm: {formatTime(nextAlarmTime)}
            </Text>
          )}
        </View>

        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmListItem
              alarm={item}
              onPress={handleEditAlarm}
              onToggle={toggleAlarmEnabled}
            />
          )}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={alarms.length === 0 ? { flex: 1 } : {}}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddAlarm}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <View style={styles.motivationalFooter}>
          <Text style={styles.footerText}>
            Wake up motivated, conquer your day!
          </Text>
        </View>
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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  nextAlarmText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    bottom: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  motivationalFooter: {
    padding: 15,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 