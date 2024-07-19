// React Native Components and Utilities
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, Pressable, TouchableOpacity } from 'react-native';

// Custom Components and Utility Functions
import GroupIcon from '../components/GroupIcon';
import { getCategoryIcon } from '../constants/Categories';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import apiHelper from '../helper/apiHelper';
import convertISODateToCustomFormat from '../helper/convertISODateToCustomFormat'; // Assuming you move this function to a utils.js file
import editNames from '../helper/editNames';
import getNamesFromContacts from '../helper/getNamesFromContacts';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import { useAuth } from '../stores/auth';
// ExpenseCard Component
function ExpenseCard({ item, loading }) {
    if (loading) {
        return (
            <View style={styles.cardContainer}>
                <View style={styles.cardInnerContainer}>
                    <GroupIcon size={5} />
                    <View style={styles.textContainer}>
                        <Text
                            style={[
                                styles.descriptionText,
                                {
                                    backgroundColor: COLOR.SKELETON_MASK_COLOR,
                                    width: calcWidth(30),
                                    borderRadius: 10,
                                },
                            ]}
                        >
                            {/* Adjust the value (10) to your desired border radius */}
                        </Text>
                        <Text
                            style={[
                                styles.groupText,
                                {
                                    backgroundColor: COLOR.SKELETON_MASK_COLOR,
                                    width: calcWidth(50),
                                    borderRadius: 10,
                                },
                            ]}
                        />
                        <Text style={[styles.dateText, { opacity: 0 }]}>Ramdom</Text>
                    </View>
                </View>
            </View>
        );
    }

    const navigation = useNavigation();
    const { user } = useAuth();

    async function onClick() {
        const { data } = await apiHelper.get(`/transaction/${item.id}`);
        const contacts = await getNamesFromContacts();
        editNames([data.creator, data.paidBy], user._id, contacts);
        editNames([data.splitAmong[0].user], user._id, contacts);
        for (let i = 0; i < data.splitAmong.length; i++) {
            editNames([data.splitAmong[i].user], user._id, contacts);
        }

        navigation.navigate(PAGES.TRANSACTION_DETAIL, { transaction: data });
    }

    return (
        <Pressable style={styles.cardContainer} onPress={onClick}>
            <View style={styles.cardInnerContainer}>
                <GroupIcon size={5} groupId={item?.group?._id} />
                <View style={styles.textContainer}>
                    <Text style={styles.descriptionText}>{sliceText(item.description, 20)}</Text>
                    <Text style={styles.groupText}>
                        {sliceText(item.category, 25)} {getCategoryIcon(item.category)}
                    </Text>

                    <Text style={styles.dateText}>{convertISODateToCustomFormat(item.date)}</Text>
                </View>
            </View>
            <Text style={styles.amountText}>₹{item.amount}</Text>
        </Pressable>
    );
}

export default ExpenseCard;

// StyleSheet
const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        paddingVertical: calcHeight(1),
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: COLOR.BORDER_COLOR,
        alignItems: 'center',
        paddingHorizontal: calcWidth(5),
    },
    cardInnerContainer: {
        flexDirection: 'row',
        paddingVertical: calcHeight(1),
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    textContainer: {
        gap: calcHeight(1),
        marginLeft: calcWidth(5),
    },
    descriptionText: {
        color: COLOR.BUTTON,
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(15),
    },
    groupText: {
        color: 'white',
    },
    dateText: {
        color: 'white',
        fontSize: getFontSizeByWindowWidth(8),
    },
    amountText: {
        color: 'white',
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
    },
});
