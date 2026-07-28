import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';

import {launchImageLibrary} from 'react-native-image-picker';

import Theme from '../../../core/theme/theme';
import {SERVER_BASE_URL} from '../../../core/api/axios';
import {getUsdtPayment} from '../services/usdtPaymentService';
import {submitPaymentProof} from '../services/paymentProofService';

const UsdtDepositScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getUsdtPayment();
        setImage(response.data.image);
        setDescription(response.data.description || '');
      } catch (error) {
        setErrorMessage('Unable to load USDT payment details.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.assets && result.assets.length > 0) {
      setProofImageUri(result.assets[0].uri || null);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofImageUri) {
      Alert.alert('Validation', 'Please select your payment screenshot.');
      return;
    }

    if (!accountDetails.trim()) {
      Alert.alert(
        'Validation',
        'Please enter your account details where the amount should be sent.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await submitPaymentProof(proofImageUri, accountDetails.trim());

      Alert.alert(
        'Submitted',
        'Your payment proof has been shared with our team. We will review it shortly.',
      );

      setProofImageUri(null);
      setAccountDetails('');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit payment proof.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      <Text style={styles.title}>USDT Deposit</Text>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <>
          {image ? (
            <Image
              source={{uri: `${SERVER_BASE_URL}${image}`}}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>
                No payment details available yet.
              </Text>
            </View>
          )}

          {description ? (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          ) : null}

          {/* Share payment proof section */}
          <View style={styles.proofCard}>
            <Text style={styles.sectionTitle}>
              Share Payment Screenshot
            </Text>

            <TouchableOpacity
              style={styles.pickImageButton}
              onPress={handlePickImage}>
              <Text style={styles.pickImageText}>
                {proofImageUri ? 'Change Screenshot' : 'Select Screenshot'}
              </Text>
            </TouchableOpacity>

            {proofImageUri ? (
              <Image
                source={{uri: proofImageUri}}
                style={styles.proofPreview}
                resizeMode="cover"
              />
            ) : null}

            <Text style={styles.sectionTitle}>
              Your Account Details
            </Text>

            <TextInput
              style={styles.accountInput}
              placeholder="e.g. Bank name, Account number, IFSC / UPI ID"
              placeholderTextColor="#64748B"
              value={accountDetails}
              onChangeText={setAccountDetails}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitProof}
              disabled={isSubmitting}>
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={async () => {
              const url = 'https://t.me/YourTelegramUsername';
              const supported = await Linking.canOpenURL(url);

              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert(
                  'Telegram Not Available',
                  'Please install Telegram to contact support.',
                );
              }
            }}>
            <Text style={styles.supportText}>Customer Support</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default UsdtDepositScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Theme.colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 14,
    backgroundColor: Theme.colors.card,
  },
  placeholderBox: {
    backgroundColor: Theme.colors.card,
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
  },
  placeholderText: {
    color: Theme.colors.grey,
    textAlign: 'center',
  },
  descriptionCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
  },
  descriptionText: {
    color: Theme.colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
  errorText: {
    color: '#FCA5A5',
    textAlign: 'center',
    marginTop: 20,
  },
  proofCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
  },
  sectionTitle: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  pickImageButton: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  pickImageText: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
  proofPreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
  },
  accountInput: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    padding: 12,
    color: Theme.colors.white,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  supportButton: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  supportText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});