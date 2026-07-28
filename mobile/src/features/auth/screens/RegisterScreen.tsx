import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../core/navigation/types';
import Theme from '../../../core/theme/theme';
import CustomInput from '../../../shared/components/Input/CustomInput';
import CustomButton from '../../../shared/components/Button/CustomButton';
import {registerUser} from '../services/authService';
import {saveToken} from '../../../core/storage/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({navigation}: Props) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanMobile = mobile.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanMobile || !cleanEmail || !password) {
      Alert.alert('Validation Error', 'Please fill all fields.');
      return;
    }

    if (cleanMobile.length < 10) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid mobile number.',
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Validation Error',
        'Password must be at least 6 characters.',
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await registerUser({
        fullName: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        password,
      });

      if (response.token) {
        await saveToken(response.token);

        Alert.alert('Success', 'Account created successfully.', [
          {
            text: 'Continue',
            onPress: () => navigation.reset({index: 0, routes: [{name: 'Main'}]}),
          },
        ]);
      } else {
        Alert.alert(
          'OTP Sent',
          response.message || 'Please verify your mobile number to continue.',
          [
            {
              text: 'Continue',
              onPress: () =>
                navigation.navigate('VerifyOtp', {mobile: cleanMobile}),
            },
          ],
        );
      }
      
    } catch (error: any) {
      let message = 'Unable to create account. Please try again.';

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please check backend connection.';
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to the backend server.';
      }

      Alert.alert('Registration Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={Theme.colors.background}
        barStyle="light-content"
      />

      <Text style={styles.title}>Create Account</Text>

      <View style={styles.card}>
        <CustomInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <CustomInput
          placeholder="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
        />

        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CustomInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {isLoading ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Creating account...</Text>
          </View>
        ) : (
          <CustomButton
            title="REGISTER"
            onPress={handleRegister}
          />
        )}

        <TouchableOpacity
          disabled={isLoading}
          onPress={() => navigation.goBack()}>
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    fontSize: 30,
    color: Theme.colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },

  card: {
    backgroundColor: Theme.colors.card,
    padding: 20,
    borderRadius: 15,
  },

  loginText: {
    marginTop: 20,
    color: Theme.colors.white,
    textAlign: 'center',
  },

  loadingButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontWeight: '700',
  },
});