import { useEffect, useState } from "react";
import { renewSubscription, } from "../../../services/subscriptionService";


import { renewSubscription,} from "../../../services/subscriptionService";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  getSubscriptionHistory,
} from "../../../services/subscriptionService";

export default function SubscriptionHistoryScreen({
  route,
}) {

  const { userId } = route.params;

  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {

    try {

      const res =
        await getSubscriptionHistory(userId);

      setHistory(res.subscriptions);

    } catch (error) {

      console.log(error);

    }

  };

  return (
    <FlatList
      data={history}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>
            {item.plan.title}
          </Text>

          <Text>
            ₹{item.amountPaid}
          </Text>

          <Text>
            {item.status}
          </Text>

          <Text>
            {new Date(
              item.startDate
            ).toLocaleDateString()}
          </Text>

          <Text>
            {new Date(
              item.endDate
            ).toLocaleDateString()}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
const handleRenew = async () => {
  try {
    await renewSubscription(subscription._id);

    alert("Subscription Renewed");

    loadSubscription();

  } catch (error) {
    console.log(error);

    alert("Renewal Failed");
  }
};
