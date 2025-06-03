package com.mydriverdriver7

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

class BackgroundLocationService : Service() {

    companion object {
        private const val TAG = "BackgroundLocationService"
        private const val NOTIFICATION_ID = 1
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Background location service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Background location service started")
        
        val notification = intent?.getParcelableExtra<Notification>("notification")
        if (notification != null) {
            startForeground(NOTIFICATION_ID, notification)
            Log.d(TAG, "Foreground service started with notification")
        }

        // Return START_STICKY to restart service if killed by system
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Background location service destroyed")
        stopForeground(true)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
