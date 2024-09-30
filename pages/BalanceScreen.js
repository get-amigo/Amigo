import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import NoBalance from '../assets/NoBalance.png';
import ScanIcon from '../assets/icons/scan.png';
import EmptyScreen from '../components/EmptyScreen';
import FabIcon from '../components/FabIcon';
import GroupBalanceCard from '../components/GroupBalanceCard';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import { useBalance } from '../stores/balance';

const headerIconSize = calcHeight(1);

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

export default BalanceScreen;
