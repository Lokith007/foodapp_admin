import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryIcon from './CategoryIcon';

export default function Header({ searchQuery, setSearchQuery, categories }) {
  return (
    <View className="bg-[#F5CB58] rounded-b-3xl px-4 pt-10 pb-6 shadow-md">

      {/* Brand Header */}
      <View className="flex-row items-baseline mb-4 px-1">
        <Text className="text-4xl font-extrabold tracking-wider">
          <Text className="text-orange-500">Grab</Text>
          <Text className="text-orange-500 italic">IT </Text>
        </Text>
        <Text className="text-2xl font-extrabold tracking-wider">
          <Text className="text-white">Admin</Text>
        </Text>
      </View>

      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1 flex-row items-center bg-white rounded-full px-4 py-2 mr-3 shadow-md">
          <TextInput
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-gray-700"
          />
          <Ionicons name="search" size={18} color="#f97316" />
        </View>
       </View>

      {/* Categories */}
      <View className="bg-[#f66c3a] rounded-2xl px-4 py-5 shadow-md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {categories.map((cat, i) => (
            <CategoryIcon key={cat} category={cat} active={i === 0} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
