import messaging from '@react-native-firebase/messaging';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import apiHelper from '../helper/apiHelper';
import { useAuth } from '../stores/auth';

async function getDeviceId() {
    const deviceId = await DeviceInfo.getUniqueId();
    console.log('Device ID:', deviceId);
    return deviceId;
}

async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        const token = await messaging().getToken();
        return token;
    }
    return null;
}

async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.deviceName) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.error('Failed to get push token for push notification!');
            return null;
        }
        const expoPushToken = await Notifications.getExpoPushTokenAsync();
        token = expoPushToken;
        deviceId = await getDeviceId();
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

            const fcmToken = await requestUserPermission();
            const { token: expoToken} = await registerForPushNotificationsAsync();

            if (fcmToken) {
                setFcmToken(fcmToken);
            }

            if (expoToken) {
                setExpoToken(expoToken);
            }

            if (deviceId) {
                setDeviceId(deviceId);
            }

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
