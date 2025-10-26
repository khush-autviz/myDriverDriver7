# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep raw resources (sound files)
-keep class **.R$raw { *; }

# Keep all resources to prevent sound files from being stripped in release
-keeppackagenames **.R
-keep class **.R
-keep class **.R$* {
    <fields>;
}
