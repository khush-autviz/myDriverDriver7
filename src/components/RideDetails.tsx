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

export default function RideDetails() {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { ride } = route.params;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
      </View>

      {/* Status and Date */}
      <View style={styles.section}>
        <View style={styles.statusContainer}>
          <Text style={[styles.status, {color: ride.status === 'completed' ? '#4CAF50' : '#F44336'}]}>{ride.status.toUpperCase()}</Text>
          <Text style={styles.date}>{new Date(ride.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })} • {new Date(ride.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}</Text>

        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.locationContainer}>
          <View style={styles.locationItem}>
            <Ionicons name="location" size={24} color="green" />
            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationAddress}>{ride.pickupLocation.address}</Text>
            </View>
          </View>
          {/* <View style={styles.locationDivider} /> */}
          <View style={styles.locationItem}>
            <Ionicons name="location" size={24} color="red" />
            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Drop-off</Text>
              <Text style={styles.locationAddress}>{ride.destination.address}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Driver Details */}
      {ride.customer && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Name</Text>
        <View style={styles.driverContainer}>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>
              {ride.customer.firstName} {ride.customer.lastName}
            </Text>
            {/* <Text style={styles.vehicleInfo}>
              {ride.driver.vehicleDetails.brand} {ride.driver.vehicleDetails.model} • {ride.driver.vehicleDetails.color}
            </Text> */}
            {/* <Text style={styles.licensePlate}>
              {ride.driver.vehicleDetails.licensePlate}
            </Text> */}
          </View>

        </View>
      </View>
      )}
      {/* Fare Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fare Details</Text>
        <View style={styles.fareContainer}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Distance</Text>
            <Text style={styles.fareValue}>{ride.distance.toFixed(2)} km</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Price per km</Text>
            <Text style={styles.fareValue}>${ride.vehicle.pricePerKm}</Text>
          </View>
          <View style={styles.fareDivider} />
          <View style={styles.fareRow}>
            <Text style={styles.totalLabel}>Total Fare</Text>
            <Text style={styles.totalValue}>${ride.fare.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Rating Button */}
      {/* {(ride.status === 'completed' && ride.rating === null) && (
        <TouchableOpacity 
          style={styles.ratingButton}
          onPress={() => navigation.navigate('Ratings', { rideId: ride.id })}
        >
          <Ionicons name="star" size={20} color={Black} />
          <Text style={styles.ratingButtonText}>Rate your ride</Text>
        </TouchableOpacity>
      )} */}

      {/* Bottom Spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  headerTitle: {
    color: Gold,
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: Gold,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statusContainer: {
    backgroundColor: DarkGray,
    borderRadius: 12,
    padding: 15,
  },
  status: {
    // color: Gold,
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    color: Gray,
    fontSize: 14,
    marginTop: 5,
  },
  locationContainer: {
    backgroundColor: DarkGray,
    borderRadius: 12,
    padding: 15,
    gap: 10,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationText: {
    marginLeft: 10,
    flex: 1,
  },
  locationLabel: {
    color: Gray,
    fontSize: 14,
  },
  locationAddress: {
    color: White,
    fontSize: 14,
    marginTop: 2,
  },
  locationDivider: {
    height: 20,
    width: 1,
    backgroundColor: Gray,
    marginLeft: 12,
    marginVertical: 5,
  },
  driverContainer: {
    backgroundColor: DarkGray,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleInfo: {
    color: Gray,
    fontSize: 14,
    marginTop: 5,
  },
  licensePlate: {
    color: Gold,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  phoneButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fareContainer: {
    backgroundColor: DarkGray,
    borderRadius: 12,
    padding: 15,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fareLabel: {
    color: Gray,
    fontSize: 14,
  },
  fareValue: {
    color: White,
    fontSize: 14,
  },
  fareDivider: {
    height: 1,
    backgroundColor: Gray,
    marginVertical: 10,
  },
  totalLabel: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    color: Gold,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingButton: {
    backgroundColor: Gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  ratingButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});