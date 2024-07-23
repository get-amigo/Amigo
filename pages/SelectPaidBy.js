import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import GroupSelectCard from '../components/GroupSelectCard';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import { useTransaction } from '../context/TransactionContext';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';

function GroupListScreen({ navigation }) {
    const { setTransactionData, transactionData } = useTransaction();
    return (
        <ScrollView alwaysBounceVertical={false}>
            {transactionData.group.members.map((member) => (
                <GroupSelectCard
                    name={member.name}
                    onPress={() => {
                        setTransactionData((prev) => ({
                            ...prev,
                            paidBy: member,
                        }));
                        navigation.goBack();
                    }}
                    image={<UserAvatar user={member} />}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: getFontSizeByWindowWidth(19),
        color: COLOR.TEXT,
        fontWeight: 'bold',
        padding: calcWidth(3),
        margin: calcHeight(2),
    },
    groupName: {
        fontSize: 16,
        marginVertical: 5, // Add margin for better spacing
    },
    group: {
        flexDirection: 'row',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: calcWidth(5),
        borderWidth: 1,
        borderColor: COLOR.BUTTON,
        borderRadius: 10,
        margin: calcHeight(2),
        marginBottom: calcHeight(5),
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: 'white',
    },
});

export default GroupListScreen;
