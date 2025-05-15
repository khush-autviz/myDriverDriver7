// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import Home from './src/components/Home';
// import Onboarding from './src/screens/Onboarding';
// import Signup from './src/components/auth/Signup';
// import { Gold } from './src/constants/Color';
// import OtpScreen from './src/components/auth/OtpScreen';
// import Search from './src/components/Search';
// import Profile from './src/components/Profile';
// import Activity from './src/components/Activity';
// import Account from './src/screens/Account';
// // import SplashScreen from 'react-native-splash-screen';
// // import Location from './src/screens/Location';
// // import TripDetails from './src/components/TripDetails';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import Signin from './src/components/auth/Signin';
// import VehicleDetails from './src/components/auth/VehicleDetails';
// import VehicleDocuments from './src/components/auth/VehicleDocuments';
// import ApprovalScreen from './src/components/auth/ApprovalScreen';

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();

// const queryClient = new QueryClient();

// function MainTabs() {
//   return (
//     <Tab.Navigator
//       initialRouteName="Home"
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ color, size }) => {
//           let iconName: string;

//           if (route.name === 'Home') {
//             iconName = 'home';
//           } else if (route.name === 'Activity') {
//             iconName = 'document-text';
//           } else if (route.name === 'Account') {
//             iconName = 'person';
//           } else {
//             iconName = 'ellipse';
//           }

//           return <Ionicons name={iconName} size={size} color={Gold} />;
//         },
//         tabBarStyle: {
//           backgroundColor: 'black',
//         },
//         tabBarLabelStyle: {
//           color: Gold,
//         },
//         headerShown: false,
//       })}
//     >
//       <Tab.Screen name="Home" component={Home} />
//       <Tab.Screen name="Activity" component={Activity} />
//       <Tab.Screen name="Account" component={Account} />
//     </Tab.Navigator>
//   );
// }

// export default function App() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

//   useEffect(() => {
//     // SplashScreen.hide()
//     const checkOnboarding = async () => {
//       const seen = await AsyncStorage.getItem('hasSeenOnboarding');
//       setHasSeenOnboarding(seen === 'true');
//       setIsLoading(false);
//     };

//     checkOnboarding();
//   }, []);

//   if (isLoading) return null;

//   return (
//     <QueryClientProvider client={queryClient}>
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {/* Onboarding Screen */}
//         {!hasSeenOnboarding ? (
//           <Stack.Screen name="Onboarding" component={Onboarding} />
//         ) : null}

//         {/* Auth Screens */}
//         <Stack.Screen name="Signin" component={Signin} />
//         {/* <Stack.Screen name="Signin" component={Signup} /> */}
//         <Stack.Screen name="Signup" component={Signup} />
//         <Stack.Screen name="OtpScreen" component={OtpScreen} />
//         {/* <Stack.Screen name="Location" component={Location} />
//         <Stack.Screen name="TripDetails" component={TripDetails} /> */}
//         <Stack.Screen name="Profile" component={Profile} />
//         <Stack.Screen name="vehicle-details" component={VehicleDetails} />
//         <Stack.Screen name="vehicle-documents" component={VehicleDocuments} />
//         <Stack.Screen name="approval-screen" component={ApprovalScreen} />
        

//         {/* Main Tabs */}
//         <Stack.Screen name="Main" component={MainTabs} />
//       </Stack.Navigator>
//     </NavigationContainer>
//     </QueryClientProvider>
//   );
// }



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
import { Gold } from './src/constants/Color';
import { SocketProvider } from './src/context/SocketContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LocationProvider } from './src/context/LocationProvider';

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
      <SocketProvider>
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
          
          {/* Main Tabs */}
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
      </SocketProvider>
    </QueryClientProvider>
    </GestureHandlerRootView>
    </LocationProvider>
  );
}