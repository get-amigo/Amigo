import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import generateUniqueId from '../helper/generateUniqueId';
import apiHelper from '../helper/apiHelper';
import { useAuth } from './auth';

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

            console.log(fetchedDate, storedDate);

            const isNewerThanStored = fetchedDate > storedDate ? true : false;

            console.log('isNewerThanStored ', isNewerThanStored);

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

    addActivityToLocalDB: (activity, groupId, user, isSynced = true) => {
        // ------ This is how data is stored ------------

        // const chat = {
        //     __v: 0,
        //     _id: '6669434742f4e0bb00be4877',
        //     activityType: 'chat',
        //     createdAt: '2024-06-12T06:42:15.144Z',
        //     creator: {
        //         _id: '665d727f11d48ac43518d5a0',
        //         name: 'Shashwat Singh',
        //         phoneNumber: '9140062947',
        //     },
        //     group: '666073fef4b7f27450c4c1ac',
        //     onModel: 'Chat',
        //     relatedId: {
        //         __v: 0,
        //         _id: '6669434742f4e0bb00be4876',
        //         createdAt: '2024-06-12T06:42:15.144Z',
        //         message: 'Y',
        //         updatedAt: '2024-06-12T06:42:15.144Z',
        //     },
        //     updatedAt: '2024-06-12T06:42:15.144Z',
        // };

        // const transaction = {
        //     __v: 0,
        //     _id: '667841c3f94be666a2227c69',
        //     activityType: 'transaction',
        //     createdAt: '2024-06-23T15:39:47.336Z',
        //     creator: { _id: '665d727f11d48ac43518d5a0', name: 'Shashwat Singh', phoneNumber: '9140062947' },
        //     group: '667148b69360748acd331913',
        //     onModel: 'Transaction',
        //     relatedId: {
        //         __v: 0,
        //         _id: '667841c3f94be666a2227c63',
        //         amount: 500,
        //         createdAt: '2024-06-23T15:39:47.222Z',
        //         creator: { _id: '665d727f11d48ac43518d5a0', countryCode: '+91', name: 'Shashwat Singh', phoneNumber: '9140062947' },
        //         date: '2024-06-23T15:39:42.932Z',
        //         description: ' ',
        //         group: '667148b69360748acd331913',
        //         paidBy: {
        //             _id: '665d727f11d48ac43518d5a0',
        //             countryCode: '+91   (not used to store)',
        //             name: 'Shashwat Singh',
        //             phoneNumber: '9140062947     (not used to store)',
        //         },
        //         splitAmong: [
        //             { amount: 50, user: { _id: '666073daf4b7f27450c4c1a4', countryCode: '+91', name: '##', phoneNumber: '9115886693' } },
        //             { amount: 50, user: { _id: '665d727f11d48ac43518d5a0', countryCode: '+91', name: 'You', phoneNumber: '9140062947' } },
        //         ],
        //         type: 'Groceries',
        //         updatedAt: '2024-06-23T15:39:47.222Z',
        //     },
        //     updatedAt: '2024-06-23T15:39:47.336Z',
        // };

        // const userrr = {
        //     __v: 0,
        //     _id: '665d727f11d48ac43518d5a0',
        //     countryCode: '+91',
        //     createdAt: '2024-06-03T07:36:31.226Z',
        //     name: 'Shashwat Singh',
        //     phoneNumber: '9140062947',
        //     updatedAt: '2024-06-03T07:37:17.580Z',
        // };

        console.log('activity ', activity);

        console.log('isSynced: ', isSynced);
        if (isSynced) {
            // if the activity is synced with the server
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
            const activityType = activity.activityType;
            console.log('activityType', activityType);
            let generatedActivity = null;

            switch (activityType) {
                case 'transaction':
                    // const activityRes = {
                    //     activityType: 'transaction',
                    //     createdAt: '2024-06-24T04:31:43.372Z',
                    //     creator: { _id: '665d727f11d48ac43518d5a0', name: 'You' },
                    //     relatedId: {
                    //         amount: 500,
                    //         date: '2024-06-24T04:31:32.137Z',
                    //         description: 'Hshshs',
                    //         group: {
                    //             _id: '6672c7bb1aaae45bdbe10c35',
                    //             activities: [Array],
                    //             groupIds: [Array],
                    //             members: [Array],
                    //             name: 'New grp',
                    //         },
                    //         paidBy: { _id: '665d727f11d48ac43518d5a0', name: 'You' },
                    //         splitAmong: [[Object], [Object], [Object], [Object]],
                    //         type: 'General',
                    //     },
                    //     synced: false,
                    // };
                    console.log('splitAmong: activity.relatedId.splitAmong ', activity.relatedId.splitAmong);

                    generatedActivity = {
                        __v: 0,
                        _id: generateUniqueId(),
                        activityType: 'transaction',
                        createdAt: now,
                        creator: { _id: user._id, name: user.name, phoneNumber: user.phoneNumber },
                        group: groupId,
                        onModel: 'Transaction',
                        relatedId: {
                            __v: 0,
                            _id: generateUniqueId(),
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
                                // countryCode: activity.relatedId.paidBy.countryCode,
                                name: activity.relatedId.paidBy.name,
                                // phoneNumber: activity.relatedId.paidBy.phoneNumber,
                            },
                            splitAmong: activity.relatedId.splitAmong,
                            type: activity.relatedId.type,
                            updatedAt: now,
                        },
                        updatedAt: now,
                    };
                    break;
                case 'payment':
                    break;
                case 'chat':
                    generatedActivity = {
                        __v: 0,
                        _id: generateUniqueId(),
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
                            _id: generateUniqueId(),
                            createdAt: now,
                            message: activity.relatedId.message,
                            updatedAt: now,
                        },
                        updatedAt: now,
                    };
                    break;
            }

            console.log('generatedActivity ', generatedActivity);

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

            set((state) => {
                return {
                    pendingActivities: {
                        ...state.pendingActivities,
                        [generatedActivity._id]: generatedActivity,
                    },
                };
            });
        }
    },

    syncAllPendingActivities: () => {
        const activities = get().pendingActivities;

        console.log('pendingActivities', activities);

        const activityKeys = Object.keys(activities);

        activityKeys.forEach(async (id) => {
            const activity = activities[id];
            console.log('.relatedId.splitAmong ', activity.relatedId.splitAmong);

            const activityType = activity.activityType;

            switch (activityType) {
                case 'transaction':
                    // const requestToSend = {
                    //     amount: 500,
                    //     date: '2024-06-24T06:51:32.172Z',
                    //     description: 'Gdtg',
                    //     group: '6671485e9360748acd33190f',
                    //     paidBy: '665d727f11d48ac43518d5a0',
                    //     splitAmong: [
                    //         { amount: 250, user: '665d727f11d48ac43518d5a0' },
                    //         { amount: 250, user: '666073daf4b7f27450c4c1a4' },
                    //     ],
                    //     type: 'Groceries',
                    //     activityId: '225d727f11d48ac43518d5a0',
                    // };

                    // const transaction = {
                    //     __v: 0,
                    //     _id: '667841c3f94be666a2227c69',
                    //     activityType: 'transaction',
                    //     createdAt: '2024-06-23T15:39:47.336Z',
                    //     creator: { _id: '665d727f11d48ac43518d5a0', name: 'Shashwat Singh', phoneNumber: '9140062947' },
                    //     group: '667148b69360748acd331913',
                    //     onModel: 'Transaction',
                    //     relatedId: {
                    //         __v: 0,
                    //         _id: '667841c3f94be666a2227c63',
                    //         amount: 500,
                    //         createdAt: '2024-06-23T15:39:47.222Z',
                    //         creator: { _id: '665d727f11d48ac43518d5a0', countryCode: '+91', name: 'Shashwat Singh', phoneNumber: '9140062947' },
                    //         date: '2024-06-23T15:39:42.932Z',
                    //         description: ' ',
                    //         group: '667148b69360748acd331913',
                    //         paidBy: { _id: '665d727f11d48ac43518d5a0', countryCode: '+91'(not used to store), name: 'Shashwat Singh', phoneNumber: '9140062947'(not used to store) },
                    //         splitAmong: [
                    //             { amount: 250, user: '666073fef4b7f27450c4c1aa' },
                    //             { amount: 250, user: '665d727f11d48ac43518d5a0' },
                    //         ],
                    //         type: 'Groceries',
                    //         updatedAt: '2024-06-23T15:39:47.222Z',
                    //     },
                    //     updatedAt: '2024-06-23T15:39:47.336Z',
                    // };

                    const splitAmong = activity.relatedId.splitAmong.map((item) => {
                        return {
                            amount: item.amount,
                            user: item.user._id,
                        };
                    });
                    // [{"amount": 50, "user": {"_id": "666073daf4b7f27450c4c1a4", "countryCode": "+91", "name": "##", "phoneNumber": "9115886693"}}, {"amount": 50, "user": {"_id": "665d727f11d48ac43518d5a0", "countryCode": "+91", "name": "You", "phoneNumber": "9140062947"}}]

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
                        })
                        .then(() => {
                            console.log('synced ---  ', activity);
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
                    break;
                case 'chat':
                    await apiHelper
                        .post(`/group/${activity.group}/chat`, {
                            message: activity.relatedId.message,
                            activityId: activity._id,
                        })
                        .then(() => {
                            console.log('synced ---  ', activity);
                            // remove from pendingMessages
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
