import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import Theme from '../../../core/theme/theme';

interface Props {
  children: React.ReactNode;
}

const InfoCard = ({children}: Props) => {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
};

export default InfoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
  },
});