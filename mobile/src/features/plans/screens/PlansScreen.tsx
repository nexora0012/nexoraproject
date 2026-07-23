import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import Theme from '../../../core/theme/theme';
import api from '../../../core/api/axios';
import RazorpayCheckout from 'react-native-razorpay';
import {purchaseUsingWallet} from '../services/planService';
import {getWalletSummary} from '../../wallet/services/walletService';

interface Plan {
  _id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  price: number;
  duration: number;
  returnAmount: number;   // <-- ADD THIS
  displayOrder: number;
  status: boolean;
}

interface PlansResponse {
  success: boolean;
  message?: string;
  plans: Plan[];
}

interface CreateOrderResponse {
  success: boolean;
  message?: string;

  keyId: string;

  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };

  plan: {
    id: string;
    title: string;
    price: number;
    duration: number;
  };

  customer: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  subscription?: {
    _id: string;
  };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  code?: number;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
  };
}

const PlansScreen = () => {
  const navigation = useNavigation<any>();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [selectedPlanId, setSelectedPlanId] =
    useState<string | null>(null);
  const [errorMessage, setErrorMessage] =
    useState('');

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [paymentMethod, setPaymentMethod] =
    useState<'wallet' | 'razorpay'>(
      'wallet',
    );

  const [selectedPlan, setSelectedPlan] =
    useState<Plan | null>(null);

  const [
    paymentModalVisible,
    setPaymentModalVisible,
  ] = useState(false);

  const [isProcessingPayment, setIsProcessingPayment] =
    useState(false);

  const loadPlans = async (
    showLoader = true,
  ) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }

      setErrorMessage('');

      const response =
        await api.get<PlansResponse>(
          '/plans/active',
        );

      if (response.data.success) {
        setPlans(response.data.plans || []);
      } else {
        setErrorMessage(
          response.data.message ||
            'Unable to load plans.',
        );
      }
    } catch (error: any) {
      console.log(
        'Plans API error:',
        error.response?.data ||
          error.message,
      );

      setErrorMessage(
        error.response?.data?.message ||
          'Unable to connect to the server.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const summaryResponse =
        await getWalletSummary();

      if (summaryResponse.success) {
        setWalletBalance(
          summaryResponse.summary
            ?.balance || 0,
        );
      }
    } catch (error: any) {
      console.log(
        'Wallet balance load error:',
        error.response?.data ||
          error.message,
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlans();
      loadWalletBalance();

      return undefined;
    }, []),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadPlans(false);
    loadWalletBalance();
  };

  const activatePlan = async (plan: Plan) => {
    try {
      setSelectedPlanId(plan._id);

      /*
       * Step 1:
       * Create an order securely from the backend.
       */
      const orderResponse =
        await api.post<CreateOrderResponse>(
          '/payments/create-order',
          {
            planId: plan._id,
          },
        );

      if (
        !orderResponse.data.success ||
        !orderResponse.data.order?.id
      ) {
        throw new Error(
          orderResponse.data.message ||
            'Unable to create payment order.',
        );
      }

      const {keyId, order, customer} =
        orderResponse.data;

      /*
       * Step 2:
       * Open Razorpay Checkout.
       *
       * Amount is already returned in paise
       * by the backend.
       */
      const options = {
        key: keyId,
        amount: String(order.amount),
        currency: order.currency || 'INR',
        name: 'Nexora',
        description: `${plan.title} Plan`,
        order_id: order.id,

        prefill: {
          name: customer?.name || '',
          email: customer?.email || '',
          contact: customer?.contact || '',
        },

        notes: {
          planId: plan._id,
          planTitle: plan.title,
        },

        theme: {
          color: '#2563EB',
        },

        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const paymentResult =
        (await RazorpayCheckout.open(
          options,
        )) as RazorpaySuccessResponse;

      /*
       * Step 3:
       * Send Razorpay response to backend.
       * Backend verifies the signature and only
       * then activates the subscription.
       */
      const verifyResponse =
        await api.post<VerifyPaymentResponse>(
          '/payments/verify',
          {
            razorpay_order_id:
              paymentResult.razorpay_order_id,

            razorpay_payment_id:
              paymentResult.razorpay_payment_id,

            razorpay_signature:
              paymentResult.razorpay_signature,
          },
        );

      if (!verifyResponse.data.success) {
        throw new Error(
          verifyResponse.data.message ||
            'Payment verification failed.',
        );
      }

      Alert.alert(
        'Payment Successful',
        verifyResponse.data.message ||
          'Your plan has been activated successfully.',
        [
          {
            text: 'Open Dashboard',
            onPress: () =>
              navigation.navigate('Home'),
          },
        ],
      );
    } catch (error: any) {
      console.log(
        'Razorpay payment error:',
        error,
      );

      /*
       * Axios/backend error
       */
      if (error.response?.data?.message) {
        Alert.alert(
          'Payment Failed',
          error.response.data.message,
        );

        return;
      }

      /*
       * Razorpay Checkout error
       */
      const razorpayError =
        error as RazorpayErrorResponse;

      if (razorpayError.description) {
        Alert.alert(
          'Payment Not Completed',
          razorpayError.description,
        );

        return;
      }

      /*
       * Local JavaScript error
       */
      Alert.alert(
        'Payment Failed',
        error.message ||
          'Unable to complete the payment.',
      );
    } finally {
      setSelectedPlanId(null);
    }
  };

  const purchaseWithWallet = async (
    plan: Plan,
  ) => {
    try {
      setIsProcessingPayment(true);

      const response =
        await purchaseUsingWallet(plan._id);

      if (!response.success) {
        throw new Error(
          response.message ||
            'Unable to complete wallet payment.',
        );
      }

      setPaymentModalVisible(false);
      setSelectedPlan(null);

      Alert.alert(
        'Payment Successful',
        response.message ||
          'Your plan has been activated successfully.',
        [
          {
            text: 'Open Dashboard',
            onPress: () =>
              navigation.navigate('Home'),
          },
        ],
      );

      loadWalletBalance();
    } catch (error: any) {
      console.log(
        'Wallet payment error:',
        error.response?.data ||
          error.message,
      );

      Alert.alert(
        'Payment Failed',
        error.response?.data?.message ||
          error.message ||
          'Unable to complete the payment.',
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const openPaymentModal = (plan: Plan) => {
    setSelectedPlan(plan);

    setPaymentMethod(
      walletBalance >= (plan.price || 0)
        ? 'wallet'
        : 'razorpay',
    );

    setPaymentModalVisible(true);
  };

  const closePaymentModal = () => {
    if (isProcessingPayment) {
      return;
    }

    setPaymentModalVisible(false);
    setSelectedPlan(null);
  };

  const handleContinue = () => {
    if (!selectedPlan) {
      return;
    }

    if (paymentMethod === 'wallet') {
      if (
        walletBalance <
        (selectedPlan.price || 0)
      ) {
        Alert.alert(
          'Insufficient Balance',
          'Your wallet balance is not enough for this plan. Please choose Razorpay instead.',
        );

        return;
      }

      purchaseWithWallet(selectedPlan);
    } else {
      const plan = selectedPlan;

      setPaymentModalVisible(false);
      setSelectedPlan(null);

      activatePlan(plan);
    }
  };

  const renderPlan = ({
    item,
  }: {
    item: Plan;
  }) => {
    const isSubmitting =
      selectedPlanId === item._id;

    return (
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {item.category || 'General'}
            </Text>
          </View>

          <Text style={styles.duration}>
            {item.duration} days
          </Text>
        </View>

        <Text style={styles.planTitle}>
          {item.title}
        </Text>

        <Text style={styles.description}>
          {item.description ||
            'No description available.'}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₹
            {Number(item.price || 0).toFixed(
              2,
            )}
          </Text>

          <Text style={styles.priceDuration}>
            / {item.duration} days
          </Text>
        </View>

        <View style={styles.returnRow}>
          <Text style={styles.returnLabel}>
            Return Amount
          </Text>

          <Text style={styles.returnAmount}>
            ₹
            {Number(
              item.returnAmount || 0,
            ).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSubmitting}
          style={[
            styles.activateButton,
            isSubmitting &&
              styles.disabledButton,
          ]}
          onPress={() =>
            openPaymentModal(item)
          }>
          {isSubmitting ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.activateButtonText
              }>
              Choose Plan
            </Text>
          )}
        </TouchableOpacity>
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
          Loading plans...
        </Text>
      </View>
    );
  }

  if (errorMessage && plans.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Plans unavailable
        </Text>

        <Text style={styles.errorMessage}>
          {errorMessage}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadPlans()}>
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
        data={plans}
        keyExtractor={item => item._id}
        renderItem={renderPlan}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
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
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              Choose Your Plan
            </Text>

            <Text style={styles.subtitle}>
              Select the plan that works best
              for you.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No plans available
            </Text>

            <Text style={styles.emptyText}>
              New plans will appear here.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.bottomSpace} />
        }
      />

      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closePaymentModal}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={closePaymentModal}
        />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetTitle}>
            Payment Method
          </Text>

          {selectedPlan && (
            <>
              <Text style={styles.sheetPlanTitle}>
                {selectedPlan.title}
              </Text>

              <View style={styles.sheetRow}>
                <Text
                  style={styles.sheetRowLabel}>
                  Plan Price
                </Text>

                <Text
                  style={styles.sheetRowValue}>
                  ₹
                  {Number(
                    selectedPlan.price || 0,
                  ).toFixed(2)}
                </Text>
              </View>

              <View style={styles.sheetRow}>
                <Text
                  style={styles.sheetRowLabel}>
                  Wallet Balance
                </Text>

                <Text
                  style={styles.sheetRowValue}>
                  ₹
                  {Number(
                    walletBalance || 0,
                  ).toFixed(2)}
                </Text>
              </View>

              <View
                style={
                  styles.optionsContainer
                }>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={
                    walletBalance <
                    (selectedPlan.price ||
                      0)
                  }
                  style={[
                    styles.optionRow,
                    paymentMethod ===
                      'wallet' &&
                      styles.optionRowSelected,
                    walletBalance <
                      (selectedPlan.price ||
                        0) &&
                      styles.optionRowDisabled,
                  ]}
                  onPress={() =>
                    setPaymentMethod('wallet')
                  }>
                  <View
                    style={[
                      styles.radioOuter,
                      paymentMethod ===
                        'wallet' &&
                        styles.radioOuterSelected,
                    ]}>
                    {paymentMethod ===
                      'wallet' && (
                      <View
                        style={
                          styles.radioInner
                        }
                      />
                    )}
                  </View>

                  <View
                    style={
                      styles.optionTextGroup
                    }>
                    <Text
                      style={
                        styles.optionLabel
                      }>
                      Wallet
                    </Text>

                    {walletBalance <
                      (selectedPlan.price ||
                        0) && (
                      <Text
                        style={
                          styles.optionWarning
                        }>
                        Insufficient balance
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.optionRow,
                    paymentMethod ===
                      'razorpay' &&
                      styles.optionRowSelected,
                  ]}
                  onPress={() =>
                    setPaymentMethod(
                      'razorpay',
                    )
                  }>
                  <View
                    style={[
                      styles.radioOuter,
                      paymentMethod ===
                        'razorpay' &&
                        styles.radioOuterSelected,
                    ]}>
                    {paymentMethod ===
                      'razorpay' && (
                      <View
                        style={
                          styles.radioInner
                        }
                      />
                    )}
                  </View>

                  <View
                    style={
                      styles.optionTextGroup
                    }>
                    <Text
                      style={
                        styles.optionLabel
                      }>
                      Razorpay
                    </Text>

                    <Text
                      style={
                        styles.optionSubLabel
                      }>
                      Card / UPI / Netbanking
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={
                  isProcessingPayment
                }
                style={[
                  styles.continueButton,
                  isProcessingPayment &&
                    styles.disabledButton,
                ]}
                onPress={handleContinue}>
                {isProcessingPayment ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.continueButtonText
                    }>
                    Continue
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                disabled={
                  isProcessingPayment
                }
                style={styles.cancelButton}
                onPress={closePaymentModal}>
                <Text
                  style={
                    styles.cancelButtonText
                  }>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PlansScreen;

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

  header: {
    marginBottom: 22,
  },

  title: {
    color: Theme.colors.white,
    fontSize: 29,
    fontWeight: '800',
  },

  subtitle: {
    color: Theme.colors.grey,
    fontSize: 14,
    marginTop: 7,
    lineHeight: 20,
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

  planCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryBadge: {
    backgroundColor: '#1E3A5F',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  categoryText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },

  duration: {
    color: Theme.colors.grey,
    fontSize: 13,
  },

  planTitle: {
    color: Theme.colors.white,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 17,
  },

  description: {
    color: Theme.colors.grey,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20,
  },

  price: {
    color: Theme.colors.primary,
    fontSize: 30,
    fontWeight: '800',
  },

  priceDuration: {
    color: Theme.colors.grey,
    fontSize: 13,
    marginLeft: 5,
    marginBottom: 5,
  },

  returnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  returnLabel: {
    color: Theme.colors.grey,
    fontSize: 14,
    fontWeight: '600',
  },

  returnAmount: {
    color: '#22C55E',
    fontSize: 20,
    fontWeight: '800',
  },

  activateButton: {
    minHeight: 50,
    backgroundColor:
      Theme.colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.65,
  },

  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 70,
  },

  emptyTitle: {
    color: Theme.colors.white,
    fontSize: 20,
    fontWeight: '700',
  },

  emptyText: {
    color: Theme.colors.grey,
    marginTop: 8,
  },

  bottomSpace: {
    height: 10,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  sheetContainer: {
    backgroundColor: Theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
  },

  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.colors.grey,
    alignSelf: 'center',
    opacity: 0.4,
    marginBottom: 16,
  },

  sheetTitle: {
    color: Theme.colors.white,
    fontSize: 20,
    fontWeight: '800',
  },

  sheetPlanTitle: {
    color: Theme.colors.grey,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },

  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sheetRowLabel: {
    color: Theme.colors.grey,
    fontSize: 14,
  },

  sheetRowValue: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  optionsContainer: {
    marginTop: 14,
    marginBottom: 22,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  optionRowSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(37,99,235,0.1)',
  },

  optionRowDisabled: {
    opacity: 0.45,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  radioOuterSelected: {
    borderColor: Theme.colors.primary,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },

  optionTextGroup: {
    flex: 1,
  },

  optionLabel: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  optionSubLabel: {
    color: Theme.colors.grey,
    fontSize: 12,
    marginTop: 2,
  },

  optionWarning: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 2,
  },

  continueButton: {
    minHeight: 52,
    backgroundColor:
      Theme.colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },

  cancelButtonText: {
    color: Theme.colors.grey,
    fontSize: 14,
    fontWeight: '600',
  },
});