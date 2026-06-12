// src/utils/notifications.js
/* 
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications"; */

/* export async function initNotifications() {
  if (!Capacitor.isNativePlatform()) {
    console.log("Push notifications only work on native devices.");
    return;
  }

  try {
    // Local notification permission
    await LocalNotifications.requestPermissions();

    // Push notification permission
    let permission = await PushNotifications.checkPermissions();

    if (permission.receive === "prompt") {
      permission = await PushNotifications.requestPermissions();
    }

    if (permission.receive !== "granted") {
      console.error("Push notification permission denied");
      return;
    }

    // Register with FCM/APNS
    await PushNotifications.register();

    // Device token
    PushNotifications.addListener("registration", (token) => {
      console.log("FCM Token:", token.value);

      // Save token to Supabase here if needed
      // saveTokenToSupabase(token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Registration error:", error);
    });

    // Push received while app is open
    PushNotifications.addListener(
      "pushNotificationReceived",
      async (notification) => {
        console.log("Push received:", notification);

        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: notification.title || "Notification",
              body: notification.body || "",
              schedule: { at: new Date(Date.now() + 100) },
            },
          ],
        });
      }
    );

    // User taps notification
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        console.log("Notification tapped:", action);

        // Example:
        // window.location.href = "/messages";
      }
    );

    console.log("Notifications initialized");
  } catch (err) {
    console.error("Notification setup error:", err);
  }
} */


export async function initNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.requestPermissions();

  let permission =
    await PushNotifications.checkPermissions();

  if (permission.receive !== "granted") {
    permission =
      await PushNotifications.requestPermissions();
  }

  if (permission.receive !== "granted") return;

  await PushNotifications.register();
}

export async function showNotification(
  title,
  body
) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title,
          body,
          schedule: {
            at: new Date(Date.now() + 100),
          },
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
}