package com.mydriverdriver7

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class BackgroundLocationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "BackgroundLocationModule"
        private const val CHANNEL_ID = "background_location_channel"
        private const val NOTIFICATION_ID = 1
        private const val LOCATION_UPDATE_INTERVAL = 5000L // 5 seconds
        private const val LOCATION_UPDATE_DISTANCE = 0f // Update even if driver hasn't moved
    }

    private var locationManager: LocationManager? = null
    private var locationListener: LocationListener? = null
    private var isTracking = false

    override fun getName(): String {
        return "BackgroundLocationModule"
    }

    init {
        createNotificationChannel()
    }

    @ReactMethod
    fun startBackgroundLocation(promise: Promise) {
        try {
            Log.d(TAG, "Starting background location tracking...")
            
            if (isTracking) {
                Log.d(TAG, "Background location tracking already running")
                promise.resolve("Already tracking")
                return
            }

            val context = reactApplicationContext
            locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

            // Check permissions
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                promise.reject("PERMISSION_DENIED", "Location permission not granted")
                return
            }

            // Create location listener
            locationListener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    Log.d(TAG, "📍 Location update: ${location.latitude}, ${location.longitude}")
                    sendLocationUpdate(location)
                }

                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                override fun onProviderEnabled(provider: String) {}
                override fun onProviderDisabled(provider: String) {}
            }

            // Start location updates
            locationManager?.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                LOCATION_UPDATE_INTERVAL,
                LOCATION_UPDATE_DISTANCE,
                locationListener!!
            )

            // Also request from network provider as backup
            if (locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true) {
                locationManager?.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    LOCATION_UPDATE_INTERVAL,
                    LOCATION_UPDATE_DISTANCE,
                    locationListener!!
                )
            }

            // Start foreground service
            startForegroundService()
            
            isTracking = true
            Log.d(TAG, "✅ Background location tracking started successfully")
            promise.resolve("Background location tracking started")

        } catch (e: Exception) {
            Log.e(TAG, "❌ Error starting background location tracking", e)
            promise.reject("START_ERROR", "Failed to start background location tracking: ${e.message}")
        }
    }

    @ReactMethod
    fun stopBackgroundLocation() {
        try {
            Log.d(TAG, "Stopping background location tracking...")
            
            locationListener?.let { listener ->
                locationManager?.removeUpdates(listener)
            }
            
            stopForegroundService()
            
            isTracking = false
            locationListener = null
            locationManager = null
            
            Log.d(TAG, "✅ Background location tracking stopped successfully")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error stopping background location tracking", e)
        }
    }

    @ReactMethod
    fun isBackgroundLocationRunning(promise: Promise) {
        promise.resolve(isTracking)
    }

    private fun sendLocationUpdate(location: Location) {
        try {
            val params = Arguments.createMap().apply {
                putDouble("latitude", location.latitude)
                putDouble("longitude", location.longitude)
                putDouble("accuracy", location.accuracy.toDouble())
                putDouble("altitude", location.altitude)
                putDouble("speed", location.speed.toDouble())
                putDouble("heading", location.bearing.toDouble())
                putDouble("timestamp", location.time.toDouble())
            }

            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("BackgroundLocationUpdate", params)

            Log.d(TAG, "📤 Location update sent to React Native")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error sending location update to React Native", e)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Background Location",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Driver location tracking"
                setShowBadge(false)
            }

            val notificationManager = reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun startForegroundService() {
        val intent = Intent(reactApplicationContext, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            reactApplicationContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
            .setContentTitle("Driver Location Tracking")
            .setContentText("Tracking your location for ride requests")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        // Start foreground service
        val serviceIntent = Intent(reactApplicationContext, BackgroundLocationService::class.java)
        serviceIntent.putExtra("notification", notification)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(serviceIntent)
        } else {
            reactApplicationContext.startService(serviceIntent)
        }
    }

    private fun stopForegroundService() {
        val serviceIntent = Intent(reactApplicationContext, BackgroundLocationService::class.java)
        reactApplicationContext.stopService(serviceIntent)
    }
}
