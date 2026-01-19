import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMutation, useQuery, gql } from '@apollo/client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'

const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!, $name: String!) {
    signUp(email: $email, password: $password, name: $name) {
      token
      userId
    }
  }
`

const GET_RESTAURENTS = gql`
  query {
    getRestaurents {
      displayName
      login
      name
    }
  }
`

export default function SignUp() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // fetch allowed emails
  const { data, loading: loadingRestaurants, error: restaurantsError } = useQuery(GET_RESTAURENTS)

  const [signUp, { loading, error }] = useMutation(SIGN_UP, {
    onCompleted: async (data) => {
      await AsyncStorage.setItem('token', data.signUp.token)
      router.replace('/sign-in')
    },
  })

  const handleSignUp = () => {
    if (!selectedRestaurant) {
      Alert.alert('Select Email', 'Please choose an email from the list.')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.')
      return
    }
    signUp({
      variables: {
        email: selectedRestaurant.login,
        name: selectedRestaurant.name,
        password,
      },
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-yellow-400">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 py-4 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Sign Up</Text>
        <View className="w-6" />
      </View>

      {/* Main Card */}
      <View className="flex-1 bg-gray-100 rounded-t-3xl mt-8 px-6 py-8">
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Create Account</Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Enter your details to create a new account.
          </Text>
        </View>

        {/* Email Dropdown */}
        <View className="mb-6">
          <Text className="text-gray-800 font-medium mb-2">Select Email</Text>
          <View className="bg-yellow-200 rounded-lg">
            {loadingRestaurants ? (
              <Text className="px-4 py-4 text-gray-600">Loading emails...</Text>
            ) : restaurantsError ? (
              <Text className="px-4 py-4 text-red-500">{restaurantsError.message}</Text>
            ) : (
              <Picker
                selectedValue={selectedRestaurant?.login || ''}
                onValueChange={(value) => {
                  const rest = data?.getRestaurents.find((r) => r.login === value)
                  setSelectedRestaurant(rest || null)
                }}
                style={{ color: '#374151' }}
              >
                <Picker.Item label="-- Choose an email --" value="" />
                {data?.getRestaurents?.map((rest) => (
                  <Picker.Item
                    key={rest.login}
                    label={`${rest.displayName} (${rest.login})`}
                    value={rest.login}
                  />
                ))}
              </Picker>
            )}
          </View>
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

        {/* Confirm Password */}
        <View className="mb-12">
          <Text className="text-gray-800 font-medium mb-2">Confirm Password</Text>
          <View className="bg-yellow-200 rounded-lg px-4 py-4 flex flex-row items-center justify-between">
            <TextInput
              secureTextEntry={!showConfirmPassword}
              placeholder="********"
              placeholderTextColor="#6B7280"
              className="flex-1 text-gray-800 tracking-widest"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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

        {/* Sign Up Button */}
        <TouchableOpacity
          className="w-full bg-orange-500 py-4 rounded-full shadow-lg"
          disabled={loading}
          onPress={handleSignUp}
        >
          <Text className="text-white font-bold text-lg text-center">
            {loading ? "Signing Up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* Show Error */}
        {error && (
          <Text className="text-red-500 text-sm mt-4 text-center">{error.message}</Text>
        )}
      </View>
    </SafeAreaView>
  )
}
