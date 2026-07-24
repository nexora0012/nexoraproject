import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import Theme from '../../../core/theme/theme';
import CustomInput from '../../../shared/components/Input/CustomInput';
import CustomButton from '../../../shared/components/Button/CustomButton';
import {forgotPassword, resetPassword} from '../services/authService';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();

  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Please enter your registered email.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await forgotPassword(email.trim());

      if (response.mobile) {
        setMobile(response.mobile);
        setStep('reset');
      }

      Alert.alert('OTP Sent', response.message);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to send OTP.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Validation', 'Please enter the 6-digit OTP.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);

      await resetPassword({
        mobile,
        otp: otp.trim(),
        newPassword,
      });

      Alert.alert('Success', 'Password reset successfully.', [
        {text: 'Login', onPress: () => navigation.navigate('Login')},
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to reset password.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {step === 'email' ? (
        <>
          <Text style={styles.subtitle}>
            Enter your registered email to receive an OTP.
          </Text>

          <CustomInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {isLoading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          ) : (
            <CustomButton title="Send OTP" onPress={handleSendOtp} />
          )}
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Enter the OTP sent to your mobile and set a new password.
          </Text>

          <CustomInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          <CustomInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          {isLoading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          ) : (
            <CustomButton title="Reset Password" onPress={handleReset} />
          )}
        </>
      )}
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
  },
});