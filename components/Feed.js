import { Octicons, EvilIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text, Image, Modal, TouchableWithoutFeedback, Alert } from 'react-native';

import ClockIcon from '../assets/icons/clock.png';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import editNames from '../helper/editNames';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import apiHelper from '../helper/apiHelper';
import Toast from 'react-native-root-toast';
import { BlurView } from '@react-native-community/blur';

function convertToCustomFormat(dateString) {
    const date = new Date(dateString);
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-IN', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-IN', timeOptions);
    return formattedDate + ' ' + formattedTime;
}

function getDateAndMonth(dateString) {
    // Parse the dateString into a Date object
    const date = new Date(dateString);

    // Array of month names
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    return day + ' ' + month;
}

function ActivityHeader({ icon, iconName, size, text }) {
    return (
        <View style={styles.header}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    gap: calcWidth(2),
                }}
            >
                <View
                    style={{
                        borderWidth: 1,
                        padding: calcWidth(1),
                        borderRadius: calcWidth(5),
                        borderColor: 'white',
                    }}
                >
                    <MaterialIcons name="call-split" size={calcWidth(3)} color="white" />
                </View>
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(10),
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    Split an expense
                </Text>
            </View>
            <Text style={styles.headerText}>
                {icon &&
                    React.createElement(icon, {
                        name: iconName,
                        size,
                        color: 'white',
                    })}
                {'    '}
                {text}
            </Text>
        </View>
    );
}

function Amount({ amount, description }) {
    return (
        <View style={styles.flexContainer}>
            <Text style={styles.amount}>₹</Text>
            <View>
                <Text style={styles.amount}>{amount}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
            </View>
        </View>
    );
}

function TransactionActivity({ transaction, createdAt, contacts, synced, creator, onDelete }) {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

    const transactionId = transaction._id;

    // TODO : HandleDelete functionality not implemented for Offline Mode

    const handleDelete = async () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this transaction?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await apiHelper.delete(`/transaction/${transactionId}`);
                            onDelete(transactionId);
                        } catch (error) {
                            console.error('Error deleting transaction:', error);
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: false },
        );
    };

    const renderDeleteModal = () => {
        if (user._id === creator._id) {
            return (
                <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <BlurView style={styles.absolute} blurType="regular" blurAmount={10} reducedTransparencyFallbackColor="white" />
                            <TouchableWithoutFeedback>
                                <View style={[styles.modalContainer, { top: modalPosition.y - 160, left: calcWidth(20) }]}>
                                    {selectedTransaction && (
                                        <>
                                            <View style={styles.selectedTransactionCard}>
                                                <ActivityHeader
                                                    icon={Octicons}
                                                    iconName="person"
                                                    size={calcHeight(2.4)}
                                                    text={`${selectedTransaction.splitAmong?.length}`}
                                                />
                                                <View style={{ marginTop: calcHeight(3) }}>
                                                    <Amount
                                                        amount={selectedTransaction.amount}
                                                        description={selectedTransaction.description}
                                                    />
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        marginTop: calcHeight(3),
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            gap: calcWidth(2),
                                                        }}
                                                    >
                                                        <EvilIcons name="calendar" size={calcWidth(5)} color="white" />
                                                        <Text style={styles.description}>
                                                            {getDateAndMonth(selectedTransaction.createdAt)}
                                                        </Text>
                                                    </View>
                                                    {synced === false && (
                                                        <Image
                                                            source={ClockIcon}
                                                            style={{
                                                                height: calcHeight(1),
                                                                width: calcHeight(1),
                                                            }}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        </>
                                    )}
                                    <View style={styles.modalButtons}>
                                        <Pressable
                                            style={styles.modalButton}
                                            onPress={() => {
                                                setModalVisible(false);
                                                handleDelete();
                                            }}
                                        >
                                            <Text style={styles.modalButtonText}>Delete</Text>
                                            <MaterialIcons name="delete" size={calcWidth(6)} color="red" />
                                        </Pressable>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            );
        } else {
            return null;
        }
    };

    return (
        <Pressable
            onLongPress={(event) => {
                setSelectedTransaction(transaction);
                setModalPosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
                setModalVisible(true);
            }}
            onPress={() => {
                const editedTransaction = transaction;
                for (const i in editedTransaction.splitAmong) {
                    editedTransaction.splitAmong[i].user = editNames([transaction.splitAmong[i].user], user._id, contacts)[0];
                }
                editedTransaction.paidBy = editNames([transaction.paidBy], user._id, contacts)[0];

                navigation.navigate(PAGES.TRANSACTION_DETAIL, {
                    transaction: {
                        ...editedTransaction,
                        creator,
                    },
                });
            }}
        >
            <ActivityHeader icon={Octicons} iconName="person" size={calcHeight(1.8)} text={`${transaction.splitAmong?.length}`} />
            <View style={{ marginTop: calcHeight(3) }}>
                <Amount amount={transaction.amount} description={transaction.description} />
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: calcHeight(3),
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        gap: calcWidth(2),
                    }}
                >
                    <EvilIcons name="calendar" size={calcWidth(5)} color="white" />
                    <Text style={styles.description}>{getDateAndMonth(createdAt)}</Text>
                </View>
                {synced === false && (
                    <Image
                        source={ClockIcon}
                        style={{
                            height: calcHeight(1),
                            width: calcHeight(1),
                        }}
                    />
                )}
            </View>
            {renderDeleteModal()}
        </Pressable>
    );
}

