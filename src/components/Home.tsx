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
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Black,
  DarkGray,
  Gold,
  Gray,
  LightGold,
  maroon,
  White,
} from '../constants/Color';
import MapView, { Marker } from 'react-native-maps';
import { useSocket } from '../context/SocketContext';
import { useMutation } from '@tanstack/react-query';
import { driverGoOffline, driverGoOnline, extraDriverGoOnline, rideAccepted, rideDetails } from '../constants/Api';
import { useLocation } from '../context/LocationProvider';
import { useAuthStore } from '../store/authStore';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { useRide } from '../context/RideContext';
import { ShowToast } from '../lib/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Home() {
  const [isNormalMode, setIsNormalMode] = useState(false);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [modalVisible, setmodalVisible] = useState(false)
  const [rideDetails, setrideDetails] = useState<any>()
  const socket = useSocket();
  const { location, startTracking, stopTracking, startBackgroundTracking, stopBackgroundTracking, isBackgroundTracking } = useLocation()
  const { user: USER, setUser: SETUSER, setRideId } = useAuthStore()
  const navigation = useNavigation()
  const { fetchRideDetails } = useRide()



  const DriverOnlineMutation = useMutation({
    mutationFn: driverGoOnline,
    onSuccess: async (response) => {
      console.log('🚀 Driver online success', response);
      setIsNormalMode(true);

      // Start background location tracking when driver goes online
      try {
        await startBackgroundTracking();
        // console.log('✅ Background location tracking started for online driver');
      } catch (error) {
        console.error('❌ Failed to start background tracking:', error);
      }

      socket?.emit('goOnDuty', {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
      })
      socket?.emit('updateLocation', {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
      })
      socket?.on('rideRequest', (data) => {
        setrideDetails(data)
        setmodalVisible(true)
        // fetchRideDetails(data.rideId)  // This will trigger useEffect when currentRide updates
      })
    },
    onError: (error) => {
      console.log('❌ Driver online error', error);
    }
  })

  const ExtraDriverOnlineMutation = useMutation({
    mutationFn: extraDriverGoOnline,
    onSuccess: (response) => {
      console.log('extra driver online success', response);
      setIsDriverMode(true);
    },
    onError: (error) => {
      console.log('extra driver online error', error);
    }
  })

  const DriverOfflineMutation = useMutation({
    mutationFn: driverGoOffline,
    onSuccess: (response) => {
      console.log('🛑 Driver offline success', response);
      socket?.emit('goOffDuty')
      setIsNormalMode(false);
      setIsDriverMode(false);

      // Stop background location tracking when driver goes offline
      try {
        stopBackgroundTracking();
        console.log('✅ Background location tracking stopped for offline driver');
      } catch (error) {
        console.error('❌ Failed to stop background tracking:', error);
      }
    },
    onError: (error) => {
      console.log('❌ Driver offline error', error);
    }
  })


  // Function to handle normal mode toggle
  const toggleNormalMode = () => {
    if (!isNormalMode) {
      DriverOnlineMutation.mutateAsync({
        driverId: USER?.id ?? USER?._id,
        location: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
        }
      })
    } else {
      // Use the offline mutation to properly stop background tracking
      DriverOfflineMutation.mutateAsync({
        driverId: USER?.id ?? USER?._id
      })
    }
  };

  // ride accept mutatiom
  const rideAcceptedMutation = useMutation({
    mutationFn: rideAccepted,
    onSuccess: (response) => {
      console.log('ride accept success', response);
      setmodalVisible(false)
      // SETUSER({...USER, rideId: currentRide?._id})
      setRideId(rideDetails.rideId)
      // fetchRideDetails(rideDetails.rideId)
      navigation.navigate('trip-details')
    },
    onError: (error) => {
      console.log('ride accept error', error);
    }
  })

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
    } else {
      setIsDriverMode(false);
    }
  };

  const onAccept = () => {
    console.log('ride accepted', rideDetails?.rideId);
    rideAcceptedMutation.mutateAsync(rideDetails?.rideId);
  }


  useEffect(() => {
    startTracking()

    return () => {
      stopTracking()
      // Also stop background tracking on component unmount
      if (isBackgroundTracking) {
        stopBackgroundTracking()
      }
    }
  }, [])

  // Log background tracking status changes
  useEffect(() => {
    console.log(`📍 Background tracking status changed: ${isBackgroundTracking ? 'ACTIVE' : 'INACTIVE'}`);
  }, [isBackgroundTracking])

  useEffect(() => {
    if (USER?.isAvailable) {
      setIsNormalMode(true)
    }
  }, [USER])

  const logAllLocalStorage = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allItems = await AsyncStorage.multiGet(allKeys);
  
      console.log('📦 AsyncStorage contents:');
      allItems.forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
    } catch (error) {
      console.error('❌ Error reading AsyncStorage:', error);
    }
  };
  
  // Call this function wherever appropriate
  useEffect(() => {
    logAllLocalStorage();
  }, []);
  


  return (
    <>
      {/* <StatusBar backgroundColor={Black} barStyle="light-content" /> */}
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Driver Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back, {USER?.name || 'Driver'}</Text>
          </View>
          {/* <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, isNormalMode ? styles.statusIndicatorOnline : styles.statusIndicatorOffline]}>
              <View style={[styles.statusDot, isNormalMode ? styles.statusOnline : styles.statusOffline]} />
              <Text style={styles.statusText}>{isNormalMode ? 'Online' : 'Offline'}</Text>
            </View>
            {isBackgroundTracking && (
              <View style={styles.trackingIndicator}>
                <View style={styles.trackingDot} />
                <Text style={styles.trackingText}>Tracking</Text>
              </View>
            )}
          </View> */}
        </View>
        {/* </View> */}

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude || 0,
              longitude: location?.longitude || 0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude: location?.latitude || 0, longitude: location?.longitude || 0 }} >
              <Image source={require('../assets/logo/push-pin.png')} style={{ width: 40, height: 40 }} />
            </Marker>
          </MapView>
        </View>


        <View style={styles.toggleContainer}>
          <View style={styles.toggleCard}>
            {/* <Text style={styles.toggleLabel}>Switch</Text> */}
            <Switch
              trackColor={{ false: DarkGray, true: Gold }}
              thumbColor={isNormalMode ? White : Gray}
              ios_backgroundColor={DarkGray}
              onValueChange={toggleNormalMode}
              value={isNormalMode}
              disabled={DriverOnlineMutation.isPending}
            />
          </View>

          {/* <View style={styles.toggleCard}>
            <Text style={styles.toggleLabel}>Driver Mode</Text>
            <Switch
              trackColor={{ false: DarkGray, true: Gold }}
              thumbColor={isDriverMode ? White : Gray}
              ios_backgroundColor={DarkGray}
              onValueChange={toggleDriverMode}
              value={isDriverMode}
              disabled={!isNormalMode || ExtraDriverOnlineMutation.isPending}
            />
          </View> */}

          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, isNormalMode ? styles.statusIndicatorOnline : styles.statusIndicatorOffline]}>
              <View style={[styles.statusDot, isNormalMode ? styles.statusOnline : styles.statusOffline]} />
              <Text style={styles.statusText}>{isNormalMode ? 'Online' : 'Offline'}</Text>
            </View>
          </View>

          {/* Temporary test button */}
          {/* <TouchableOpacity
            style={{
              backgroundColor: 'red',
              padding: 10,
              borderRadius: 5,
              marginTop: 10,
              alignItems: 'center'
            }}
            onPress={testModal}
          >
            <Text style={{color: 'white'}}>Test Modal</Text>
          </TouchableOpacity> */}
        </View>
      </View>


      {/* ride request modal */}
      <Modal
        isVisible={modalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.7}
        onBackdropPress={() => setmodalVisible(false)}
        style={{
          margin: 0,
          justifyContent: 'flex-end',
        }}
        statusBarTranslucent
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={{
          backgroundColor: Black,
          borderRadius: 24,
          // borderTopLeftRadius: 24,
          // borderTopRightRadius: 24,
          // paddingBottom: 60,
          borderColor: LightGold,
          borderWidth: 1
        }}>
          <View style={{
            alignItems: 'center',
            paddingTop: 12,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          }}>
            <Text style={{
              color: Gold,
              fontSize: 18,
              fontWeight: '700',
            }}>New Ride Request</Text>
            <Text style={{
              color: LightGold,
              fontSize: 24,
              fontWeight: '900',
            }}>${rideDetails?.fare}</Text>
          </View>

          <View style={{
            padding: 20,
          }}>
            {/* Pickup Location */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}>
              <View style={{
                width: 24,
                alignItems: 'center',
                marginRight: 10,
                paddingTop: 4,
              }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#4CAF50',
                }} />
              </View>
              <View style={{
                flex: 1,
              }}>
                <Text style={{
                  color: Gray,
                  fontSize: 14,
                  marginBottom: 4,
                }}>Pickup</Text>
                <Text style={{
                  color: White,
                  fontSize: 16,
                  fontWeight: '500',
                }}>{rideDetails?.pickupLocation?.address || 'Unknown location'}</Text>
              </View>
            </View>

            {/* Destination Location */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 24,
            }}>
              <View style={{
                width: 24,
                alignItems: 'center',
                marginRight: 10,
                paddingTop: 4,
              }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: Gold,
                }} />
              </View>
              <View style={{
                flex: 1,
              }}>
                <Text style={{
                  color: Gray,
                  fontSize: 14,
                  marginBottom: 4,
                }}>Destination</Text>
                <Text style={{
                  color: White,
                  fontSize: 16,
                  fontWeight: '500',
                }}>{rideDetails?.destination?.address || 'Unknown location'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  // backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backgroundColor: DarkGray,
                  borderRadius: 12,
                  paddingVertical: 15,
                  alignItems: 'center',
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                onPress={() => setmodalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: White,
                  fontSize: 16,
                  fontWeight: '600',
                }}>Ignore</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Gold,
                  borderRadius: 12,
                  paddingVertical: 15,
                  alignItems: 'center',
                }}
                onPress={onAccept}
                activeOpacity={0.7}
                disabled={rideAcceptedMutation.isPending}
              >
                <Text style={{
                  color: Black,
                  fontSize: 16,
                  fontWeight: '700',
                }}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );


}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  toggleCard: {
    // backgroundColor: 'rgba(255, 255, 255, 0.05)',
    // borderRadius: 12,
    padding: 10,
    width: '48%',
    alignItems: 'flex-start',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.1)',
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
    justifyContent: 'space-between'
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 16,
    marginBottom: 20
    // paddingTop: 10,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: White,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Gray,
    fontSize: 14,
    marginTop: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
  },
  statusIndicatorOnline: {
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  statusIndicatorOffline: {
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusOnline: {
    backgroundColor: Gold,
  },
  statusOffline: {
    backgroundColor: Gray,
  },
  statusText: {
    color: White,
    fontSize: 14,
    fontWeight: '600',
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
    marginTop: 4,
  },
  trackingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  trackingText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '600',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Black,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 14, // Extra padding for iOS devices with home indicator
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: Gray,
    borderRadius: 3,
    marginBottom: 12,
  },
  modalTitle: {
    color: Gold,
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalDescription: {
    color: White,
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.9,
  },
  reasonsList: {
    paddingBottom: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  reasonText: {
    color: White,
    fontSize: 16,
    fontWeight: '500',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cancelButton: {
    backgroundColor: maroon,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10
  },
  cancelButtonText: {
    color: White,
    fontSize: 16,
    fontWeight: '700',
  },

});



