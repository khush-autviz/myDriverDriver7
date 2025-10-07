import { Platform, Alert, Linking, PermissionsAndroid, Permission } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

class NotificationPermissionService {
  private static instance: NotificationPermissionService;

  private constructor() {}

  public static getInstance(): NotificationPermissionService {
    if (!NotificationPermissionService.instance) {
      NotificationPermissionService.instance = new NotificationPermissionService();
    }
    return NotificationPermissionService.instance;
  }

  /**
   * Request notification permissions for both Android and iOS
   */
  async requestNotificationPermission(): Promise<NotificationPermissionStatus> {
    try {
      if (Platform.OS === 'android') {
        return await this.requestAndroidNotificationPermission();
      } else if (Platform.OS === 'ios') {
        return await this.requestIOSNotificationPermission();
      } else {
        return {
          granted: false,
          canAskAgain: false,
          status: 'unsupported_platform'
        };
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  /**
   * Request notification permission for Android
   */
  private async requestAndroidNotificationPermission(): Promise<NotificationPermissionStatus> {
    try {
      // Check if we already have permission
      const hasPermission = await this.checkAndroidNotificationPermission();
      if (hasPermission.granted) {
        return hasPermission;
      }

      // Request POST_NOTIFICATIONS permission (Android 13+)
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs notification permission to send you ride updates and alerts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        
        // Store permission status
        await this.storePermissionStatus(isGranted);
        
        return {
          granted: isGranted,
          canAskAgain: granted === PermissionsAndroid.RESULTS.DENIED,
          status: granted
        };
      } else {
        // For Android versions below 13, notifications are enabled by default
        // but we should still check if they're disabled in settings
        const isEnabled = await this.checkAndroidNotificationSettings();
        
        if (!isEnabled) {
          this.showAndroidSettingsAlert();
        }

        await this.storePermissionStatus(isEnabled);
        
        return {
          granted: isEnabled,
          canAskAgain: true,
          status: isEnabled ? 'granted' : 'denied'
        };
      }
    } catch (error) {
      console.error('Error requesting Android notification permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  /**
   * Request notification permission for iOS
   */
  private async requestIOSNotificationPermission(): Promise<NotificationPermissionStatus> {
    try {
      // For iOS, we need to use a library like @react-native-community/push-notification-ios
      // or react-native-permissions. Since we're keeping it simple, we'll show an alert
      // and guide the user to enable notifications in settings
      
      return new Promise((resolve) => {
        Alert.alert(
          'Enable Notifications',
          'To receive ride updates and alerts, please enable notifications in your device settings.',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => {
                this.storePermissionStatus(false);
                resolve({
                  granted: false,
                  canAskAgain: true,
                  status: 'denied'
                });
              }
            },
            {
              text: 'Open Settings',
              onPress: () => {
                this.openIOSSettings();
                resolve({
                  granted: false,
                  canAskAgain: true,
                  status: 'denied'
                });
              }
            }
          ]
        );
      });
    } catch (error) {
      console.error('Error requesting iOS notification permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  /**
   * Check current Android notification permission status
   */
  private async checkAndroidNotificationPermission(): Promise<NotificationPermissionStatus> {
    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        return {
          granted,
          canAskAgain: !granted,
          status: granted ? 'granted' : 'denied'
        };
      } else {
        // For older Android versions, check if notifications are enabled in settings
        const isEnabled = await this.checkAndroidNotificationSettings();
        return {
          granted: isEnabled,
          canAskAgain: true,
          status: isEnabled ? 'granted' : 'denied'
        };
      }
    } catch (error) {
      console.error('Error checking Android notification permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  /**
   * Check if Android notifications are enabled in settings
   * This is a simplified check - in a real app you might want to use a library
   * like react-native-notification-permission
   */
  private async checkAndroidNotificationSettings(): Promise<boolean> {
    try {
      // This is a simplified implementation
      // In a real app, you might want to use a library to check notification settings
      return true; // Assume enabled for now
    } catch (error) {
      console.error('Error checking Android notification settings:', error);
      return false;
    }
  }

  /**
   * Show alert to guide user to Android notification settings
   */
  private showAndroidSettingsAlert(): void {
    Alert.alert(
      'Notifications Disabled',
      'Notifications are currently disabled. Please enable them in your device settings to receive ride updates.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Open Settings',
          onPress: () => this.openAndroidSettings()
        }
      ]
    );
  }

  /**
   * Open Android notification settings
   */
  private openAndroidSettings(): void {
    try {
      Linking.openSettings();
    } catch (error) {
      console.error('Error opening Android settings:', error);
    }
  }

  /**
   * Open iOS notification settings
   */
  private openIOSSettings(): void {
    try {
      Linking.openURL('app-settings:');
    } catch (error) {
      console.error('Error opening iOS settings:', error);
    }
  }

  /**
   * Store permission status in AsyncStorage
   */
  private async storePermissionStatus(granted: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_permission', JSON.stringify({
        granted,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error storing permission status:', error);
    }
  }

  /**
   * Get stored permission status
   */
  async getStoredPermissionStatus(): Promise<boolean | null> {
    try {
      const stored = await AsyncStorage.getItem('notification_permission');
      if (stored) {
        const data = JSON.parse(stored);
        return data.granted;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored permission status:', error);
      return null;
    }
  }

  /**
   * Check if we should show permission request (only once)
   */
  async shouldShowPermissionRequest(): Promise<boolean> {
    try {
      const stored = await this.getStoredPermissionStatus();
      // Only ask if we've never asked before
      return stored === null;
    } catch (error) {
      console.error('Error checking if should show permission request:', error);
      return true; // Default to showing if there's an error
    }
  }

  /**
   * Request permission only once on first app launch
   */
  async requestPermissionOnce(): Promise<NotificationPermissionStatus> {
    try {
      const shouldAsk = await this.shouldShowPermissionRequest();
      
      if (!shouldAsk) {
        // Already asked before, return current status
        return await this.getCurrentPermissionStatus();
      }

      // First time asking, request permission
      const result = await this.requestNotificationPermission();
      
      // Mark that we've asked (regardless of result)
      await this.storePermissionStatus(result.granted);
      
      return result;
    } catch (error) {
      console.error('Error requesting permission once:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  /**
   * Get current permission status
   */
  async getCurrentPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      if (Platform.OS === 'android') {
        return await this.checkAndroidNotificationPermission();
      } else if (Platform.OS === 'ios') {
        // For iOS, we can't easily check the actual status without additional libraries
        // So we'll return based on what we stored
        const stored = await this.getStoredPermissionStatus();
        return {
          granted: stored === true,
          canAskAgain: stored !== true,
          status: stored === true ? 'granted' : 'denied'
        };
      } else {
        return {
          granted: false,
          canAskAgain: false,
          status: 'unsupported_platform'
        };
      }
    } catch (error) {
      console.error('Error getting current permission status:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }
}

export default NotificationPermissionService;
