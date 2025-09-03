import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { COLORS } from '../types';
import { useAlarmStats } from '../hooks/useAlarmStats';

interface StatsScreenProps {
  onClose: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onClose }) => {
  const { stats, loading, getStreakStatus, getWeeklyPerformance, resetStats } = useAlarmStats();
  const weeklyPerf = getWeeklyPerformance();
  const streakStatus = getStreakStatus();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; color?: string }> = ({
    title,
    value,
    subtitle,
    color = COLORS.primary
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const getSuccessRate = () => {
    if (stats.totalAlarms === 0) return 0;
    return Math.round((stats.onTimeWakeups / stats.totalAlarms) * 100);
  };

  const getAverageSnoozes = () => {
    if (stats.totalAlarms === 0) return 0;
    return (stats.snoozeCount / stats.totalAlarms).toFixed(1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Wake-Up Stats</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Streak Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Streak</Text>
            <View style={[styles.streakCard, { backgroundColor: stats.streakDays > 0 ? COLORS.accent : '#E0E0E0' }]}>
              <Text style={styles.streakNumber}>{stats.streakDays}</Text>
              <Text style={styles.streakLabel}>Day{stats.streakDays !== 1 ? 's' : ''}</Text>
              <Text style={styles.streakStatus}>{streakStatus}</Text>
            </View>
          </View>

          {/* Weekly Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.weeklyCard}>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>Days with alarms:</Text>
                <Text style={styles.weeklyValue}>{weeklyPerf.totalDays}</Text>
              </View>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>On-time wake-ups:</Text>
                <Text style={styles.weeklyValue}>{weeklyPerf.onTimeDays}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${weeklyPerf.percentage}%`,
                      backgroundColor: weeklyPerf.percentage >= 80 ? COLORS.accent :
                        weeklyPerf.percentage >= 60 ? COLORS.primary : COLORS.secondary
                    }
                  ]}
                />
              </View>
              <Text style={styles.percentageText}>{weeklyPerf.percentage}% success rate</Text>
            </View>
          </View>

          {/* Overall Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Time</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Alarms"
                value={stats.totalAlarms}
                color={COLORS.primary}
              />
              <StatCard
                title="Success Rate"
                value={`${getSuccessRate()}%`}
                subtitle={`${stats.onTimeWakeups} on-time wake-ups`}
                color={COLORS.accent}
              />
              <StatCard
                title="Total Snoozes"
                value={stats.snoozeCount}
                subtitle={`${getAverageSnoozes()} avg per alarm`}
                color={COLORS.secondary}
              />
              <StatCard
                title="Motivation Quotes"
                value={stats.motivationalQuotesShown}
                subtitle="Total quotes shown"
                color="#9C27B0"
              />
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsContainer}>
              <View style={[styles.achievement, stats.streakDays >= 7 ? styles.achievementUnlocked : styles.achievementLocked]}>
                <Text style={styles.achievementEmoji}>🔥</Text>
                <Text style={[styles.achievementText, stats.streakDays >= 7 ? styles.achievementTextUnlocked : styles.achievementTextLocked]}>
                  Week Warrior
                </Text>
                <Text style={styles.achievementDesc}>7-day streak</Text>
              </View>

              <View style={[styles.achievement, stats.totalAlarms >= 50 ? styles.achievementUnlocked : styles.achievementLocked]}>
                <Text style={styles.achievementEmoji}>⏰</Text>
                <Text style={[styles.achievementText, stats.totalAlarms >= 50 ? styles.achievementTextUnlocked : styles.achievementTextLocked]}>
                  Alarm Master
                </Text>
                <Text style={styles.achievementDesc}>50 total alarms</Text>
              </View>

              <View style={[styles.achievement, getSuccessRate() >= 90 ? styles.achievementUnlocked : styles.achievementLocked]}>
                <Text style={styles.achievementEmoji}>🏆</Text>
                <Text style={[styles.achievementText, getSuccessRate() >= 90 ? styles.achievementTextUnlocked : styles.achievementTextLocked]}>
                  Perfect Morning
                </Text>
                <Text style={styles.achievementDesc}>90% success rate</Text>
              </View>

              <View style={[styles.achievement, stats.snoozeCount === 0 && stats.totalAlarms > 0 ? styles.achievementUnlocked : styles.achievementLocked]}>
                <Text style={styles.achievementEmoji}>🚫</Text>
                <Text style={[styles.achievementText, stats.snoozeCount === 0 && stats.totalAlarms > 0 ? styles.achievementTextUnlocked : styles.achievementTextLocked]}>
                  No Snooze Hero
                </Text>
                <Text style={styles.achievementDesc}>Never hit snooze</Text>
              </View>
            </View>
          </View>

          {/* Reset Button */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.resetButton} onPress={resetStats}>
              <Text style={styles.resetText}>Reset All Statistics</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.text,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  streakCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  streakLabel: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginTop: -5,
  },
  streakStatus: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 5,
    textAlign: 'center',
  },
  weeklyCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weeklyLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  weeklyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 15,
  },
  progressFill: {
    height: '100%',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statSubtitle: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.6,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievement: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementUnlocked: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  achievementLocked: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  achievementEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTextUnlocked: {
    color: COLORS.text,
  },
  achievementTextLocked: {
    color: '#999',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
