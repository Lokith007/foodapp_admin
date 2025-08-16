import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const categories = [
  { id: 1, name: "Snacks", icon: "🍿" },
  { id: 2, name: "Meal", icon: "🍽️" },
  { id: 3, name: "Dessert", icon: "🧁" },
  { id: 4, name: "Drinks", icon: "🥤" },
];

const foodItems = [
  {
    id: 1,
    name: "Mexican Appetizer",
    description: "Tortilla Chips With Toppins",
    rating: 5.0,
    price: "₹15.00",
    image: "https://picsum.photos/400/250?food=1",
  },
  {
    id: 2,
    name: "Pork Skewer",
    description:
      "Marinated in a rich blend of herbs and spices, then grilled to perfection, served with a side of zesty dipping sauce.",
    rating: 4.0,
    price: "₹12.99",
    image: "https://picsum.photos/400/250?food=2",
  },
];

const CategoryIcon = ({ category, active }) => (
  <TouchableOpacity className="flex flex-col items-center mx-3">
    <View
      className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
        active ? "bg-white" : "bg-[#F3E9B5]"
      }`}
    >
      <Text
        className={`text-2xl ${active ? "text-[#E95322]" : "text-[#E95322]"}`}
      >
        {category.icon}
      </Text>
    </View>
    <Text
      className={`text-sm font-medium ${
        active ? "text-black" : "text-white"
      }`}
    >
      {category.name}
    </Text>
  </TouchableOpacity>
);


const FoodCard = ({ item }) => (
  <View className="bg-[#F5F5F5] rounded-2xl mx-4 mb-6 shadow-lg border border-[#e48b1d]">
    <Image
      source={{ uri: item.image }}
      className="w-full h-48 rounded-t-2xl"
      resizeMode="cover"
    />
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
        <View className="flex-row items-center bg-[#E95322] px-2 py-1 rounded-full">
          <Ionicons name="star" size={12} color="#fff" />
          <Text className="text-white text-xs font-bold ml-1">
            {item.rating.toFixed(1)}
          </Text>
        </View>
      </View>
      <Text className="text-gray-600 text-sm mb-3">{item.description}</Text>
      <View className="flex-row justify-between items-center border-t border-gray-200 pt-3">
        <View />
        <Text className="text-[#E95322] text-lg font-bold">{item.price}</Text>
      </View>
    </View>
  </View>
);



export default function FoodDeliveryApp() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View className="flex-1 bg-[#F5F5F5">
      {/* Header */}
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
            {categories.map((category, i) => (
              <CategoryIcon key={category.id} category={category} active={i === 0} />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Body */}
      <ScrollView className="flex-1 pt-4">
        <View className="flex-row items-center justify-between px-4 mb-4">
          <Text className="text-gray-700 font-medium">
            Sort By: <Text className="text-orange-600 font-semibold">Popular</Text>
          </Text>
          <TouchableOpacity className="bg-orange-500 rounded-full p-2 shadow-md">
            <Ionicons name="filter" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {foodItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
