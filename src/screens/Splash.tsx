import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { Black } from '../constants/Color';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../constants/Api';
import { useQuery } from '@tanstack/react-query';

const Splash = ({ navigation }: { navigation: any }) => {
  const token = useAuthStore((state) => state.token);
  const USER = useAuthStore((state) => state.user);
  const mobileNumber = USER?.phone;
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const {data: driverDetails} = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
  });

  useEffect(() => {
    console.log("driverDetails splash", driverDetails);
    const checkAuthAndOnboarding = async () => {
      try {
        // Check if user has seen onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        // Wait for 2 seconds to show splash screen
        setTimeout(() => {
          // If token is still not loaded, keep loading
          if (token === undefined || token === null) {
            setIsLoading(false);
            return;
          }

          if (token && token.access_token) {
            // If token exists, navigate based on account status
            if (USER?.accountStatus === 'VehiclePending') {
              navigation.navigate('vehicle-details', { mobileNumber });
            } else if (USER?.accountStatus === 'DocumentsPending') {
              navigation.navigate('vehicle-documents', { mobileNumber });
            } else if (USER?.accountStatus === 'ApprovalPending') {
              navigation.navigate('approval-screen', { mobileNumber });
            } else if (USER?.accountStatus === 'active') {
              navigation.navigate('Main');
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
  }, [navigation, token, USER, driverDetails]); // Include USER in dependencies

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