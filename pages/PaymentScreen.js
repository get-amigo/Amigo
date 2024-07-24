import { AntDesign } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-root-toast';

import AmountInput from '../components/AmountInput';
import Button from '../components/Button';
import Loader from '../components/Loader';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import apiHelper from '../helper/apiHelper';
import checkConnectivity from '../helper/getNetworkStateAsync';
import offlineMessage from '../helper/offlineMessage';
import { calcHeight, calcWidth } from '../helper/res';
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
        if (amount <= 0) {
            Alert.alert('Alert', 'Amount cannot be 0.');
            return;
        }
        setIsLoading(true);
        try {
            await apiHelper.post('/payment', {
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
        } catch {
            setIsLoading(false);
            Alert.alert('Alert', 'Amount cannot be empty.');
        }
    }

    if (isLoading) return <Loader />;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.fullHeight}
            enabled
            keyboardVerticalOffset={calcHeight(10)}
        >
            <ScrollView style={styles.fullHeight}>
                <View style={styles.header}>
                    <View style={styles.headerItem}>
                        <UserAvatar user={payment.from} />
                        <Text style={styles.paymentPersonName}>{sliceText(payment.from.name, 10)}</Text>
                    </View>
                    <View style={styles.payingToContainer}>
                        <Text style={styles.payingToText}>Paying To</Text>
                        <AntDesign style={styles.arrow} name="arrowright" size={24} color="white" />
                    </View>
                    <View style={styles.headerItem}>
                        <UserAvatar user={payment.to} />
                        <Text style={styles.paymentPersonName}>{sliceText(payment.to.name, 10)}</Text>
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
                            multiline
                            maxLength={100}
                            scrollEnabled
                            ref={descriptionRef}
                            style={styles.description}
                        />
                    </Pressable>
                    <Text style={styles.remainingCharacter}>{remainingChars} left</Text>
                </View>
                <View style={styles.buttonContainer}>
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
    fullHeight: {
        flex: 1,
    },
    paymentPersonName: {
        color: COLOR.TEXT,
        fontWeight: 'bold',
        marginTop: calcHeight(2),
    },
    payingToContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: calcHeight(1.7),
    },
    payingToText: {
        color: COLOR.LIGHT_GRAY,
    },
    arrow: {
        marginTop: calcHeight(3),
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: calcWidth(10),
    },
});

export default GroupScreen;
