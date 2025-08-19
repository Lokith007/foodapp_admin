import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Loading() {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#f97316" />
      <Text className="mt-2 text-gray-600">Loading menu...</Text>
    </View>
  );
}
