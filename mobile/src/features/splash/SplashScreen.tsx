import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../core/navigation/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Splash'
>;

const SplashScreen = ({navigation}: Props) => {

  useEffect(() => {

    const timer = setTimeout(() => {

      navigation.replace('Login');

    }, 2500);

    return () => clearTimeout(timer);

  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NEXORA</Text>

      <Text style={styles.subtitle}>
        AI Membership Platform
      </Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    color: '#3B82F6',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 5,
  },

  subtitle: {
    marginTop: 15,
    color: '#FFFFFF',
    fontSize: 18,
  },
});