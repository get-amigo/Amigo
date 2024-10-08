import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import apiHelper from '../helper/apiHelper';
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
        // acts is an array of activities fetched by api
        if (!acts || acts.length === 0) {
            return;
        } else {
            console.log('Activities Fetched');
        }

        set((state) => {
            const groupId = acts[0].group;
            const newActivitiesById = {
                ...(state.activities[groupId]?.activitiesById || {}),
            };
            let newActivityOrder = [...(state.activities[groupId]?.activityOrder || [])];
            // const fetchedDate = new Date(acts[0].createdAt);

            // Create a set of existing activity IDs for faster lookup
            const existingIds = new Set(newActivityOrder);

            // Sort acts by createdAt in descending order (newest first)
            const sortedActs = acts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            sortedActs.forEach((act) => {
                newActivitiesById[act._id] = {
                    ...newActivitiesById[act._id],
                    ...act,
                };

                if (!existingIds.has(act._id)) {
                    // If the activity is new, find its correct position in the order
                    const insertIndex = newActivityOrder.findIndex(
                        (id) => new Date(newActivitiesById[id].createdAt) <= new Date(act.createdAt),
                    );

                    if (insertIndex === -1) {
                        // If no suitable position found, add to the end
                        newActivityOrder.push(act._id);
                    } else {
                        // Insert at the correct position
                        newActivityOrder.splice(insertIndex, 0, act._id);
                    }
                    existingIds.add(act._id);
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

    isActivityAvailable: (params) => {
        const { activityId, groupId } = params;
        return activityId in (get().activities[groupId]?.activitiesById || {});
    },

    addActivityToLocalDB: (params) => {
        const { activity, groupId, user, isSynced = false, addToPending = false } = params;

        if (isSynced) {
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
            const now = new Date().toISOString();
            const activityType = activity.activityType;
            let generatedActivity = null;

            const activityId = generateUniqueId();
            const relatedId = generateUniqueId();

            switch (activityType) {
                case 'transaction':
                    generatedActivity = {
                        _id: activityId,
                        activityType: 'transaction',
                        createdAt: now,
                        creator: { _id: user._id, name: user.name, phoneNumber: user.phoneNumber },
                        group: groupId,
                        onModel: 'Transaction',
                        relatedId: {
                            _id: relatedId,
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
                                phoneNumber: activity.relatedId.paidBy.phoneNumber,
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
                            _id: relatedId,
                            createdAt: now,
                            message: activity.relatedId.message,
                            replyTo: activity.relatedId.replyTo,
                            replyingMessage: activity.relatedId.replyingMessage,
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

            return { activityId, relatedId };
        }
    },

    syncAllPendingActivities: () => {
        const activities = get().pendingActivities;

        const activityKeys = Object.keys(activities);

        activityKeys.forEach(async (id) => {
            const activity = activities[id];

            const activityType = activity.activityType;

            const splitAmong =
                activityType == 'transaction'
                    ? activity.relatedId.splitAmong.map((item) => {
                          return {
                              amount: item.amount,
                              user: item.user._id,
                          };
                      })
                    : null;

            switch (activityType) {
                case 'transaction':
                    await apiHelper
                        .post('/transaction', {
                            amount: activity.relatedId.amount,
                            date: activity.relatedId.createdAt,
                            description: activity.relatedId.description,
                            group: activity.group,
                            paidBy: activity.relatedId.paidBy._id,
                            splitAmong,
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
                            console.log('Activity is ', activity);
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
        set(() => {
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

    deleteActivity: (params) => {
        const { activityId, groupId, synced } = params;
        if (synced === false) {
            set((state) => {
                const newPendingActivities = state?.pendingActivities || {};
                delete newPendingActivities[activityId];
                return {
                    pendingActivities: { ...newPendingActivities },
                };
            });
        }
        if (!get().activities[groupId]?.activityOrder || get().activities[groupId].activityOrder.length == 0) {
            return;
        }
        set((state) => {
            const newActivitiesById = {
                ...(state.activities[groupId]?.activitiesById || {}),
            };

            delete newActivitiesById[activityId];

            const newActivityOrder = state.activities[groupId].activityOrder.filter((elem) => elem != activityId);

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
