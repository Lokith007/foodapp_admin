import React from 'react';
import { View, Text } from 'react-native';

export default function ErrorComponent({ message }) {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-red-500">{message || 'Error loading menu'}</Text>
    </View>
  );
}
