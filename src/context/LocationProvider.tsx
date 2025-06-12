// import React, {
//     createContext,
//     useState,
//     useEffect,
//     ReactNode,
//     useContext,
//   } from 'react';
//   import Geolocation, {
//     GeoCoordinates,
//     GeoPosition,
//   } from 'react-native-geolocation-service';
//   import { PermissionsAndroid, Platform, Alert } from 'react-native';
  
//   type Location = GeoCoordinates | null;
  
//   interface LocationContextType {
//     location: Location;
//     getCurrentLocation: () => Promise<void>;
//     startTracking: () => Promise<void>;
//     stopTracking: () => void;
//   }
  
//   export const LocationContext = createContext<any>(
//     undefined
//   );
  
//   interface Props {
//     children: ReactNode;
//   }
  
//   export const LocationProvider: React.FC<Props> = ({ children }) => {
//     const [location, setLocation] = useState<Location>(null);
//     const [watchId, setWatchId] = useState<number | null>(null);
  
//     const requestPermission = async (): Promise<boolean> => {
//       if (Platform.OS === 'ios') {
//         return true; // iOS handles permission automatically
//       }
  
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Permission',
//             message: 'App needs access to your location.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           }
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (error) {
//         console.warn('Permission error:', error);
//         return false;
//       }
//     };
  
//     const getCurrentLocation = async (): Promise<void> => {
//       const hasPermission = await requestPermission();
//       if (!hasPermission) {
//         Alert.alert('Permission Denied', 'Location permission is required.');
//         return;
//       }
  
//       Geolocation.getCurrentPosition(
//         (position: GeoPosition) => {
//           setLocation(position.coords);
//         },
//         (error) => {
//           console.error('Error getting location:', error.message);
//           Alert.alert('Error', 'Failed to get location: ' + error.message);
//         },
//         { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//       );
//     };
  
//     const startTracking = async (): Promise<void> => {
//       const hasPermission = await requestPermission();
//       if (!hasPermission) return;
  
//       const id = Geolocation.watchPosition(
//         (position: GeoPosition) => {
//           setLocation(position.coords);
//         },
//         (error) => {
//           console.error('Error watching location:', error.message);
//         },
//         {
//           enableHighAccuracy: true,
//           distanceFilter: 0,
//           interval: 5000,
//           fastestInterval: 2000,
//         }
//       );
//       setWatchId(id);
//     };
  
//     const stopTracking = (): void => {
//       if (watchId !== null) {
//         Geolocation.clearWatch(watchId);
//         setWatchId(null);
//       }
//     };
  
//     useEffect(() => {
//       getCurrentLocation(); // Get initial location on mount
  
//       return () => {
//         // Clean up live tracking on unmount
//         if (watchId !== null) {
//           Geolocation.clearWatch(watchId);
//         }
//       };
//     }, [watchId]);
  
//     return (
//       <LocationContext.Provider
//         value={{
//           location,
//           getCurrentLocation,
//           startTracking,
//           stopTracking,
//         }}
//       >
//         {children}
//       </LocationContext.Provider>
//     );
//   };
  
//   // Optional: Custom hook for easier context usage
//   export const useLocation = (): LocationContextType => {
//     const context = useContext(LocationContext);
//     if (!context) {
//       throw new Error('useLocation must be used within a LocationProvider');
//     }
//     return context;
//   };
  




import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import Geolocation, {
  GeoCoordinates,
  GeoPosition,
} from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert, NativeModules, DeviceEventEmitter, NativeEventEmitter } from 'react-native';
import { useSocket } from './SocketContext';
import { useAuthStore } from '../store/authStore';

type Location = GeoCoordinates | null;

interface LocationContextType {
  location: Location;
  getCurrentLocation: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  startBackgroundTracking: () => Promise<void>;
  stopBackgroundTracking: () => void;
  isBackgroundTracking: boolean;
}

export const LocationContext = createContext<any>(
  undefined
);

interface Props {
  children: ReactNode;
}

