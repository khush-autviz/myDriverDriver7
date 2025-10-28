package com.mydriverdriver7

import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "myDriverDriver7"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * 🔊 Create notification channel with custom sound
   * Called when activity is created
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    createNotificationChannel()
  }

  private fun createNotificationChannel() {
    // Notification channels are required for Android 8.0 (API level 26) and above
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channelId = "mytone"
      val channelName = "My Tone Channel"
      val importance = NotificationManager.IMPORTANCE_HIGH

      val channel = NotificationChannel(channelId, channelName, importance).apply {
        description = "Notifications with custom sound"
        enableVibration(true)
        
        // Set custom sound
        val soundUri = Uri.parse("android.resource://$packageName/raw/mytone")
        val audioAttributes = AudioAttributes.Builder()
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(AudioAttributes.USAGE_NOTIFICATION)
          .build()
        setSound(soundUri, audioAttributes)
      }

      // Get notification manager and delete old channel (to force update)
      val notificationManager = getSystemService(NotificationManager::class.java)
      notificationManager?.deleteNotificationChannel(channelId) // Force refresh
      notificationManager?.createNotificationChannel(channel)
      
      android.util.Log.d("MainActivity", "✅ Notification channel created with custom sound")
    }
  }
}