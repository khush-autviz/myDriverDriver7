import React, { useState, useEffect } from 'react';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

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
          backgroundColor: 'black',
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
  return (
    <LocationProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <RideProvider>
            <SocketProvider>
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

                    {/* Main Tabs */}
                    <Stack.Screen name="Main" component={MainTabs} />
                  </Stack.Navigator>
                  <Toast/>
                </NavigationContainer>
              </SafeAreaView>
            </SocketProvider>
          </RideProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </LocationProvider>
  );
}