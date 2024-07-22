import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, RefreshControl } from 'react-native';
import apiHelper from '../helper/apiHelper';
import PAGES from '../constants/pages';
import FabIcon from '../components/FabIcon';
import { useFocusEffect } from '@react-navigation/native';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import EmptyScreen from '../components/EmptyScreen';
import NoBalance from '../assets/NoBalance.png';
import GroupBalanceCard from '../components/GroupBalanceCard';
import { useAuth } from '../stores/auth';
import ScanIcon from '../assets/icons/scan.png';
import UserAvatar from '../components/UserAvatar';
const headerIconSize = calcHeight(1);
import NetInfo from '@react-native-community/netinfo';
import groupBalancesAndCalculateTotal from '../utility/groupBalancesAndCalculateTotal';
import { useBalance } from '../stores/balance';
import safeAreaStyle from '../constants/safeAreaStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

function BalanceScreen({ navigation }) {
    const { user } = useAuth();
    const { fetchData, loading, totalBalances, balances } = useBalance();
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchData(user);
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData(user);
        setRefreshing(false);
    }, [user]);

    if (loading)
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
                        ></Text>
                        <Text
                            style={{
                                color: COLOR.TEXT,
                                fontWeight: 'bold',
                            }}
                        ></Text>
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
        <SafeAreaView style={safeAreaStyle}>
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
                    style={{
                        marginTop: calcHeight(5),
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLOR.REFRESH_INDICATOR_ARROW]}
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
        </SafeAreaView>
    );
}

export default BalanceScreen;
