import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      userId
    }
  }
`;

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [signIn, { loading, error }] = useMutation(SIGN_IN, {
    onCompleted: async (data) => {
      await AsyncStorage.setItem('token', data.signIn.token);
      router.replace('/Menu');
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-yellow-400">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 py-4 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Log In</Text>
        <View className="w-6" />
      </View>

      {/* Main Card */}
      <View className="flex-1 bg-gray-100 rounded-t-3xl mt-8 px-6 py-8">
        {/* Welcome */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Welcome</Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Manage restaurants, track orders, and keep everything running smoothly in one place.
          </Text>
        </View>

        {/* Email */}
        <View className="mb-6">
          <Text className="text-gray-800 font-medium mb-2">Email or Mobile Number</Text>
          <TextInput
            className="bg-yellow-200 rounded-lg px-4 py-4 text-gray-800"
            placeholder="example@example.com"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View className="mb-4">
          <Text className="text-gray-800 font-medium mb-2">Password</Text>
          <View className="bg-yellow-200 rounded-lg px-4 py-4 flex flex-row items-center justify-between">
            <TextInput
              className="flex-1 text-gray-800 tracking-widest"
              placeholder="••••••••••••"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#F97316"
              />
            </TouchableOpacity>
          </View>
        </View>


        {/* Login Button */}
        <TouchableOpacity
          className="w-full bg-orange-500 py-4 rounded-full shadow-lg"
          disabled={loading}
          onPress={() => signIn({ variables: { email, password } })}
        >
          <Text className="text-white font-bold text-lg text-center">
            {loading ? "Logging in..." : "Log In"}
          </Text>
        </TouchableOpacity>

        {/* Show Error if any */}
        {error && (
          <Text className="text-red-500 text-sm mt-4 text-center">
            {error.message}
          </Text>
        )}

        {/* Don't have account? */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600 text-sm">Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/sign-up')}>
            <Text className="text-orange-500 text-sm font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
