import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gql, useQuery, useMutation } from '@apollo/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';

import Header from '../components/Header';
import FoodCard from '../components/FoodCard.jsx';
import Loading from '../components/Loading.jsx';
import ErrorComponent from '../components/Error.jsx';

/* ---------------- QUERIES ---------------- */

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
      refetch();
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
      const filteredMenu = useMemo(() => {
            return menu.filter((item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }, [menu, searchQuery]);

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

       <ScrollView className="flex-1 pt-4">
            {/* EMPTY STATE */}
            {filteredMenu.length === 0 && (
              <View className="flex-1 items-center justify-center mt-20">
                <Ionicons name="fast-food-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg mt-4 font-semibold">
                  No items found
                </Text>
                <Text className="text-gray-400 text-sm mt-1 text-center px-6">
                  Add new items or adjust your search
                </Text>
              </View>
            )}

            {/* MENU LIST */}
            {filteredMenu.length > 0 &&
              filteredMenu.map((item, idx) => (
                <FoodCard key={idx} item={item} refetch={refetch} />
              ))}

            <View className="h-24" />
          </ScrollView>


        {/* Floating Button */}
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-orange-600 rounded-full p-4 shadow-lg"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="flex-1 bg-black/40">
            <View className="flex-1 justify-end">
              <View className="bg-white h-[90%] rounded-t-3xl overflow-hidden">

                {/* Header */}
                <View className="flex-row justify-between items-center p-5 border-b">
                  <Text className="text-2xl font-bold text-gray-900">
                    Add New Item
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={26} />
                  </TouchableOpacity>
                </View>

                <KeyboardAwareScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
                  <Image
                    source={{
                      uri:
                        newItem.imageUrl ||
                        'https://cdn-icons-png.freepik.com/512/13357/13357352.png',
                    }}
                    className="w-full h-52 rounded-2xl mb-6"
                  />

                  <Text className="text-gray-600 text-sm font-bold uppercase mb-4">
                    Essentials
                  </Text>

                  <Text className="text-gray-900 text-sm font-semibold mb-1 ml-1">
                    Item Name
                  </Text>
                  <View className="bg-gray-50 border rounded-xl px-4 py-2 mb-4">
                    <TextInput
                      value={newItem.name}
                      onChangeText={(t) =>
                        setNewItem((p) => ({ ...p, name: t }))
                      }
                      className="text-lg text-gray-900"
                    />
                  </View>

                  <View className="mb-4">
                    <View className="mb-4">
                      <Text className="text-gray-900 text-sm font-semibold mb-1 ml-1">
                        Price
                      </Text>
                      <View className="bg-gray-50 border rounded-xl px-4 py-2">
                        <TextInput
                          value={newItem.price}
                          keyboardType="numeric"
                          onChangeText={(t) =>
                            setNewItem((p) => ({ ...p, price: t }))
                          }
                          className="text-lg text-gray-900"
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-900 text-sm font-semibold mb-1 ml-1">
                        Category
                      </Text>
                      <View className="bg-gray-50 border rounded-xl px-4 py-2">
                        <TextInput
                          value={newItem.category}
                          onChangeText={(t) =>
                            setNewItem((p) => ({ ...p, category: t }))
                          }
                          className="text-lg text-gray-900"
                        />
                      </View>
                    </View>
                  </View>

                  <Text className="text-gray-600 text-sm font-bold uppercase mb-3">
                    Details
                  </Text>

                  <Text className="text-gray-900 text-sm font-semibold mb-1 ml-1">
                    Description
                  </Text>
                  <View className="bg-gray-50 border rounded-xl px-4 py-2 mb-4">
                    <TextInput
                      value={newItem.description}
                      multiline
                      textAlignVertical="top"
                      onChangeText={(t) =>
                        setNewItem((p) => ({ ...p, description: t }))
                      }
                      className="text-lg text-gray-900 h-16"
                    />
                  </View>

                  <Text className="text-gray-900 text-sm font-semibold mb-1 ml-1">
                    Image URL
                  </Text>
                  <View className="bg-gray-50 border rounded-xl px-4 py-2 mb-6">
                    <TextInput
                      value={newItem.imageUrl}
                      onChangeText={(t) =>
                        setNewItem((p) => ({ ...p, imageUrl: t }))
                      }
                      className="text-base text-gray-700"
                    />
                  </View>

                  <View className="bg-white border rounded-xl p-4 mb-28 flex-row justify-between">
                    <View>
                      <Text className="text-lg font-bold text-gray-900">
                        Item Availability
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Set availability for the new item
                      </Text>
                    </View>
                    <Switch
                      value={newItem.isAvailable}
                      onValueChange={(v) =>
                        setNewItem((p) => ({ ...p, isAvailable: v }))
                      }
                      thumbColor={newItem.isAvailable ? '#EA580C' : '#ccc'}
                    />
                  </View>
                </KeyboardAwareScrollView>

                <View className="absolute bottom-0 w-full p-5 bg-white border-t">
                  <TouchableOpacity
                    onPress={handleAdd}
                    disabled={adding}
                    className="bg-orange-600 py-4 rounded-xl flex-row justify-center"
                  >
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      {adding ? 'Adding...' : 'Add Item'}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
