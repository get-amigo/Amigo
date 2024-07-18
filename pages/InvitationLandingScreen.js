import React, { useEffect } from 'react';
import Loader from '../components/Loader'; // Assuming you have a Loader component
import PAGES from '../constants/pages'; // Ensure you have the relevant pages constant
import apiHelper from '../helper/apiHelper'; // And the apiHelper for your API calls

const InvitationLandingScreen = ({
    navigation,
    route: {
        params: { groupId },
    },
}) => {
    useEffect(() => {
        handleJoin();
    }, [groupId]);

    const handleJoin = async () => {
        try {
            await apiHelper.post(`group/${groupId}/join`);
        } catch (e) {}
        navigation.navigate(PAGES.GROUP_LIST);
    };

    return <Loader />;
};

export default InvitationLandingScreen;
