import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRide, getRideHelpers } from '../context/RideContext';
import { Gold, Black, White, Gray } from '../constants/Color';

// Example component showing how to use the RideContext
export default function RideContextExample() {
  const {
    currentRide,
    fetchRideDetails,
    updateRideData,
    clearRide,
    refreshRide
  } = useRide();

  const handleFetchRide = () => {
    // Example: Fetch ride details for a specific ride ID
    fetchRideDetails('60d0fe4f5311236168a109cd');
  };

  const handleUpdateStatus = () => {
    // Example: Update ride status
    updateRideData({ status: 'rideStarted' });
  };

  const handleClearRide = () => {
    clearRide();
  };

  const handleRefreshRide = () => {
    refreshRide();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Context Example</Text>



      {/* Current Ride Data */}
      {currentRide && (
        <View style={styles.rideContainer}>
          <Text style={styles.rideTitle}>Current Ride</Text>
          <Text style={styles.rideText}>ID: {currentRide._id}</Text>
          <Text style={styles.rideText}>Status: {getRideHelpers.getStatusText(currentRide.status)}</Text>
          <Text style={styles.rideText}>Customer ID: {currentRide.customer}</Text>
          <Text style={styles.rideText}>Driver ID: {currentRide.driver}</Text>
          <Text style={styles.rideText}>Pickup: {currentRide.pickupLocation.address}</Text>
          <Text style={styles.rideText}>Destination: {currentRide.destination.address}</Text>
          <Text style={styles.rideText}>Fare: ${currentRide.fare}</Text>
          <Text style={styles.rideText}>Distance: {currentRide.distance} km</Text>
          <Text style={styles.rideText}>Vehicle ID: {currentRide.vehicle}</Text>

          {/* Example of using helper functions for coordinates */}
          <Text style={styles.rideText}>
            Pickup Coords: {JSON.stringify(getRideHelpers.getPickupLatLng(currentRide))}
          </Text>
          <Text style={styles.rideText}>
            Destination Coords: {JSON.stringify(getRideHelpers.getDestinationLatLng(currentRide))}
          </Text>
          <Text style={styles.rideText}>
            Is Active: {getRideHelpers.isRideActive(currentRide.status) ? 'Yes' : 'No'}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleFetchRide}>
          <Text style={styles.buttonText}>Fetch Ride Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleUpdateStatus}>
          <Text style={styles.buttonText}>Update Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRefreshRide}>
          <Text style={styles.buttonText}>Refresh Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleClearRide}>
          <Text style={styles.buttonText}>Clear Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Gold,
    textAlign: 'center',
    marginBottom: 20,
  },

  rideContainer: {
    backgroundColor: Gray,
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Gold,
    marginBottom: 10,
  },
  rideText: {
    color: White,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: Gold,
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: Black,
    fontWeight: 'bold',
  },
});
