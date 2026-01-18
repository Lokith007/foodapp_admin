import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmergencyContactCardProps {
    name: string;
    expoPushToken: string;
    isSelected: boolean;
    onSelect: () => void;
}

export const EmergencyContactCard: React.FC<EmergencyContactCardProps> = ({
    name,
    isSelected,
    onSelect,
}) => {
    return (
        <TouchableOpacity
            style={[styles.card, isSelected && styles.selectedCard]}
            onPress={onSelect}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="person-circle-outline"
                        size={40}
                        color={isSelected ? "#FF3B30" : "#6B7280"}
                    />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.name, isSelected && styles.selectedText]}>{name}</Text>
                    <Text style={styles.role}>Emergency Contact</Text>
                </View>
                <Ionicons
                    name={isSelected ? "checkbox" : "square-outline"}
                    size={24}
                    color={isSelected ? "#FF3B30" : "#D1D5DB"}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedCard: {
        borderColor: "#FF3B30",
        backgroundColor: "#FFF5F5",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    selectedText: {
        color: "#FF3B30",
    },
    role: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 2,
    },
});
