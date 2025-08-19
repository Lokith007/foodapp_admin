import React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryIcon from './CategoryIcon';

export default function Header({ searchQuery, setSearchQuery, categories }) {
  return (
    <View className="bg-[#F5CB58] rounded-b-3xl px-4 pt-10 pb-6 shadow-md">
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
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md">
          <Ionicons name="cart-outline" size={20} color="#f97316" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md ml-2">
          <Ionicons name="notifications-outline" size={20} color="#f97316" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md ml-2">
          <Ionicons name="person-outline" size={20} color="#f97316" />
        </TouchableOpacity>
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
