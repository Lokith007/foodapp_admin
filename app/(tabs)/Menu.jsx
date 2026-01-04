import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gql, useQuery, useMutation } from '@apollo/client';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView className="flex-1 bg-[#F5CB58]" edges={['top']}>

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
              <FoodCard key={idx} item={item} refetch={refetch} />
            ))}

          {/* Add padding at bottom so FAB doesn't cover last item */}
          <View className="h-24" />
        </ScrollView>

        {/* Floating Plus Button */}
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-orange-600 rounded-full p-4 shadow-lg active:bg-orange-700"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Modal for Adding Menu Item - Consistent Design with FoodCard */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="flex-1 bg-black/40 justify-center items-center">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="w-full h-full flex-1 justify-end"
            >
              <View className="bg-white h-[90%] w-full rounded-t-3xl overflow-hidden flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                  <Text className="text-xl font-bold text-gray-800">
                    Add New Item
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
                          newItem.imageUrl ||
                          'https://cdn-icons-png.freepik.com/512/13357/13357352.png',
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
                        value={newItem.name}
                        placeholder="Item Name"
                        onChangeText={(text) =>
                          setNewItem((prev) => ({ ...prev, name: text }))
                        }
                        className="text-gray-800 font-medium text-base"
                      />
                    </View>

                    <View className="flex-row space-x-3">
                      <View className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <TextInput
                          value={newItem.price}
                          placeholder="Price"
                          keyboardType="numeric"
                          onChangeText={(text) =>
                            setNewItem((prev) => ({ ...prev, price: text }))
                          }
                          className="text-gray-800 font-medium text-base"
                        />
                      </View>
                      <View className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <TextInput
                          value={newItem.category}
                          placeholder="Category"
                          onChangeText={(text) =>
                            setNewItem((prev) => ({ ...prev, category: text }))
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
                      value={newItem.description}
                      placeholder="Item Description"
                      multiline
                      onChangeText={(text) =>
                        setNewItem((prev) => ({ ...prev, description: text }))
                      }
                      className="text-gray-800 text-base h-20"
                      textAlignVertical="top"
                    />
                  </View>

                  <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-6">
                    <TextInput
                      value={newItem.imageUrl}
                      placeholder="Image URL"
                      onChangeText={(text) =>
                        setNewItem((prev) => ({ ...prev, imageUrl: text }))
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
                        Set availability for the new item
                      </Text>
                    </View>
                    <Switch
                      trackColor={{ false: '#e0e0e0', true: '#FFEDD5' }}
                      thumbColor={newItem.isAvailable ? '#EA580C' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={(val) =>
                        setNewItem((prev) => ({ ...prev, isAvailable: val }))
                      }
                      value={newItem.isAvailable}
                    />
                  </View>
                </ScrollView>

                {/* Footer Button */}
                <View className="p-5 border-t border-gray-100 bg-white absolute bottom-0 w-full pb-10">
                  <TouchableOpacity
                    onPress={handleAdd}
                    disabled={adding}
                    className="bg-orange-600 w-full py-4 rounded-xl flex-row justify-center items-center shadow-md shadow-orange-200"
                  >
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      {adding ? 'Adding...' : 'Add Item'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
