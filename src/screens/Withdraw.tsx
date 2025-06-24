import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, FlatList, TextInput, Alert, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { createWithdrawalRequest, withdrawalHistory } from '../constants/Api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShowToast } from '../lib/Toast'

export default function Withdraw() {
  const navigation: any = useNavigation()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'withdraw' | 'transactions'>('withdraw')
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  
  // Form state for withdrawal
  const [amount, setAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
  })

  // Fetch withdrawal history
  const { 
    data: withdrawalHistoryData, 
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['withdrawalHistory'],
    queryFn: withdrawalHistory,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  })

  // Create withdrawal request mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: createWithdrawalRequest,
    onSuccess: (response) => {
    //   Alert.alert(
    //     'Success',
    //     'Withdrawal request submitted successfully!',
    //     [
    //       {
    //         text: 'OK',
    //         onPress: () => {
    //           // Reset form
    //           setAmount('')
    //           setBankDetails({
    //             accountHolderName: '',
    //             accountNumber: '',
    //             bankName: '',
    //             routingNumber: '',
    //             swiftCode: ''
    //           })
    //           // Refresh withdrawal history
    //           queryClient.invalidateQueries({ queryKey: ['withdrawalHistory'] })
    //         }
    //       }
    //     ]
    //   )
    ShowToast('Withdrawal request submitted successfully!', {
        type: 'success'
        })
        setAmount('')
        setBankDetails({
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
        })
        refetchHistory()
    },
    onError: (error: any) => {
    //   Alert.alert(
    //     'Error',
    //     error?.response?.data?.message || 'Failed to submit withdrawal request',
    //     [{ text: 'OK' }]
    //   )
    ShowToast(error?.response?.data?.message || 'Failed to submit withdrawal request', {
        type: 'error'
        })
    }
  })

  const withdrawalHistoryList = withdrawalHistoryData?.data?.requests || []

  console.log('withdrawalHistoryList', withdrawalHistoryData)

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
    return `$${amount.toFixed(2)}`
  }

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { color: '#4CAF50', icon: 'checkmark-circle' }
      case 'rejected':
        return { color: '#FF6B6B', icon: 'close-circle' }
      case 'pending':
        return { color: '#FF9800', icon: 'time' }
      default:
        return { color: Gray, icon: 'help-circle' }
    }
  }

  // Handle withdrawal submission
  const handleWithdrawalSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      ShowToast('Please enter a valid amount', {
        type: 'error'
      })
      return
    }

    if (!bankDetails.accountHolderName || !bankDetails.accountNumber || 
        !bankDetails.bankName) {
      ShowToast('Please fill in all required bank details', {
        type: 'warning'
      })
      return
    }

    // Show confirmation dialog
    setShowConfirmationModal(true)
  }

  // Withdrawal history item component
  const WithdrawalItem = ({ item }: { item: any }) => {
    const statusInfo = getStatusInfo(item.status)

    return (
        <View style={{  backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            padding: 16,}}>
      <View style={styles.withdrawalItem}>
        <View style={styles.withdrawalLeft}>
          <View style={[styles.withdrawalIcon, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={18} color={statusInfo.color} />
          </View>
          <View style={styles.withdrawalInfo}>
            <Text style={styles.withdrawalTitle}>Withdrawal Request</Text>
            <Text style={styles.withdrawalDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.withdrawalBank}>{item.bankDetails?.bankName || 'Bank details'}</Text>
            <Text style={styles.withdrawalAccount}>Account: {item.bankDetails?.accountNumber || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.withdrawalRight}>
          <Text style={styles.withdrawalAmount}>{formatAmount(item.amount)}</Text>
          <Text style={[styles.withdrawalStatus, { color: statusInfo.color }]}>
            {item.status?.toLowerCase() === 'pending' ? 'Pending' : 
             item.status?.toLowerCase() === 'approved' ? 'Approved' :
             item.status?.toLowerCase() === 'rejected' ? 'Rejected' : item.status}
          </Text>
          {item.processedAt && (
            <Text style={styles.processedDate}>
              Processed: {formatDate(item.processedAt)}
            </Text>
          )}
        </View>
        </View>
        {item.status?.toLowerCase() === 'rejected' && (
          <Text style={{color: '#FF6B6B', fontSize: 12, fontWeight: '600', marginTop: 10}}>{item.rejectionReason}</Text>
        )}
      </View>
    )
  }

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="card-outline" size={48} color={Gray} />
      </View>
      <Text style={styles.emptyStateTitle}>No Withdrawal History</Text>
      <Text style={styles.emptyStateDescription}>
        Your withdrawal requests will appear here once you submit them.
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
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'withdraw' && styles.activeTab]}
          onPress={() => setActiveTab('withdraw')}
        >
          <Text style={[styles.tabText, activeTab === 'withdraw' && styles.activeTabText]}>
            Withdraw
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'withdraw' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.withdrawContainer}>
            {/* Amount Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={Gray}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Bank Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank Details</Text>
              
              <TextInput
                style={styles.input}
                value={bankDetails.accountHolderName}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
                placeholder="Account Holder Name"
                placeholderTextColor={Gray}
              />
              
              <TextInput
                style={styles.input}
                value={bankDetails.accountNumber}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
                placeholder="Account Number"
                placeholderTextColor={Gray}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.input}
                value={bankDetails.bankName}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
                placeholder="Bank Name"
                placeholderTextColor={Gray}
              />
              
              {/* <TextInput
                style={styles.input}
                value={bankDetails.routingNumber}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, routingNumber: text }))}
                placeholder="Routing Number"
                placeholderTextColor={Gray}
                keyboardType="numeric"
              /> */}
              
              {/* <TextInput
                style={styles.input}
                value={bankDetails.swiftCode}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, swiftCode: text }))}
                placeholder="SWIFT Code (Optional)"
                placeholderTextColor={Gray}
                autoCapitalize="characters"
              /> */}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.submitButton,
                createWithdrawalMutation.isPending && styles.submitButtonDisabled
              ]}
              onPress={handleWithdrawalSubmit}
              disabled={createWithdrawalMutation.isPending}
            >
              {createWithdrawalMutation.isPending ? (
                <ActivityIndicator size="small" color={Black} />
              ) : (
                <Text style={styles.submitButtonText}>Submit Withdrawal Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // Transactions Tab
        <>
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Gold} />
              <Text style={styles.loadingText}>Loading withdrawal history...</Text>
            </View>
          ) : historyError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
              <Text style={styles.errorTitle}>Failed to Load</Text>
              <Text style={styles.errorDescription}>
                Unable to load your withdrawal history. Please try again.
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => refetchHistory()}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={withdrawalHistoryList}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={({ item }) => <WithdrawalItem item={item} />}
              ListEmptyComponent={EmptyState}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </>
      )}

      {showConfirmationModal && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showConfirmationModal}
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="wallet" size={32} color={Gold} />
                </View>
                <Text style={styles.modalTitle}>Confirm Withdrawal</Text>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  Are you sure you want to proceed with this withdrawal?
                </Text>
                
                <View style={styles.withdrawalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>${parseFloat(amount).toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bank:</Text>
                    <Text style={styles.detailValue}>{bankDetails.bankName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account:</Text>
                    <Text style={styles.detailValue}>{bankDetails.accountNumber}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowConfirmationModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    createWithdrawalMutation.isPending && styles.confirmButtonDisabled
                  ]}
                  onPress={() => {
                    setShowConfirmationModal(false)
                    const withdrawalData = {
                      amount: parseFloat(amount),
                      bankDetails
                    }
                    createWithdrawalMutation.mutate(withdrawalData)
                  }}
                  disabled={createWithdrawalMutation.isPending}
                >
                  {createWithdrawalMutation.isPending ? (
                    <ActivityIndicator size="small" color={White} />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Gold,
  },
  tabText: {
    color: Gray,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: Black,
  },
  content: {
    flex: 1,
  },
  withdrawContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: White,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currencySymbol: {
    color: Gold,
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: White,
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: White,
    fontSize: 16,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: Gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '700',
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
  withdrawalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'rgba(255, 255, 255, 0.05)',
    // borderRadius: 12,
    // padding: 16,
  },
  withdrawalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  withdrawalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  withdrawalInfo: {
    flex: 1,
  },
  withdrawalTitle: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  withdrawalDate: {
    color: Gray,
    fontSize: 14,
    marginBottom: 2,
  },
  withdrawalBank: {
    color: Gray,
    fontSize: 12,
  },
  withdrawalAccount: {
    color: Gray,
    fontSize: 11,
    marginTop: 2,
  },
  withdrawalRight: {
    alignItems: 'flex-end',
  },
  withdrawalAmount: {
    color: Gold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  withdrawalStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 2,
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
  processedDate: {
    color: Gray,
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: Black,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: Gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: Gold,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalDescription: {
    color: White,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  withdrawalDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: Gray,
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    color: Gold,
    fontSize: 14,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Gold,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '700',
  },
})
