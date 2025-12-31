import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "expo-router";

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
    onCompleted: (data) => {
      if (data?.forgotPassword) {
        Alert.alert("Mail sent", "Check your email to reset password");
        router.replace("/sign-in");
      } else {
        Alert.alert("Email not registered");
      }
    },
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
  });

  const handleSubmit = () => {
    if (!email.trim()) {
      Alert.alert("Please enter your email");
      return;
    }

    forgotPassword({ variables: { email } });
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20, textAlign: "center" }}>
        Forgot Password
      </Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 10,
          marginBottom: 12,
        }}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#fbbf24" : "#FB923C",
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
