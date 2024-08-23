import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import generateUniqueId from '../helper/generateUniqueId';

const draftTransactionStore = (set, get) => ({
    drafts: {},

    addDraft: (transaction, user, groupId) => {
        const now = new Date().toISOString();
        const draftId = generateUniqueId();
        const relatedId = generateUniqueId();

        const draftActivity = {
            _id: draftId,
            activityType: 'transaction',
            createdAt: now,
            creator: {
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
            },
            group: groupId,
            onModel: 'Transaction',
            relatedId: {
                _id: relatedId,
                amount: transaction.amount,
                createdAt: now,
                creator: {
                    _id: user._id,
                    countryCode: user.countryCode,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                },
                date: now,
                description: transaction.description,
                group: groupId,
                paidBy: {
                    _id: transaction.paidBy._id,
                    name: transaction.paidBy.name,
                },
                splitAmong: transaction.splitAmong,
                type: transaction.type,
                updatedAt: now,
            },
            updatedAt: now,
            isSynced: false,
        };

        set((state) => ({
            drafts: {
                ...state.drafts,
                [draftId]: draftActivity,
            },
        }));

        return { draftId, relatedId };
    },

    removeDraft: (draftId) => {
        set((state) => {
            const newDrafts = { ...state.drafts };
            delete newDrafts[draftId];
            return { drafts: newDrafts };
        });
        console.log("DONE")
    },

    clearDrafts: () => {
        set({ drafts: {} });
    },

    getDraftsForUser: (userId) => {
        const { drafts } = get();
        return Object.values(drafts).filter(
            (draft) => draft.creator._id === userId
        );
    },
});

const useDraftTransactionStore = create(
    devtools(
        persist(draftTransactionStore, {
            name: 'draft-transaction-store',
            storage: createJSONStorage(() => AsyncStorage),
        }),
    ),
);

export default useDraftTransactionStore;
