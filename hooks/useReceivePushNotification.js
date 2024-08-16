import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
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
            title: "Amigo",
            body: "A new transaction is created in the group",
            data: data,
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