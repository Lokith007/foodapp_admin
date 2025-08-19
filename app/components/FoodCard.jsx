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
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-6 rounded-2xl w-11/12">
            <Text className="text-lg font-bold mb-4">Edit Item</Text>

            {/* Name */}
            <TextInput
              value={editedItem.name}
              placeholder="Name"
              onChangeText={(text) =>
                setEditedItem((prev) => ({ ...prev, name: text }))
              }
              className="border border-gray-300 rounded-lg p-2 mb-3"
            />

            {/* Price */}
            <TextInput
              value={String(editedItem.price)}
              placeholder="Price"
              keyboardType="numeric"
              onChangeText={(text) =>
                setEditedItem((prev) => ({ ...prev, price: text }))
              }
              className="border border-gray-300 rounded-lg p-2 mb-3"
            />

            {/* Description */}
            <TextInput
              value={editedItem.description}
              placeholder="Description"
              onChangeText={(text) =>
                setEditedItem((prev) => ({ ...prev, description: text }))
              }
              className="border border-gray-300 rounded-lg p-2 mb-3"
            />

            {/* Category */}
            <TextInput
              value={editedItem.category}
              placeholder="Category"
              onChangeText={(text) =>
                setEditedItem((prev) => ({ ...prev, category: text }))
              }
              className="border border-gray-300 rounded-lg p-2 mb-3"
            />

            {/* Image URL */}
            <TextInput
              value={editedItem.imageUrl}
              placeholder="Image URL"
              onChangeText={(text) =>
                setEditedItem((prev) => ({ ...prev, imageUrl: text }))
              }
              className="border border-gray-300 rounded-lg p-2 mb-3"
            />

            {/* Availability */}
            <View className="flex-row items-center mb-3">
              <Text className="mr-3">Available</Text>
              <Switch
                value={editedItem.isAvailable}
                onValueChange={(val) =>
                  setEditedItem((prev) => ({ ...prev, isAvailable: val }))
                }
              />
            </View>

            {/* Buttons */}
            <View className="flex-row justify-between mt-4">
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
              <Button title={loading ? 'Saving...' : 'Save'} onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
