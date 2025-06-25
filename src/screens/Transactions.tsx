import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { driverWalletTransactions } from '../constants/Api'
import { useQuery } from '@tanstack/react-query'

export default function Transactions() {
  const navigation: any = useNavigation()
  const [refreshing, setRefreshing] = useState(false)

  // Fetch wallet transactions using TanStack Query
  const { 
    data: transactionsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['walletTransactions'],
    queryFn: driverWalletTransactions,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  })

  const transactions = transactionsData?.data?.transactions || []

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (error) {
      console.error('Error refreshing transactions:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format amount
  const formatAmount = (amount: number) => {
    return `R${Math.abs(amount).toFixed(2)}`
  }

  // Get transaction type icon and color
  const getTransactionInfo = (type: string, amount: number) => {
    const isCredit = amount > 0
    
    switch (type?.toLowerCase()) {
      case 'ride_earning':
        return {
          icon: 'car',
          color: '#4CAF50',
          label: 'Ride Earning'
        }
      case 'withdrawal':
        return {
          icon: 'arrow-down',
          color: '#FF6B6B',
          label: 'Withdrawal'
        }
      case 'bonus':
        return {
          icon: 'gift',
          color: '#FF9800',
          label: 'Bonus'
        }
      case 'refund':
        return {
          icon: 'refresh',
          color: '#2196F3',
          label: 'Refund'
        }
      default:
        return {
          icon: isCredit ? 'add-circle' : 'remove-circle',
          color: isCredit ? '#4CAF50' : '#FF6B6B',
          label: isCredit ? 'Credit' : 'Debit'
        }
    }
  }

  console.log('transactions', transactionsData)

  // Transaction item component
  const TransactionItem = ({ item }: { item: any }) => {
    const transactionInfo = getTransactionInfo(item.type, item.amount)
    const isCredit = item.amount > 0

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, { backgroundColor: `${transactionInfo.color}20` }]}>
            <Ionicons name={transactionInfo.icon} size={18} color={transactionInfo.color} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{transactionInfo.label}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
            {item.description && (
              <Text style={styles.transactionDescription}>{item.description}</Text>
            )}
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: isCredit ? '#4CAF50' : '#FF6B6B' }
          ]}>
            {isCredit ? '+' : '-'}{formatAmount(item.amount)}
          </Text>
          <Text style={styles.transactionStatus}>
            {item.status?.toLowerCase() === 'completed' ? 'Completed' : item.status || 'Pending'}
          </Text>
        </View>
      </View>
    )
  }

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="receipt-outline" size={48} color={Gray} />
      </View>
      <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Your transaction history will appear here once you start earning from rides.
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        {/* <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => refetch()}
          disabled={isLoading}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color={isLoading ? Gray : Gold} 
          />
        </TouchableOpacity> */}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Gold} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorDescription}>
            Unable to load your transaction history. Please try again.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => <TransactionItem item={item} />}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Gold}
              colors={[Gold]}
              progressBackgroundColor={Black}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Gold,
    fontSize: 20,
    fontWeight: '700',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Gray,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: White,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: Gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    color: Gray,
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDescription: {
    color: Gray,
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionStatus: {
    color: Gray,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  separator: {
    height: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    lineHeight: 22,
  },
})
