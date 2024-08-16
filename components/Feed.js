import { AntDesign, EvilIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-root-toast';
import ClockIcon from '../assets/icons/clock.png';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import apiHelper from '../helper/apiHelper';
import editNames from '../helper/editNames';
import formatDateRelativeToToday from '../helper/formatDateRelativeToToday';
import formatTo12HourTime from '../helper/formatTo12HourTime';
import getDateAndMonth from '../helper/getDateAndMonth';
import checkConnectivity from '../helper/getNetworkStateAsync';
import offlineMessage from '../helper/offlineMessage';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import useGroupActivitiesStore from '../stores/groupActivitiesStore';

const SELECTOR_SIZE = 3.4;

function ActivityHeader({ icon, size, text }) {
    return (
        <View style={styles.header}>
            <Text
                style={{
                    fontSize: getFontSizeByWindowWidth(10.7),
                    color: 'white',
                    fontWeight: '600',
                }}
            >
                Split an Expense
            </Text>
            <Text style={styles.headerText}>
                {icon && <AntDesign name="user" size={size} color="white" />}
                {'  '}
                {text}
            </Text>
        </View>
    );
}

function TransactionActivityDetails({ transaction, createdAt, synced, highlightColor }) {
    return (
        <>
            <View style={[styles.transactionCard, { backgroundColor: highlightColor }]}>
                <ActivityHeader
                    icon={Octicons}
                    iconName="person"
                    size={getFontSizeByWindowWidth(10.5)}
                    text={`${transaction.splitAmong?.length}`}
                />
                <View style={styles.flexContainer}>
                    <View>
                        <Text style={styles.amount}>₹ {transaction.amount}</Text>
                    </View>
                </View>
            </View>
            <View
                style={{
                    marginLeft: calcWidth(1),
                }}
            >
                <View>
                    {transaction.description && transaction.description != ' ' && (
                        <Text style={styles.description}>{transaction.description}</Text>
                    )}
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: calcWidth(3.3),
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: calcWidth(1.2),
                        }}
                    >
                        <View>
                            <EvilIcons name="calendar" size={calcWidth(5.2)} color="white" style={{ marginLeft: calcWidth(-1) }} />
                        </View>
                        <Text
                            style={{
                                color: 'white',
                                fontSize: getFontSizeByWindowWidth(10.8),
                                fontWeight: '400',
                            }}
                        >
                            {getDateAndMonth(createdAt)}
                        </Text>
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginRight: calcWidth(1),
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ color: 'white', fontSize: getFontSizeByWindowWidth(7), fontWeight: '300' }}>
                            {formatTo12HourTime(createdAt)}
                        </Text>
                        {synced === false && <Image source={ClockIcon} style={styles.syncIcon} />}
                    </View>
                </View>
            </View>
        </>
    );
}

function TransactionActivity({ transaction, createdAt, contacts, synced, creator, highlightColor, activityId }) {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const transactionId = transaction._id;
    const groupId = transaction.group;
    const deleteActivity = useGroupActivitiesStore((state) => state.deleteActivity);

    const handleDelete = async () => {
        const isOnline = await checkConnectivity();
        if (!isOnline && synced !== false) {
            // if user is offline and the message is not synced
            offlineMessage();
            return;
        }
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
                        if (isOnline) {
                            try {
                                await apiHelper.delete(`/transaction/${transactionId}`);
                                deleteActivity(activityId, groupId, synced);
                                Toast.show('Transaction Deleted', {
                                    duration: Toast.durations.LONG,
                                });
                            } catch (error) {
                                console.error('Error deleting transaction:', error);
                                Toast.show('Failed To Delete Transaction', {
                                    duration: Toast.durations.LONG,
                                });
                            }
                        } else {
                            deleteActivity(activityId, groupId, synced);
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
                                <View style={[styles.modalContainer, { top: modalPosition.y - 140, left: calcWidth(40) }]}>
                                    {selectedTransaction && (
                                        <TransactionActivityDetails
                                            transaction={selectedTransaction}
                                            createdAt={selectedTransaction.createdAt}
                                            contacts={contacts}
                                            synced={synced}
                                            creator={creator}
                                            highlightColor={highlightColor}
                                        />
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
                    handleDelete,
                });
            }}
            style={styles.transactionActivityContainer}
        >
            <TransactionActivityDetails
                transaction={transaction}
                createdAt={createdAt}
                contacts={contacts}
                synced={synced}
                creator={creator}
                highlightColor={highlightColor}
            />
            {renderDeleteModal()}
        </Pressable>
    );
}

