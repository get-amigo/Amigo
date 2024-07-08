import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import generateUniqueId from '../helper/generateUniqueId';
import apiHelper from '../helper/apiHelper';

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

            const newActivitiesById = {
                ...(state.activities[groupId]?.activitiesById || {}),
            };

            const newActivityOrder = [...(state.activities[groupId]?.activityOrder || [])];

            const fetchedDate = new Date(acts[0].createdAt);
            let low = 0;
            let high = newActivityOrder.length - 1;

            while (low <= high) {
                let mid = Math.floor(low + (high - low) / 2);
                let midDate = new Date(
                    state.activities[groupId]?.activitiesById[state.activities[groupId]?.activityOrder[mid]]?.createdAt ??
                        '2000-06-19T09:08:12.155Z',
                );

                if (midDate < fetchedDate) {
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            }

            const unstoredIds = [];
            acts.forEach((act) => {
                if (!(act._id in newActivitiesById)) {
                    unstoredIds.push(act._id);
                    newActivitiesById[act._id] = act;
                }
            });

            // "low" variable stores the correct position where the new activity should be stored

            newActivityOrder.splice(low, 0, ...unstoredIds);

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

    addActivityToLocalDB: (activity, groupId, user, isSynced = false, addToPending = false) => {
        if (isSynced) {
            set((state) => {
                const newActivitiesById = {
                    ...(state.activities[groupId]?.activitiesById || {}),
                };
                const newActivityOrder = [...(state.activities[groupId]?.activityOrder || [])];
                if (!(activity._id in newActivitiesById)) {
                    // find correct index
                    const fetchedDate = new Date(activity.createdAt);

                    let low = 0;
                    let high = newActivityOrder.length - 1;

                    while (low <= high) {
                        let mid = Math.floor(low + (high - low) / 2);
                        let midDate = new Date(newActivitiesById[newActivityOrder[mid]]?.createdAt ?? '2000-06-19T09:08:12.155Z');

                        if (midDate < fetchedDate) {
                            high = mid - 1;
                        } else {
                            low = mid + 1;
                        }
                    }

                    newActivityOrder.splice(low, 0, activity._id);
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
            const now = new Date().toISOString();
            const activityType = activity.activityType;
            let generatedActivity = null;

            const activityId = generateUniqueId();
            const otherId = generateUniqueId();
            switch (activityType) {
                case 'transaction':
                    generatedActivity = {
                        __v: 0,
                        _id: activityId,
                        activityType: 'transaction',
                        createdAt: now,
                        creator: { _id: user._id, name: user.name, phoneNumber: user.phoneNumber },
                        group: groupId,
                        onModel: 'Transaction',
                        relatedId: {
                            __v: 0,
                            _id: otherId,
                            amount: activity.relatedId.amount,
                            createdAt: now,
                            creator: {
                                _id: user._id,
                                countryCode: user.countryCode,
                                name: user.name,
                                phoneNumber: user.phoneNumber,
                            },
                            date: now,
                            description: activity.relatedId.description,
                            group: groupId,
                            paidBy: {
                                _id: activity.relatedId.paidBy._id,
                                name: activity.relatedId.paidBy.name,
                            },
                            splitAmong: activity.relatedId.splitAmong,
                            type: activity.relatedId.type,
                            updatedAt: now,
                        },
                        updatedAt: now,
                        isSynced: false,
                    };
                    break;
                case 'payment':
                    return;
                case 'chat':
                    generatedActivity = {
                        __v: 0,
                        _id: activityId,
                        activityType: 'chat',
                        createdAt: now,
                        creator: {
                            _id: user._id,
                            name: user.name,
                            phoneNumber: user.phoneNumber,
                        },
                        group: groupId,
                        onModel: 'Chat',
                        relatedId: {
                            __v: 0,
                            _id: otherId,
                            createdAt: now,
                            message: activity.relatedId.message,
                            updatedAt: now,
                        },
                        updatedAt: now,
                        isSynced: false,
                    };
                    break;
            }

            set((state) => {
                const newActivitiesById = {
                    ...(state.activities[groupId]?.activitiesById || {}),
                };
                const newActivityOrder = [...(state.activities[groupId]?.activityOrder || [])];
                if (!(generatedActivity._id in newActivitiesById)) {
                    newActivityOrder.unshift(generatedActivity._id);
                }

                newActivitiesById[generatedActivity._id] = generatedActivity;

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

            if (addToPending) {
                set((state) => {
                    return {
                        pendingActivities: {
                            ...state.pendingActivities,
                            [generatedActivity._id]: generatedActivity,
                        },
                    };
                });
            }
            return { activityId, otherId };
        }
    },

    syncAllPendingActivities: () => {
        const activities = get().pendingActivities;

        const activityKeys = Object.keys(activities);

        activityKeys.forEach(async (id) => {
            const activity = activities[id];

            const activityType = activity.activityType;

            switch (activityType) {
                case 'transaction':
                    const splitAmong = activity.relatedId.splitAmong.map((item) => {
                        return {
                            amount: item.amount,
                            user: item.user._id,
                        };
                    });

                    await apiHelper
                        .post('/transaction', {
                            amount: activity.relatedId.amount,
                            date: activity.relatedId.createdAt,
                            description: activity.relatedId.description,
                            group: activity.group,
                            paidBy: activity.relatedId.paidBy._id,
                            splitAmong: splitAmong,
                            type: activity.relatedId.type,
                            activityId: activity._id,
                            transactionId: activity.relatedId._id,
                        })
                        .then(() => {
                            get().updateIsSynced(activity);
                            // remove from pendingActivities
                            set((state) => {
                                const newPendingActivities = { ...state.pendingActivities };
                                delete newPendingActivities[id];
                                return { pendingActivities: newPendingActivities };
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                    break;
                case 'payment':
                    return;
                case 'chat':
                    await apiHelper
                        .post(`/group/${activity.group}/chat`, {
                            message: activity.relatedId.message,
                            activityId: activity._id,
                            chatId: activity.relatedId._id,
                        })
                        .then(() => {
                            // remove from pendingMessages
                            get().updateIsSynced(activity);
                            set((state) => {
                                const newPendingActivities = { ...state.pendingActivities };
                                delete newPendingActivities[id];
                                return { pendingActivities: newPendingActivities };
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                    break;
            }
        });
    },

    clearPendingActivities: () => {
        set((state) => {
            return { pendingActivities: {} };
        });
    },

    updateIsSynced: (activity) => {
        const id = activity._id;
        const groupId = activity.group;
        set((state) => {
            const newActivitiesById = {
                ...(state.activities[groupId]?.activitiesById || {}),
            };

            const updatedActivity = {
                ...newActivitiesById[id],
                isSynced: true,
            };

            newActivitiesById[id] = updatedActivity;

            return {
                activities: {
                    ...state.activities,
                    [groupId]: {
                        ...state.activities[groupId],
                        activitiesById: newActivitiesById,
                    },
                },
            };
        });
    },
});

const useGroupActivitiesStore = create(
    devtools(
        persist(groupActivitiesStore, {
            name: 'group-activities-store',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (error) {
                        console.error('An error occurred during hydration', error);
                    } else {
                        state.setHasHydrated(true);
                    }
                };
            },
        }),
    ),
);

export default useGroupActivitiesStore;
