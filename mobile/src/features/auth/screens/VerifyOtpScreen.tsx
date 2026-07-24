import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../core/navigation/types';
import Theme from '../../../core/theme/theme';
import CustomInput from '../../../shared/components/Input/CustomInput';
import CustomButton from '../../../shared/components/Button/CustomButton';
import {verifyRegistrationOtp, resendOtp} from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOtp'>;

const VerifyOtpScreen = ({navigation, route}: Props) => {
  const {mobile} = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Validation Error', 'Please enter the 6-digit OTP.');
      return;
    }

    try {
      setIsLoading(true);

      await verifyRegistrationOtp({mobile, otp: otp.trim()});

      Alert.alert('Success', 'Your account has been verified.', [
        {
          text: 'Login',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Invalid or expired OTP.';
      Alert.alert('Verification Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      await resendOtp(mobile);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your mobile number.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Unable to resend OTP.';
      Alert.alert('Error', message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Mobile Number</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {mobile}
      </Text>

      <CustomInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      ) : (
        <CustomButton title="Verify & Continue" onPress={handleVerify} />
      )}

      <Text style={styles.resendText} onPress={!isResending ? handleResend : undefined}>
        {isResending ? 'Resending...' : "Didn't receive the code? Resend OTP"}
      </Text>
    </View>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 25,
  },
  resendText: {
    color: Theme.colors.primary,
    textAlign: 'center',
    marginTop: 20,
  },
});