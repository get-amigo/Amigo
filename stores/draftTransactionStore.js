import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import generateUniqueId from '../helper/generateUniqueId';

const draftTransactionStore = (set, get) => ({
    drafts: {},

    addDraft: (transaction, user, groupId, relatedId = null) => {
        const now = new Date().toISOString();
        const newRelatedId = relatedId || generateUniqueId();

        console.log('Draft Transaction:');
        console.log(transaction);
        console.log(newRelatedId);

        const draftActivity = {
            _id: newRelatedId,
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
                _id: newRelatedId,
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
                group: transaction.group,
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
        console.log('New Draft Activity:', draftActivity);

        set((state) => ({
            drafts: {
                ...state.drafts,
                [newRelatedId]: draftActivity,
            },
        }));

        //return { relatedId: newRelatedId };
    },

    updateDraft: (relatedId, updatedTransaction) => {
        set((state) => {
            const existingDraft = state.drafts[relatedId];
            console.log('Update Transaction:');
            console.log(updatedTransaction);
            console.log(relatedId);
            console.log(existingDraft);
            if (existingDraft) {
                const now = new Date().toISOString();
                const updatedDraftActivity = {
                    ...existingDraft,
                    group: { ...existingDraft.group, ...updatedTransaction.group },
                    updatedAt: now,
                    relatedId: {
                        ...existingDraft.relatedId,
                        amount: updatedTransaction.amount,
                        description: updatedTransaction.description,
                        group: updatedTransaction.group, // Group information
                        paidBy: updatedTransaction.paidBy, // Paid by information
                        splitAmong: updatedTransaction.splitAmong, // Split among information
                        type: updatedTransaction.type, // Type field added
                        date: now,
                    },
                };
                console.log('Updated Draft Activity:', updatedDraftActivity); // Add this line
                return {
                    drafts: {
                        ...state.drafts,
                        [relatedId]: updatedDraftActivity,
                    },
                };
            }
            return state; // No changes if the draft doesn't exist
        });
    },

    removeDraft: (relatedId) => {
        set((state) => {
            const newDrafts = { ...state.drafts };
            delete newDrafts[relatedId];
            return { drafts: newDrafts };
        });
        console.log('DONE');
    },

    clearDrafts: () => {
        set({ drafts: {} });
    },

    getDraftsForUser: (userId) => {
        const { drafts } = get();
        return Object.values(drafts).filter((draft) => draft.creator._id === userId);
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
