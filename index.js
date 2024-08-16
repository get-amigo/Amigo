import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { AppRegistry } from 'react-native';
import App from './App';

const handleBackgroundMessage = async (remoteMessage) => {
  if (remoteMessage) {
    console.log('Background:', remoteMessage);

    const data = JSON.parse(remoteMessage.data.data);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: data.type,
        body: "A new transaction is created in the group by " + data.paidBy,
        data: data,
      },
      trigger: { seconds: 1 },
    });
  }
};

messaging().setBackgroundMessageHandler(handleBackgroundMessage);

AppRegistry.registerComponent('Amigo', () => App);
