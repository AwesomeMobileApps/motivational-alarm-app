import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { AlarmSettings, COLORS } from '../types';
import { formatTime, formatDays } from '../utils/alarmUtils';

interface AlarmListItemProps {
  alarm: AlarmSettings;
  onPress: (alarm: AlarmSettings) => void;
  onToggle: (id: string) => void;
}

/**
 * Component to display a single alarm in the list
 */
export const AlarmListItem: React.FC<AlarmListItemProps> = ({
  alarm,
  onPress,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { opacity: alarm.isEnabled ? 1 : 0.5 }
      ]}
      onPress={() => onPress(alarm)}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(alarm.time)}</Text>
        <Text style={styles.daysText}>{formatDays(alarm.days)}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        <Text style={styles.labelText}>{alarm.label}</Text>
        <Switch
          value={alarm.isEnabled}
          onValueChange={() => onToggle(alarm.id)}
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={alarm.isEnabled ? COLORS.accent : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  daysText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
}); 