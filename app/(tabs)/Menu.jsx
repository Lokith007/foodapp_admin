import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gql, useQuery, useMutation } from '@apollo/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo, useEffect } from 'react';

import Header from '../components/Header';
import FoodCard from '../components/FoodCard.jsx';
import Loading from '../components/Loading.jsx';
import ErrorComponent from '../components/Error.jsx';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DropDownPicker from "react-native-dropdown-picker";

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

const GET_FOOD_CATEGORIES = gql`
  query GetFoodCategories {
    getFoodCategories {
      foodCategories {
        id
        name
        image
      }
    }
  }
`;

export default function FoodDeliveryApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

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

  const { data: catData, loading: catLoading } = useQuery(GET_FOOD_CATEGORIES);
  const foodCategories = catData?.getFoodCategories?.foodCategories || [];
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState(null);

  const catItems = useMemo(() => {
    return foodCategories.map((cat) => ({
      label: cat.name,
      value: cat.name,
      icon: () => (
        <Image
          source={{ uri: cat.image }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            marginRight: 10,
          }}
        />
      ),
    }));
  }, [foodCategories]);

  useEffect(() => {
    // keep dropdown value synced with your form state
    setCatValue(newItem.category || null);
  }, [newItem.category]);


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
    return menu.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menu, searchQuery, activeCategory]);

  const categories = useMemo(
    () => [...new Set(menu.map((item) => item.category))],
    [menu]
  );

  if (loading || meLoading) return <Loading />;
  if (error) return <ErrorComponent />;

  return (
    <SafeAreaView className="flex-1 bg-[#F66C3A]" edges={['top']}>
      <View className="flex-1 bg-[#F5F5F5]">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          foodCategories={foodCategories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
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
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">

            {/* ✅ Safe Area + Rounded Top */}
            <SafeAreaView className="bg-white rounded-t-3xl overflow-hidden h-[92%]">
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
              >
                <View className="flex-1">

                  {/* Header */}
                  <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-white z-10">
                    <View>
                      <Text className="text-2xl font-bold text-gray-900">
                        Add New Item
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        Fill in the details below
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="bg-gray-100 p-2 rounded-full"
                    >
                      <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                  </View>

                  {/* ✅ Scroll that adjusts when keyboard opens */}
                  <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}
                    extraScrollHeight={140}
                    contentContainerStyle={{ paddingBottom: 190 }}
                    className="flex-1"
                  >
                    <View className="p-6">

                      {/* Image Section */}
                      <View className="items-center mb-8">
                        <Image
                          source={{
                            uri:
                              newItem.imageUrl ||
                              "https://cdn-icons-png.freepik.com/512/13357/13357352.png",
                          }}
                          className="w-full h-56 rounded-3xl mb-4 bg-gray-50"
                          resizeMode="cover"
                        />
                        <Text className="text-xs text-gray-400">
                          {newItem.imageUrl ? "Preview Image" : "Default Image"}
                        </Text>
                      </View>

                      {/* Form Fields */}
                      <View className="space-y-6">

                        {/* Basic Info */}
                        <View>
                          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            Basic Info
                          </Text>

                          <View className="space-y-4">
                            {/* Item Name */}
                            <View>
                              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                                Item Name
                              </Text>
                              <TextInput
                                value={newItem.name}
                                onChangeText={(t) =>
                                  setNewItem((p) => ({ ...p, name: t }))
                                }
                                placeholder="e.g. Chicken Burger"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>

                            {/* Price + Category */}
                            <View className="flex-row space-x-4">
                              {/* Price */}
                              <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                                  Price
                                </Text>

                                <View className="relative">
                                  <Text className="absolute left-4 top-3.5 text-gray-400 text-base">
                                    ₹
                                  </Text>

                                  <TextInput
                                    value={newItem.price}
                                    keyboardType="numeric"
                                    onChangeText={(t) =>
                                      setNewItem((p) => ({ ...p, price: t }))
                                    }
                                    placeholder="0.00"
                                    className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3.5 text-base text-gray-900 mr-2"
                                    placeholderTextColor="#9CA3AF"
                                  />
                                </View>
                              </View>

                              {/* Category */}
                              <View className="flex-1" style={{ zIndex: 999 }}>
                                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                                  Category
                                </Text>

                                <DropDownPicker
                                  open={catOpen}
                                  value={catValue}
                                  items={catItems}
                                  setOpen={setCatOpen}
                                  setValue={(callback) => {
                                    const selectedValue = callback(catValue);
                                    setCatValue(selectedValue);
                                    setNewItem((p) => ({ ...p, category: selectedValue }));
                                  }}
                                  placeholder="Select category"
                                  listMode="SCROLLVIEW"
                                  style={{
                                    backgroundColor: "#F9FAFB",
                                    borderColor: "#E5E7EB",
                                    borderRadius: 14,
                                    minHeight: 50,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                  }}
                                  dropDownContainerStyle={{
                                    borderColor: "#E5E7EB",
                                    borderRadius: 14,
                                    backgroundColor: "white",
                                  }}
                                  textStyle={{
                                    fontSize: 15,
                                    color: "#111827",
                                    fontWeight: "600",
                                  }}
                                  placeholderStyle={{
                                    color: "#9CA3AF",
                                    fontWeight: "500",
                                  }}
                                  showArrowIcon={true}
                                  ArrowUpIconComponent={() => (
                                    <Ionicons name="chevron-up" size={18} color="#6B7280" />
                                  )}
                                  ArrowDownIconComponent={() => (
                                    <Ionicons name="chevron-down" size={18} color="#6B7280" />
                                  )}
                                  TickIconComponent={() => (
                                    <Ionicons name="checkmark" size={18} color="#EA580C" />
                                  )}
                                />
                              </View>


                            </View>
                          </View>
                        </View>

                        {/* Details */}
                        <View>
                          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 mt-2">
                            Details
                          </Text>

                          <View className="space-y-4">
                            {/* Description */}
                            <View>
                              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                                Description
                              </Text>

                              <TextInput
                                value={newItem.description}
                                multiline
                                textAlignVertical="top"
                                onChangeText={(t) =>
                                  setNewItem((p) => ({ ...p, description: t }))
                                }
                                placeholder="Describe the mood and taste..."
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 h-28 pt-3"
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>

                            {/* Image URL */}
                            <View>
                              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                                Image URL
                              </Text>

                              <TextInput
                                value={newItem.imageUrl}
                                onChangeText={(t) =>
                                  setNewItem((p) => ({ ...p, imageUrl: t }))
                                }
                                placeholder="https://..."
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                          </View>
                        </View>

                        {/* Availability */}
                        <View className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex-row justify-between items-center mb-4">
                          <View className="flex-1 mr-4">
                            <Text className="text-lg font-bold text-orange-900">
                              Available Now
                            </Text>
                            <Text className="text-sm text-orange-700/80 mt-1">
                              Show this item on the menu immediately
                            </Text>
                          </View>

                          <Switch
                            value={newItem.isAvailable}
                            onValueChange={(v) =>
                              setNewItem((p) => ({ ...p, isAvailable: v }))
                            }
                            trackColor={{ false: "#D1D5DB", true: "#FED7AA" }}
                            thumbColor={newItem.isAvailable ? "#EA580C" : "#F3F4F6"}
                          />
                        </View>

                      </View>
                    </View>
                  </KeyboardAwareScrollView>

                  {/* ✅ Fixed Footer Button */}
                  <View className="absolute bottom-0 w-full p-5 bg-white border-t border-gray-100">
                    <TouchableOpacity
                      onPress={handleAdd}
                      disabled={adding}
                      className="bg-orange-600 py-4 rounded-xl flex-row justify-center items-center"
                    >
                      <Ionicons name="add-circle" size={24} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">
                        {adding ? "Adding..." : "Add Item"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}
