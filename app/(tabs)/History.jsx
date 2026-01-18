import React from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ALERTS = [
  {
    id: 1,
    type: "CRITICAL",
    title: "Severe Impact Detected",
    message: "System auto-triggered emergency protocol. GPS coordinates sent to center.",
    time: "10:32 AM",
    date: "TODAY",
    icon: "flash",
    color: "#ef4444",
  },
  {
    id: 2,
    title: "SOS Signal Sent",
    message: "Emergency messages delivered to 3 designated contacts.",
    time: "10:33 AM",
    date: "TODAY",
    icon: "paper-plane",
    color: "#f59e0b",
  },
  {
    id: 3,
    title: "Ambublance Dispatched",
    message: "Nearest medical unit from City General is en route.",
    time: "10:35 AM",
    date: "TODAY",
    icon: "medical",
    color: "#3b82f6",
  },
  {
    id: 4,
    title: "Rapid Braking Detected",
    message: "Unusual deceleration noticed at high speed. System monitoring.",
    time: "08:15 PM",
    date: "YESTERDAY",
    icon: "speedometer",
    color: "#8b5cf6",
  },
  {
    id: 5,
    title: "System Diagnostic",
    message: "All sensor modules reporting healthy status.",
    time: "04:20 PM",
    date: "28 DEC",
    icon: "shield-checkmark",
    color: "#10b981",
  },
];

export default function History() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">System Logs</Text>
          <Text className="text-gray-500">Timeline of vehicle health & alerts</Text>
        </View>

        <View className="pl-4">
          {ALERTS.map((alert, idx) => (
            <View key={alert.id} className="mb-8 flex-row relative">
              {/* Timeline Line */}
              {idx !== ALERTS.length - 1 && (
                <View className="absolute left-4 top-10 bottom-[-32px] w-0.5 bg-gray-100" />
              )}

              {/* Indicator Dot */}
              <View className="z-10 bg-white p-1 rounded-full border-2" style={{ borderColor: alert.color }}>
                <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: alert.color }}>
                  <Ionicons name={alert.icon} size={14} color="white" />
                </View>
              </View>

              <View className="flex-1 ml-6 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-gray-800 font-black text-lg leading-6">{alert.title}</Text>
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{alert.date} • {alert.time}</Text>
                  </View>
                  {alert.type === "CRITICAL" && (
                    <View className="bg-red-600 px-2 py-0.5 rounded-lg">
                      <Text className="text-[8px] font-black text-white">CRITICAL</Text>
                    </View>
                  )}
                </View>

                <Text className="text-gray-500 text-sm leading-5">
                  {alert.message}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="py-10 flex-row justify-center items-center">
          <View className="w-2 h-2 rounded-full bg-gray-200 mr-2" />
          <Text className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">End of History</Text>
          <View className="w-2 h-2 rounded-full bg-gray-200 ml-2" />
        </View>
      </ScrollView>
    </View>
  );
}


