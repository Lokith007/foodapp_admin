import React from 'react';
import { View, Text, ImageBackground,TextInput, TouchableOpacity, Switch, ScrollView ,ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Modal, FlatList } from "react-native";

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

const UPDATE_RESTAURANT_STATUS = gql`
  mutation UpdateRestaurantStatus($isOpen: Boolean!) {
    updateRestaurantStatus(isOpen: $isOpen)
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
const [updateStatus] = useMutation(UPDATE_RESTAURANT_STATUS);

const [isEditing, setIsEditing] = React.useState(false);
const [openingTime, setOpeningTime] = React.useState(null);
const [closingTime, setClosingTime] = React.useState(null);
const [showTimeModal, setShowTimeModal] = React.useState(false);
const [timeType, setTimeType] = React.useState(null); // "opening" | "closing"

const [tempHour, setTempHour] = React.useState("12");
const [tempMinute, setTempMinute] = React.useState("00");
const [tempAmPm, setTempAmPm] = React.useState("AM");

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

const [imageUrl, setImageUrl] = React.useState("");
const [localIsOpen, setLocalIsOpen] = React.useState(null);
const adminEmail = meData?.me?.email || "Admin";

React.useEffect(() => {
  if (data?.getMyRestaurant && localIsOpen === null) {
    setLocalIsOpen(data.getMyRestaurant.isOpen);
  }
}, [data, localIsOpen]);

  if (loading) {
  return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
}

if (error) {
  const isAuthError =
    error.message.includes("Not authenticated") ||
    error.message.includes("jwt") ||
    error.message.includes("token");
  
  return (
    
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-red-500 text-center mb-4">
        {error.message}
      </Text>

      {isAuthError && (
        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.removeItem("token");
            router.replace("/sign-in");
          }}
          className="bg-red-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
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
const handleToggleStatus = async (value) => {
  setLocalIsOpen(value); // instant UI

  try {
    await updateStatus({
      variables: { isOpen: value },
    });
  } catch (err) {
    console.error("❌ Status update failed", err);
    setLocalIsOpen(!value); // rollback
  }
};

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

{/* INFO SECTION */}
<View className="m-4 p-4 bg-white rounded-2xl shadow-md border border-gray-200">

  {/* OPENING TIME */}
  <Text className="text-sm text-gray-700 mb-1">Opening Time</Text>

  {isEditing ? (
    <TouchableOpacity
      onPress={() => {
        setTimeType("opening");
        setShowTimeModal(true);
      }}
      className="border p-3 rounded bg-white mb-3"
    >
      <Text className="text-black">
        {openingTime || "Select Opening Time"}
      </Text>
    </TouchableOpacity>
  ) : (
    <Text className="mb-3">Opening Time: {restaurant.openingTime}</Text>
  )}

  {/* CLOSING TIME */}
  <Text className="text-sm text-gray-700 mb-1">Closing Time</Text>

  {isEditing ? (
    <TouchableOpacity
      onPress={() => {
        setTimeType("closing");
        setShowTimeModal(true);
      }}
      className="border p-3 rounded bg-white mb-3"
    >
      <Text className="text-black">
        {closingTime || "Select Closing Time"}
      </Text>
    </TouchableOpacity>
  ) : (
    <Text className="mb-3">Closing Time: {restaurant.closingTime}</Text>
  )}

  {/* IMAGE URL */}
  {isEditing && (
    <TextInput
      value={imageUrl}
      onChangeText={setImageUrl}
      placeholder="Restaurant Image URL"
      placeholderTextColor="#9ca3af"
      className="border p-2 rounded mt-2 text-black"
      autoCapitalize="none"
    />
  )}

  {/* STATS */}
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

  {/* STATUS TOGGLE */}
  <View className="flex-row items-center justify-between mt-6">
    <Text className="text-sm text-gray-700">Restaurant Status:</Text>
    <Switch
      value={localIsOpen}
      onValueChange={handleToggleStatus}
      thumbColor={localIsOpen ? "#4ade80" : "#f87171"}
    />
  </View>

  {/* SAVE / EDIT BUTTON */}
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
      <Text className="text-white font-bold">Save Changes</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      onPress={startEditing}
      className="bg-orange-500 py-3 rounded-xl mt-4 items-center"
    >
      <Text className="text-white font-bold">Edit Details</Text>
    </TouchableOpacity>
  )}

  {/* LOGOUT BUTTON */}   

        <TouchableOpacity
  onPress={handleLogout}
  className="mt-4 bg-red-500 py-3 rounded-xl items-center"
>
  <Text className="text-white font-bold">Logout</Text>
</TouchableOpacity>

 </View>
<Modal
  visible={showTimeModal}
  transparent
  animationType="fade"
>
  <View className="flex-1 bg-black/40 justify-center items-center">
    <View className="bg-white rounded-2xl p-4 w-[90%] max-w-md">

      {/* TITLE */}
      <Text className="text-lg font-bold text-center mb-4">
        Select Time
      </Text>

      {/* HOURS */}
      <Text className="text-sm font-semibold text-center mb-2">
        Hours
      </Text>

      <FlatList
        data={hours}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setTempHour(item)}
            style={{
              width: 52,
              height: 42,
              marginHorizontal: 6,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor:
                tempHour === item ? "#f97316" : "#e5e7eb",
            }}
          >
            <Text className="text-white font-bold">
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* MINUTES */}
      <Text className="text-sm font-semibold text-center mt-4 mb-2">
        Minutes
      </Text>

      <FlatList
        data={minutes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setTempMinute(item)}
            style={{
              width: 52,
              height: 42,
              marginHorizontal: 6,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor:
                tempMinute === item ? "#f97316" : "#e5e7eb",
            }}
          >
            <Text className="text-white font-bold">
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* AM / PM */}
      <View className="flex-row justify-center mt-5">
        {["AM", "PM"].map((a) => (
          <TouchableOpacity
            key={a}
            onPress={() => setTempAmPm(a)}
            className={`px-6 py-2 mx-2 rounded-xl ${
              tempAmPm === a ? "bg-orange-500" : "bg-gray-200"
            }`}
          >
            <Text className="text-white font-bold">
              {a}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ACTION BUTTONS */}
      <View className="flex-row justify-between mt-6">
        <TouchableOpacity
          onPress={() => setShowTimeModal(false)}
          className="px-5 py-2 rounded-xl bg-gray-300"
        >
          <Text className="font-bold text-gray-800">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const time = `${tempHour}:${tempMinute} ${tempAmPm}`;

            if (timeType === "opening") {
              setOpeningTime(time);
            } else {
              setClosingTime(time);
            }

            setShowTimeModal(false);
          }}
          className="px-6 py-2 rounded-xl bg-green-500"
        >
          <Text className="text-white font-bold">Confirm</Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
</Modal>

   
    </ScrollView>
  );
}