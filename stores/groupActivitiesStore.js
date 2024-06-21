import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import generateUniqueId from '../helper/generateUniqueId';

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

            const isNewerThanStored = fetchedDate > storedDate ? true : false;

            const newActivitiesById = {
                ...(state.activities[groupId]?.activitiesById || {}),
            };

            const newActivityOrder = [...(state.activities[groupId]?.activityOrder || [])];

            if (isNewerThanStored) {
                for (let n = acts.length - 1; n >= 0; n--) {
                    const act = acts[n];
                    if (!(act._id in newActivitiesById)) {
                        newActivityOrder.unshift(act._id);
                        newActivitiesById[act._id] = act;
                    }
                }
            } else {
                acts.forEach((act) => {
                    if (!(act._id in newActivitiesById)) {
                        newActivityOrder.push(act._id);
                        newActivitiesById[act._id] = act;
                    }
                });
            }

            // acts.forEach((act) => {
            //     if (!(act._id in newActivitiesById)) {
            //         if (isNewerThanStored) {
            //             newActivityOrder.unshift(act._id);
            //         } else {
            //             newActivityOrder.push(act._id);
            //         }
            //         newActivitiesById[act._id] = act;
            //     }
            // });

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

    addActivityToLocalDB: (activity, groupId, isSynced = true) => {
        // currently handling chats

        /* 
            {
                __v: 0,
                _id: "6669434742f4e0bb00be4877",
                activityType: "chat",
                createdAt: "2024-06-12T06:42:15.144Z",
                creator: {
                _id: "665d727f11d48ac43518d5a0",
                name: "Shashwat Singh",
                phoneNumber: "9140062947",
                },
                group: "666073fef4b7f27450c4c1ac",
                onModel: "Chat",
                relatedId: {
                __v: 0,
                _id: "6669434742f4e0bb00be4876",
                createdAt: "2024-06-12T06:42:15.144Z",
                message: "Y",
                updatedAt: "2024-06-12T06:42:15.144Z",
                },
                updatedAt: "2024-06-12T06:42:15.144Z",
            },
        
        */

        console.log('isSynced: ', isSynced);
        if (isSynced) {
            // if the message is synced with the server
            set((state) => {
                const newActivitiesById = {
                    ...(state.activities[groupId]?.activitiesById || {}),
                };
                const newActivityOrder = [...(state.activities[groupId]?.activityOrder || [])];
                if (!(activity._id in newActivitiesById)) {
                    newActivityOrder.unshift(activity._id);
                }

                newActivitiesById[activity._id] = activity;

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
        } else {
            // If not synced
            const now = new Date().toISOString();
            const msg = {
                __v: 0,
                _id: generateUniqueId(),
                activityType: 'chat',
                createdAt: now,
                creator: {
                    _id: '665d727f11d48ac43518d5a0',
                    name: 'Shashwat Singh',
                    phoneNumber: '9140062947',
                },
                group: groupId,
                onModel: 'Chat',
                relatedId: {
                    __v: 0,
                    _id: generateUniqueId(),
                    createdAt: now,
                    message: activity,
                    updatedAt: now,
                },
                updatedAt: now,
            };

            set((state) => {
                const newActivitiesById = {
                    ...(state.activities[groupId]?.activitiesById || {}),
                };
                const newActivityOrder = [...(state.activities[groupId]?.activityOrder || [])];
                if (!(msg._id in newActivitiesById)) {
                    newActivityOrder.unshift(msg._id);
                }

                newActivitiesById[msg._id] = msg;

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

            set((state) => {
                return {
                    pendingActivities: {
                        ...state.pendingActivities,
                        [msg._id]: msg,
                    },
                };
            });
        }

        console.log(activity);
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
