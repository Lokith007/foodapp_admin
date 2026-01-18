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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from "react-native-dropdown-picker";

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


export default function FoodCard({ item, refetch }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });
  const { data: meData, loading: meLoading } = useQuery(ME);
  const restaurantId = meData?.me?.name || null;
  const { data: catData, loading: catLoading } = useQuery(GET_FOOD_CATEGORIES);
  const foodCategories = catData?.getFoodCategories?.foodCategories || [];

  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState(item.category || null);

  const catItems = React.useMemo(() => {
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

  // keep dropdown synced when editedItem.category changes
  React.useEffect(() => {
    setCatValue(editedItem.category || null);
  }, [editedItem.category]);

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
      <SafeAreaView>
        {/* Modal for Editing */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-black/40 justify-end">

            <SafeAreaView className="bg-white rounded-t-3xl overflow-hidden h-[90%]">
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
              >

                {/* Header */}
                <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                  <Text className="text-xl font-bold text-gray-800">Edit Item</Text>

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-gray-100 p-2 rounded-full"
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* ✅ Scroll that moves up when keyboard opens */}
                <KeyboardAwareScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  enableOnAndroid={true}
                  extraScrollHeight={120}
                  contentContainerStyle={{ paddingBottom: 180 }}
                  className="flex-1 px-5 pt-2"
                >
                  {/* Image Section */}
                  <View className="items-center my-4">
                    <Image
                      source={{
                        uri: editedItem.imageUrl || "https://picsum.photos/400/250",
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

                  <View className="space-y-4 mb-6">

                    {/* Item Name */}
                    <View>
                      <Text className="text-gray-600 text-sm font-semibold mb-2">
                        Item Name
                      </Text>
                      <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <TextInput
                          value={editedItem.name}
                          placeholder="Enter item name"
                          onChangeText={(text) =>
                            setEditedItem((prev) => ({ ...prev, name: text }))
                          }
                          className="text-gray-800 font-medium text-base"
                        />
                      </View>
                    </View>

                    {/* Price + Category */}
                    <View className="flex-row space-x-3" style={{ zIndex: 999 }}>

                      {/* Price */}
                      <View className="flex-1" style={{ zIndex: 1 }}>
                        <Text className="text-gray-600 text-sm font-semibold mb-2 my-2">
                          Price (₹)
                        </Text>
                        <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mr-2">
                          <TextInput
                            value={String(editedItem.price)}
                            placeholder="Enter price"
                            keyboardType="numeric"
                            onChangeText={(text) =>
                              setEditedItem((prev) => ({ ...prev, price: text }))
                            }
                            className="text-gray-800 font-medium text-base"
                          />
                        </View>
                      </View>

                      {/* Category */}
                      <View className="flex-1" style={{ zIndex: 999 }}>
                        <Text className="text-gray-600 text-sm font-semibold mb-2 my-2">
                          Category
                        </Text>

                        <DropDownPicker
                          open={catOpen}
                          value={catValue}
                          items={catItems}
                          setOpen={setCatOpen}
                          setValue={(callback) => {
                            const selected = callback(catValue);
                            setCatValue(selected);
                            setEditedItem((prev) => ({ ...prev, category: selected }));
                          }}
                          placeholder="Select category"
                          listMode="SCROLLVIEW"
                          style={{
                            backgroundColor: "#F9FAFB",
                            borderColor: "#F3F4F6",
                            borderRadius: 12,
                            minHeight: 48,
                            paddingHorizontal: 12,
                            paddingVertical: 20,
                          }}
                          dropDownContainerStyle={{
                            borderColor: "#F3F4F6",
                            borderRadius: 12,
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
                          ArrowDownIconComponent={() => (
                            <Ionicons name="chevron-down" size={18} color="#6B7280" />
                          )}
                          ArrowUpIconComponent={() => (
                            <Ionicons name="chevron-up" size={18} color="#6B7280" />
                          )}
                          TickIconComponent={() => (
                            <Ionicons name="checkmark" size={18} color="#EA580C" />
                          )}
                        />
                      </View>


                    </View>
                  </View>

                  {/* Details Section */}
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
                    Details
                  </Text>

                  {/* Description */}
                  <View className="mb-4">
                    <Text className="text-gray-600 text-sm font-semibold mb-2">
                      Description
                    </Text>
                    <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <TextInput
                        value={editedItem.description}
                        placeholder="Write a short description"
                        multiline
                        onChangeText={(text) =>
                          setEditedItem((prev) => ({ ...prev, description: text }))
                        }
                        className="text-gray-800 text-base h-20"
                        textAlignVertical="top"
                      />
                    </View>
                  </View>

                  {/* Image URL */}
                  <View className="mb-6">
                    <Text className="text-gray-600 text-sm font-semibold mb-2">
                      Image URL
                    </Text>
                    <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <TextInput
                        value={editedItem.imageUrl}
                        placeholder="Paste image link"
                        onChangeText={(text) =>
                          setEditedItem((prev) => ({ ...prev, imageUrl: text }))
                        }
                        className="text-gray-500 text-sm"
                      />
                    </View>
                  </View>


                  {/* Availability Section */}
                  <View className="bg-white border border-gray-100 rounded-xl p-4 mb-10 shadow-sm flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="text-gray-800 font-bold text-base mb-1">
                        Item Availability
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        Item is currently visible on menu
                      </Text>
                    </View>

                    <Switch
                      trackColor={{ false: "#e0e0e0", true: "#FFEDD5" }}
                      thumbColor={editedItem.isAvailable ? "#EA580C" : "#f4f3f4"}
                      onValueChange={(val) =>
                        setEditedItem((prev) => ({ ...prev, isAvailable: val }))
                      }
                      value={editedItem.isAvailable}
                    />
                  </View>
                </KeyboardAwareScrollView>

                {/* ✅ Footer stays fixed but does NOT hide inputs because paddingBottom is added */}
                <View className="p-5 border-t border-gray-100 bg-white">
                  <View className="flex-col gap-3">

                    <TouchableOpacity
                      onPress={handleDelete}
                      disabled={deleting}
                      className="bg-red-50 w-full py-4 rounded-xl flex-row justify-center items-center border border-red-100"
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      <Text className="text-red-500 font-bold text-lg ml-2">
                        {deleting ? "Deleting..." : "Delete Item"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSave}
                      className="bg-orange-600 w-full py-4 rounded-xl flex-row justify-center items-center"
                    >
                      <Ionicons name="save-outline" size={20} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">
                        {loading ? "Saving Changes..." : "Save Changes"}
                      </Text>
                    </TouchableOpacity>

                  </View>
                </View>

              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
        </Modal>

      </SafeAreaView>
    </>
  );
}