function PaymentActivity({ payment, contacts }) {
    const { user } = useAuth();
    const [payer, receiver] = editNames([payment.payer, payment.receiver], user._id, contacts);
    return (
        <View
            style={{
                gap: calcHeight(2),
            }}
        >
            <Text style={styles.description}>
                {payer.name} paid {receiver.name}
            </Text>
            <Amount amount={payment.amount} description={payment.description} />
        </View>
    );
}

function ChatActivity({ chat, synced }) {
    function convertToCustomFormat(dateString) {
        const date = new Date(dateString);
        const timeOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        };
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
        return formattedTime;
    }
    return (
        <View>
            <Text
                style={{
                    color: 'white',
                }}
            >
                {chat.message}
            </Text>
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    flex: 1,
                    alignContent: 'center',
                    justifyContent: 'flex-end',
                    gap: calcWidth(1),
                }}
            >
                <Text
                    style={{
                        color: 'grey',
                        fontSize: getFontSizeByWindowWidth(10),
                    }}
                >
                    {convertToCustomFormat(chat.createdAt)}
                </Text>
                {/* incase sync is missing for the data comming from the backend it should have the right sync */}
                {synced === false && <Image source={ClockIcon} style={{ height: calcHeight(1), width: calcHeight(1) }} />}
            </View>
        </View>
    );
}

function Feed(props) {
    const { user } = useAuth();
    const { creator, activityType, createdAt, onDelete } = props;

    const renderActivity = () => {
        const activityStrategy = ActivityStrategyFactory(activityType, onDelete);
        if (activityStrategy) {
            return activityStrategy.renderActivity(props);
        }
        return null;
    };

    return (
        <View
            style={[
                styles.transactionContainer,
                {
                    justifyContent: user._id === creator?._id ? 'flex-end' : 'flex-start',
                },
            ]}
        >
            {user._id !== creator?._id && <UserAvatar user={creator} />}
            <View
                style={{
                    marginLeft: user._id === creator?._id ? 0 : calcWidth(2),
                }}
            >
                {user._id !== creator?._id && (
                    <View
                        style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                        }}
                    >
                        <Text
                            style={{
                                color: COLOR.BUTTON,
                            }}
                        >
                            {' '}
                            {creator.name}
                        </Text>
                        <Text
                            style={{
                                color: 'white',
                            }}
                        >
                            {' '}
                            {convertToCustomFormat(createdAt)}
                        </Text>
                    </View>
                )}
                <View
                    style={[
                        styles.transactionCard,
                        {
                            backgroundColor: user._id === creator?._id ? '#663CAB' : '#342F4F',
                            ...(user._id === creator?._id
                                ? {
                                      borderBottomLeftRadius: calcHeight(1),
                                      borderBottomRightRadius: calcHeight(2),
                                      borderTopLeftRadius: calcHeight(2),
                                  }
                                : {
                                      borderBottomLeftRadius: calcHeight(2),
                                      borderBottomRightRadius: calcHeight(1),
                                      borderTopRightRadius: calcHeight(2),
                                  }),
                        },
                    ]}
                >
                    {renderActivity()}
                </View>
            </View>
        </View>
    );
}

