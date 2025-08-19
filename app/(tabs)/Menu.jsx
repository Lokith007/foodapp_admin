import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gql, useQuery, useMutation } from '@apollo/client';

import Header from '../components/Header';
import FoodCard from '../components/FoodCard.jsx';
import Loading from '../components/Loading.jsx';
import ErrorComponent from '../components/Error.jsx';

// ✅ Queries stay inside this file
const GET_MENU = gql`
  query GetMenu($name: String!) {
    getMenuByRestaurantName(name: $name) {
      admin
      isOpen
      logo
      menu {
        category
        description
        freq
        imageUrl
        isAvailable
        name
        price
      }
      name
    }
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

// ✅ Mutation to add menu item
const ADD_TO_MENU = gql`
  mutation AddToMenu(
    $restaurantId: String!
    $category: String!
    $description: String!
    $imageUrl: String!
    $isAvailable: Boolean!
    $name: String!
    $price: Float!
  ) {
    addToMenu(
      restaurantId: $restaurantId
      category: $category
      description: $description
      freq: 0
      imageUrl: $imageUrl
      isAvailable: $isAvailable
      name: $name
      price: $price
    )
  }
`;

export default function FoodDeliveryApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // form state
  const [newItem, setNewItem] = useState({
    category: '',
    description: '',
    imageUrl: '',
    isAvailable: true,
    name: '',
    price: '',
  });

  const { data: meData, loading: meLoading } = useQuery(ME);
  const userId = meData?.me?.name || null;

  const { data, loading, error, refetch } = useQuery(GET_MENU, {
    variables: { name: userId },
    skip: !userId,
  });

  const [addToMenu, { loading: adding }] = useMutation(ADD_TO_MENU, {
    onCompleted: () => {
      setModalVisible(false);
      setNewItem({
        category: '',
        description: '',
        imageUrl: '',
        isAvailable: true,
        name: '',
        price: '',
      });
      refetch(); // refresh menu
    },
  });

  const handleAdd = () => {
    if (!userId) return;

    addToMenu({
      variables: {
        restaurantId: userId,
        category: newItem.category,
        description: newItem.description,
        imageUrl: newItem.imageUrl,
        isAvailable: newItem.isAvailable,
        name: newItem.name,
        price: parseFloat(newItem.price),
      },
    });
  };

  const menu = data?.getMenuByRestaurantName?.menu || [];
  const categories = useMemo(
    () => [...new Set(menu.map((item) => item.category))],
    [menu]
  );

  if (loading || meLoading) return <Loading />;
  if (error) return <ErrorComponent />;

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
      />

      <ScrollView className="flex-1 pt-4 ">
        <View className="flex-row items-center justify-between px-4 mb-4">
          <Text className="text-gray-700 font-medium">
            Sort By:{' '}
            <Text className="text-orange-600 font-semibold">Popular</Text>
          </Text>
          <TouchableOpacity className="bg-orange-500 rounded-full p-2 shadow-md">
            <Ionicons name="filter" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {menu
          .filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item, idx) => (
            <FoodCard key={idx} item={item} />
          ))}
      </ScrollView>

      {/* Floating Plus Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-orange-600 rounded-full p-4 shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal for Adding Menu Item */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-11/12 p-6 rounded-xl shadow-lg">
            <Text className="text-lg font-bold mb-4 text-center">
              Add New Item
            </Text>

            <TextInput
              placeholder="Name"
              className="border p-2 mb-3 rounded"
              value={newItem.name}
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            />
            <TextInput
              placeholder="Category"
              className="border p-2 mb-3 rounded"
              value={newItem.category}
              onChangeText={(text) =>
                setNewItem({ ...newItem, category: text })
              }
            />
            <TextInput
              placeholder="Description"
              className="border p-2 mb-3 rounded"
              value={newItem.description}
              onChangeText={(text) =>
                setNewItem({ ...newItem, description: text })
              }
            />
            <TextInput
              placeholder="Image URL"
              className="border p-2 mb-3 rounded"
              value={newItem.imageUrl}
              onChangeText={(text) =>
                setNewItem({ ...newItem, imageUrl: text })
              }
            />
            <TextInput
              placeholder="Price"
              keyboardType="numeric"
              className="border p-2 mb-3 rounded"
              value={newItem.price}
              onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            />

            <View className="flex-row items-center mb-4">
              <Text className="mr-2">Available:</Text>
              <Switch
                value={newItem.isAvailable}
                onValueChange={(val) =>
                  setNewItem({ ...newItem, isAvailable: val })
                }
              />
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-400 px-4 py-2 rounded"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-orange-600 px-4 py-2 rounded"
                onPress={handleAdd}
                disabled={adding}
              >
                <Text className="text-white">
                  {adding ? 'Adding...' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
