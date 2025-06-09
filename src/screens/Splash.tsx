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

  // fetches driver info
  const { data: DriverDetails, isLoading: isDriverDetailsLoading, error } = useQuery({
    queryKey: ['driver-details'],
    queryFn: getProfile,
    // staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!token,
    refetchOnWindowFocus: false, // Changed to false to prevent unnecessary refetches
    retry: 3, // Added retry logic
  })

  console.log(DriverDetails, 'DriverDetails in splash');

  // NEW CODE - Set minimum display time for splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDisplayTime(true);
    }, 2000); // Show splash for at least 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // OLD CODE - commented out problematic navigation logic
  /*
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        // Check if user has seen onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        // Wait for 2 seconds to show splash screen
        setTimeout(() => {
          // If token is still not loaded, keep loading
          // if (token === undefined || token === null) {
          //   setIsLoading(false);
          //   return;
          // }

          if (token) {
            const mobileNumber = DriverDetails?.data?.phone;
            // If token exists, navigate based on account status
            if (!isDriverDetailsLoading) {
              
            if (DriverDetails) {
              SETUSER(DriverDetails.data)
              if (DriverDetails?.data?.accountStatus === 'VehiclePending') {
                navigation.navigate('vehicle-details', { mobileNumber });
              } else if (DriverDetails?.data?.accountStatus === 'DocumentsPending') {
                navigation.navigate('vehicle-documents', { mobileNumber });
              } else if (DriverDetails?.data?.accountStatus === 'ApprovalPending') {
                navigation.navigate('approval-screen', { mobileNumber });
              } else if (DriverDetails?.data?.accountStatus === 'active') {
                console.log("current ride splash", DriverDetails.data.currentRide);

                if (DriverDetails.data.currentRide) {
                  // console.log("current ride splash", DriverDetails.data.currentRide);
                  SETRIDEID(DriverDetails.data.currentRide)
                  navigation.navigate('trip-details');
                }
                else {
                  navigation.navigate('Main');
                }
              }
            }
          } else if (hasSeenOnboarding === 'true') {
            // If user has seen onboarding but no token, go to Signin
            navigation.replace('Signin');
          } else {
            // If user hasn't seen onboarding, go to Onboarding
            navigation.replace('Onboarding');
          }

          }
          setIsLoading(false); // Done loading
        }, 2000);
      } catch (error) {
        console.error('Error checking auth/onboarding:', error);
        setIsLoading(false);
        navigation.replace('Signin'); // Fallback to Signin on error
      }
    };

    checkAuthAndOnboarding();

  }, [DriverDetails]);
  */

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
          // If we have a token, wait for profile data
          if (isDriverDetailsLoading) return;

          if (error) {
            console.error('Failed to fetch profile:', error);
            setHasNavigated(true);
            navigation.replace('Signin');
            return;
          }

          if (DriverDetails?.data) {
            SETUSER(DriverDetails.data);
            const mobileNumber = DriverDetails.data.phone;
            const accountStatus = DriverDetails.data.accountStatus;
            
            setHasNavigated(true);

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
  }, [token, DriverDetails, isDriverDetailsLoading, error, minDisplayTime, hasNavigated]);

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