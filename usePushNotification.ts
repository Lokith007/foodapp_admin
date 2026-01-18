// hooks/usePushNotifications.ts
import { useEffect, useRef, useState } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface PushNotificationState {
  expoPushToken?: string;
  notification?: Notifications.Notification;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,

    // ✅ iOS banner/list support (new expo-notifications)
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification>();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const registerForPushNotificationsAsync = async () => {
    try {
      if (!Device.isDevice) {
        alert("Must use a physical device for Push notifications");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push notification permission");
        return;
      }

      // ✅ ANDROID: strong SOS channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("sos", {
          name: "SOS Alerts",
          importance: Notifications.AndroidImportance.MAX,

          enableVibrate: true,
          vibrationPattern: [0, 500, 300, 500, 300, 800],

          // ✅ default is ok unless you add custom sound file
          sound: "default",

          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,

          enableLights: true,
          lightColor: "#FF0000",
          bypassDnd: true, // 🚫 can't bypass DND unless user allows / system
        });
      }

      // ✅ Push token (EAS projectId)
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.log("❌ Missing projectId. Add it in app.json/app.config.js");
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });

      console.log("✅ EXPO PUSH TOKEN:", token.data);
      setExpoPushToken(token.data);
    } catch (err) {
      console.log("❌ Push Notification Register Error:", err);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        console.log("📩 Notification Received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👉 Notification Clicked:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { expoPushToken, notification };
};
