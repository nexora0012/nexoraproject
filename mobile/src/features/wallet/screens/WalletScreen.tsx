import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import Theme from '../../../core/theme/theme';

import {
  getTransactions,
  getWalletSummary,
  WalletSummary,
  WalletTransaction,
} from '../services/walletService';

const emptySummary: WalletSummary = {
  balance: 0,
  totalCredit: 0,
  totalDebit: 0,

  todayCredit: 0,
  todayDebit: 0,

  pendingReturn: 0,
  pendingReturnCount: 0,

  totalMaturityReturn: 0,
};

const WalletScreen = () => {
  const navigation =
    useNavigation<any>();

  const [transactions, setTransactions] =
    useState<WalletTransaction[]>([]);

  const [summary, setSummary] =
    useState<WalletSummary>(emptySummary);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const loadWallet = async (
    showLoader = true,
  ) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }

      setErrorMessage('');

      const [
        summaryResponse,
        transactionResponse,
      ] = await Promise.all([
        getWalletSummary(),
        getTransactions(),
      ]);

      if (summaryResponse.success) {
        setSummary(
          summaryResponse.summary ||
            emptySummary,
        );
      }

      if (transactionResponse.success) {
        setTransactions(
          transactionResponse.transactions ||
            [],
        );
      }
    } catch (error: any) {
      console.log(
        'Wallet load error:',
        error.response?.data ||
          error.message,
      );

      setErrorMessage(
        error.response?.data?.message ||
          'Unable to load wallet.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWallet();

      return undefined;
    }, []),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWallet(false);
  };

  const formatCurrency = (
    amount: number,
  ) => {
    return `₹${Number(
      amount || 0,
    ).toFixed(2)}`;
  };

  const formatDate = (
    value: string,
  ) => {
    return new Date(
      value,
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTransactionTitle = (
    transaction: WalletTransaction,
  ) => {
    switch (transaction.category) {
      case 'MaturityReturn':
        return 'Maturity Return';

      case 'PlanPurchase':
        return 'Plan Purchase';

      case 'AdminCredit':
        return 'Wallet Credit';

      case 'AdminDebit':
        return 'Wallet Debit';

      case 'Refund':
        return 'Refund';

      default:
        return transaction.type === 'credit'
          ? 'Wallet Credit'
          : 'Wallet Debit';
    }
  };

  const getTransactionSymbol = (
    transaction: WalletTransaction,
  ) => {
    if (
      transaction.category ===
      'MaturityReturn'
    ) {
      return 'R';
    }

    if (
      transaction.category ===
      'PlanPurchase'
    ) {
      return 'P';
    }

    return transaction.type === 'credit'
      ? '+'
      : '−';
  };

  const renderTransaction = ({
    item,
  }: {
    item: WalletTransaction;
  }) => {
    const isCredit =
      item.type === 'credit';

    const isMaturityReturn =
      item.category ===
      'MaturityReturn';

    return (
      <View style={styles.transactionCard}>
        <View
          style={[
            styles.typeIcon,
            isCredit
              ? styles.creditIcon
              : styles.debitIcon,

            isMaturityReturn &&
              styles.returnIcon,
          ]}>
          <Text
            style={[
              styles.typeIconText,
              isCredit
                ? styles.creditText
                : styles.debitText,

              isMaturityReturn &&
                styles.returnIconText,
            ]}>
            {getTransactionSymbol(item)}
          </Text>
        </View>

        <View
          style={styles.transactionContent}>
          <Text
            style={styles.transactionTitle}>
            {getTransactionTitle(item)}
          </Text>

          <Text
            style={
              styles.transactionDescription
            }
            numberOfLines={2}>
            {item.description ||
              'Wallet transaction'}
          </Text>

          <Text style={styles.transactionDate}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <Text
          style={[
            styles.transactionAmount,
            isCredit
              ? styles.creditText
              : styles.debitText,
          ]}>
          {isCredit ? '+' : '−'}
          {formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={Theme.colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading wallet...
        </Text>
      </View>
    );
  }

  if (
    errorMessage &&
    transactions.length === 0
  ) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Wallet unavailable
        </Text>

        <Text style={styles.errorMessage}>
          {errorMessage}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadWallet()}>
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={item => item._id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={
              Theme.colors.primary
            }
            colors={[
              Theme.colors.primary,
            ]}
          />
        }
        contentContainerStyle={
          styles.listContent
        }
        ListHeaderComponent={
          <>
            <Text style={styles.title}>
              My Wallet
            </Text>

            <Text style={styles.subtitle}>
              View your balance, pending returns
              and recent wallet activity.
            </Text>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>
                Available Balance
              </Text>

              <Text style={styles.balanceAmount}>
                {formatCurrency(
                  summary.balance,
                )}
              </Text>

              <Text style={styles.balanceHint}>
                Available for plan purchases
              </Text>
            </View>

            <View style={styles.returnCard}>
              <View style={styles.returnHeader}>
                <View>
                  <Text style={styles.returnLabel}>
                    Pending Return
                  </Text>

                  <Text style={styles.returnAmount}>
                    {formatCurrency(
                      summary.pendingReturn,
                    )}
                  </Text>
                </View>

                <View style={styles.pendingBadge}>
                  <Text
                    style={styles.pendingBadgeText}>
                    {summary.pendingReturnCount}{' '}
                    active
                  </Text>
                </View>
              </View>

              <Text style={styles.returnHint}>
                This amount will be credited after
                eligible subscriptions mature.
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  Total Credit
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    styles.creditText,
                  ]}>
                  {formatCurrency(
                    summary.totalCredit,
                  )}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  Total Debit
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    styles.debitText,
                  ]}>
                  {formatCurrency(
                    summary.totalDebit,
                  )}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  Today's Credit
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    styles.creditText,
                  ]}>
                  {formatCurrency(
                    summary.todayCredit,
                  )}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  Today's Debit
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    styles.debitText,
                  ]}>
                  {formatCurrency(
                    summary.todayDebit,
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.maturityCard}>
              <Text style={styles.maturityLabel}>
                Total Returns Received
              </Text>

              <Text style={styles.maturityAmount}>
                {formatCurrency(
                  summary.totalMaturityReturn,
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.paymentHistoryButton}
              onPress={() =>
                navigation.navigate(
                  'PaymentHistory',
                )
              }>
              <Text
                style={
                  styles.paymentHistoryButtonText
                }>
                View Payment History
              </Text>

              <Text
                style={
                  styles.paymentHistoryArrow
                }>
                ›
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.usdtDepositButton}
              onPress={() =>
                navigation.navigate(
                  'UsdtDeposit',
                )
              }>
              <Text
                style={
                  styles.usdtDepositButtonText
                }>
                Deposit via USDT
              </Text>

              <Text
                style={
                  styles.paymentHistoryArrow
                }>
                ›
              </Text>
            </TouchableOpacity>    

            <Text style={styles.sectionTitle}>
              Transactions
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No transactions found
            </Text>

            <Text style={styles.emptyText}>
              Wallet activity will appear
              here.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.bottomSpace} />
        }
      />
    </View>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Theme.colors.background,
  },

  centerContainer: {
    flex: 1,
    backgroundColor:
      Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  listContent: {
    padding: 20,
    paddingBottom: 110,
  },

  title: {
    color: Theme.colors.white,
    fontSize: 29,
    fontWeight: '800',
  },

  subtitle: {
    color: Theme.colors.grey,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 22,
  },

  balanceCard: {
    backgroundColor:
      Theme.colors.primary,
    borderRadius: 20,
    padding: 22,
  },

  balanceLabel: {
    color: '#DBEAFE',
    fontSize: 14,
  },

  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 8,
  },

  balanceHint: {
    color: '#DBEAFE',
    fontSize: 12,
    marginTop: 7,
  },

  returnCard: {
    backgroundColor: '#172554',
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },

  returnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  returnLabel: {
    color: '#BFDBFE',
    fontSize: 13,
  },

  returnAmount: {
    color: '#60A5FA',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 5,
  },

  returnHint: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  pendingBadge: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  pendingBadgeText: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '700',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  statCard: {
    width: '48%',
    backgroundColor: Theme.colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },

  statLabel: {
    color: Theme.colors.grey,
    fontSize: 12,
  },

  statValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 7,
  },

  maturityCard: {
    backgroundColor: '#052E16',
    borderRadius: 16,
    padding: 17,
    marginTop: 2,
  },

  maturityLabel: {
    color: '#86EFAC',
    fontSize: 13,
  },

  maturityAmount: {
    color: '#22C55E',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 5,
  },

  paymentHistoryButton: {
    minHeight: 54,
    backgroundColor: Theme.colors.card,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  paymentHistoryButtonText: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  paymentHistoryArrow: {
    color: Theme.colors.primary,
    fontSize: 28,
    fontWeight: '500',
  },

  usdtDepositButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 12,
  }, 

  usdtDepositButtonText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  }, 

  sectionTitle: {
    color: Theme.colors.white,
    fontSize: 19,
    fontWeight: '700',
    marginTop: 27,
    marginBottom: 13,
  },

  transactionCard: {
    backgroundColor:
      Theme.colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  typeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  creditIcon: {
    backgroundColor:
      'rgba(34,197,94,0.15)',
  },

  debitIcon: {
    backgroundColor:
      'rgba(239,68,68,0.15)',
  },

  returnIcon: {
    backgroundColor: '#14532D',
  },

  returnIconText: {
    color: '#86EFAC',
  },

  typeIconText: {
    fontSize: 21,
    fontWeight: '800',
  },

  transactionContent: {
    flex: 1,
    marginHorizontal: 12,
  },

  transactionTitle: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  transactionDescription: {
    color: Theme.colors.grey,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  transactionDate: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 5,
  },

  transactionAmount: {
    fontSize: 15,
    fontWeight: '800',
  },

  creditText: {
    color: '#22C55E',
  },

  debitText: {
    color: '#EF4444',
  },

  loadingText: {
    color: Theme.colors.white,
    marginTop: 14,
  },

  errorTitle: {
    color: Theme.colors.white,
    fontSize: 22,
    fontWeight: '700',
  },

  errorMessage: {
    color: Theme.colors.grey,
    textAlign: 'center',
    marginTop: 10,
  },

  retryButton: {
    backgroundColor:
      Theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 55,
  },

  emptyTitle: {
    color: Theme.colors.white,
    fontSize: 18,
    fontWeight: '700',
  },

  emptyText: {
    color: Theme.colors.grey,
    marginTop: 7,
  },

  bottomSpace: {
    height: 10,
  },
});