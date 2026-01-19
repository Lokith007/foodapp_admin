// app/_layout.jsx

import { Stack, useSegments } from 'expo-router';
import Toast from 'react-native-toast-message';
import client from '../apolloClient';
import { ApolloProvider, useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox, Platform } from 'react-native';
import { useEffect, useRef, useCallback } from 'react';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black
} from '@expo-google-fonts/outfit';

import './globals.css';

/* -------------------- IGNORE WARNINGS -------------------- */

LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'Unable to activate keep awake',
]);

/* -------------------- NOTIFICATION HANDLER -------------------- */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/* -------------------- GRAPHQL -------------------- */

const SAVE_PUSH_TOKEN = gql`
  mutation savePushRestsurents($userId: String!, $token: String!) {
    savePushRestsurents(userId: $userId, token: $token)
  }
`;

/* -------------------- REGISTER PUSH TOKEN -------------------- */

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('❌ Must use physical device');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } =
      await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Notification permission denied');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.log('❌ Expo projectId missing');
    return null;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;

  console.log('📱 Expo Push Token:', token);
  return token;
}

/* -------------------- ROOT NAV -------------------- */

function RootLayoutNav() {
  const segments = useSegments();

  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  const lastSyncedUserId = useRef(null);
  const lastSyncedToken = useRef(null);

  const [savePushToken] = useMutation(SAVE_PUSH_TOKEN);

  /* -------------------- SYNC TOKEN (SAFE) -------------------- */

  const syncPushToken = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        console.log('⏳ userId not available yet, waiting...');
        return;
      }

      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      // Prevent duplicate saves
      if (
        lastSyncedUserId.current === userId &&
        lastSyncedToken.current === token
      ) {
        console.log('ℹ️ Push token already synced');
        return;
      }

      console.log('🔄 Saving push token for user:', userId);

      await savePushToken({
        variables: { userId, token },
      });

      lastSyncedUserId.current = userId;
      lastSyncedToken.current = token;

      console.log('✅ Push token saved successfully');
    } catch (err) {
      console.error('❌ Push token sync failed:', err);
    }
  }, [savePushToken]);

  /* -------------------- RUN AFTER LOGIN ROUTE -------------------- */

  useEffect(() => {
    // Runs when user navigates to authenticated routes
    syncPushToken();
  }, [segments, syncPushToken]);

  /* -------------------- LISTENERS -------------------- */

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('🔔 Notification received:', notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👉 Notification tapped:', response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Toast />
    </>
  );
}

/* -------------------- ROOT PROVIDER -------------------- */

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  if (!fontsLoaded) return null;

  return (
    <ApolloProvider client={client}>
      <RootLayoutNav />
    </ApolloProvider>
  );
}
