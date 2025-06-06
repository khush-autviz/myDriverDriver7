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
  // const USER = useAuthStore((state) => state.user);
  // const mobileNumber = USER?.phone;
  const [isLoading, setIsLoading] = useState(true); // Add loading state


  // fetches driver info
  const { data: DriverDetails, } = useQuery({
    queryKey: ['driver-details'],
    queryFn: getProfile,
    // staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!token,
    refetchOnWindowFocus: true,
  })

  console.log(DriverDetails, 'DriverDetails in splash');

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

  useEffect(() => {
    if (DriverDetails) {
      SETUSER(DriverDetails.data)
    }
  }, [DriverDetails])



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