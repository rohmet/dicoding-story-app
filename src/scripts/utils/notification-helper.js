import { convertBase64ToUint8Array } from "./index";
import { VAPID_PUBLIC_KEY } from "../config";
import {
  subscribePushNotification,
  unsubscribePushNotification,
} from "../data/api";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API tidak didukung.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    alert("Izin notifikasi ditolak.");
    return false;
  }

  if (status === "default") {
    alert("Izin notifikasi ditutup atau diabaikan.");
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return false;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    console.log("Sudah berlangganan push notification.");
    return false;
  }

  console.log("Mulai berlangganan push notification...");

  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.ready;
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error("subscribe: response:", response);
      await pushSubscription.unsubscribe();
      return false;
    }

    console.log("Berhasil berlangganan push notification.");
    return true;
  } catch (error) {
    console.error("subscribe: error:", error);
    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
    return false;
  }
}

export async function unsubscribe() {
  const pushSubscription = await getPushSubscription();

  if (!pushSubscription) {
    console.log("Belum berlangganan.");
    return false;
  }

  try {
    const { endpoint } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      console.error("unsubscribe: response:", response);
      return false;
    }

    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      console.error("Gagal unsubscribe dari PushManager");
      return false;
    }

    console.log("Langganan push notification berhasil dinonaktifkan.");
    return true;
  } catch (error) {
    console.error("unsubscribe: error:", error);
    return false;
  }
}
