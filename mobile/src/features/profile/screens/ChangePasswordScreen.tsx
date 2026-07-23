import React, {useState} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import Theme from '../../../core/theme/theme';

import {changePassword} from '../services/profileService';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const submit = async () => {
    if (!currentPassword) {
      Alert.alert(
        'Validation',
        'Please enter your current password.',
      );
      return;
    }

    if (!newPassword) {
      Alert.alert(
        'Validation',
        'Please enter your new password.',
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        'Invalid Password',
        'New password must contain at least 6 characters.',
      );
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert(
        'Invalid Password',
        'New password must be different from current password.',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'New password and confirm password do not match.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        Alert.alert(
          'Success',
          response.message ||
            'Password changed successfully.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.goBack(),
            },
          ],
        );
      }
    } catch (error: any) {
      console.log(
        'Change password error:',
        error.response?.data ||
          error.message,
      );

      Alert.alert(
        'Change Password Failed',
        error.response?.data?.message ||
          'Unable to change password.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          Change Password
        </Text>

        <Text style={styles.subtitle}>
          Enter your current password and choose
          a secure new password.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Current Password
          </Text>

          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Enter current password"
            placeholderTextColor={
              Theme.colors.grey
            }
            value={currentPassword}
            onChangeText={setCurrentPassword}
            editable={!isSubmitting}
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            New Password
          </Text>

          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Enter new password"
            placeholderTextColor={
              Theme.colors.grey
            }
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!isSubmitting}
            autoCapitalize="none"
          />

          <Text style={styles.helperText}>
            Password must contain at least 6
            characters.
          </Text>

          <Text style={styles.label}>
            Confirm New Password
          </Text>

          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Confirm new password"
            placeholderTextColor={
              Theme.colors.grey
            }
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isSubmitting}
            autoCapitalize="none"
            onSubmitEditing={submit}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isSubmitting &&
              styles.disabledButton,
          ]}
          onPress={submit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.buttonText}>
              Change Password
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Theme.colors.background,
  },

  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80,
  },

  title: {
    color: Theme.colors.white,
    fontSize: 29,
    fontWeight: '800',
  },

  subtitle: {
    color: Theme.colors.grey,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 24,
  },

  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: 18,
    padding: 20,
  },

  label: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    backgroundColor:
      Theme.colors.background,
    color: Theme.colors.white,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 18,
  },

  helperText: {
    color: Theme.colors.grey,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 18,
  },

  button: {
    backgroundColor:
      Theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 54,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },
});