export const LocationProvider: React.FC<Props> = ({ children }) => {
  const [location, setLocation] = useState<Location>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isBackgroundTracking, setIsBackgroundTracking] = useState<boolean>(false);
  const socket = useSocket();
  const { user } = useAuthStore();
  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);


  // Get native modules
  const { BackgroundLocationModule } = NativeModules;
  // const backgroundLocationEmitter = Platform.OS === 'ios'
  //   ? new NativeEventEmitter(BackgroundLocationModule)
  //   : DeviceEventEmitter;

    const backgroundLocationEmitter = DeviceEventEmitter;

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      await Geolocation.requestAuthorization('whenInUse');
      return true; // iOS handles permission automatically
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn('Permission error:', error);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        setLocation(position.coords);
      },
      (error) => {
        console.error('Error getting location:', error.message);
        Alert.alert('Error', 'Failed to get location: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const startTracking = async (): Promise<void> => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const id = Geolocation.watchPosition(
      (position: GeoPosition) => {
        setLocation(position.coords);
      },
      (error) => {
        console.error('Error watching location:', error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
    setWatchId(id);
  };

  const stopTracking = (): void => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // Function to send location to backend via socket
  const sendLocationToBackend = (coords: GeoCoordinates) => {
    console.log(socket, 'socket in sendLocationToBackend');
    if (socket) {
      console.log('📍 Sending location to backend:', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date().toISOString(),
        driverId: user?.id ?? user?._id
      });
      socket.emit('updateLocation', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        driverId: user?.id ?? user?._id,
        timestamp: Date.now()
      });
    } else {
      console.log('❌ Cannot send location - socket or user not available');
    }
  };

  // Background location tracking functions
  const startBackgroundTracking = async (): Promise<void> => {
    try {
      console.log('🚀 Starting background location tracking...');

      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is required for background tracking.');
        return;
      }

      // Start native background location service
      if (BackgroundLocationModule) {
        await BackgroundLocationModule.startBackgroundLocation();
        console.log('✅ Native background location service started');
      }

      setIsBackgroundTracking(true);

      // Set up interval to get and send location every 5 seconds
      locationUpdateInterval.current = setInterval(async () => {
        try {
          console.log('⏰ Background location update interval triggered');

          Geolocation.getCurrentPosition(
            (position: GeoPosition) => {
              console.log('📍 Background location obtained:', position.coords);
              setLocation(position.coords);
              sendLocationToBackend(position.coords);
            },
            (error) => {
              console.error('❌ Background location error:', error.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000
            }
          );
        } catch (error) {
          console.error('❌ Error in background location interval:', error);
        }
      }, 5000); // 5 seconds interval

      console.log('✅ Background location tracking started successfully');
    } catch (error) {
      console.error('❌ Failed to start background tracking:', error);
      Alert.alert('Error', 'Failed to start background location tracking');
    }
  };

  const stopBackgroundTracking = (): void => {
    try {
      console.log('🛑 Stopping background location tracking...');

      // Clear interval
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
        locationUpdateInterval.current = null;
        // console.log('✅ Location update interval cleared');
      }

      // Stop native background location service
      if (BackgroundLocationModule) {
        BackgroundLocationModule.stopBackgroundLocation();
        // console.log('✅ Native background location service stopped');
      }

      setIsBackgroundTracking(false);
      console.log('✅ Background location tracking stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping background tracking:', error);
    }
  };

  useEffect(() => {
    getCurrentLocation(); // Get initial location on mount

    return () => {
      // Clean up live tracking on unmount
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Listen for background location updates from native module
  useEffect(() => {
    const subscription = backgroundLocationEmitter.addListener(
      'BackgroundLocationUpdate',
      (locationData: any) => {
        console.log('📍 Received background location update from native:', locationData);
        const coords = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          altitude: locationData.altitude || 0,
          altitudeAccuracy: locationData.altitudeAccuracy || 0,
          heading: locationData.heading || 0,
          speed: locationData.speed || 0,
        };
        setLocation(coords);
        sendLocationToBackend(coords);
      }
    );

    return () => {
      subscription?.remove();
    };
  }, [socket, user]);

  return (
    <LocationContext.Provider
      value={{
        location,
        getCurrentLocation,
        startTracking,
        stopTracking,
        startBackgroundTracking,
        stopBackgroundTracking,
        isBackgroundTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Optional: Custom hook for easier context usage
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
