import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/authContext";
import { FIREBASE_AUTH, db } from "../../FirebaseConfig";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { EmergencyContactCard } from "../../components/EmergencyContactCard";
import { sendSOSNotificationToContacts } from "../../lib/notifications";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

interface Contact {
  id: string;
  name: string;
  expoPushToken: string;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosError, setSosError] = useState(false);
  const [isSendingSOS, setIsSendingSOS] = useState(false);

  const [isSimulatingAccident, setIsSimulatingAccident] = useState(false);
  const [speed, setSpeed] = useState(48);
  const [impact, setImpact] = useState(0.2);
  const [coordinates, setCoordinates] = useState({ lat: 13.0827, lng: 80.2707 });
  const [showFirstAidModal, setShowFirstAidModal] = useState(false);

  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [isEditingContacts, setIsEditingContacts] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fetch all contacts and user's selected contacts
  useEffect(() => {
    if (!user) return;

    const fetchAllContacts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const contacts: Contact[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Don't show current user as emergency contact
          if (doc.id !== user.uid && data.expoPushToken && data.expoPushToken !== "not_available") {
            contacts.push({ id: doc.id, name: data.name || data.email, expoPushToken: data.expoPushToken });
          }
        });
        setAllContacts(contacts);
      } catch (err) {
        console.error("Error fetching all contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    };

    const selectedContactsRef = collection(db, "users", user.uid, "selectedContacts");
    const unsubscribe = onSnapshot(selectedContactsRef, (snapshot) => {
      const selectedIds = new Set<string>();
      snapshot.forEach((doc) => {
        selectedIds.add(doc.data().contactId);
      });
      setSelectedContactIds(selectedIds);
    });

    fetchAllContacts();
    return () => unsubscribe();
  }, [user]);

  // Pulse animation for map marker
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Mock sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSimulatingAccident) {
        setSpeed(Math.floor(40 + Math.random() * 20));
        setImpact(parseFloat((0.1 + Math.random() * 0.3).toFixed(1)));
        setCoordinates((prev) => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
        }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isSimulatingAccident]);

  const toggleContactSelection = async (contact: Contact) => {
    if (!user) return;

    const contactDocRef = doc(db, "users", user.uid, "selectedContacts", contact.id);

    if (selectedContactIds.has(contact.id)) {
      await deleteDoc(contactDocRef);
    } else {
      await setDoc(contactDocRef, {
        contactId: contact.id,
        name: contact.name,
        expoPushToken: contact.expoPushToken,
      });
    }
  };

  const handleSOSConfirm = async () => {
    setShowSOSModal(false);
    setIsSendingSOS(true);
    setSosError(false);

    try {
      if (!user) throw new Error("User not logged in");

      const selectedSnapshot = await getDocs(
        collection(db, "users", user.uid, "selectedContacts")
      );
      const tokens: string[] = [];
      selectedSnapshot.forEach((doc) => {
        tokens.push(doc.data().expoPushToken);
      });

      if (tokens.length === 0) {
        Alert.alert("No Contacts Selected", "Please select emergency contacts first.");
        setIsSendingSOS(false);
        return;
      }

      const result = await sendSOSNotificationToContacts(tokens, {
        title: "🚨 SOS Emergency Alert",
        body: `${user.displayName || user.email} needs help. Tap to open location.`,
        data: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          speed: speed,
          impact: impact,
          timestamp: new Date().toISOString(),
          userId: user.uid,
        },
      });

      if (result.success) {
        setSosSent(true);
        setTimeout(() => setSosSent(false), 5000);
      } else {
        setSosError(true);
      }
    } catch (err) {
      console.error("SOS Send Error:", err);
      setSosError(true);
    } finally {
      setIsSendingSOS(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const toggleAccidentSimulation = () => {
    if (!isSimulatingAccident) {
      setIsSimulatingAccident(true);
      setSpeed(0);
      setImpact(8.5);
      setShowSOSModal(true);
    } else {
      setIsSimulatingAccident(false);
      setSpeed(48);
      setImpact(0.2);
    }
  };

  const getImpactColor = (val: number) => {
    if (val < 1) return "#10b981";
    if (val < 4) return "#f59e0b";
    return "#ef4444";
  };

  const firstAidSteps = [
    { title: "Safety First", text: "Ensure your own safety before helping others.", icon: "shield" },
    { title: "Stay Calm", text: "Call 108 or 112 immediately for medical help.", icon: "call" },
    { title: "Assess Scene", text: "Check for fire, fuel leaks, or traffic hazards.", icon: "search" },
    { title: "Control Bleeding", text: "Apply firm pressure to wounds with clean cloth.", icon: "bandage" },
    { title: "Do Not Move", text: "Avoid moving victims unless there is immediate danger.", icon: "hand-left" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#FF3B30", "#FF6B6B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>SOS Shield</Text>
              <Text style={styles.headerSubtitle}>Safety Dashboard</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => setShowFirstAidModal(true)}
                style={[styles.headerIconBtn, { marginRight: 10 }]}
              >
                <Ionicons name="medical" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.headerIconBtn}
              >
                <Ionicons name="log-out-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentPadding}>
          <View
            style={[
              styles.statusCard,
              isSimulatingAccident ? styles.statusCardEmergency : styles.statusCardNormal,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="car-outline"
                  size={28}
                  color={isSimulatingAccident ? "#ef4444" : "#374151"}
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {isSimulatingAccident ? "Collision Detected!" : "Vehicle Status"}
                </Text>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isSimulatingAccident ? "#ef4444" : "#10b981" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: isSimulatingAccident ? "#ef4444" : "#10b981" },
                    ]}
                  >
                    {isSimulatingAccident ? "Emergency Protocol Active" : "System Active"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Live Speed</Text>
                <Text style={styles.metricValue}>
                  {speed}
                  <Text style={styles.metricUnit}> km/h</Text>
                </Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Impact Force</Text>
                <Text
                  style={[styles.metricValue, { color: impact > 5 ? "#ef4444" : "#1C1C1E" }]}
                >
                  {impact}
                  <Text style={styles.metricUnit}> G</Text>
                </Text>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min((impact / 10) * 100, 100)}%`,
                    backgroundColor: getImpactColor(impact),
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              onPress={toggleAccidentSimulation}
              style={styles.simulationButton}
            >
              <Ionicons
                name={isSimulatingAccident ? "refresh-circle" : "shield-half"}
                size={20}
                color={isSimulatingAccident ? "#ef4444" : "#10b981"}
              />
              <Text
                style={[
                  styles.simulationButtonText,
                  { color: isSimulatingAccident ? "#ef4444" : "#10b981" },
                ]}
              >
                {isSimulatingAccident ? "Reset Normal State" : "Simulate Accident"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.badge, { marginRight: 10 }]}>
                <Text style={styles.badgeText}>{selectedContactIds.size} Selected</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditingContacts(!isEditingContacts)}
                style={styles.editButton}
              >
                <Ionicons
                  name={isEditingContacts ? "chevron-up" : "create-outline"}
                  size={18}
                  color="#007AFF"
                />
                <Text style={styles.editButtonText}>
                  {isEditingContacts ? "Done" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isEditingContacts ? (
            loadingContacts ? (
              <ActivityIndicator size="large" color="#FF3B30" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.contactsList}>
                {allContacts.map((contact) => (
                  <EmergencyContactCard
                    key={contact.id}
                    name={contact.name}
                    expoPushToken={contact.expoPushToken}
                    isSelected={selectedContactIds.has(contact.id)}
                    onSelect={() => toggleContactSelection(contact)}
                  />
                ))}
                {allContacts.length === 0 && (
                  <Text style={styles.emptyText}>No other users found.</Text>
                )}
              </View>
            )
          ) : (
            <View style={styles.contactsList}>
              {allContacts
                .filter(c => selectedContactIds.has(c.id))
                .map((contact) => (
                  <EmergencyContactCard
                    key={contact.id}
                    name={contact.name}
                    expoPushToken={contact.expoPushToken}
                    isSelected={true}
                    onSelect={() => { }} // Selection disabled in default view
                  />
                ))}
              {selectedContactIds.size === 0 && (
                <Text style={styles.emptyText}>No emergency contacts selected.</Text>
              )}
            </View>
          )}

          <View style={styles.sosContainer}>
            {sosSent && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
                <Text style={styles.successText}>SOS ALERT SENT SUCCESSFULLY</Text>
              </View>
            )}

            {sosError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
                <Text style={styles.errorText}>FAILED TO SEND SOS. RETRY?</Text>
                <TouchableOpacity onPress={handleSOSConfirm} style={styles.retryButton}>
                  <Text style={styles.retryText}>RETRY</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.sosButton, isSendingSOS && styles.sosButtonDisabled]}
              activeOpacity={0.9}
              onPress={() => setShowSOSModal(true)}
              disabled={isSendingSOS}
            >
              {isSendingSOS ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="warning-outline" size={28} color="white" />
                  <Text style={styles.sosButtonText}>SOS EMERGENCY</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.sosHint}>Tap to notify all selected contacts</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showFirstAidModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>First Aid Guide</Text>
              <TouchableOpacity
                onPress={() => setShowFirstAidModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {firstAidSteps.map((step, idx) => (
                <View key={idx} style={styles.firstAidStep}>
                  <View style={styles.firstAidIconContainer}>
                    <Ionicons name={step.icon as any} size={24} color="#ef4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.firstAidStepTitle}>{step.title}</Text>
                    <Text style={styles.firstAidStepText}>{step.text}</Text>
                  </View>
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showSOSModal} transparent={true} animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="alert-circle" size={50} color="white" />
            </View>
            <Text style={styles.confirmTitle}>Trigger SOS?</Text>
            <Text style={styles.confirmSubtitle}>
              This will send your current location and vehicle data to all {selectedContactIds.size} selected contacts.
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSOSModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSOSConfirm}>
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  headerIconBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 15,
  },
  contentPadding: {
    padding: 24,
  },
  statusCard: {
    borderRadius: 25,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
  },
  statusCardNormal: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  statusCardEmergency: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 15,
    marginRight: 15,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  metricUnit: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "normal",
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#F2F2F7",
    height: "100%",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#F2F2F7",
    borderRadius: 3,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  simulationButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  simulationButtonText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  badge: {
    backgroundColor: "#E4E6EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
    marginLeft: 4,
  },
  contactsList: {
    marginBottom: 30,
  },
  emptyText: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 14,
    marginVertical: 20,
  },
  sosContainer: {
    marginBottom: 40,
  },
  sosButton: {
    borderRadius: 24,
    backgroundColor: "#ef4444",
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  sosButtonDisabled: {
    backgroundColor: "#FECACA",
  },
  sosButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 12,
    letterSpacing: 1,
  },
  sosHint: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 12,
  },
  successBanner: {
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 15,
  },
  successText: {
    color: "#065F46",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 15,
  },
  errorText: {
    color: "#991B1B",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  closeButton: {
    backgroundColor: "#F2F2F7",
    padding: 8,
    borderRadius: 20,
  },
  firstAidStep: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  firstAidIconContainer: {
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 15,
    marginRight: 15,
  },
  firstAidStepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 5,
  },
  firstAidStepText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  confirmCard: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
  },
  alertIcon: {
    backgroundColor: "#ef4444",
    padding: 20,
    borderRadius: 40,
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 10,
  },
  confirmSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  confirmActions: {
    flexDirection: "row",
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginRight: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
