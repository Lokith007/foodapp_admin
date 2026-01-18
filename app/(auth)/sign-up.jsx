import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FIREBASE_AUTH, db } from "../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { usePushNotifications } from "../../usePushNotification";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { expoPushToken } = usePushNotifications();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      // Update profile with name
      await updateProfile(user, { displayName: name });

      // Save user details to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        expoPushToken: expoPushToken || "not_available",
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      router.replace("/(tabs)/Home");
    } catch (error) {
      console.error(error);
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FF3B30", "#FF6B6B"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="person-add-outline" size={80} color="white" />
            <Text style={styles.title}>CREATE ACCOUNT</Text>
            <Text style={styles.subtitle}>Join the SOS Shield Network</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="example@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Password</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#FF3B30"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="shield-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.tokenInfo}>
              <Ionicons
                name={expoPushToken ? "checkmark-circle" : "sync-outline"}
                size={16}
                color={expoPushToken ? "#10b981" : "#f59e0b"}
              />
              <Text style={[styles.tokenText, { color: expoPushToken ? "#10b981" : "#f59e0b" }]}>
                {expoPushToken ? "Push Token Ready" : "Retrieving Push Token..."}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FF3B30" />
              ) : (
                <Text style={styles.buttonText}>REGISTER</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    marginTop: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inputLabelContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
    fontSize: 16,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 4,
  },
  tokenText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "white",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
  buttonText: {
    color: "#FF3B30",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  linkText: {
    color: "#FF3B30",
    fontWeight: "bold",
    fontSize: 14,
  },
});
