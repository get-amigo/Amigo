import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

const groupActivitiesStore = (set, get) => ({
    _hasHydrated: false,

    setHasHydrated: (state) => {
        set({
            _hasHydrated: state,
        });
    },

    activities: {},

    pendingActivities: {},

    addOldActivitiesToLocalDB: (acts) => {
        // acts is an array of activities fethed by api
        if (!acts || acts.length === 0) {
            return;
        }
        set((state) => {
            const groupId = acts[0].group;

            const fetchedDate = new Date(acts[0].createdAt);
            const storedDate = new Date(
                state.activities[groupId]?.activitiesById[state.activities[groupId]?.activityOrder[0]]?.createdAt ??
                    '2000-06-19T09:08:12.155Z',
            );

            console.log('Date ', fetchedDate, storedDate);
            const isNewerThanStored = fetchedDate > storedDate ? true : false;
            console.log('newwer? ', isNewerThanStored);

            const newActivitiesById = {
                ...(state.activities[groupId]?.activitiesById || {}),
            };

            const newActivityOrder = [...(state.activities[groupId]?.activityOrder || [])];

            acts.forEach((act) => {
                if (!(act._id in newActivitiesById)) {
                    if (isNewerThanStored) {
                        newActivityOrder.unshift(act._id);
                    } else {
                        newActivityOrder.push(act._id);
                    }
                    newActivitiesById[act._id] = act;
                }
            });

            return {
                activities: {
                    ...state.activities,
                    [groupId]: {
                        ...state.activities[groupId],
                        activitiesById: newActivitiesById,
                        activityOrder: newActivityOrder,
                    },
                },
            };
        });
    },

    isActivityAvailable: (activityId, groupId) => {
        return activityId in (get().activities[groupId]?.activitiesById || {});
    },
});

const useGroupActivitiesStore = create(
    devtools(
        persist(groupActivitiesStore, {
            name: 'group-activities-store',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => {
                console.log('hydration starts');

                return (state, error) => {
                    if (error) {
                        console.error('An error occurred during hydration', error);
                    } else {
                        state.setHasHydrated(true);
                        console.log('Hydration finished');
                    }
                };
            },
        }),
    ),
);

export default useGroupActivitiesStore;
