import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useAuthStore } from '../store/authStore'
import { useNavigation } from '@react-navigation/native'
import { driverWalletBalance } from '../constants/Api'
import { useQuery } from '@tanstack/react-query'

export default function Account() {
  const USER = useAuthStore(state => state.user)
  const LOGOUT = useAuthStore(state => state.logout)
  const navigation: any = useNavigation()
  const [refreshing, setRefreshing] = useState(false)

  // Fetch wallet balance using TanStack Query
  const { 
    data: walletData, 
    isLoading: isLoadingBalance, 
    error: walletError,
    refetch: refetchWalletBalance 
  } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: driverWalletBalance,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  const walletBalance = walletData?.data?.balance || 0

  const handleLogout = () => {
    // navigation.navigate('Signin')
    navigation.reset({
      index: 0,
      routes: [{ name: 'Signin' }],
    })
    LOGOUT()
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refetchWalletBalance()
    } catch (error) {
      console.error('Error refreshing wallet balance:', error)
    } finally {
      setRefreshing(false)
    }
  }

  console.log('USER', USER?.documents?.profilePhoto?.image)

  // Menu items with icons, labels, and navigation targets
  const menuItems = [
    {
      icon: 'person',
      label: 'Manage Profile',
      onPress: () => navigation.navigate('Profile'),
      important: true
    },
    {
      icon: 'car-sport',
      label: 'Drivers',
      onPress: () => navigation.navigate('fellow-drivers'),
      important: true
    },
    {
      icon: 'card',
      label: 'Wallet Transactions',
      onPress: () => navigation.navigate('transactions'),
      important: true
    },
    {
      icon: 'wallet',
      label: 'Withdraw',
      onPress: () => navigation.navigate('withdraw'),
      important: true
    },
    // {
    //   icon: 'settings',
    //   label: 'Settings',
    //   onPress: () => {},
    //   important: true
    // },
    // {
    //   icon: 'chatbubbles',
    //   label: 'Messages',
    //   onPress: () => {},
    //   important: true
    // },
    // {
    //   icon: 'flame',
    //   label: 'Points & Rewards',
    //   onPress: () => {},
    //   important: true
    // },
    {
      icon: 'log-out',
      label: 'Logout',
      onPress: handleLogout,
      important: true,
      danger: true
    }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Gold}
            colors={[Gold]}
            progressBackgroundColor={Black}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            {/* {USER?.documents?.profilePhoto?.image ? (
              <Image 
                source={{ uri: `http://3.110.180.116:3000/${USER?.documents?.profilePhoto?.image}` }} 
                style={styles.profileImage} 
              />
            ) : ( */}
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {USER?.firstName?.charAt(0) || ''}{USER?.lastName?.charAt(0) || ''}
                </Text>
              </View>
            {/* )} */}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{USER?.firstName} {USER?.lastName}</Text>
            <Text style={styles.profileEmail}>{USER?.email || 'No email provided'}</Text>
            {/* <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletContent}>
            <View style={styles.walletLeft}>
              <View style={styles.walletIconContainer}>
                <Ionicons name="wallet" size={20} color={Gold} />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletTitle}>Wallet</Text>
                <Text style={styles.walletSubtitle}>Available balance</Text>
              </View>
            </View>
            <View style={styles.walletRight}>
              {isLoadingBalance ? (
                <ActivityIndicator size="small" color={Gold} />
              ) : walletError ? (
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => refetchWalletBalance()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.balanceAmount}>R{walletBalance.toFixed(2)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Invite Card */}
        {/* <View style={styles.inviteCard}>
          <View style={styles.inviteContent}>
            <Ionicons name="gift-outline" size={28} color={Black} style={styles.inviteIcon} />
            <View>
              <Text style={styles.inviteTitle}>Invite friends!</Text>
              <Text style={styles.inviteSubtitle}>Invite your friends to earn free points for later use</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.inviteButton}>
            <Text style={styles.inviteButtonText}>Share</Text>
            <Ionicons name="share-social-outline" size={16} color={White} />
          </TouchableOpacity>
        </View> */}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.filter(item => item.important).map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem, 
                item.danger && styles.dangerMenuItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={item.danger ? '#FF6B6B' : Gold} 
                />
              </View>
              <Text style={[
                styles.menuLabel, 
                item.danger && styles.dangerMenuLabel
              ]}>
                {item.label}
              </Text>
              {!item.danger && (
                <Ionicons name="chevron-forward" size={18} color={Gray} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: LightGold,
    fontSize: 28,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Gold,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Gold,
  },
  profileInitials: {
    color: Gold,
    fontSize: 28,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: White,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    color: Gray,
    fontSize: 14,
    marginBottom: 10,
  },
  editProfileButton: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 4,
  },
  editProfileText: {
    color: Gold,
    fontSize: 14,
    fontWeight: '600',
  },
  inviteCard: {
    backgroundColor: '#fce5fc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inviteIcon: {
    marginRight: 12,
  },
  inviteTitle: {
    color: Black,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  inviteSubtitle: {
    color: DarkGray,
    fontSize: 14,
    width: '90%',
  },
  inviteButton: {
    backgroundColor: Gold,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  inviteButtonText: {
    color: White,
    fontWeight: '600',
    marginRight: 6,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dangerMenuItem: {
    marginTop: 16,
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dangerMenuLabel: {
    color: '#FF6B6B',
  },
  versionText: {
    color: Gray,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
  },
  walletContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    color: White,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletSubtitle: {
    color: Gray,
    fontSize: 12,
  },
  walletRight: {
    // alignItems: 'flex-end',
    // paddingRight: 10,
  },
  loadingText: {
    color: Gray,
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: Gold,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  retryButtonText: {
    color: Black,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: {
    color: Gold,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
})