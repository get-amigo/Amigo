import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { persist, createJSONStorage } from 'zustand/middleware';

import apiHelper from '../helper/apiHelper';
import { clearAllLocalStoreData } from '../helper/localStorage';
import logout from '../helper/logout';
import { create, resetAllStores } from '../helper/zustand';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            addName: async (name) => {
                apiHelper.put('/user', { name });
                set({ user: { ...get().user, name } });
            },
            logout: async () => {
                await logout();

                set({ user: null });
                resetAllStores();
                clearAllLocalStoreData();
            },
            login: ({ user, token }) => {
                set({ user });
                set({ token });
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
        }),
        {
            name: 'auth',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export const useAuth = useAuthStore;
export const getToken = () => useAuthStore.getState().token;
