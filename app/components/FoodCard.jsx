import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gql, useMutation } from '@apollo/client';
import { useQuery } from '@apollo/client';
// GraphQL mutation
const MODIFY_MENU = gql`
  mutation ModifyMenu(
    $restaurantId: String!
    $name: String!
    $price: Float!
    $updates: menuInput!
  ) {
    modifyMenu(
      restaurantId: $restaurantId
      name: $name
      price: $price
      updates: $updates
    )
  }
`;
const ME = gql`
  query {
    me {
      id
      email
      name
    }
  }
`;
export default function FoodCard({ item }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });
  const { data: meData, loading: meLoading } = useQuery(ME);
  const restaurantId = meData?.me?.name || null;

  const [modifyMenu, { loading }] = useMutation(MODIFY_MENU, {
    onCompleted: () => {
      setModalVisible(false);
      console.log('Menu updated successfully');
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleSave = () => {
    modifyMenu({
      variables: {
        restaurantId: restaurantId, // static
        name: item.name, // identifier
        price: item.price, // identifier
        updates: {
          category: editedItem.category,
          description: editedItem.description,
          imageUrl: editedItem.imageUrl,
          isAvailable: editedItem.isAvailable,
          name: editedItem.name,
          price: parseFloat(editedItem.price),
          freq: item.freq, // keep old freq unchanged
        },
      },
    });
  };

  return (
    <>
      {/* Card */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-[#F5F5F5] rounded-2xl mx-4 mb-6 shadow-lg border border-[#e48b1d]"
      >
        <Image
          source={{ uri: item.imageUrl || 'https://picsum.photos/400/250' }}
          className="w-full h-48 rounded-t-2xl"
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
            <View className="flex-row items-center bg-[#E95322] px-2 py-1 rounded-full">
              <Ionicons name="star" size={12} color="#fff" />
              <Text className="text-white text-xs font-bold ml-1">
                {item.freq ? item.freq.toFixed(1) : '4.5'}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm mb-3">{item.description}</Text>
          <View className="flex-row justify-between items-center border-t border-gray-200 pt-3">
            <View />
            <Text className="text-[#E95322] text-lg font-bold">₹{item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal for Editing */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
  <View className="flex-1 bg-black/50 justify-center items-center px-4">
    <View className="bg-white rounded-3xl w-full p-6 shadow-2xl">
      {/* Header */}
      <Text className="text-2xl font-extrabold text-orange-500 mb-6 text-center">
        Edit Item
      </Text>

      {/* Form Section */}
      <View className="space-y-4">
        {/* Name */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-1">Name</Text>
          <TextInput
            value={editedItem.name}
            placeholder="Enter item name"
            onChangeText={(text) => setEditedItem((prev) => ({ ...prev, name: text }))}
            className="bg-orange-50 border border-orange-300 rounded-xl p-3 text-gray-800"
          />
        </View>

        {/* Price */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-1">Price</Text>
          <TextInput
            value={String(editedItem.price)}
            placeholder="Enter price"
            keyboardType="numeric"
            onChangeText={(text) => setEditedItem((prev) => ({ ...prev, price: text }))}
            className="bg-orange-50 border border-orange-300 rounded-xl p-3 text-gray-800"
          />
        </View>

        {/* Description */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-1">Description</Text>
          <TextInput
            value={editedItem.description}
            placeholder="Enter description"
            multiline
            numberOfLines={3}
            onChangeText={(text) => setEditedItem((prev) => ({ ...prev, description: text }))}
            className="bg-orange-50 border border-orange-300 rounded-xl p-3 text-gray-800 h-20"
          />
        </View>

        {/* Category */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-1">Category</Text>
          <TextInput
            value={editedItem.category}
            placeholder="Enter category"
            onChangeText={(text) => setEditedItem((prev) => ({ ...prev, category: text }))}
            className="bg-orange-50 border border-orange-300 rounded-xl p-3 text-gray-800"
          />
        </View>

        {/* Image URL */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-1">Image URL</Text>
          <TextInput
            value={editedItem.imageUrl}
            placeholder="Enter image URL"
            onChangeText={(text) => setEditedItem((prev) => ({ ...prev, imageUrl: text }))}
            className="bg-orange-50 border border-orange-300 rounded-xl p-3 text-gray-800"
          />
        </View>

        {/* Availability */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-sm font-semibold text-gray-700">Available</Text>
          <Switch
            value={editedItem.isAvailable}
            onValueChange={(val) => setEditedItem((prev) => ({ ...prev, isAvailable: val }))}
            trackColor={{ false: "#fca5a5", true: "#fde047" }}
            thumbColor={editedItem.isAvailable ? "#f97316" : "#f87171"}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-6">
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          className="flex-1 bg-red-500 py-3 rounded-xl mr-2"
        >
          <Text className="text-center text-white font-bold text-base">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="flex-1 bg-orange-500 py-3 rounded-xl ml-2"
        >
          <Text className="text-center text-white font-bold text-base">
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </>
  );
}