const ActivityStrategyFactory = (activityType, onDelete) => {
    switch (activityType) {
        case 'transaction':
            return {
                renderActivity: ({ relatedId: transaction, createdAt, contacts, synced, creator }) => (
                    <TransactionActivity
                        transaction={transaction}
                        createdAt={createdAt}
                        contacts={contacts}
                        synced={synced}
                        creator={creator}
                        onDelete={onDelete}
                    />
                ),
            };
        case 'payment':
            return {
                renderActivity: ({ relatedId: payment, contacts }) => <PaymentActivity payment={payment} contacts={contacts} />,
            };
        case 'chat':
            return {
                renderActivity: ({ creator, relatedId, createdAt, synced }) => (
                    <ChatActivity
                        chat={{
                            creator,
                            message: relatedId?.message,
                            createdAt,
                        }}
                        synced={synced}
                    />
                ),
            };
        default:
            return null;
    }
};

const styles = StyleSheet.create({
    transactionContainer: {
        flex: 1,
        flexDirection: 'row',
        margin: calcWidth(3),
        marginVertical: calcHeight(4),
    },
    transactionCard: {
        padding: calcWidth(5),
        width: calcWidth(70),
        backgroundColor: '#342F4F',
        borderBottomLeftRadius: calcHeight(1),
        borderBottomRightRadius: calcHeight(1),
        marginTop: calcHeight(1),
    },
    description: {
        fontSize: getFontSizeByWindowWidth(10),
        color: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
    },
    amount: {
        fontSize: getFontSizeByWindowWidth(20),
        color: COLOR.TEXT,
        fontWeight: 'bold',
        marginRight: calcWidth(2),
    },
    flexContainer: {
        flexDirection: 'row',
        marginLeft: calcWidth(2),
    },
    createdAt: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        marginTop: calcHeight(2),
    },

    selectedTransactionCard: {
        flexDirection: 'column',
        width: calcWidth(76),
        paddingHorizontal: calcWidth(4),
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    modalOverlay: {
        flex: 1,
        paddingTop: calcHeight(32),
        alignItems: 'flex-end',
        paddingRight: calcWidth(6),
    },
    modalContainer: {
        position: 'absolute',
        width: calcWidth(128),
        backgroundColor: '#663CAB',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: calcWidth(4),
        paddingVertical: calcHeight(4),
        // alignItems: 'center',
    },
    modalTitle: {
        fontSize: getFontSizeByWindowWidth(16),
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: calcHeight(1),
    },
    modalText: {
        fontSize: getFontSizeByWindowWidth(14),
        marginBottom: calcHeight(2),
        color: 'rgba(255,255,255,0.6)',
    },
    modalButtons: {
        position: 'absolute',
        top: calcHeight(22.8),
        left: calcWidth(22),
    },
    modalButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: calcWidth(54),
        paddingVertical: calcHeight(2),
        paddingHorizontal: calcWidth(4),
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(44, 44, 46, 1)',
        backgroundColor: 'rgba(28, 28, 30, 0.9)',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'rgba(255, 69, 58, 1)',
        fontSize: getFontSizeByWindowWidth(14),
    },
});

export default Feed;
