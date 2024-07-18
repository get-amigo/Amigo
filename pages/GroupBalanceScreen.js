import React from 'react';
import { Text, StyleSheet, View, Pressable, FlatList, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import GroupIcon from '../components/GroupIcon';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import sliceText from '../helper/sliceText';
import Cross from '../assets/icons/cross.png';
import UserAvatar from '../components/UserAvatar';
import safeAreaStyle from '../constants/safeAreaStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

function GroupBalanceScreen({ navigation, route }) {
    const { group } = route.params;
    const { user } = useAuth();

    // Helper function to render list item
    const renderListItem = ({ item }) => {
        const isBorrower = group.totalBalance > 0;
        const balanceColor = group.totalBalance < 0 ? 'red' : '#00C83D';

        const handlePress = () => {
            const payment = {
                group: group._id,
                amount: item.amount,
                from: isBorrower ? item : user,
                to: isBorrower ? user : item,
            };
            navigation.navigate('Payment', { payment });
        };

        return (
            <Pressable onPress={handlePress} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                    <UserAvatar user={item} />
                    <Text style={styles.itemName}>{sliceText(item.name, 10)}</Text>
                </View>
                <View style={styles.listItemRight}>
                    <View style={styles.amountView}>
                        <Text style={[styles.amountText, { color: balanceColor }]}>₹{item.amount}</Text>
                        <Text style={[styles.subAmountText, { color: balanceColor }]}>
                            {group.totalBalance < 0 ? 'you owe' : 'you get back'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={calcHeight(2)} color="white" />
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={safeAreaStyle}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image style={styles.crossIcon} source={Cross} />
                </Pressable>
                <GroupIcon groupId={group._id} />
                <Text style={styles.groupName}>{sliceText(group.name, 25)}</Text>
            </View>
            <View style={styles.balanceInfo}>
                <View style={styles.balanceInfoLeft}>
                    <View
                        style={[
                            styles.indicator,
                            {
                                backgroundColor: group.totalBalance > 0 ? '#00C83D' : 'red',
                            },
                        ]}
                    />
                    <View style={styles.balanceTextContainer}>
                        <Text style={styles.balanceText}>Total Split Balance</Text>
                        <Text style={styles.subBalanceText}>{group.totalBalance < 0 ? 'you owe' : 'you get back'}</Text>
                    </View>
                </View>
                <View style={styles.balanceAmountContainer}>
                    <Text style={styles.balanceAmount}>₹{Math.abs(group.totalBalance)}</Text>
                    <View
                        style={[
                            styles.arrowIconContainer,
                            {
                                backgroundColor: group.totalBalance > 0 ? '#00C83D' : 'red',
                            },
                        ]}
                    >
                        <Feather name={group.totalBalance > 0 ? 'arrow-up-right' : 'arrow-down-left'} size={calcWidth(4)} color="white" />
                    </View>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={group.totalBalance > 0 ? group.borrowers : group.lenders}
                keyExtractor={(item) => item._id}
                renderItem={renderListItem}
                style={styles.list}
            />
        </SafeAreaView>
    );
}

// // StyleSheet
const styles = StyleSheet.create({
    // ... existing styles

    balanceText: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
    },
    subBalanceText: {
        color: '#7F7F7F',
        fontSize: getFontSizeByWindowWidth(10),
    },
    balanceAmount: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
    },
    list: {
        marginTop: calcHeight(2),
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: calcHeight(2),
        marginVertical: calcHeight(0.5),
        padding: calcHeight(2),
        alignItems: 'center',
        backgroundColor: 'rgba(52, 47, 79, 0.53)',
        borderRadius: 10,
    },
    itemName: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
    },
    amountText: {
        fontSize: getFontSizeByWindowWidth(12),
        fontWeight: 'bold',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: calcWidth(5),
        gap: calcWidth(5),
        borderBottomRightRadius: calcWidth(2),
        borderBottomLeftRadius: calcWidth(2),
        backgroundColor: '#31254D',
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: calcWidth(5), // Adjust as needed
    },
    listItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: calcWidth(5),
    },
    amountView: {
        alignItems: 'center',
    },
    subAmountText: {
        fontSize: getFontSizeByWindowWidth(8),
    },
    crossIcon: {
        height: calcHeight(3),
        width: calcHeight(3),
    },
    balanceInfoLeft: {
        flexDirection: 'row',
    },
    indicator: {
        width: calcWidth(1),
        borderTopRightRadius: calcWidth(3),
        borderBottomRightRadius: calcWidth(3),
        flex: 1,
    },
    balanceTextContainer: {
        marginLeft: calcHeight(3),
    },
    balanceAmountContainer: {
        marginRight: calcWidth(5),
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowIconContainer: {
        marginLeft: calcWidth(2),
        padding: calcWidth(0.1),
        backgroundColor: '#00C83D',
        borderRadius: calcWidth(2),
    },
    groupName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(15),
    },
    balanceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: calcHeight(3),
        backgroundColor: 'rgba(33, 24, 45, 0.58)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
});

export default GroupBalanceScreen;
