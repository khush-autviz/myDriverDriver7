import React, { useEffect, useState } from 'react'
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
} from 'react-native'
import { Black, Gold, Gray, LightGold, White } from '../../constants/Color'
import { useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useAuthStore } from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'
// import { checkApprovalStatus } from '../../constants/Api'

export default function ApprovalScreen() {
  const USER = useAuthStore(state => state.user)
  const navigation: any = useNavigation()
  
  // Query to check approval status periodically
//   const { data, isLoading, refetch } = useQuery({
//     queryKey: ['approvalStatus', USER?.id],
//     queryFn: () => checkApprovalStatus(USER?.id),
//     enabled: !!USER?.id,
//     refetchInterval: 30000, // Check every 30 seconds
//     onSuccess: (response) => {
//       console.log('Approval status:', response);
//       // If approved, navigate to main screen
//       if (response?.data?.status === 'approved') {
//         Alert.alert(
//           'Approved!',
//           'Your documents have been verified. You can now start using the app.',
//           [
//             { text: 'OK', onPress: () => navigation.navigate('Main') }
//           ]
//         );
//       }
//     }
//   });
  
  // Update time elapsed counter
  useEffect(() => {
  }, []);
  
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Document Verification</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={80} color={Gold} />
        </View>
        
        <Text style={styles.titleText}>Verification in Progress</Text>
        
        <Text style={styles.descriptionText}>
          Your documents have been submitted and are currently being reviewed by our team.
          This process typically takes 24-48 hours to complete.
        </Text>
        
         {/* <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>
            {isLoading ? 'Checking...' : (data?.data?.status || 'Pending')}
          </Text>
        </View>  */}
        
        {/* <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Time elapsed:</Text>
          <Text style={styles.timeValue}>{getTimeElapsedText()}</Text>
        </View> */}
        
        {/* <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color={LightGold} />
          <Text style={styles.infoText}>
            You'll receive a notification once your documents are verified.
            You can check back here anytime to see your current status.
          </Text>
        </View> */}
        
        {/* <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Black} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color={Black} />
              <Text style={styles.refreshButtonText}>Refresh Status</Text>
            </>
          )}
        </TouchableOpacity> */}
        
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="mail-outline" size={20} color={White} />
          <Text style={styles.supportButtonText}>Test</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Black,
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    color: Gold,
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: White,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  descriptionText: {
    color: LightGold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  statusLabel: {
    color: Gray,
    fontSize: 16,
    marginRight: 10,
  },
  statusValue: {
    color: Gold,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  timeLabel: {
    color: Gray,
    fontSize: 16,
    marginRight: 10,
  },
  timeValue: {
    color: White,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    width: '100%',
  },
  infoText: {
    color: LightGold,
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: Gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
  },
  refreshButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  supportButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  supportButtonText: {
    color: White,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  }
})