import { useInfiniteQuery } from '@tanstack/react-query';
import apiHelper from '../helper/apiHelper';
import { useGroup } from '../context/GroupContext';

import useGroupActivitiesStore from '../stores/groupActivitiesStore';

const useActivities = () => {
    const { group } = useGroup();

    const fetchSize = 11;

    const isActivityAvailable = useGroupActivitiesStore((state) => state.isActivityAvailable);
    const addOldActivitiesToLocalDB = useGroupActivitiesStore((state) => state.addOldActivitiesToLocalDB);

    const fetchActivities = async ({ pageParam = null }) => {
        console.log('in fetch offset', pageParam);

        let data;

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

    return useInfiniteQuery({
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
};

export default useActivities;
