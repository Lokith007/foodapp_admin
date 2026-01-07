import React from 'react';
import { View, Text, ImageBackground,TextInput, TouchableOpacity, Switch, ScrollView ,ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_MY_RESTAURANT = gql`
  query {
    getMyRestaurant {
      hotelName
      logo
      isOpen
      openingTime
      closingTime
    }
  }
`;
const EDIT_RESTAURANT = gql`
  mutation EditRestaurantDetails(
    $openingTime: String
    $closingTime: String  
    $isOpen: Boolean
    $imageUrl: String
  ) {
    editRestaurantDetails(
      openingTime: $openingTime
      closingTime: $closingTime
      isOpen: $isOpen
      imageUrl: $imageUrl
    )
  }
`;

const GET_ME = gql`
  query {
    me {
      email
    }
  }
`;


export default function Profile() {
   const router = useRouter();
 const { data, loading, error } = useQuery(GET_MY_RESTAURANT);

const { data: meData } = useQuery(GET_ME);
const [editRestaurant, { loading: saving }] = useMutation(
  EDIT_RESTAURANT,
  {
    onCompleted: () => {
      setIsEditing(false);
    },
  }
);
const [isEditing, setIsEditing] = React.useState(false);
const [openingTime, setOpeningTime] = React.useState("");
const [closingTime, setClosingTime] = React.useState("");
const [imageUrl, setImageUrl] = React.useState("");

const adminEmail = meData?.me?.email || "Admin";
  if (loading) {
  return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
}

if (error) {
  return <Text style={{ marginTop: 40, textAlign: 'center' }}>{error.message}</Text>;
}

if (!data || !data.getMyRestaurant) {
  return <Text style={{ marginTop: 40, textAlign: 'center' }}>No restaurant data</Text>;
}

const restaurant = data.getMyRestaurant;
const startEditing = () => {
  setOpeningTime(restaurant.openingTime || "");
  setClosingTime(restaurant.closingTime || "");
  setImageUrl(restaurant.logo || "");
  setIsEditing(true);
};
const [localIsOpen, setLocalIsOpen] = React.useState(null);

React.useEffect(() => {
  if (restaurant && localIsOpen === null) {
    setLocalIsOpen(restaurant.isOpen);
  }
}, [restaurant, localIsOpen]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/sign-in');
  };
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header with Background Image */}
   <ImageBackground
  source={{ uri: restaurant.logo }}
  className="h-44 justify-end"
  resizeMode="cover"
>
  <View className="bg-black/50 p-4">
    <Text className="text-white text-xl font-bold">
      {restaurant.hotelName}
    </Text>
    <Text className="text-gray-200 text-sm mt-1">
      Admin: {adminEmail}
    </Text>
  </View>
</ImageBackground>

      {/* Info Section */}
      <View className="m-4 p-4 bg-white rounded-2xl shadow-md border border-gray-200 shwdow-lg">
        {/* Timings */}
        {isEditing ? (
  <TextInput
    value={openingTime}
    onChangeText={setOpeningTime}
    placeholder="Opening Time (HH:MM)"
    className="border p-2 rounded"
  />
) : (
  <Text>Opening Time: {restaurant.openingTime}</Text>
)}
{isEditing ? (
  <TextInput
    value={closingTime}
    onChangeText={setClosingTime}
    placeholder="Closing Time (HH:MM)"
    className="border p-2 rounded"
  />
) : (
  <Text>Closing Time: {restaurant.closingTime}</Text>
)}

{isEditing && (
  <TextInput
    value={imageUrl}
    onChangeText={setImageUrl}
    placeholder="Restaurant Image URL"
    className="border p-2 rounded mt-2"
    autoCapitalize="none"
  />
)}

        {/* Stats */}
        <View className="flex-row justify-between mt-6">
          <View className="items-center flex-1">
            <Text className="text-lg font-bold text-gray-800">120</Text>
            <Text className="text-xs text-gray-500 mt-1">Orders this Week</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-lg font-bold text-gray-800">18</Text>
            <Text className="text-xs text-gray-500 mt-1">Orders Today</Text>
          </View>
        </View>

        {/* Open/Close Toggle */}
    {/* Restaurant Status */}
<View className="flex-row items-center justify-between mt-6">
  <Text className="text-sm text-gray-700">Restaurant Status:</Text>
  <View className="flex-row items-center">
  <Switch
    value={localIsOpen}
    onValueChange={setLocalIsOpen}
    disabled={!isEditing}     // 🔒 KEY FIX
    thumbColor={localIsOpen ? "#4ade80" : "#f87171"}
  />
</View>


        </View>

        {/* Edit Button */}
        {isEditing ? (
  <TouchableOpacity
    onPress={() =>
      editRestaurant({
        variables: {
          openingTime,
          closingTime,
          isOpen: localIsOpen,
          imageUrl,
        },
      })
    }
    className="bg-green-500 py-3 rounded-xl mt-4 items-center"
  >
    <Text className="text-white font-bold">
      {saving ? "Saving..." : "Save Changes"}
    </Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity
    onPress={startEditing}
    className="bg-orange-500 py-3 rounded-xl mt-4 items-center"
  >
    <Text className="text-white font-bold">Edit Details</Text>
  </TouchableOpacity>
)}

        <TouchableOpacity
  onPress={handleLogout}
  className="mt-4 bg-red-500 py-3 rounded-xl items-center"
>
  <Text className="text-white font-bold">Logout</Text>
</TouchableOpacity>


      </View>
    </ScrollView>
  );
}
