import { AntDesign } from '@expo/vector-icons';
import React, { useState, useRef} from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Toast from 'react-native-root-toast';
import AmountInput from '../components/AmountInput';
import Loader from '../components/Loader';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import apiHelper from '../helper/apiHelper';
import checkConnectivity from '../helper/getNetworkStateAsync';
import offlineMessage from '../helper/offlineMessage';
import { calcHeight ,calcWidth,} from '../helper/res';
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
        if (!description) {
            Alert.alert('Please Enter Description');
            return;
        }
        if (!amount || parseFloat(amount) === 0) {
            Alert.alert('Please Enter Correct Amount');
            return;
        }
        const isOnline = await checkConnectivity();
        if (!isOnline) {
            offlineMessage();
            return;
        }
        if (amount <= 0) {
            Alert.alert('Amount cannot be 0.');
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
            alert('Amount cannot be empty.');
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
                <ScrollView style={{ flex: 1 }} keyboardDismissMode="none" keyboardShouldPersistTaps="always">
                    <View style={styles.header}>
                        <View style={styles.headerItem}>
                            <UserAvatar user={payment.from} />
                            <Text style={{ color: COLOR.TEXT, fontWeight: 'bold', marginTop: calcHeight(2) }}>
                                {sliceText(payment.from.name, 10)}
                            </Text>
                        </View>
                        <View style={{ ...styles.headerItem,...styles.payingTo}}>
                            <Text style={{ color:COLOR.SECONDARY_BORDER_COLOR }}>Paying To</Text>
                            <AntDesign style={styles.rightArrow} name="arrowright" size={24} color="white" />
                        </View>
                        <View style={styles.headerItem}>
                            <UserAvatar user={payment.to} />
                            <Text style={{ color: COLOR.TEXT, fontWeight: 'bold', marginTop: calcHeight(2) }}>
                                {sliceText(payment.to.name, 10)}
                            </Text>
                        </View>
                    </View>
                    <AmountInput
                        amount={amount}
                        handleInputChange={(text) => setAmount(text)}
                        isTextInput
                        onSubmitEditing={() => descriptionRef.current.focus()}
                    />
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
                                maxLength={25}
                                onSubmitEditing={submitPayment}
                            />
                        </Pressable>
                        <Text style={styles.remainingCharacter}>{remainingChars} left</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container:{
        flex:1
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
        color: 'white',
    },
    descriptionContainer: {
        padding: calcWidth(2.2),
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        maxWidth: calcWidth(80),
        maxHeight: calcWidth(20),
        marginTop: calcWidth(2),
    },
    payingTo:{
        justifyContent: 'flex-end', 
        marginTop: calcHeight(1.7) 
    },
    remainingCharacter: {
        paddingTop: calcHeight(1),
        color: COLOR.BUTTON,
    },
    rightArrow:{
        marginTop: calcHeight(3)
    },
});

export default GroupScreen;
