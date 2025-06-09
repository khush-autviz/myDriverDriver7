import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { Black } from '../constants/Color';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../constants/Api';
import { useQuery } from '@tanstack/react-query';
import { useRide } from '../context/RideContext';

const Splash = ({ navigation }: { navigation: any }) => {
  const token = useAuthStore((state) => state.token?.access_token);
  const SETUSER = useAuthStore((state) => state.setUser);
  const SETRIDEID = useAuthStore((state) => state.setRideId);
  
  // OLD CODE - commented out to fix white screen issue
  // const [isLoading, setIsLoading] = useState(true);
  
  // NEW CODE - better state management
  const [hasNavigated, setHasNavigated] = useState(false);
  const [minDisplayTime, setMinDisplayTime] = useState(false);
  const [networkTimeout, setNetworkTimeout] = useState(false);

  // fetches driver info
  const { data: DriverDetails, isLoading: isDriverDetailsLoading, error, isError } = useQuery({
    queryKey: ['driver-details'],
    queryFn: getProfile,
    // staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!token,
    refetchOnWindowFocus: false, // Changed to false to prevent unnecessary refetches
    retry: 2, // Reduced retry attempts to prevent long delays
    retryDelay: 1000, // 1 second between retries
    gcTime: 0, // Don't cache failed queries
  })

  console.log(DriverDetails, 'DriverDetails in splash');

  // NEW CODE - Set minimum display time for splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDisplayTime(true);
    }, 2000); // Show splash for at least 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // NEW CODE - Network timeout to prevent infinite waiting
  useEffect(() => {
    if (!token) return; // Only set timeout if we have a token and are making API calls

    const timeoutTimer = setTimeout(() => {
      console.log('Network timeout reached - proceeding with fallback navigation');
      setNetworkTimeout(true);
    }, 10000); // 10 second timeout for network operations

    return () => clearTimeout(timeoutTimer);
  }, [token]);

  // NEW CODE - Improved navigation logic
  useEffect(() => {
    const handleNavigation = async () => {
      // Prevent multiple navigations
      if (hasNavigated) return;

      // Wait for minimum display time
      if (!minDisplayTime) return;

      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        if (token) {
          // Check for network timeout or API error - proceed with fallback
          if (networkTimeout || (isError && error)) {
            console.error('Network timeout or API error:', error);
            setHasNavigated(true);
            // Fallback to signin screen so user can retry when connectivity returns
            navigation.replace('Signin');
            return;
          }

          // If we have a token, wait for profile data (unless timeout occurred)
          if (isDriverDetailsLoading && !networkTimeout) return;

          if (DriverDetails?.data) {
            SETUSER(DriverDetails.data);
            const mobileNumber = DriverDetails.data.phone;
            const accountStatus = DriverDetails.data.accountStatus;
            
            setHasNavigated(true);
            if (!DriverDetails.data.registrationComplete){
              navigation.replace('Signup', { mobileNumber });
              return;
            }
            if (accountStatus === 'VehiclePending') {
              navigation.replace('vehicle-details', { mobileNumber });
            } else if (accountStatus === 'DocumentsPending') {
              navigation.replace('vehicle-documents', { mobileNumber });
            } else if (accountStatus === 'ApprovalPending') {
              navigation.replace('approval-screen', { mobileNumber });
            } else if (accountStatus === 'active') {
              if (DriverDetails.data.currentRide) {
                SETRIDEID(DriverDetails.data.currentRide);
                navigation.replace('trip-details');
              } else {
                navigation.replace('Main');
              }
            }
          } else if (networkTimeout) {
            // Network timeout without data - go to signin so user can retry
            setHasNavigated(true);
            navigation.replace('Signin');
          }
        } else {
          // No token - navigate to appropriate screen
          setHasNavigated(true);
          
          if (hasSeenOnboarding === 'true') {
            navigation.replace('Signin');
          } else {
            navigation.replace('Onboarding');
          }
        }
      } catch (error) {
        console.error('Error in splash navigation:', error);
        setHasNavigated(true);
        navigation.replace('Signin');
      }
    };

    handleNavigation();
  }, [token, DriverDetails, isDriverDetailsLoading, error, isError, minDisplayTime, hasNavigated, networkTimeout]);

  useEffect(() => {
    if (DriverDetails) {
      SETUSER(DriverDetails.data)
    }
  }, [DriverDetails])

  // OLD CODE - problematic conditional rendering
  /*
  // Optionally, show a loading indicator or nothing while loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={Black} barStyle="light-content" />
        <Image
          source={require('../assets/logo/mainLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return null; // Return null after navigation (optional, since navigation will occur)
  */

  // NEW CODE - Always show splash screen until navigation
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Black} barStyle="light-content" />
      <Image
        source={require('../assets/logo/mainLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: '30%',
  },
});

export default Splash;