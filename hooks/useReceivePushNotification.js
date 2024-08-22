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

         // Foreground Notification
         await Notifications.scheduleNotificationAsync({
          content: {
            title: data.group.name,
            body: `A new transaction of ₹${data.amount} has been created by ${data.creator.name}`,
        data: {data,screen:PAGES.ABOUT},
            
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