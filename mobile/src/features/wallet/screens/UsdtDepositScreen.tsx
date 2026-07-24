// this is a create a new one 

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import Theme from '../../../core/theme/theme';
import {SERVER_BASE_URL} from '../../../core/api/axios';
import {getUsdtPayment} from '../services/usdtPaymentService';

const UsdtDepositScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
});