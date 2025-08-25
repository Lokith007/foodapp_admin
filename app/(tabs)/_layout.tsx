// tabs/_layout.tsx
import { Tabs } from 'expo-router'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E95322',   // active color (orange)
        tabBarInactiveTintColor: '#9ca3af', // inactive (gray)
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 6, // safe gap above system bar
          paddingTop: 6,    // keeps icon centered
        },
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="food-outline" color={color} size={30} />
          ),
        }}
      />

      <Tabs.Screen
        name="Orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="silverware-fork-knife" color={color} size={30} />
          ),
        }}
      />

      <Tabs.Screen
        name="History"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" color={color} size={30} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={30} />
          ),
        }}
      />
    </Tabs>
  );
}
