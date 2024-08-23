import React from 'react';
import { ScrollView } from 'react-native';

import GroupSelectCard from '../components/GroupSelectCard';
import UserAvatar from '../components/UserAvatar';
import { useTransaction } from '../context/TransactionContext';

function GroupListScreen({ navigation }) {
    const { setTransactionData, transactionData } = useTransaction();
    return (
        <ScrollView alwaysBounceVertical={false}>
            {transactionData.group.members.map((member, index) => (
                <GroupSelectCard
                    name={member.name ? member.name : member.phoneNumber}

                    onPress={() => {
                        setTransactionData((prev) => ({
                            ...prev,
                            paidBy: member,
                        }));
                        navigation.goBack();
                    }}
                    image={<UserAvatar user={member} />}
                    key={index}
                />
            ))}
        </ScrollView>
    );
}

export default GroupListScreen;
