import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gql, useMutation, useQuery } from '@apollo/client';

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

const DELETE_FROM_MENU = gql`
  mutation DeleteFromMenu(
    $restaurantId: String!
    $name: String!
    $price: Float!
  ) {
    deleteFromMenu(
      restaurantId: $restaurantId
      name: $name
      price: $price
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
export default function FoodCard({ item, refetch }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });
  const { data: meData, loading: meLoading } = useQuery(ME);
  const restaurantId = meData?.me?.name || null;

  const [modifyMenu, { loading }] = useMutation(MODIFY_MENU, {
    onCompleted: () => {
      setModalVisible(false);
      console.log('Menu updated successfully');
      if (refetch) refetch();
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const [deleteFromMenu, { loading: deleting }] = useMutation(DELETE_FROM_MENU, {
    onCompleted: () => {
      setModalVisible(false);
      console.log('Menu item deleted successfully');
      if (refetch) refetch();
    },
    onError: (err) => {
      console.error('Delete failed:', err);
      Alert.alert('Error', 'Failed to delete item');
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

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (!restaurantId) return;
            deleteFromMenu({
              variables: {
                restaurantId: restaurantId,
                name: item.name,
                price: item.price,
              },
            });
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Card */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-white rounded-2xl mx-4 mb-4 shadow-sm border border-gray-100 overflow-hidden"
      >
        <Image
          source={{ uri: item.imageUrl || 'https://picsum.photos/400/250' }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className={`absolute top-3 right-3 px-3 py-1 rounded-full shadow-sm z-10 ${item.isAvailable ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
          <Text className={`text-xs font-bold ${item.isAvailable ? 'text-green-700' : 'text-red-600'}`}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </View>
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-xl font-bold text-gray-900 flex-1 mr-2">
              {item.name}
            </Text>
            <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-lg">
              <Text className="text-green-700 text-xs font-bold">
                {item.freq ? item.freq.toFixed(1) : '4.5'} ★
              </Text>
            </View>
          </View>
          <Text
            className="text-gray-500 text-sm mb-4 leading-5"
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
            <Text className="text-gray-400 font-medium text-xs uppercase tracking-wider">
              {item.category}
            </Text>
            <Text className="text-orange-600 text-lg font-bold">
              ₹{item.price}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal for Editing */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/40 justify-center items-center">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full h-full flex-1 justify-end"
          >
            <View className="bg-white h-[90%] w-full rounded-t-3xl overflow-hidden flex-1">
              {/* Header */}
              <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-800">
                  Edit Item
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1 px-5 pt-2"
                showsVerticalScrollIndicator={false}
              >
                {/* Image Section */}
                <View className="items-center my-4">
                  <Image
                    source={{
                      uri:
                        editedItem.imageUrl || 'https://picsum.photos/400/250',
                    }}
                    className="w-full h-48 rounded-2xl"
                    resizeMode="cover"
                  />
                  <Text className="text-gray-400 text-xs mt-2 text-center">
                    Preview Image
                  </Text>
                </View>

                {/* Essentials Section */}
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 mt-2">
                  Essentials
                </Text>
                <View className="space-y-3 mb-6">
                  <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <TextInput
                      value={editedItem.name}
                      placeholder="Item Name"
                      onChangeText={(text) =>
                        setEditedItem((prev) => ({ ...prev, name: text }))
                      }
                      className="text-gray-800 font-medium text-base"
                    />
                  </View>

                  <View className="flex-row space-x-3">
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <TextInput
                        value={String(editedItem.price)}
                        placeholder="Price"
                        keyboardType="numeric"
                        onChangeText={(text) =>
                          setEditedItem((prev) => ({ ...prev, price: text }))
                        }
                        className="text-gray-800 font-medium text-base"
                      />
                    </View>
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <TextInput
                        value={editedItem.category}
                        placeholder="Category"
                        onChangeText={(text) =>
                          setEditedItem((prev) => ({ ...prev, category: text }))
                        }
                        className="text-gray-800 font-medium text-base"
                      />
                    </View>
                  </View>
                </View>

                {/* Details Section */}
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
                  Details
                </Text>
                <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3">
                  <TextInput
                    value={editedItem.description}
                    placeholder="Item Description"
                    multiline
                    onChangeText={(text) =>
                      setEditedItem((prev) => ({ ...prev, description: text }))
                    }
                    className="text-gray-800 text-base h-20"
                    textAlignVertical="top"
                  />
                </View>

                <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-6">
                  <TextInput
                    value={editedItem.imageUrl}
                    placeholder="Image URL"
                    onChangeText={(text) =>
                      setEditedItem((prev) => ({ ...prev, imageUrl: text }))
                    }
                    className="text-gray-500 text-sm"
                  />
                </View>

                {/* Availability Section */}
                <View className="bg-white border border-gray-100 rounded-xl p-4 mb-24 shadow-sm flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="text-gray-800 font-bold text-base mb-1">
                      Item Availability
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      Item is currently visible on menu
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#e0e0e0', true: '#FFEDD5' }}
                    thumbColor={editedItem.isAvailable ? '#EA580C' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(val) =>
                      setEditedItem((prev) => ({ ...prev, isAvailable: val }))
                    }
                    value={editedItem.isAvailable}
                  />
                </View>
              </ScrollView>

              {/* Footer Button */}
              <View className="p-5 border-t border-gray-100 bg-white absolute bottom-0 w-full pb-10 flex-col gap-3">
                {/* Delete Button */}
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={deleting}
                  className="bg-red-50 w-full py-4 rounded-xl flex-row justify-center items-center border border-red-100"
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text className="text-red-500 font-bold text-lg ml-2">
                    {deleting ? 'Deleting...' : 'Delete Item'}
                  </Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-orange-600 w-full py-4 rounded-xl flex-row justify-center items-center shadow-md shadow-orange-200"
                >
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text className="text-white font-bold text-lg ml-2">
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
