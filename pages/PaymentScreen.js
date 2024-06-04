import { AntDesign } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
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
import { SafeAreaView } from 'react-native-safe-area-context';

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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            enabled
            keyboardVerticalOffset={calcHeight(10)}
        >
            <SafeAreaView style={styles.container}>
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
                            style={styles.description}
                            onChangeText={(text) => {
                                const remaining = 100 - text.length;
                                setRemainingChars(remaining >= 0 ? remaining : 0);
                                setDescription(text.slice(0, 100));
                            }}
                            value={description}
                            placeholder="Description"
                            placeholderTextColor="#ccc"
                            ref={descriptionRef}
                            textAlign="center"
                            multiline={true}
                            numberOfLines={4}
                        />
                    </Pressable>
                    <Text style={styles.remainingCharacter}>{remainingChars} left</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', marginBottom: calcHeight(2) }}>
                    <Button onPress={submitPayment} title="Record as Cash Payment" />
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
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
        flex: 1,
        color: 'white',
    },
    descriptionContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        width: calcWidth(30),
        marginTop: calcHeight(1),
    },
    remainingCharacter: {
        paddingTop: calcHeight(1),
        color: COLOR.BUTTON,
    },
});

export default GroupScreen;
