import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MESSAGE_COMPOSER_PADDING } from '../../constants/constants';
import PAGES from '../../constants/pages';
import { useGroup } from '../../context/GroupContext';
import { useTransaction } from '../../context/TransactionContext';
import apiHelper from '../../helper/apiHelper';
import { calcWidth, getFontSizeByWindowWidth } from '../../helper/res';
import useNetwork from '../../hooks/useNetwork';
import { useAuth } from '../../stores/auth';
import useGroupActivitiesStore from '../../stores/groupActivitiesStore';

const MessageComposer = ({ chatData, activityId }) => {
    const insets = useSafeAreaInsets();
    const { group } = useGroup();
    const { user } = useAuth();
    const { setTransactionData, resetTransaction } = useTransaction();
    const isConnected = useNetwork();
    const navigation = useNavigation();

    const [isExpenseBtnVisible, setIsExpenseBtnVisible] = useState(true);
    const [isSendBtnVisible, setIsSendBtnVisible] = useState(false);
    const [text, setText] = useState('');
    const [editing, setEditing] = useState(false);

    const addActivityToLocalDB = useGroupActivitiesStore((state) => state.addActivityToLocalDB);
    const updateIsSynced = useGroupActivitiesStore((state) => state.updateIsSynced);
    const updateChat = useGroupActivitiesStore((state) => state.updateChat);

    useEffect(() => {
        if (chatData) {
            setText(chatData.message);
            setEditing(true);
            console.log('chat', chatData);
        } else {
            setEditing(false);
        }
    }, [chatData]);

    const handleTextInputAndToggleExpenseButton = useCallback((text) => {
        if (text.length === 0) {
            setIsExpenseBtnVisible(false);
            setIsSendBtnVisible(false);
        } else if (!isNaN(text) && Number(text) > 0) {
            setIsExpenseBtnVisible(true);
            setIsSendBtnVisible(true);
        } else {
            setIsExpenseBtnVisible(false);
            setIsSendBtnVisible(true);
        }
        setText(text);
    }, []);

    const sendChatMessage = async (message) => {
        if (message.replace(/^\s+|\s+$/g, '') === '') {
            return;
        }
        const currentTime = new Date().toISOString();
        try {
            if (isConnected) {
                if (editing) {
                    await apiHelper.patch(`/chat/${chatData._id}`, {
                        message,
                        updatedAt: currentTime,
                    });
                    updateIsSynced({
                        _id: chatData._id,
                        group: group._id,
                    });
                    updateChat(activityId, group._id, message);
                } else {
                    const { activityId, relatedId } = addActivityToLocalDB(
                        { activityType: 'chat', relatedId: { message } },
                        group._id,
                        user,
                        false,
                        false,
                    );
                    await apiHelper.post(`/group/${group._id}/chat`, {
                        message,
                        activityId,
                        chatId: relatedId,
                    });
                    updateIsSynced({
                        _id: activityId,
                        group: group._id,
                    });

                }
            } else {
                // No network connection
                addActivityToLocalDB({ activityType: 'chat', relatedId: { message } }, group._id, user, false, false);
                console.warn('No network connection. Activity saved locally.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setText('');
            setEditing(false);
        }
    };

    return (
        <View style={{ marginTop: calcWidth(2) }}>
            {/* <View style={styles.payContainer}>
                **** will be required when we add "Pay to XYZ rs. 500 feature" ****
                <Pressable style={styles.payBtn}>
                    <Text
                        style={{
                            color: 'white',
                            fontSize: getFontSizeByWindowWidth(10.7),
                            fontWeight: '600',
                        }}
                    >
                        Pay Binny ₹100
                    </Text>
                </Pressable>
            </View> */}
            <View
                style={[
                    styles.bottomContainer,
                    {
                        paddingHorizontal: calcWidth(2.8),
                        paddingTop: MESSAGE_COMPOSER_PADDING,
                        paddingBottom: MESSAGE_COMPOSER_PADDING > insets.bottom ? MESSAGE_COMPOSER_PADDING : insets.bottom,
                    },
                ]}
            >
                <View style={styles.row}>
                    <Pressable
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: !isExpenseBtnVisible ? 'flex' : 'none',
                            marginLeft: calcWidth(4),
                        }}
                        onPress={() => setIsExpenseBtnVisible(true)}
                    >
                        <FontAwesome name="angle-right" size={getFontSizeByWindowWidth(27)} color="white" />
                    </Pressable>
                    <Pressable
                        style={[styles.button, { display: isExpenseBtnVisible ? 'flex' : 'none' }]}
                        onPress={() => {
                            setText('');
                            resetTransaction();
                            // If it's a number, strip out non-digit characters
                            let amt = parseInt(text);
                            if (amt <= 0) {
                                amt = '';
                            }
                            setTransactionData((prev) => ({
                                ...prev,
                                group,
                                amount: amt ? '' + amt : '',
                            }));
                            navigation.navigate(PAGES.ADD_TRANSACTION);
                        }}
                    >
                        <Text
                            style={{
                                fontSize: getFontSizeByWindowWidth(15),
                                color: 'white',
                                marginRight: 4,
                            }}
                        >
                            +
                        </Text>
                        <Text style={styles.buttonText}> Expense</Text>
                    </Pressable>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor="#ccc"
                            placeholder="Message..."
                            value={text}
                            onChangeText={handleTextInputAndToggleExpenseButton}
                            onFocus={() => {
                                if (text.length === 0) setIsExpenseBtnVisible(false);
                            }}
                            onBlur={() => {
                                if (text === '') {
                                    setIsExpenseBtnVisible(true);
                                }
                            }}
                        />
                    </View>
                    {isSendBtnVisible && (
                        <Pressable style={styles.sendBtn} onPress={() => sendChatMessage(text)}>
                            <Ionicons name="send" size={calcWidth(5.5)} color="white" />
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
};

export default MessageComposer;

const styles = StyleSheet.create({
    bottomContainer: {
        borderTopLeftRadius: calcWidth(3),
        borderTopRightRadius: calcWidth(3),
        alignContent: 'center',
        backgroundColor: '#111016',
    },
    row: {
        alignContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#272239',
        overflow: 'hidden',
        borderRadius: calcWidth(6),
        minHeight: calcWidth(12.5),
    },
    button: {
        borderRadius: calcWidth(6),
        backgroundColor: '#8740FD',
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: calcWidth(3.8),
        paddingVertical: calcWidth(2.5),
        flexDirection: 'row',
    },
    buttonText: {
        fontSize: getFontSizeByWindowWidth(10.7),
        color: 'white',
        alignItems: 'center',
        fontWeight: '400',
    },
    payContainer: {
        paddingVertical: calcWidth(5),
        justifyContent: 'center',
    },
    payBtn: {
        margin: 'auto',
        paddingVertical: calcWidth(3),
        paddingHorizontal: calcWidth(4),
        borderWidth: 1,
        borderColor: '#9566CF',
        borderRadius: calcWidth(5.5),
    },
    textInputContainer: {
        flex: 1,
        paddingHorizontal: calcWidth(3),
        flexDirection: 'row',
        backgroundColor: '#272239',
    },

    input: {
        color: 'white',
        fontSize: getFontSizeByWindowWidth(10.7),
        flex: 1,
        margin: 'auto',
        fontWeight: '400',
    },

    sendBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8740FD',
        width: calcWidth(11.5),
        height: calcWidth(11.5),
        borderRadius: calcWidth(5.5),
        marginVertical: 'auto',
    },
});
