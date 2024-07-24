import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

import apiHelper from '../helper/apiHelper';
import { create } from '../helper/zustand'; // Import create instead of createStore
import groupBalancesAndCalculateTotal from '../utility/groupBalancesAndCalculateTotal';
const useBalanceStore = create(
    persist(
        (set) => ({
            balances: [],
            loading: false,
            totalBalances: null,
            setLoading: (loading) => set({ loading }),
            fetchData: async (user) => {
                const { totalBalances } = useBalanceStore.getState();
                if (!totalBalances) set({ loading: true });
                const { data } = await apiHelper('/balance');
                const { groups, userTotalBalance } = await groupBalancesAndCalculateTotal(data, user._id);
                set({
                    loading: false,
                    balances: groups,
                    totalBalances: parseInt(userTotalBalance),
                });
            },
        }),
        {
            name: 'balance',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export const useBalance = useBalanceStore;
