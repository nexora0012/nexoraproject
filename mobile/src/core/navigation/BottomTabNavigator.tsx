import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { Ionicons } from '@react-native-vector-icons/ionicons';

import DashboardScreen from '../../features/dashboard/screens/DashboardScreen';
import PlansScreen from '../../features/plans/screens/PlansScreen';
import WalletScreen from '../../features/wallet/screens/WalletScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import UsdtDepositScreen from '../../features/wallet/screens/UsdtDepositScreen';

const Tab = createBottomTabNavigator();

const getIconName = (
  routeName: string,
  isFocused: boolean,
) => {
  switch (routeName) {
    case 'Home':
      return isFocused ? 'home' : 'home-outline';

    case 'Plans':
      return isFocused ? 'grid' : 'grid-outline';

    case 'Wallet':
      return isFocused ? 'wallet' : 'wallet-outline';

    case 'USDT':
      return isFocused ? 'cash' : 'cash-outline';

    case 'Profile':
      return isFocused ? 'person' : 'person-outline';

    default:
      return 'ellipse-outline';
  }
};

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key].options;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={
                isFocused ? { selected: true } : {}
              }
              accessibilityLabel={
                options.tabBarAccessibilityLabel
              }
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                isFocused && styles.activeTabButton,
              ]}
            >
              <Ionicons
                name={getIconName(route.name, isFocused)}
                size={isFocused ? 23 : 22}
                color={isFocused ? '#FFFFFF' : '#64748B'}
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  isFocused && styles.activeTabLabel,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Plans"
        component={PlansScreen}
      />

      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
      />
      <Tab.Screen
        name="USDT"
        component={UsdtDepositScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },

  tabBarContainer: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 9,

    elevation: 14,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },

  tabButton: {
    flex: 1,
    height: 52,
    marginHorizontal: 3,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTabButton: {
    flex: 1.35,
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
  },

  tabLabel: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  activeTabLabel: {
    marginTop: 0,
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BottomTabNavigator;