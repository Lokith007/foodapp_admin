import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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

        {/* Forget Password */}
        <View className="mb-12 items-end">
          <TouchableOpacity onPress={() => router.push("forgotpassword")}>
            <Text className="text-orange-500 text-sm">Forget Password</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
      className="w-full bg-orange-500 py-4 rounded-full shadow-lg"
      onPress={() => router.replace("/(tabs)/Menu")}
    >
      <Text className="text-white font-bold text-lg text-center">Log In</Text>
    </TouchableOpacity>

        {/* Don't have account? */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600 text-sm">Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("sign-up")}>
            <Text className="text-orange-500 text-sm font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
