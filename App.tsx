import React, { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Splash from './src/screens/Splash';
import Home from './src/components/Home';
import Onboarding from './src/screens/Onboarding';
import Signup from './src/components/auth/Signup';
import Signin from './src/components/auth/Signin';
import OtpScreen from './src/components/auth/OtpScreen';
import Activity from './src/components/Activity';
import Account from './src/screens/Account';
import Profile from './src/components/Profile';
import VehicleDetails from './src/components/auth/VehicleDetails';
import VehicleDocuments from './src/components/auth/VehicleDocuments';
import ApprovalScreen from './src/components/auth/ApprovalScreen';
import { Black, Gold } from './src/constants/Color';
import { SocketProvider } from './src/context/SocketContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LocationProvider } from './src/context/LocationProvider';
import { RideProvider } from './src/context/RideContext';
import TripDetails from './src/components/TripDetails';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from './src/lib/Toast';
import RideDetails from './src/components/RideDetails';
import Transactions from './src/screens/Transactions';
import Withdraw from './src/screens/Withdraw';
import FellowDrivers from './src/screens/FellowDrivers';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();


// Background handler - MUST be at the top level, before any component
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification received:', remoteMessage);
  
  const notifType = remoteMessage.data?.type || 'default';
  
  // Create channel for background notification
  const channelId = await notifee.createChannel({
    id: notifType === 'ride_requested' ? 'ride_channel' : 'default_channel',
    name: notifType === 'ride_requested' ? 'Ride Requests' : 'Default Channel',
    importance: AndroidImportance.HIGH,
    vibration: true,
    // vibrationPattern: notifType === 'ride_requested' ? [0, 500, 200, 500] : [0, 300, 200, 300],
    sound: notifType === 'ride_requested' ? 'mytone' : 'default',
  });
  
  // Display the notification
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || remoteMessage.data?.title || 'New Message',
    body: remoteMessage.notification?.body || remoteMessage.data?.body || 'You have a new notification',
    ios: {
      sound: notifType === 'ride_requested' ? 'mytone.mp3' : 'default',
    },
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
      sound: notifType === 'ride_requested' ? 'mytone' : 'default',
    },
  });
});

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Activity') {
            iconName = 'document-text';
          } else if (route.name === 'Account') {
            iconName = 'person';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={Gold} />;
        },
        tabBarStyle: {
          backgroundColor: Black,
        },
        tabBarLabelStyle: {
          color: Gold,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Activity" component={Activity} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

export default function App() {
  async function requestPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    }
    else if (Platform.OS === 'ios') {
      // Add iOS notification permission request
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('iOS notification permission granted');
      } else {
        console.log('iOS notification permission denied');
      }
    }
  }

  useEffect(() => {
    requestPermission();
    // messaging()
    //   .getToken()
    //   .then(token => console.log('🔥 FIREBASE FCM TOKEN:', token));
  }, []);

  // Handle foreground messages
  // useEffect(() => {
  //   console.log('useEffect');
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     console.log('Foreground message:', remoteMessage);

  //     console.log('Notification type:', remoteMessage.data?.type);

  //     // Request permissions if needed
  //     await notifee.requestPermission({
  //       sound: true,
  //       badge: true,
  //       alert: true,
  //     });

  //     // await notifee.deleteChannel('default');

  //     // Create a channel (Android)
  //     const channelId = await notifee.createChannel({
  //       id: 'default',
  //       name: 'Default Channel',
  //       importance: AndroidImportance.HIGH,
  //       vibration: true,
  //       sound: 'mytone',
  //     });

  //     // Display a notification
  //     await notifee.displayNotification({
  //       title: remoteMessage.notification?.title,
  //       body: remoteMessage.notification?.body,
  //       ios: {
  //         sound: 'mytone',
  //       },
  //       android: {
  //         channelId,
  //         pressAction: {
  //           id: 'default',
  //         },
  //         sound: 'mytone',
  //       },
  //     });
  //   });

  //   return unsubscribe;
  // }, []);

  useEffect(() => {
    console.log('App mounted - setting up notifications');
    
    // Request permissions and setup
    const setupNotifications = async () => {
      try {
        // Request Notifee permissions
        await notifee.requestPermission({
          sound: true,
          badge: true,
          alert: true,
        });
        
        // Request Firebase messaging permissions (iOS)
        await messaging().requestPermission();
        
        // Get FCM token
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        
        // Pre-create channels to ensure they exist
        await notifee.createChannel({
          id: 'ride_channel',
          name: 'Ride Requests',
          importance: AndroidImportance.HIGH,
          vibration: true,
          // vibrationPattern: [0, 500, 200, 500],
          sound: 'mytone',
        });
        
        await notifee.createChannel({
          id: 'default_channel',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
          vibration: true,
          // vibrationPattern: [0, 300, 200, 300],
          sound: 'default',
        });
        
        console.log('Channels created successfully');
      } catch (error) {
        console.error('Setup error:', error);
      }
    };
    
    setupNotifications();
    
    // Handle foreground notifications
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('=== FOREGROUND NOTIFICATION RECEIVED ===');
      console.log('Full message:', JSON.stringify(remoteMessage, null, 2));
      
      const notifType = remoteMessage.data?.type || 'default';
      console.log('Notification type:', notifType);
      
      // Use pre-created channel
      const channelId = notifType === 'ride_requested' ? 'ride_channel' : 'default_channel';
      console.log('Using channel:', channelId);
      
      try {
        // Display the notification
        const notificationId = await notifee.displayNotification({
          title: remoteMessage.notification?.title || remoteMessage.data?.title || 'New Message',
          body: remoteMessage.notification?.body || remoteMessage.data?.body || 'You have a new notification',
          ios: {
            sound: notifType === 'ride_requested' ? 'mytone.mp3' : 'default',
          },
          android: {
            channelId,
            pressAction: {
              id: 'default',
            },
            sound: notifType === 'ride_requested' ? 'mytone' : 'default',
            importance: AndroidImportance.HIGH,
          },
        });
        
        console.log('Notification displayed with ID:', notificationId);
      } catch (error) {
        console.error('Error displaying notification:', error);
      }
    });
    
    return unsubscribe;
  }, []);

  return (
    // <LocationProvider>
    <SocketProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <RideProvider>
            {/* <SocketProvider> */}
              <LocationProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: Black, paddingTop: 10 }}>
                  <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                      {/* Splash Screen as initial screen */}
                      <Stack.Screen name="Splash" component={Splash} />

                      {/* Onboarding Screen */}
                      <Stack.Screen name="Onboarding" component={Onboarding} />

                      {/* Auth Screens */}
                      <Stack.Screen name="Signin" component={Signin} />
                      <Stack.Screen name="Signup" component={Signup} />
                      <Stack.Screen name="OtpScreen" component={OtpScreen} />
                      <Stack.Screen name="Profile" component={Profile} />
                      <Stack.Screen name="vehicle-details" component={VehicleDetails} />
                      <Stack.Screen name="vehicle-documents" component={VehicleDocuments} />
                      <Stack.Screen name="approval-screen" component={ApprovalScreen} />
                      <Stack.Screen name='trip-details' component={TripDetails} />
                      <Stack.Screen name='ride-details' component={RideDetails} />
                      <Stack.Screen name='transactions' component={Transactions} />
                      <Stack.Screen name='withdraw' component={Withdraw} />
                      <Stack.Screen name='fellow-drivers' component={FellowDrivers} />

                      {/* Main Tabs */}
                      <Stack.Screen name="Main" component={MainTabs} />
                    </Stack.Navigator>
                    <Toast/>
                  </NavigationContainer>
                </SafeAreaView>
              </LocationProvider>
            {/* </SocketProvider> */}
          </RideProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SocketProvider>
  );
}