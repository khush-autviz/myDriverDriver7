import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Switch,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import {
  Black,
  DarkGray,
  Gold,
  Gray,
  White,
} from '../constants/Color';
import MapView, { Marker } from 'react-native-maps';
import { useSocket } from '../context/SocketContext';
import { useMutation } from '@tanstack/react-query';
import { driverGoOnline, extraDriverGoOnline } from '../constants/Api';
import { useLocation } from '../context/LocationProvider';
import { useAuthStore } from '../store/authStore';


export default function Home() {
  const [isNormalMode, setIsNormalMode] = useState(false);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const socket = useSocket();
  const {location} = useLocation()
  const USER = useAuthStore(state => state.user)

  const DriverOnlineMutation = useMutation({
    mutationFn: driverGoOnline,
    onSuccess: (response) => {
      console.log('driver online success', response);
    },
    onError: (error) => {
      console.log('driver online error', error);
    }
  })

  const ExtraDriverOnlineMutation = useMutation({
    mutationFn: extraDriverGoOnline,
    onSuccess: (response) => {
      console.log('extra driver online success', response);
    },
    onError: (error) => {
      console.log('extra driver online error', error);
    }
  })
  
  // Function to handle normal mode toggle
  const toggleNormalMode = () => {
    if (!isNormalMode) {
      DriverOnlineMutation.mutateAsync({
        driverId: USER?.id,
        location: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        }
      })
      setIsNormalMode(true);
      setIsDriverMode(false);
    } else {
      setIsNormalMode(false);
    }
  };
  
  // Function to handle driver mode toggle
  const toggleDriverMode = () => {
    if (!isDriverMode) {
      ExtraDriverOnlineMutation.mutateAsync({
        driverId: USER?.id,
        location: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        }
      })
      setIsDriverMode(true);
      setIsNormalMode(false);
    } else {
      setIsDriverMode(false);
    }
  };

  


  return (
    <>
      <StatusBar backgroundColor={Black} barStyle="light-content" />
      <View style={styles.container}>
        {/* Mode Toggle Section */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleCard}>
            <Text style={styles.toggleLabel}>Normal Mode</Text>
            <Switch
              trackColor={{ false: DarkGray, true: Gold }}
              thumbColor={isNormalMode ? White : Gray}
              ios_backgroundColor={DarkGray}
              onValueChange={toggleNormalMode}
              value={isNormalMode}
            />
          </View>
  
          <View style={styles.toggleCard}>
            <Text style={styles.toggleLabel}>Driver Mode</Text>
            <Switch
              trackColor={{ false: DarkGray, true: Gold }}
              thumbColor={isDriverMode ? White : Gray}
              ios_backgroundColor={DarkGray}
              onValueChange={toggleDriverMode}
              value={isDriverMode}
            />
          </View>
        </View>
  
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              // latitude: 37.78825,
              latitude: location?.latitude || 0,
              // longitude: -122.4324,
              longitude: location?.longitude || 0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
          </MapView>
        </View>
      </View>
    </>
  );
  

}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  toggleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleLabel: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  toggleDescription: {
    color: Gray,
    fontSize: 14,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Black,
    padding: 10,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 10,
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
  
});