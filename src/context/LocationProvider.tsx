import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext,
  } from 'react';
  import Geolocation, {
    GeoCoordinates,
    GeoPosition,
  } from 'react-native-geolocation-service';
  import { PermissionsAndroid, Platform, Alert } from 'react-native';
  
  type Location = GeoCoordinates | null;
  
  interface LocationContextType {
    location: Location;
    getCurrentLocation: () => Promise<void>;
    startTracking: () => Promise<void>;
    stopTracking: () => void;
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
  
    const requestPermission = async (): Promise<boolean> => {
      if (Platform.OS === 'ios') {
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
  
    useEffect(() => {
      getCurrentLocation(); // Get initial location on mount
  
      return () => {
        // Clean up live tracking on unmount
        if (watchId !== null) {
          Geolocation.clearWatch(watchId);
        }
      };
    }, [watchId]);
  
    return (
      <LocationContext.Provider
        value={{
          location,
          getCurrentLocation,
          startTracking,
          stopTracking,
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
  