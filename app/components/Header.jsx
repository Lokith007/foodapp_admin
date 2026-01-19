import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header({
  searchQuery,
  setSearchQuery,
  foodCategories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <View className="bg-[#F66C3A] rounded-b-[26px] px-4 pt-3 pb-4 shadow-lg">
      {/* Top Row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/logo_only.png")}
            className="w-10 h-10 mr-2"
            resizeMode="contain"
          />

          <View>
            <View className="flex-row items-end">
              <Text className="text-[28px] font-outfit-extrabold text-white leading-none">
                Grab
              </Text>
              <Text className="text-[28px] font-outfit-extrabold text-yellow-300 italic leading-none">
                IT
              </Text>

              <View className="ml-2 bg-white/20 px-2 py-0.5 rounded-full">
                <Text className="text-[12px] text-white font-outfit-bold tracking-wide">
                  ADMIN
                </Text>
              </View>
            </View>

            <Text className="text-[12px] text-orange-100 font-outfit-medium mt-1">
              Skip the line • Grab & Go
            </Text>
          </View>
        </View>

        {/* Right bubble */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-9 h-9 rounded-full bg-white/25 items-center justify-center"
        >
          <Ionicons name="fast-food-outline" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-2xl px-3 py-2 shadow-sm border border-orange-100">
        <Ionicons name="search" size={18} color="#f97316" />
        <TextInput
          placeholder="Search menu..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-gray-800 ml-2 text-[14px]"
        />

        {searchQuery?.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between mb-2">
    <Text className="text-white text-[14px] font-outfit-bold tracking-wide">
      Categories
    </Text>

    <View className="bg-white/20 px-3 py-1 rounded-full">
      <Text className="text-[12px] text-white font-outfit-semibold">
        {activeCategory}
      </Text>
    </View>
  </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 12 }}
        >
          {/* All */}
    {/* All */}
    <TouchableOpacity
      key="All"
      activeOpacity={0.85}
      onPress={() => setActiveCategory("All")}
      className="mr-3"
    >
      <View
        className={`flex-row items-center px-5 py-2.5 rounded-full border ${
          activeCategory === "All"
            ? "bg-white border-white shadow-md"
            : "bg-white/10 border-white/25"
        }`}
      >
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${
            activeCategory === "All" ? "bg-[#F66C3A]/10" : "bg-white/15"
          }`}
        >
          <Ionicons
            name="apps-outline"
            size={16}
            color={activeCategory === "All" ? "#F66C3A" : "white"}
          />
        </View>

        <Text
          className={`ml-2 text-[13px] font-outfit-bold ${
            activeCategory === "All" ? "text-[#F66C3A]" : "text-white"
          }`}
        >
          All
        </Text>

        {/* Active Indicator */}
        {activeCategory === "All" && (
          <View className="ml-2 w-2 h-2 rounded-full bg-[#F66C3A]" />
        )}
      </View>
    </TouchableOpacity>


          {/* API Categories */}
          {foodCategories.map((category) => {
            const isActive = activeCategory === category.name;

            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.85}
                onPress={() => setActiveCategory(category.name)}
                className="mr-3"
              >
                <View
                  className={`flex-row items-center px-4 py-2 rounded-full border ${
                    isActive
                      ? "bg-white border-white"
                      : "bg-white/15 border-white/30"
                  }`}
                >
                  <Image
                    source={{ uri: category.image }}
                    className="w-8 h-8 rounded-lg"
                    resizeMode="cover"
                  />
                  <Text
                    numberOfLines={1}
                    className={`ml-2 text-[13px] font-outfit-bold max-w-[110px] ${
                      isActive ? "text-[#F66C3A]" : "text-white"
                    }`}
                  >
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
      </View>
    </View>
  );
}
