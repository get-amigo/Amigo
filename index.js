import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { AppRegistry } from 'react-native';
import App from './App';
import PAGES from './constants/pages';

const handleBackgroundMessage = async (remoteMessage) => {
    if (remoteMessage) {
        const data = JSON.parse(remoteMessage.data.data);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: data.group.name,
                body: `A new transaction of ₹${data.amount} has been created by ${data.creator.name}`,
                data: { data, screen: PAGES.GROUP_LIST },
            },
            trigger: { seconds: 1 },
        });
    }
};

messaging().setBackgroundMessageHandler(handleBackgroundMessage);

AppRegistry.registerComponent('Amigo', () => App);
