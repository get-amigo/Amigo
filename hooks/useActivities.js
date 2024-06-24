import { useInfiniteQuery } from '@tanstack/react-query';
import apiHelper from '../helper/apiHelper';
import { useGroup } from '../context/GroupContext';

import useGroupActivitiesStore from '../stores/groupActivitiesStore';
import { useCallback, useEffect, useRef, useState } from 'react';

const useActivities = () => {
    const { group } = useGroup();

    const fetchSize = 11;

    const viewedItemCountRef = useRef(0);
    const viewedItems = useRef(new Set());
    const [shouldFetch, setShouldFetch] = useState(false);

    const isActivityAvailable = useGroupActivitiesStore((state) => state.isActivityAvailable);
    const addOldActivitiesToLocalDB = useGroupActivitiesStore((state) => state.addOldActivitiesToLocalDB);

    const handleItemLayout = useCallback(
        (itemKey) => {
            // console.log('viewedItemCountRef---------------- ', viewedItemCountRef);
            if (!viewedItems.current.has(itemKey)) {
                viewedItems.current.add(itemKey);
                viewedItemCountRef.current += 1;

                if (viewedItemCountRef.current === fetchSize - 1) {
                    console.log(`User has viewed ${fetchSize - 1} items!`);
                    setShouldFetch(true);
                    viewedItemCountRef.current = 0;
                    viewedItems.current.clear();
                }
            }
        },
        [viewedItems],
    );

    const fetchActivities = async ({ pageParam = null }) => {
        console.log('in fetch offset', pageParam);

        let data;
        setShouldFetch(false);
        if (!pageParam) {
            const res = await apiHelper(`/activity-feed?groupId=${group._id}&size=${fetchSize}`);
            data = res.data;
        } else {
            const res = await apiHelper(`/activity-feed?groupId=${group._id}&lastActivityTime=${pageParam}&size=${fetchSize}`);
            data = res.data;
        }

        console.log('fetched');

        const messagesToStore = data.slice(0, 10);

        addOldActivitiesToLocalDB(messagesToStore);

        return data;
    };

    const { fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
        queryKey: [group._id],
        queryFn: fetchActivities,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage?.length < fetchSize) {
                console.log('Last page or fewer than 11 messages');
                return undefined;
            }

            const lastMessage = lastPage[fetchSize - 1];
            if (isActivityAvailable(lastMessage._id, lastMessage.group)) {
                console.log(fetchSize, 'th message already stored');
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
        handleItemLayout,
        shouldFetch,
    };
};

export default useActivities;
