import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/authContext";

export default function Index() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace("/(tabs)/Home");
            } else {
                router.replace("/(auth)/sign-in");
            }
        }
    }, [user, loading]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#ef4444" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
