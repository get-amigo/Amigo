import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function useNotificationResponse() {
  const navigation = useNavigation();

  useEffect(() => {
    // when the app is running and a notification is tapped
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen, ...data } = response.notification.request.content.data;
      if (screen) {
        navigation.navigate(screen, { data });
        console.log('Navigating to:', screen, 'with data:', data);
      }
    });

    return () => subscription.remove();
  }, [navigation]);
}
