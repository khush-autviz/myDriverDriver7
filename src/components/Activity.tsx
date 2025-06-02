import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, Gray, Gold, LightGold, White, DarkGray } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'

// Sample data for demonstration
const sampleActivities : any= [
  // Empty for now - will show empty state
]

// Activity item component
const ActivityItem = ({ item}: {item: any} ) => (
  <View style={styles.activityItem}>
    <View style={styles.activityIconContainer}>
      <Ionicons name={item.type === 'ride' ? 'car' : 'cash'} size={20} color={Gold} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{item.title}</Text>
      <Text style={styles.activityDate}>{item.date}</Text>
    </View>
    <View style={styles.activityAmount}>
      <Text style={[styles.amountText, item.type === 'earning' && styles.earningText]}>
        {item.type === 'earning' ? '+' : ''}{item.amount}
      </Text>
    </View>
  </View>
)

export default function Activity() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(false)



  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="time-outline" size={60} color={Gold} />
      </View>
      <Text style={styles.emptyStateTitle}>No Activity Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Your completed rides and earnings will appear here. Start driving to see your activity.
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      {/* Activity Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Rides</Text>
          <Text style={styles.summaryValue}>0</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Earnings</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>
      </View>

      {/* Activity List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Gold} />
          <Text style={styles.loadingText}>Loading your activities...</Text>
        </View>
      ) : (
        <FlatList
          data={sampleActivities}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <ActivityItem item={item} />}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.activityListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: LightGold,
    fontSize: 32,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterTitle: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionText: {
    color: White,
    fontSize: 14,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingRight: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: Gold,
  },
  tabText: {
    color: Gray,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: Black,
    fontWeight: '600',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 10,
  },
  summaryLabel: {
    color: Gray,
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    color: Gold,
    fontSize: 24,
    fontWeight: '700',
  },
  activityListContent: {
    flexGrow: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDate: {
    color: Gray,
    fontSize: 14,
  },
  activityAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: White,
    fontSize: 16,
    fontWeight: '700',
  },
  earningText: {
    color: '#4CAF50',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    color: White,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: Gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Gray,
    marginTop: 12,
    fontSize: 16,
  },
})