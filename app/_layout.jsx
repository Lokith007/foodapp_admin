import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../lib/authContext";
import "./globals.css";

export default function RootLayout() {
    return (
        <AuthProvider>
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" />
                            <Stack.Screen name="(auth)" />
                            <Stack.Screen name="(tabs)" />
                        </Stack>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </SafeAreaProvider>
        </AuthProvider>
    );
}

