import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBoFjeN4i7jm2T5QM0qDMGZapKXytVVROw",
  authDomain: "saferide-6b128.firebaseapp.com",
  projectId: "saferide-6b128",
  storageBucket: "saferide-6b128.firebasestorage.app",
  messagingSenderId: "402528714473",
  appId: "1:402528714473:web:7470f1ecdad51c7d197a78",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const FIREBASE_AUTH = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
