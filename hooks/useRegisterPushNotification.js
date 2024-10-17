import messaging from '@react-native-firebase/messaging';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import apiHelper from '../helper/apiHelper';
import { useAuth } from '../stores/auth';

async function getDeviceId() {
    let deviceId;

    if (Platform.OS === 'ios') {
        deviceId = await Application.getIosIdForVendorAsync();
    } else if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId();
    }

    console.log('Device ID:', deviceId);
    return deviceId;
}

async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        const token = await messaging().getToken();
        return token;
    }
    return null;
}

async function registerForPushNotificationsAsync() {
    let token;
    let deviceId = await getDeviceId();

    if (Constants.deviceName) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.error('Failed to get push token for push notification!');
            return { token: null, deviceId };
        }
        const expoPushToken = await Notifications.getExpoPushTokenAsync();
        token = expoPushToken.data;
    } else {
        console.error('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return { token, deviceId };
}

export default function useRegisterForPushNotification() {
    const { user, token, setExpoToken, setFcmToken, setDeviceId } = useAuth();

    useEffect(() => {
        (async () => {
            if (!user || !token) {
                return;
            }
            // TODO: fix me
            const fcmToken = await requestUserPermission();
            const { token: expoToken, deviceId } = await registerForPushNotificationsAsync();

            if (fcmToken) {
                setFcmToken(fcmToken);
            }

            if (expoToken) {
                setExpoToken(expoToken);
            }

            if (deviceId) {
                setDeviceId(deviceId);
            }
            console.log(`${Platform.OS}`, fcmToken);
            if (!fcmToken && !expoToken) return;

            const newData = {
                token: fcmToken,
                platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
                userId: user._id,
                deviceId: deviceId,
            };

            await apiHelper.post('/notifications/device-token', newData);
        })();
    }, [user, token]);
}
