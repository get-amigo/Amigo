import { AntDesign } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Toast from 'react-native-root-toast';

import AmountInput from '../components/AmountInput';
import Button from '../components/Button';
import GroupIcon from '../components/GroupIcon';
import Loader from '../components/Loader';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import apiHelper from '../helper/apiHelper';
import checkConnectivity from '../helper/getNetworkStateAsync';
import offlineMessage from '../helper/offlineMessage';
import { calcHeight, getFontSizeByWindowWidth, calcWidth, deviceHeight } from '../helper/res';
import sliceText from '../helper/sliceText';

function GroupScreen({
    route: {
        params: { payment },
    },
    navigation,
}) {
    const [amount, setAmount] = useState(payment.amount + '');
    const [description, setDescription] = useState('');
    const [remainingChars, setRemainingChars] = useState(100);

    const descriptionRef = useRef();
    const [isLoading, setIsLoading] = useState(false);

    async function submitPayment() {
        const isOnline = await checkConnectivity();
        if (!isOnline) {
            offlineMessage();
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await apiHelper.post('/payment', {
                payer: payment.from._id || payment.from.id,
                receiver: payment.to._id || payment.to.id,
                group: payment.group,
                amount,
                description,
            });
            Toast.show('Payment Added', {
                duration: Toast.durations.LONG,
            });
            setIsLoading(false);
            navigation.navigate(PAGES.BALANCE);
        } catch (e) {
            setIsLoading(false);
            alert(e);
        }
    }

    if (isLoading) return <Loader />;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
            enabled
            keyboardVerticalOffset={calcHeight(10)}
        >
            <ScrollView
                style={{
                    flex: 1,
                }}
            >
                <View style={styles.header}>
                    <View style={styles.headerItem}>
                        <UserAvatar user={payment.from} />
                        <Text style={{ color: COLOR.TEXT, fontWeight: 'bold', marginTop: calcHeight(2) }}>
                            {sliceText(payment.from.name, 10)}
                        </Text>
                    </View>
                    <View style={{ ...styles.headerItem, justifyContent: 'flex-end', marginTop: calcHeight(1.7) }}>
                        <Text style={{ color: '#D9D9D9' }}>Paying To</Text>
                        <AntDesign style={{ marginTop: calcHeight(3) }} name="arrowright" size={24} color="white" />
                    </View>
                    <View style={styles.headerItem}>
                        <UserAvatar user={payment.to} />
                        <Text style={{ color: COLOR.TEXT, fontWeight: 'bold', marginTop: calcHeight(2) }}>
                            {sliceText(payment.to.name, 10)}
                        </Text>
                    </View>
                </View>
                <AmountInput amount={amount} handleInputChange={(text) => setAmount(text)} isTextInput />
                <View style={styles.rowCentered}>
                    <Pressable style={styles.descriptionContainer} onPress={() => descriptionRef.current.focus()}>
                        <TextInput
                            onChangeText={(text) => {
                                const remaining = 100 - text.length;
                                setRemainingChars(remaining >= 0 ? remaining : 0);
                                setDescription(text.slice(0, 100));
                            }}
                            value={description}
                            placeholder="Description"
                            placeholderTextColor="gray"
                            textAlign={description?.length === 0 ? 'left' : 'center'}
                            multiline={true}
                            maxLength={100}
                            scrollEnabled
                            ref={descriptionRef}
                            style={styles.description}
                        />
                    </Pressable>
                    <Text style={styles.remainingCharacter}>{remainingChars} left</Text>
                </View>
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginBottom: calcWidth(10),
                    }}
                >
                    <Button onPress={submitPayment} title="Record as Cash Payment" />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: calcHeight(5),
    },
    headerItem: {
        alignItems: 'center',
    },
    rowCentered: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    description: {
        color: 'white',
        paddingHorizontal: calcWidth(3),
    },
    descriptionContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        padding: calcWidth(3),
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        minWidth: calcWidth(30),
        maxWidth: calcWidth(65),
        maxHeight: calcWidth(25),
        justifyContent: 'center',
        alignItems: 'center',
    },
    remainingCharacter: {
        paddingTop: calcHeight(1),
        color: COLOR.BUTTON,
    },
});

export default GroupScreen;
