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
} from 'react-native';
import {
  Black,
  DarkGray,
  Gold,
  Gray,
  maroon,
  White,
} from '../constants/Color';
import MapView, { Marker } from 'react-native-maps';
import { useSocket } from '../context/SocketContext';
import { useMutation } from '@tanstack/react-query';
import { driverGoOffline, driverGoOnline, extraDriverGoOnline } from '../constants/Api';
import { useLocation } from '../context/LocationProvider';
import { useAuthStore } from '../store/authStore';
import Modal from 'react-native-modal';


export default function Home() {
  const [isNormalMode, setIsNormalMode] = useState(false);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [modalVisible, setmodalVisible] = useState(false)
  const [rideData, setrideData] = useState()
  const socket = useSocket();
  const {location, startTracking, stopTracking} = useLocation()
  const USER = useAuthStore(state => state.user)


  const DriverOnlineMutation = useMutation({
    mutationFn: driverGoOnline,
    onSuccess: (response) => {
      console.log('driver online success', response);
      setIsNormalMode(true);
      socket?.emit('goOnDuty', {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
      })
      socket?.emit('updateLocation', {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
      })
      socket?.on('rideRequest', (data) => {
        console.log('ride request', data);
        setrideData(data)
        // setmodalVisible(true)
      })
    },
    onError: (error) => {
      console.log('driver online error', error);
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
      console.log('driver offline success', response);
      socket?.emit('goOffDuty')
      setIsNormalMode(false);
      setIsDriverMode(false);
    },
    onError: (error) => {
      console.log('driver offline error', error);
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
    } else {
      setIsNormalMode(false);
      setIsDriverMode(false);
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
    } else {
      setIsDriverMode(false);
    }
  };

  useEffect(() => {
    startTracking()
  
    return () => {
      stopTracking()
    }
  }, [])
  
  useEffect(() => {
    if (rideData) {
      setmodalVisible(true)
    }
  }, [rideData])

  return (
    <>
      {/* <StatusBar backgroundColor={Black} barStyle="light-content" /> */}
      <View style={styles.container}>
        {/* Mode Toggle Section */}
        {/* <View style={styles.toggleContainer}>
          <View style={styles.toggleCard}>
            <Text style={styles.toggleLabel}>Normal Mode</Text>
            <Switch
              trackColor={{ false: DarkGray, true: Gold }}
              thumbColor={isNormalMode ? White : Gray}
              ios_backgroundColor={DarkGray}
              onValueChange={toggleNormalMode}
              value={isNormalMode}
              disabled={DriverOnlineMutation.isPending}
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
              disabled={!isNormalMode || ExtraDriverOnlineMutation.isPending} 
            />
          </View>
        </View> */}

<View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Driver Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back, {USER?.name || 'Driver'}</Text>
          </View>
          <View style={[styles.statusIndicator, isNormalMode ? styles.statusIndicatorOnline : styles.statusIndicatorOffline]}>
            <View style={[styles.statusDot, isNormalMode ? styles.statusOnline : styles.statusOffline]} />
            <Text style={styles.statusText}>{isNormalMode ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
      {/* </View> */}
  
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
            <Marker coordinate={{ latitude: location?.latitude, longitude: location?.longitude}} />
          </MapView>
        </View>


        <View style={styles.toggleContainer}>
          <View style={styles.toggleCard}>
            <Text style={styles.toggleLabel}>Normal Mode</Text>
            <Switch
              trackColor={{ false: DarkGray, true: Gold }}
              thumbColor={isNormalMode ? White : Gray}
              ios_backgroundColor={DarkGray}
              onValueChange={toggleNormalMode}
              value={isNormalMode}
              disabled={DriverOnlineMutation.isPending}
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
              disabled={!isNormalMode || ExtraDriverOnlineMutation.isPending} 
            />
          </View>
        </View>
        </View>


            {/* ride request modal */}
            <Modal
                isVisible={modalVisible}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
                onBackdropPress={() => setmodalVisible(false)}
                style={styles.modal}
                statusBarTranslucent
                useNativeDriver
                hideModalContentWhileAnimating
            >
                <View style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        {/* <View style={styles.modalIndicator} /> */}
                        <Text style={styles.modalTitle}>Cancel Ride</Text>
                    </View>

                    {/* Modal Content */}
                    <View style={styles.modalContent}>
                        <Text style={styles.modalDescription}>
                            Please select a reason for cancellation:
                        </Text>

                        {/* <FlatList
                            data={cancelReasons}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.reasonButton}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        cancelRideMutation.mutate({
                                            id: rideId, // Replace with actual ride ID
                                            payload: { reason: item }
                                        });
                                        setmodalVisible(false);
                                    }}
                                >
                                    <Text style={styles.reasonText}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Gold} />
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.reasonsList}
                        /> */}
                    </View>

                    {/* Modal Footer */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            activeOpacity={0.8}
                            onPress={() => setmodalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
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
  fontSize: 12,
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
  paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Extra padding for iOS devices with home indicator
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



