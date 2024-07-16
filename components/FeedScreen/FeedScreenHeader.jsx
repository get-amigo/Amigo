import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import PAGES from '../../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../../helper/res';
import GroupIcon from '../GroupIcon';
import { useGroup } from '../../context/GroupContext';
import COLOR from '../../constants/Colors';
import sliceText from '../../helper/sliceText';
import getMembersString from '../../utility/getMembersString';
import ScannerIcon from '../../assets/icons/scanner.png';
import { useTransaction } from '../../context/TransactionContext';
import { AntDesign } from '@expo/vector-icons';

const FeedScreenHeader = ({ totalBalance }) => {
    const navigation = useNavigation();
    const { group } = useGroup();
    const { setTransactionData } = useTransaction();
    return (
        <Pressable
            style={styles.header}
            onPress={() => {
                navigation.navigate(PAGES.GROUP_SETTINGS, {
                    balance: totalBalance != 0,
                });
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: calcWidth(5),
                }}
            >
                <Pressable onPress={() => navigation.goBack()} style={{ marginLeft: 4 }}>
                    <AntDesign name="arrowleft" size={calcHeight(3)} color="white" />
                </Pressable>
                <GroupIcon groupId={group._id} />
                <View>
                    <Text style={styles.groupName}>{sliceText(group.name, 25)}</Text>
                    <Text style={styles.groupMembers}>{getMembersString(group.members, 20)}</Text>
                </View>
            </View>
            <Pressable
                onPress={() => {
                    setTransactionData((prev) => ({
                        ...prev,
                        group,
                    }));
                    navigation.navigate(PAGES.SCANNER);
                }}
            >
                <Image
                    source={ScannerIcon}
                    style={{
                        width: calcHeight(3),
                        height: calcHeight(3),
                        marginRight: calcWidth(5),
                    }}
                />
            </Pressable>
        </Pressable>
    );
};

export default FeedScreenHeader;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: calcHeight(2.1),
        backgroundColor: COLOR.APP_BACKGROUND,
        shadowRadius: 0.5,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowColor: '#000000',
        elevation: 2,
        paddingLeft: calcWidth(3),
    },
    groupName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(12),
    },
    groupMembers: {
        color: '#A5A5A5',
        fontSize: getFontSizeByWindowWidth(11),
    },
});
