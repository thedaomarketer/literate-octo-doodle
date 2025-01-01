import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import messaging from '@react-native-firebase/messaging';
import { Home, DollarSign, Bell, Shield } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

// Environment configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.yourservice.com';

// Type definitions
interface Transaction {
  amount: number;
  location: {
    lat: number;
    lon: number;
  };
}

interface FraudCheckResponse {
  fraudDetected: boolean;
}

interface SavingsRecommendationResponse {
  recommendedSavings: number;
}

interface Expense {
  amount: number;
  category: string;
}

// Dashboard Component
function Dashboard() {
  const [balance, setBalance] = useState(1000);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.balance}>Balance: ${balance.toFixed(2)}</Text>
    </View>
  );
}

// Fraud Detection Component
function FraudDetection() {
  const [fraudDetected, setFraudDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForFraud = async () => {
    setIsLoading(true);
    setError(null);

    const transactions: Transaction[] = [
      { amount: 500, location: { lat: 40.7128, lon: -74.0060 } },
      { amount: 2000, location: { lat: 35.6895, lon: 139.6917 } },
    ];

    try {
      const response = await fetch(`${API_BASE_URL}/check-fraud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });
      const result = await response.json() as FraudCheckResponse;
      setFraudDetected(result.fraudDetected);
      if (result.fraudDetected) {
        Alert.alert('Fraud Alert', 'Suspicious activity detected in your account.');
      }
    } catch (error) {
      setError('Failed to check for fraud');
      Alert.alert('Error', 'Failed to check for fraud. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Fraud Detection</Text>
      <Button 
        title="Check for Fraud" 
        onPress={checkForFraud}
        disabled={isLoading}
      />
      {isLoading && <ActivityIndicator style={styles.loader} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {fraudDetected && (
        <Text style={styles.fraudAlert}>Fraudulent transactions detected!</Text>
      )}
    </View>
  );
}

// Savings Recommendation Component
function SavingsRecommendation() {
  const [recommendedSavings, setRecommendedSavings] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSavingsRecommendation = async () => {
    setIsLoading(true);
    setError(null);

    const expenses: Expense[] = [
      { amount: 1500, category: 'Rent' },
      { amount: 500, category: 'Utilities' },
      { amount: 300, category: 'Groceries' },
    ];

    try {
      const response = await fetch(`${API_BASE_URL}/recommend-savings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income: 5000, expenses }),
      });
      const result = await response.json() as SavingsRecommendationResponse;
      setRecommendedSavings(result.recommendedSavings);
    } catch (error) {
      setError('Failed to get savings recommendation');
      Alert.alert('Error', 'Unable to get savings recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Savings Recommendation</Text>
      <Button 
        title="Get Savings Recommendation" 
        onPress={getSavingsRecommendation}
        disabled={isLoading}
      />
      {isLoading && <ActivityIndicator style={styles.loader} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {recommendedSavings !== null && (
        <Text style={styles.recommendation}>
          Recommended savings: ${recommendedSavings.toFixed(2)}
        </Text>
      )}
    </View>
  );
}

// Notifications Component
function Notifications() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    requestUserPermission();
    getFCMToken();
  }, []);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  };

  const getFCMToken = async () => {
    const token = await messaging().getToken();
    setFcmToken(token);
    console.log('FCM Token:', token);
  };

  const notifyLowBalance = async () => {
    if (!fcmToken) return;

    const balance = 50;  // Simulated low balance
    try {
      await fetch('http://localhost:3000/notify-low-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance, token: fcmToken }),
      });
      console.log('Notification request sent');
      Alert.alert('Notification Sent', 'A low balance notification has been simulated.');
    } catch (error) {
      console.error('Error sending notification request:', error);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Notifications</Text>
      <Text>FCM Token: {fcmToken ? 'Received' : 'Not available'}</Text>
      <Button title="Simulate Low Balance Notification" onPress={notifyLowBalance} />
    </View>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let icon;

            if (route.name === 'Dashboard') {
              icon = <Home color={color} size={size} />;
            } else if (route.name === 'Fraud') {
              icon = <Shield color={color} size={size} />;
            } else if (route.name === 'Savings') {
              icon = <DollarSign color={color} size={size} />;
            } else if (route.name === 'Notifications') {
              icon = <Bell color={color} size={size} />;
            }

            return icon;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Fraud" component={FraudDetection} />
        <Tab.Screen name="Savings" component={SavingsRecommendation} />
        <Tab.Screen name="Notifications" component={Notifications} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balance: {
    fontSize: 18,
    marginBottom: 20,
  },
  fraudAlert: {
    color: 'red',
    marginTop: 20,
    fontSize: 18,
  },
  recommendation: {
    marginTop: 20,
    fontSize: 18,
  },
});