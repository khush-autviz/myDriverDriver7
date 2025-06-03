# Background Location Tracking Implementation

## Overview
This implementation provides continuous driver location tracking using native modules that work even when the app is in background or closed state. Location updates are sent to the backend via socket connection every 5 seconds.

## Features
- ✅ **Background Location Tracking**: Works when app is backgrounded or closed
- ✅ **5-Second Intervals**: Location updates every 5 seconds regardless of driver movement
- ✅ **Socket Integration**: Real-time location updates to backend via Socket.io
- ✅ **Driver Status Integration**: Starts when driver goes online, stops when offline
- ✅ **Cross-Platform**: Native modules for both Android and iOS
- ✅ **Comprehensive Logging**: Detailed logs for debugging and monitoring
- ✅ **UI Indicators**: Visual feedback showing tracking status

## Architecture

### React Native Layer
- **LocationProvider**: Enhanced context with background tracking capabilities
- **Home Component**: Integration with driver online/offline status
- **Socket Integration**: Real-time communication with backend

### Native Modules

#### Android
- **BackgroundLocationModule.kt**: Main native module for location tracking
- **BackgroundLocationService.kt**: Foreground service for background operation
- **BackgroundLocationPackage.kt**: Package registration

#### iOS
- **BackgroundLocationModule.swift**: Core location manager with background capabilities
- **BackgroundLocationModule.m**: Objective-C bridge

## Implementation Details

### Location Update Flow
1. Driver toggles online → `startBackgroundTracking()` called
2. Native module starts foreground service (Android) or background location (iOS)
3. Location updates triggered every 5 seconds
4. Each update sent to React Native via event emitter
5. LocationProvider receives update and sends to backend via socket
6. Driver toggles offline → `stopBackgroundTracking()` called

### Key Functions

#### LocationProvider
```typescript
startBackgroundTracking(): Promise<void>  // Start background tracking
stopBackgroundTracking(): void           // Stop background tracking
sendLocationToBackend(coords): void      // Send location via socket
```

#### Native Modules
```kotlin
// Android
startBackgroundLocation(promise)  // Start tracking with foreground service
stopBackgroundLocation()         // Stop tracking and service
```

```swift
// iOS
startBackgroundLocation(resolve, reject)  // Start with background permissions
stopBackgroundLocation()                 // Stop background tracking
```

## Permissions

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

### iOS (Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to track driver location for ride requests.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to track driver location for ride requests even when the app is in background.</string>
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>background-processing</string>
</array>
```

## Usage

### Starting Background Tracking
```typescript
// Automatically starts when driver goes online
const toggleNormalMode = () => {
  if (!isNormalMode) {
    DriverOnlineMutation.mutateAsync({...}) // Triggers startBackgroundTracking()
  }
}
```

### Stopping Background Tracking
```typescript
// Automatically stops when driver goes offline
const toggleNormalMode = () => {
  if (isNormalMode) {
    DriverOfflineMutation.mutateAsync({...}) // Triggers stopBackgroundTracking()
  }
}
```

## Logging
The implementation includes comprehensive logging:

```
🚀 Starting background location tracking...
✅ Native background location service started
📍 Background location obtained: {lat, lng}
📤 Location update sent to React Native
📍 Sending location to backend: {data}
🛑 Stopping background location tracking...
```

## UI Indicators
- **Online/Offline Status**: Shows driver availability
- **Background Tracking Indicator**: Green dot showing active location tracking

## Testing
1. Toggle driver online → Check logs for background tracking start
2. Background the app → Verify location updates continue every 5 seconds
3. Check backend for received location updates
4. Toggle driver offline → Verify tracking stops

## Troubleshooting

### Common Issues
1. **Permissions**: Ensure all location permissions are granted
2. **Background Restrictions**: Check device battery optimization settings
3. **Socket Connection**: Verify socket connection is active
4. **Native Module Registration**: Ensure modules are properly registered

### Debug Commands
```bash
# Android logs
adb logcat | grep BackgroundLocation

# iOS logs (Xcode console)
# Look for BackgroundLocationModule logs
```

## Build Requirements
- React Native 0.79+
- Android API 26+ (for foreground services)
- iOS 12+ (for background location)
- Proper signing certificates for production builds
