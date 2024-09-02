import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import PAGES from '../constants/pages';
import { useAuth } from '../stores/auth';

export default function useReceivePushNotification() {
    const { user, token } = useAuth();
    const navigation = useNavigation();

    useEffect(() => {
        if (!user || !token) {
            return;
        }

        const handleForegroundMessage = async (remoteMessage) => {
            if (remoteMessage) {
                console.log('Foreground Message:', remoteMessage.data);

                const data = JSON.parse(remoteMessage.data.data);
                const groupName = data.group.name;
                const creatorName = data.creator.name;
                const totalAmount = data.amount;
                const userId = user._id;

                const userShareObject = data.splitAmong.find((item) => item.user === userId);
                const userShare = userShareObject ? userShareObject.amount : 0;

                // notification content
                const title = `${groupName}`;
                const body = `New Expense Added.\n${creatorName} split ₹${totalAmount} with you. Your share: ₹${userShare}`;

                // Foreground Notification
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: title,
                        body: body,
                        data: { data, screen: PAGES.GROUP_LIST },
                    },
                    trigger: { seconds: 1 },
                });
            }
        };

        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });

        const unsubscribeOnMessage = messaging().onMessage(handleForegroundMessage);

        return () => {
            unsubscribeOnMessage();
        };
    }, [user, token, navigation]);
}
