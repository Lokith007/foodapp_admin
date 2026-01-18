import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: "Muthuraj",
    phone: "+91 98765 43210",
    emergencyContact: "+91 98765 09876",
    bloodGroup: "A+",
    medicalNotes: "No known allergies. Asthma patient.",
    vehicleNumber: "TN 01 AB 1234",
    vehicleType: "Luxury Sedan",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert("Profile Updated", "Your emergency information has been saved successfully.");
    }, 1500);
  };

  const InputField = ({ label, value, onChangeText, icon, placeholder }) => (
    <View className="mb-6">
      <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">{label}</Text>
      <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-1">
        <Ionicons name={icon} size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 py-3 ml-3 text-gray-800 font-bold"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#d1d5db"
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">Safety Profile</Text>
          <Text className="text-gray-500">Information for emergency responders</Text>
        </View>

        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-red-600 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="person" size={20} color="white" />
            </View>
            <Text className="text-xl font-black text-gray-800">Personal Details</Text>
          </View>

          <InputField
            label="Full Name"
            value={formData.fullName}
            onChangeText={(txt) => setFormData({ ...formData, fullName: txt })}
            icon="person-outline"
          />
          <InputField
            label="Phone Number"
            value={formData.phone}
            onChangeText={(txt) => setFormData({ ...formData, phone: txt })}
            icon="call-outline"
          />
          <InputField
            label="Emergency Contact"
            value={formData.emergencyContact}
            onChangeText={(txt) => setFormData({ ...formData, emergencyContact: txt })}
            icon="megaphone-outline"
          />
        </View>

        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-blue-600 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="medical" size={20} color="white" />
            </View>
            <Text className="text-xl font-black text-gray-800">Medical Data</Text>
          </View>

          <InputField
            label="Blood Group"
            value={formData.bloodGroup}
            onChangeText={(txt) => setFormData({ ...formData, bloodGroup: txt })}
            icon="water-outline"
          />
          <View className="mb-6">
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Medical Notes</Text>
            <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 min-h-[100px]">
              <TextInput
                multiline
                className="text-gray-800 font-bold"
                value={formData.medicalNotes}
                onChangeText={(txt) => setFormData({ ...formData, medicalNotes: txt })}
              />
            </View>
          </View>
        </View>

        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-gray-900 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="car" size={20} color="white" />
            </View>
            <Text className="text-xl font-black text-gray-800">Vehicle Info</Text>
          </View>

          <InputField
            label="Vehicle Number"
            value={formData.vehicleNumber}
            onChangeText={(txt) => setFormData({ ...formData, vehicleNumber: txt })}
            icon="barcode-outline"
          />
        </View>

        <TouchableOpacity
          className={`py-5 rounded-3xl items-center mb-10 shadow-xl ${isSaving ? 'bg-gray-400' : 'bg-gray-900 shadow-gray-400'}`}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text className="text-white font-black text-lg">
            {isSaving ? "Saving..." : "Save Emergency Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


