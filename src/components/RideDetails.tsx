import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Black, Gold, Gray, White, DarkGray } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RideDetails() {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { ride } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView showsVerticalScrollIndicator={false}> */}
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <Ionicons 
                name={ride.status === 'completed' ? 'checkmark-circle' : 'time'} 
                size={28} 
                color={ride.status === 'completed' ? '#4CAF50' : '#FF9800'} 
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Ride Status</Text>
              <Text style={styles.statusSubtitle}>
                {ride.status === 'completed' ? 'Successfully completed' : 'In progress'}
              </Text>
            </View>
          </View>
          <View style={styles.statusDetails}>
            <Text style={[styles.statusText, {color: ride.status === 'completed' ? '#4CAF50' : '#FF9800'}]}>
              {ride.status.toUpperCase()}
            </Text>
            <Text style={styles.dateText}>
              {new Date(ride.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })} • {new Date(ride.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Trip Details Section */}
        <View style={styles.formContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            
            <View style={styles.locationCard}>
              <View style={styles.locationItem}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location" size={20} color="#4CAF50" />
                </View>
                <View style={styles.locationContent}>
                  <Text style={styles.locationLabel}>Pickup Location</Text>
                  <Text style={styles.locationAddress}>{ride.pickupLocation.address}</Text>
                </View>
              </View>
              
              <View style={styles.locationDivider} />
              
              <View style={styles.locationItem}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location" size={20} color="#FF6B6B" />
                </View>
                <View style={styles.locationContent}>
                  <Text style={styles.locationLabel}>Drop-off Location</Text>
                  <Text style={styles.locationAddress}>{ride.destination.address}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Customer Details Section */}
          {ride.customer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              
              <View style={styles.customerCard}>
                <View style={styles.customerIconContainer}>
                  <Ionicons name="person" size={24} color={Gold} />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>
                    {ride.customer.firstName} {ride.customer.lastName}
                  </Text>
                  <Text style={styles.customerLabel}>Customer</Text>
                </View>
              </View>
            </View>
          )}

          {/* Fare Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fare Details</Text>
            
            <View style={styles.fareCard}>
              <View style={styles.fareRow}>
                <View style={styles.fareItem}>
                  <Ionicons name="speedometer" size={18} color={Gold} />
                  <Text style={styles.fareLabel}>Distance</Text>
                  <Text style={styles.fareValue}>{ride.distance.toFixed(2)} km</Text>
                </View>
                <View style={styles.fareDivider} />
                <View style={styles.fareItem}>
                  <Ionicons name="cash" size={18} color={Gold} />
                  <Text style={styles.fareLabel}>Price per km</Text>
                  <Text style={styles.fareValue}>R{ride.vehicle.pricePerKm}</Text>
                </View>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Fare</Text>
                <Text style={styles.totalValue}>R{ride.fare.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  statusCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginVertical: 16,
    // shadowColor: Gold,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    color: White,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtitle: {
    color: Gray,
    fontSize: 13,
  },
  statusDetails: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  dateText: {
    color: Gray,
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  locationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    color: Gray,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    color: White,
    fontSize: 14,
    lineHeight: 20,
  },
  locationDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  customerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerLabel: {
    color: Gray,
    fontSize: 13,
  },
  fareCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fareRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  fareItem: {
    flex: 1,
    alignItems: 'center',
  },
  fareDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  fareLabel: {
    color: Gray,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 4,
  },
  fareValue: {
    color: White,
    fontSize: 16,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalLabel: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    color: Gold,
    fontSize: 20,
    fontWeight: '700',
  },
});