function PaymentActivity({ payment, contacts, highlightColor }) {
    const { user } = useAuth();
    const [payer, receiver] = editNames([payment.payer, payment.receiver], user._id, contacts);
    return (
        <>
            <View
                style={{
                    width: calcWidth(54),
                }}
            >
                <View
                    style={{
                        gap: calcWidth(3.8),
                        backgroundColor: highlightColor,
                        padding: calcWidth(2.5),
                        borderRadius: calcWidth(2.35),
                    }}
                >
                    <Text
                        style={{
                            fontSize: getFontSizeByWindowWidth(10.7),
                            color: 'white',
                            fontWeight: '600',
                        }}
                    >
                        {payer.name} paid {receiver.name}
                    </Text>

                    <View style={styles.flexContainer}>
                        <View>
                            <Text style={styles.amount}>₹ {payment.amount}</Text>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        marginLeft: calcWidth(1),
                    }}
                >
                    <View>
                        {payment.description && payment.description != ' ' && <Text style={styles.description}>{payment.description}</Text>}
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: calcWidth(3.3),
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: calcWidth(1.2),
                            }}
                        >
                            <View>
                                <EvilIcons name="calendar" size={calcWidth(5.2)} color="white" style={{ marginLeft: calcWidth(-1) }} />
                            </View>
                            <Text
                                style={{
                                    color: 'white',
                                    fontSize: getFontSizeByWindowWidth(10.8),
                                    fontWeight: '400',
                                }}
                            >
                                {getDateAndMonth(payment.createdAt)}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            marginRight: calcWidth(1),
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: getFontSizeByWindowWidth(7), fontWeight: '300' }}>
                            {formatTo12HourTime(payment.createdAt)}
                        </Text>
                    </View>
                </View>
            </View>
        </>
    );
}

function ChatActivity({ chat, synced }) {
    return (
        <View
            style={{
                maxWidth: calcWidth(50),
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
            }}
        >
            <Text
                style={{
                    color: 'white',
                    fontSize: getFontSizeByWindowWidth(10.7),
                    fontWeight: '400',
                }}
            >
                {chat.message}
            </Text>
            <View
                style={{
                    marginLeft: 'auto',
                    flexDirection: 'row',
                }}
            >
                <Text
                    style={{
                        color: 'white',
                        fontSize: getFontSizeByWindowWidth(7),
                        fontWeight: '300',
                        marginLeft: calcWidth(3),
                    }}
                >
                    {formatTo12HourTime(chat.createdAt)}
                </Text>
                {/* incase sync is missing for the data comming from the backend it should have the right sync */}
                {synced === false && (
                    <Image
                        source={ClockIcon}
                        style={{
                            height: calcWidth(2.2),
                            width: calcWidth(2.2),
                            margin: 'auto',
                            marginLeft: calcWidth(1),
                        }}
                    />
                )}
            </View>
        </View>
    );
}

function Feed(props) {
    const { user } = useAuth();
    const { creator, activityType, createdAt, showCreatorName, showCreatorAvatar, showDate } = props;

    const renderActivity = () => {
        const activityStrategy = ActivityStrategyFactory(activityType, user._id === creator?._id);
        if (activityStrategy) {
            return activityStrategy.renderActivity(props);
        }
        return null;
    };
    return (
        <>
            {showDate && (
                <View style={styles.dateContainer}>
                    <View style={styles.dateWrapper}>
                        <Text style={styles.dateText}>{formatDateRelativeToToday(createdAt)}</Text>
                    </View>
                </View>
            )}
            <View
                style={[
                    styles.activityContainer,
                    {
                        justifyContent: user._id === creator?._id ? 'flex-end' : 'flex-start',
                        marginTop: showCreatorName && user._id !== creator?._id && !showDate ? calcWidth(8) : 0,
                    },
                ]}
            >
                {user._id !== creator?._id && (
                    <View
                        style={{
                            width: calcHeight(SELECTOR_SIZE),
                            justifyContent: 'flex-end',
                        }}
                    >
                        {showCreatorAvatar && <UserAvatar user={creator} size={SELECTOR_SIZE} />}
                    </View>
                )}
                <View
                    style={{
                        marginLeft: user._id === creator?._id ? 0 : calcWidth(2),
                    }}
                >
                    {user._id !== creator?._id && showCreatorName && (
                        <View
                            style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                marginBottom: -calcWidth(1),
                            }}
                        >
                            <Text
                                style={{
                                    color: COLOR.BUTTON,
                                    fontSize: getFontSizeByWindowWidth(10.7),
                                    fontWeight: '500',
                                }}
                            >
                                {' '}
                                {creator.name}
                            </Text>
                        </View>
                    )}
                    <View
                        style={[
                            styles.activityCard,
                            {
                                backgroundColor: user._id === creator?._id ? '#663CAB' : '#342F4F',
                                ...(user._id === creator?._id
                                    ? {
                                          borderTopLeftRadius: calcWidth(3.85),
                                          borderTopRightRadius: calcWidth(3.85),
                                          borderBottomLeftRadius: calcWidth(3.85),
                                      }
                                    : {
                                          borderTopLeftRadius: calcWidth(3.85),
                                          borderTopRightRadius: calcWidth(3.85),
                                          borderBottomRightRadius: calcWidth(3.85),
                                      }),
                            },
                            activityType === 'transaction' || activityType === 'payment'
                                ? {
                                      paddingHorizontal: calcWidth(1.5),
                                      paddingBottom: calcWidth(2.7),
                                      paddingTop: calcWidth(1.5),
                                  }
                                : { paddingVertical: calcWidth(2.7), paddingHorizontal: calcWidth(3) },
                        ]}
                    >
                        {renderActivity()}
                    </View>
                </View>
            </View>
        </>
    );
}

