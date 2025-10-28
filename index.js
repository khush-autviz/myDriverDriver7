// /**
//  * @format
//  */
// import {AppRegistry} from 'react-native';
// import messaging from '@react-native-firebase/messaging';
// import notifee, {AndroidImportance} from '@notifee/react-native';
// import App from './App';
// import {name as appName} from './app.json';

// const CHANNEL_ID = 'mytone';

// /**
//  * 🔊 Initialize Notification Channel
//  */
// async function setupNotificationChannel() {
//   try {
//     // Check if channel exists
//     const channels = await notifee.getChannels();
//     const existingChannel = channels.find(ch => ch.id === CHANNEL_ID);
    
//     if (existingChannel) {
//       console.log('[Init] Channel already exists, deleting...');
//       await notifee.deleteChannel(CHANNEL_ID);
//     }

//     // Create fresh channel
//     await notifee.createChannel({
//       id: CHANNEL_ID,
//       name: 'My Tone Channel',
//       importance: AndroidImportance.HIGH,
//       vibration: true,
//       sound: 'mytone', // must match res/raw/mytone.mp3
//     });
    
//     console.log('[Init] ✅ Notification channel created with custom tone');
//   } catch (error) {
//     console.error('[Init] ❌ Channel setup error:', error);
//   }
// }

// // Setup channel immediately when module loads
// setupNotificationChannel();

// /**
//  * 🔔 Background Message Handler
//  */
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('📩 Background notification received:', remoteMessage);
  
//   try {
//     // Always ensure channel exists before displaying
//     await setupNotificationChannel();
    
//     // Small delay to ensure channel is ready
//     await new Promise(resolve => setTimeout(resolve, 100));

//     // Display custom notification
//     await notifee.displayNotification({
//       title: remoteMessage.data?.title || remoteMessage.notification?.title || 'New Message',
//       body: remoteMessage.data?.body || remoteMessage.notification?.body || 'You have a new notification',
//       android: {
//         channelId: CHANNEL_ID,
//         pressAction: {
//           id: 'default',
//         },
//         sound: 'mytone',
//         importance: AndroidImportance.HIGH,
//       },
//     });
    
//     console.log('✅ Background notification displayed with custom tone');
//   } catch (error) {
//     console.error('❌ Error in background notification:', error);
//   }
// });

// AppRegistry.registerComponent(appName, () => App);


/**
* @format
*/
import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
 
/**
* 🔔 Background Message Handler
*/
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background notification received:', remoteMessage);
  // Firebase will auto-display using the native channel settings
  return Promise.resolve();
});
 
AppRegistry.registerComponent(appName, () => App);