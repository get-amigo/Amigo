import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import Loader from '../components/Loader'; // Assuming you have a Loader component
import PAGES from '../constants/pages'; // Ensure you have the relevant pages constant
import apiHelper from '../helper/apiHelper'; // And the apiHelper for your API calls
import Toast from 'react-native-root-toast';

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
            const { data } = await apiHelper.post(`group/${groupId}/join`);
            Toast.show(`Joined ${data?.name}`, {
                duration: Toast.durations.LONG,
            });
        } catch (e) {
            Toast.show('Already in the group', {
                duration: Toast.durations.LONG,
            });
        }

        navigation.navigate(PAGES.TAB_NAVIGATOR, {
            screen: PAGES.GROUP_LIST,
        });
    };

    return <Loader />;
};

export default InvitationLandingScreen;
