import { create, resetAllStores } from '../helper/zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiHelper from '../helper/apiHelper';
import { clearAllLocalStoreData } from '../helper/localStorage';
import * as SplashScreen from 'expo-splash-screen';
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
                const { logout } = get();
                await apiHelper.delete('/user');
                logout();
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
