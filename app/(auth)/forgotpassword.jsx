import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

export default function SetPassword() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <SafeAreaView className="flex-1 bg-yellow-400">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 py-4 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Set Password</Text>
        <View className="w-6" />
      </View>

      {/* Main Card */}
      <View className="flex-1 bg-gray-100 rounded-t-3xl mt-8 px-6 py-8">
        {/* Info Text */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Create New Password</Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Create a strong new password to secure your admin account.
          </Text>
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-gray-800 font-medium mb-2">Password</Text>
          <View className="bg-yellow-200 rounded-lg px-4 py-4 flex flex-row items-center justify-between">
            <TextInput
              secureTextEntry={!showPassword}
              placeholder="********"
              placeholderTextColor="#6B7280"
              className="flex-1 text-gray-800 tracking-widest"
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

        {/* Confirm Password */}
        <View className="mb-12">
          <Text className="text-gray-800 font-medium mb-2">Confirm Password</Text>
          <View className="bg-yellow-200 rounded-lg px-4 py-4 flex flex-row items-center justify-between">
            <TextInput
              secureTextEntry={!showConfirmPassword}
              placeholder="********"
              placeholderTextColor="#6B7280"
              className="flex-1 text-gray-800 tracking-widest"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#F97316"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          className="w-full bg-orange-500 py-4 rounded-full shadow-lg"
          onPress={() => router.push("/sign-in")}
        >
          <Text className="text-white font-bold text-lg text-center">
            Create New Password
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
