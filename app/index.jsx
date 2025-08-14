import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FB923C', '#F97316', '#EF4444']}
      className="flex-1 justify-center items-center px-6"
    >
      {/* Logo */}
      <Image
        source={require('../assets/logo.png')}
        className="w-38 h-36 mb-8"
        resizeMode="contain"
      />

      {/* Stylish Brand Name */}
      <Text className="text-6xl font-extrabold mb-6 tracking-wider">
        <Text className="text-yellow-300 italic">Grab</Text>
        <Text className="text-white font-light">It</Text>
      </Text>

      {/* Description */}
<Text style={{ fontFamily: 'serif', color: 'white', textAlign: 'center', fontSize: 16, opacity: 0.9, marginBottom: 40 }}>
      The smartest way to order food
    </Text>



      {/* Login Button */}
      <Pressable
        onPress={() => router.push('/(auth)/login')}
        className="w-full bg-yellow-300 py-4 rounded-full shadow-lg"
      >
        <Text className="text-red-500 font-bold text-lg text-center">
          Log In
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
