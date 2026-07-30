import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';

const AppBackground = ({children}: {children: React.ReactNode}) => {
  return (
    <ImageBackground
      source={require('../../assets/images/app_background.png')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
};

export default AppBackground;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
});