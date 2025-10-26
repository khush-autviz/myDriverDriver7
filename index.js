/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification received:', remoteMessage);
  
  try {
    // Ensure the channel exists before displaying notification
    await notifee.createChannel({
      id: 'mytone',
      name: 'My Tone Channel',
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'mytone',
    });
    
    // Display the notification
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || remoteMessage.data?.title || 'New Message',
      body: remoteMessage.notification?.body || remoteMessage.data?.body || 'You have a new notification',
      android: {
        channelId: 'mytone',
        pressAction: {
          id: 'default',
        },
        sound: 'mytone',
      },
    });
    
    console.log('Background notification displayed successfully');
  } catch (error) {
    console.error('Error in background notification:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);
