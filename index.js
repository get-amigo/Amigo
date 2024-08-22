import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { AppRegistry } from 'react-native';
import App from './App';
import PAGES from './constants/pages';
import { useAuth } from './stores/auth';

const handleBackgroundMessage = async (remoteMessage) => {
    if (remoteMessage) {
        const data = JSON.parse(remoteMessage.data.data);
        const groupName = data.group.name;
        const creatorName = data.creator.name;
        const totalAmount = data.amount;
        const userId = useAuth.getState().user._id;

        const userShareObject = data.splitAmong.find((item) => item.user === userId);
        const userShare = userShareObject ? userShareObject.amount : 0;

        // notification content
        const body = `New Expense Added\n${creatorName} split ₹${totalAmount} with you. Your share: ₹${userShare}`;
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${groupName}`,
                body: body,
                data: { data, screen: PAGES.GROUP_LIST },
            },
            trigger: { seconds: 1 },
        });
    }
};

messaging().setBackgroundMessageHandler(handleBackgroundMessage);

AppRegistry.registerComponent('Amigo', () => App);
