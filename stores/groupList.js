import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

import apiHelper from '../helper/apiHelper';
import editNamesAsync from '../helper/editNamesAsync';
import { create } from '../helper/zustand'; // Import create instead of createStore

const useGroupStore = create(
    persist(
        (set) => ({
            // Use create instead of createStore
            groups: [],
            loading: false,
            search: '',
            setSearch: (search) => set({ search }),
            fetchData: async (user) => {
                const { groups } = useGroupStore.getState();
                if (groups.length === 0) {
                    set({ loading: true });
                }
                const { data } = await apiHelper('/group');
                for (const group of data) group.members = await editNamesAsync(group.members, user._id);
                set({ groups: data, loading: false });
            },
            updateMember: async ({ groupId, newMembers, userId }) => {
                const { groups } = useGroupStore.getState();
                const groupIndex = groups.findIndex((group) => group._id === groupId);
                const newMembersWithName = await editNamesAsync(newMembers, userId);
                const newGroups = groups.map((group) => ({
                    ...group,
                    members: [...group.members],
                }));

                if (groupIndex !== -1) {
                    for (const newMemberWithName of newMembersWithName) newGroups[groupIndex].members.push(newMemberWithName);
                }
                set({ groups: newGroups });
            },
        }),
        {
            name: 'groupList',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export const useGroupList = useGroupStore;
