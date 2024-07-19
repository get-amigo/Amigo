import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

import apiHelper from '../helper/apiHelper';
import { create } from '../helper/zustand';
const useExpenseStore = create(
    persist(
        (set, get) => ({
            expense: [],
            range: {
                startDate: undefined,
                endDate: undefined,
            },
            loading: false,
            type: undefined,
            backendsynced: true,
            setType: (type) => set({ type }),
            setRange: (range) => set({ range }),
            resetParams: () => {
                set({
                    range: { startDate: undefined, endDate: undefined },
                    type: undefined,
                });
                const { fetchExpense } = get();
                fetchExpense();
            },
            fetchExpense: async () => {
                const { range, type, backendsynced } = get();
                if (!backendsynced) return;
                try {
                    const { expense } = useExpenseStore.getState();
                    if (expense.length === 0) set({ loading: true });
                    const filter = {
                        startDate: range.startDate,
                        endDate: range.endDate,
                        type: Array.isArray(type) ? type : [type],
                    };

                    const { data } = await apiHelper('/transaction/expenses', {
                        params: filter,
                    });
                    set({ expense: data, loading: false });
                } catch (error) {
                    console.error(error);
                }
            },
            deleteExpenseById: async (expenseId) => {
                try {
                    set((state) => ({
                        expense: state.expense.filter((item) => item.id !== expenseId),
                        backendsynced: false,
                    }));
                    await apiHelper.delete(`transaction/${expenseId}`);
                    set({ backendsynced: true });
                } catch (error) {
                    console.error(error);
                }
            },
        }),
        {
            name: 'expense',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export const useExpense = useExpenseStore;
