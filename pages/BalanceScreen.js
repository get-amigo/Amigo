import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import NoBalance from '../assets/NoBalance.png';
import draftIcon from '../assets/icons/draftIcon.png';
import ScanIcon from '../assets/icons/scan.png';
import EmptyScreen from '../components/EmptyScreen';
import FabIcon from '../components/FabIcon';
import GroupBalanceCard from '../components/GroupBalanceCard';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import { useBalance } from '../stores/balance';
import useDraftTransactionStore from '../stores/draftTransactionStore';
import useFocusThrottledFetch from '../hooks/useFocusThrottledFetch';

const headerIconSize = calcHeight(1);

function BalanceScreen({ navigation }) {
    const { user } = useAuth();
    const { fetchData, loading, totalBalances, balances } = useBalance();
    const [refreshing, setRefreshing] = useState(false);
    const [drafts, setDrafts] = useState([]);
    const [loadingDrafts, setLoadingDrafts] = useState(true);
    const { getDraftsForUser } = useDraftTransactionStore();

    useFocusThrottledFetch(() => {
            const loadData = async () => {
                setLoadingDrafts(true);
                await fetchData(user);
                const draftsData = getDraftsForUser(user._id);
                setDrafts(draftsData);
                setLoadingDrafts(false);
            };
           , 800);


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData(user);
        const draftsData = getDraftsForUser(user._id);
        setDrafts(draftsData);
        setRefreshing(false);
    }, [user]);

    if (loading || loadingDrafts)
        return (
            <>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: calcWidth(headerIconSize),
                    }}
                >
                    <Pressable onPress={() => navigation.navigate(PAGES.SCANNER)}>
                        <Image
                            source={ScanIcon}
                            style={{
                                width: calcWidth(headerIconSize),
                                height: calcWidth(headerIconSize),
                            }}
                        />
                    </Pressable>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                navigation.navigate(PAGES.ACCOUNT);
                            }}
                        >
                            <UserAvatar user={user} size={4} />
                        </Pressable>
                    </View>
                </View>
                <View
                    style={{
                        padding: calcWidth(2),
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            backgroundColor: COLOR.SKELETON_MASK_COLOR,
                            padding: calcHeight(2),
                            borderRadius: 10,
                            justifyContent: 'space-between',
                            marginTop: calcHeight(1),
                        }}
                    >
                        <Text
                            style={{
                                color: COLOR.TEXT,
                                fontWeight: 'bold',
                            }}
                        />
                        <Text
                            style={{
                                color: COLOR.TEXT,
                                fontWeight: 'bold',
                            }}
                        />
                    </View>
                </View>
                <FlatList
                    data={[{}, {}, {}]}
                    renderItem={({ item }) => <GroupBalanceCard group={item} loading />}
                    style={{
                        marginTop: calcHeight(5),
                    }}
                />
            </>
        );

    return (
        <View style={{ flex: 1 }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginHorizontal: calcWidth(headerIconSize),
                    marginVertical: calcWidth(3),
                }}
            >
                <Pressable onPress={() => navigation.navigate(PAGES.SCANNER)}>
                    <Image
                        source={ScanIcon}
                        style={{
                            width: calcWidth(headerIconSize),
                            height: calcWidth(headerIconSize),
                        }}
                    />
                </Pressable>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: calcWidth(4),
                    }}
                >
                    {drafts && drafts.length > 0 && (
                        <View style={styles.draftIconContainer}>
                            <Pressable
                                onPress={() => {
                                    navigation.navigate(PAGES.DRAFT_LIST);
                                }}
                                style={styles.draftIcon}
                            >
                                <Image source={draftIcon} />
                            </Pressable>
                            <Text style={styles.draftCount}>{drafts.length}</Text>
                        </View>
                    )}
                    <Pressable
                        onPress={() => {
                            navigation.navigate(PAGES.ACCOUNT);
                        }}
                    >
                        <UserAvatar user={user} size={4} />
                    </Pressable>
                </View>
            </View>
            <View
                style={{
                    padding: calcWidth(2),
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        backgroundColor: COLOR.BUTTON,
                        padding: calcHeight(2),
                        borderRadius: 10,
                        justifyContent: 'space-between',
                        marginTop: calcHeight(1),
                    }}
                >
                    <Text
                        style={{
                            color: COLOR.TEXT,
                            fontWeight: 'bold',
                        }}
                    >
                        Total Balance
                    </Text>
                    <Text
                        style={{
                            color: COLOR.TEXT,
                            fontWeight: 'bold',
                        }}
                    >
                        ₹ {totalBalances}
                    </Text>
                </View>
            </View>
            {balances && balances.length == 0 ? (
                <EmptyScreen
                    onPress={() => {
                        navigation.navigate(PAGES.ADD_TRANSACTION);
                    }}
                    image={NoBalance}
                    title="No Transactions Yet"
                />
            ) : (
                <FlatList
                    data={balances}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <GroupBalanceCard group={item} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLOR.REFRESH_INDICATOR_ARROW]}
                            tintColor={COLOR.REFRESH_INDICATOR_COLOR_IOS}
                            progressBackgroundColor={COLOR.REFRESH_INDICATOR_BACKGROUND}
                        />
                    }
                />
            )}
            {balances && balances.length != 0 && (
                <FabIcon
                    onPress={() => {
                        navigation.navigate(PAGES.ADD_TRANSACTION);
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    draftIcon: {
        borderWidth: calcWidth(0.48),
        borderRadius: calcWidth(100),
        borderColor: COLOR.PRIMARY,
        paddingVertical: calcWidth(1.4),
        paddingHorizontal: calcWidth(1.76),
    },
    draftIconContainer: {
        position: 'relative',
    },
    draftCount: {
        position: 'absolute',
        top: calcHeight(-0.8),
        left: calcWidth(5.6),
        backgroundColor: COLOR.BUTTON,
        color: COLOR.PRIMARY,
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: calcWidth(100),
        fontSize: getFontSizeByWindowWidth(10),
        paddingHorizontal: calcWidth(1.6),
    },
});

export default BalanceScreen;
