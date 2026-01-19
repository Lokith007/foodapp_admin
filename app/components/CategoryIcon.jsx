import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export default function CategoryIcon({ category, active }) {
  return (
    <TouchableOpacity className="flex flex-col items-center mx-3">
      <View
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
          active ? 'bg-white' : 'bg-[#F3E9B5]'
        }`}
      >
        <Text className="text-2xl text-[#E95322]">🍽️</Text>
      </View>
      <Text
        className={`text-sm font-medium ${active ? 'text-black' : 'text-white'}`}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
}
