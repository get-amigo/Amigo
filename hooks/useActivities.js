import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import { useGroup } from '../context/GroupContext';
import apiHelper from '../helper/apiHelper';
import useGroupActivitiesStore from '../stores/groupActivitiesStore';

const useActivities = () => {
    const { group } = useGroup();

    const fetchSize = 11;

    const viewedItemCountRef = useRef(0);
    const viewedItems = useRef(new Set());
    const [shouldFetch, setShouldFetch] = useState(false);

    const isActivityAvailable = useGroupActivitiesStore((state) => state.isActivityAvailable);
    const addOldActivitiesToLocalDB = useGroupActivitiesStore((state) => state.addOldActivitiesToLocalDB);

    const trackViewedItem = useCallback(
        (itemKey) => {
            if (!viewedItems.current.has(itemKey)) {
                viewedItems.current.add(itemKey);
                viewedItemCountRef.current += 1;

                if (viewedItemCountRef.current === fetchSize - 1) {
                    setShouldFetch(true);
                    viewedItemCountRef.current = 0;
                    viewedItems.current.clear();
                }
            }
        },
        [viewedItems],
    );

    const fetchActivities = async ({ pageParam = null }) => {
        let data;
        setShouldFetch(false);
        if (!pageParam) {
            const res = await apiHelper(`/activity-feed?groupId=${group._id}&size=${fetchSize}`);
            data = res.data;
        } else {
            const res = await apiHelper(`/activity-feed?groupId=${group._id}&lastActivityTime=${pageParam}&size=${fetchSize}`);
            data = res.data;
        }

        const messagesToStore = data.slice(0, 10);

        addOldActivitiesToLocalDB(messagesToStore);

        return data;
    };

    const { fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
        queryKey: [group._id],
        queryFn: fetchActivities,
        getNextPageParam: (lastPage) => {
            if (lastPage?.length < fetchSize) {
                return undefined;
            }

            const lastMessage = lastPage[fetchSize - 1];
            if (isActivityAvailable({ activityId: lastMessage._id, groupId: lastMessage.group })) {
                return undefined;
            }
            const secondLastMessage = lastPage[fetchSize - 2];
            return secondLastMessage.createdAt;
        },
    });

    return {
        fetchNextPage,
        hasNextPage,
        isLoading,
        trackViewedItem,
        shouldFetch,
    };
};

export default useActivities;
