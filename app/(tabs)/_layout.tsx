// tabs/_layout.tsx
import { Tabs } from 'expo-router'
import React, { useRef } from 'react'
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 70,
          paddingTop: 7,
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