import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

const GOLD_COLOR = '#FFD700';

export const Loader = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={GOLD_COLOR} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});

// Usage example:
// Full screen loader:
// <Loader loading={true} fullScreen text="Loading..." />

// Component loader:
// <Loader loading={true} text="Please wait" />

// Small inline loader:
// <SmallLoader loading={true} />

// Custom styled loader:
// <Loader
//   loading={true}
//   color="#FF5722"
//   backgroundColor="rgba(0, 0, 0, 0.8)"
//   text="Processing..."
//   textStyle={{ color: '#FFFFFF' }}
// />