const ActivityStrategyFactory = (activityType, isUserTheCreator) => {
    switch (activityType) {
        case 'transaction':
            return {
                renderActivity: ({ relatedId: transaction, createdAt, contacts, isSynced: synced, creator, _id }) => (
                    <TransactionActivity
                        transaction={transaction}
                        createdAt={createdAt}
                        contacts={contacts}
                        synced={synced}
                        creator={creator}
                        highlightColor={isUserTheCreator ? '#9566CF' : '#4B426B'}
                        activityId={_id}
                    />
                ),
            };
        case 'payment':
            return {
                renderActivity: ({ relatedId: payment, contacts }) => (
                    <PaymentActivity payment={payment} contacts={contacts} highlightColor={isUserTheCreator ? '#9566CF' : '#4B426B'} />
                ),
            };
        case 'chat':
            return {
                renderActivity: ({ creator, relatedId, createdAt, isSynced: synced }) => (
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
    activityContainer: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: calcWidth(2),
    },
    activityCard: {
        marginTop: calcWidth(2),
    },
    description: {
        fontSize: getFontSizeByWindowWidth(10),
        color: 'white',
        fontWeight: '400',
        marginTop: calcWidth(1.2),
    },
    header: {
        flexDirection: 'row',
        gap: calcWidth(2.5),
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
        fontWeight: '400',
        fontSize: getFontSizeByWindowWidth(10.5),
        marginLeft: 'auto',
    },
    amount: {
        fontSize: getFontSizeByWindowWidth(18),
        color: COLOR.TEXT,
        fontWeight: '600',
        marginRight: calcWidth(2),
    },
    flexContainer: {
        flexDirection: 'row',
    },
    createdAt: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        marginTop: calcHeight(2),
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
        paddingRight: calcWidth(60),
    },
    modalContainer: {
        position: 'absolute',
        backgroundColor: '#663CAB',
        borderWidth: 1,
        borderRadius: calcHeight(1),
        borderBottomEndRadius: calcHeight(0),
        paddingHorizontal: calcWidth(1),
        paddingTop: calcHeight(0.6),
        paddingBottom: calcHeight(1),
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
        top: calcHeight(16.8),
        left: calcWidth(8),
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
    transactionCard: {
        gap: calcWidth(3.8),
        padding: calcWidth(2.5),
        borderRadius: calcWidth(2.35),
        width: calcWidth(54),
    },
    syncIcon: {
        height: calcWidth(2.2),
        width: calcWidth(2.2),
        margin: 'auto',
        marginLeft: calcWidth(1),
    },
    dateContainer: {
        alignItems: 'center',
        marginVertical: calcWidth(7),
    },
    dateWrapper: {
        borderRadius: calcWidth(3.6),
        overflow: 'hidden',
    },
    dateText: {
        color: 'white',
        paddingHorizontal: calcWidth(2.4),
        paddingVertical: calcWidth(1.2),
        fontSize: getFontSizeByWindowWidth(10.7),
        fontWeight: '400',
        backgroundColor: '#272239',
    },
    transactionActivityContainer: {
        width: calcWidth(54),
    },
});

export default Feed;
