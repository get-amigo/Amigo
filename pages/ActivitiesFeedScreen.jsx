import React, { useCallback, useEffect, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BalanceGroupPin from '../components/BalanceGroupPin';
import FeedScreenHeader from '../components/FeedScreen/FeedScreenHeader';
import FeedsContainer from '../components/FeedScreen/FeedsContainer';
import MessageComposer from '../components/FeedScreen/MessageComposer';
import safeAreaStyle from '../constants/safeAreaStyle';
import { useGroup } from '../context/GroupContext';
import apiHelper from '../helper/apiHelper';
import { calcWidth } from '../helper/res';
import useNetwork from '../hooks/useNetwork';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../stores/auth';
import useGroupActivitiesStore from '../stores/groupActivitiesStore';
import groupBalancesAndCalculateTotal from '../utility/groupBalancesAndCalculateTotal';

const ActivitiesFeedScreen = ({ route }) => {
    const { group } = useGroup();
    const { user } = useAuth();
    const isConnected = useNetwork();

    const [totalBalance, setTotalBalance] = useState();
    const [balances, setBalances] = useState();
    const { chatData } = route?.params || {};

    // activity store
    const activities = useGroupActivitiesStore((state) => state.activities[group._id]?.activitiesById || {});
    const addActivityToLocalDB = useGroupActivitiesStore((state) => state.addActivityToLocalDB);
    const syncAllPendingActivities = useGroupActivitiesStore((state) => state.syncAllPendingActivities);

    useEffect(() => {
        async function fetchBalance() {
            try {
                const { data } = await apiHelper(`/balance/${group._id}`);
                if (data.length === 0) {
                    setTotalBalance(0);
                    return;
                }

                const { groups } = await groupBalancesAndCalculateTotal(data, user._id);
                setTotalBalance(groups[0].totalBalance);
                setBalances(groups[0]);
            } catch (error) {
                console.error(error);
            }
        }

        if (group._id) {
            fetchBalance();
        }
    }, [activities]);

    const fetchActivity = useCallback(async (activity) => {
        if (activity.creator._id !== user._id) {
            addActivityToLocalDB(activity, activity.group, user, true);
        }
    }, []);

    useSocket('activity created', fetchActivity);

    useEffect(() => {
        async function f() {
            if (isConnected) {
                syncAllPendingActivities();
            }
        }
        f();
    }, [isConnected]);

    return (
        <SafeAreaView style={safeAreaStyle}>
            <ImageBackground
                source={require('../assets/chatBackground_new.png')}
                style={{
                    width: calcWidth(100),
                    height: '100%',
                    marginTop: StatusBar.currentHeight,
                    position: 'absolute',
                }}
            />
            <KeyboardAvoidingView
                style={{
                    flex: 1,
                }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={40}
            >
                <FeedScreenHeader totalBalance={totalBalance} />

                <BalanceGroupPin totalBalance={totalBalance} balances={balances} />

                <FeedsContainer />

                <MessageComposer chatData={chatData} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ActivitiesFeedScreen;
