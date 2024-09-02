import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { createJSONStorage, persist } from 'zustand/middleware';
import apiHelper from '../helper/apiHelper';
import { clearAllLocalStoreData } from '../helper/localStorage';
import logout from '../helper/logout';
import { create, resetAllStores } from '../helper/zustand';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            expoToken: null,
            fcmToken: null,
            deviceId: null,
            addName: async (name) => {
                apiHelper.put('/user', { name });
                set({ user: { ...get().user, name } });
            },
            logout: async () => {
                const { fcmToken, deviceId, user } = get();

                if (fcmToken && user) {
                    try {
                        const payload = {
                            token: fcmToken,
                            platform: Platform.OS === 'android' ? 'ANDROID' : 'IOS',
                            userId: user._id,
                            deviceId,
                        };

                        await apiHelper.delete('/notifications/device-token', {
                            data: payload,
                        });
                    } catch (error) {
                        console.error('Error deleting device token:', error);
                    }
                }

                await logout();

                set({ user: null, expoToken: null, fcmToken: null, deviceId: null });
                resetAllStores();
                clearAllLocalStoreData();
            },
            login: ({ user, token }) => {
                set({ user, token });
            },
            editUser: async (editedUser) => {
                set({ user: { ...get().user, ...editedUser } });
                apiHelper.put('/user', editedUser);
            },
            fetchUser: async (set) => {
                try {
                    const { data } = await apiHelper.get('/user');
                    set({ user: data });
                } catch (e) {
                    console.error('Error fetching user data:', e);
                }
                await SplashScreen.hideAsync();
            },
            deleteAccount: async () => {
                await apiHelper.delete('/user');
                await logout();
            },
            setExpoToken: (expoToken) => {
                set({ expoToken });
            },
            setFcmToken: (fcmToken) => {
                set({ fcmToken });
            },
            setDeviceId: (deviceId) => {
                set({ deviceId });
            },
        }),
        {
            name: 'auth',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export const useAuth = useAuthStore;
export const getToken = () => useAuthStore.getState().token;
export const getExpoToken = () => useAuthStore.getState().expoToken;
export const getFcmToken = () => useAuthStore.getState().fcmToken;
export const getDeviceId = () => useAuthStore.getState().deviceId;
