import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { useAuth } from '../stores/auth';
import handleNotification from '../helper/handleNotification';

export default function useReceivePushNotification() {
    const { user, token } = useAuth();
    const messageId = useRef('');
    useEffect(() => {
        if (!user || !token) {
            return;
        }
        const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
            console.log('swipe');
            await clearAllNotifications();
        });
        const unsubscribeOnMessage = messaging().onMessage(async (message) => {
            const data = message.data!!.data as string;
            console.log('Please I have done a dumb', message);
            const parsedData = JSON.parse(data);

            handleNotification(message, user._id);
            messageId.current = parsedData._id;
        });

        messaging().setBackgroundMessageHandler(async (message) => {
            const data = message.data!!.data as string;
            const parsedData = JSON.parse(data);
            if (messageId.current == parsedData._id) return;

            handleNotification(message, user._id);
            messageId.current = parsedData._id;
        });

        return () => {
            unsubscribeOnMessage();
            subscription.remove();
        };
    }, [user, token]);
}

const clearAllNotifications = async () => {
    try {
        await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
        console.error('Failed to clear notifications:', error);
    }
};
