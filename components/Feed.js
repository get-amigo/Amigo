import { Octicons, EvilIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View, Pressable, Text, Image } from 'react-native';

import ClockIcon from '../assets/icons/clock.png';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import editNames from '../helper/editNames';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';

const SELECTOR_SIZE = 5;

function convertToCustomTimeFormat(dateString) {
    const date = new Date(dateString);
    const timeOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    return formattedTime;
}

function convertToCustomFormatDate(dateString) {
    const date = new Date(dateString);
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-IN', dateOptions);
    return formattedDate;
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
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(11),
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    Split an Expense
                </Text>
            </View>
            <Text style={styles.headerText}>
                {icon &&
                    React.createElement(icon, {
                        name: iconName,
                        size,
                        color: 'white',
                    })}
                {'   '}
                {text}
            </Text>
        </View>
    );
}

function Amount({ amount, description }) {
    return (
        <>
            <View style={styles.flexContainer}>
                <Text style={styles.amount}>₹</Text>
                <View>
                    <Text style={styles.amount}>{amount}</Text>
                </View>
            </View>
            <View>{description && description != ' ' && <Text style={styles.description}>{description}</Text>}</View>
        </>
    );
}

function TransactionActivity({ transaction, createdAt, contacts, synced, creator }) {
    const { user } = useAuth();
    const navigation = useNavigation();

    return (
        <Pressable
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
            <View style={{ marginTop: calcWidth(4) }}>
                <Amount amount={transaction.amount} description={transaction.description} />
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: calcWidth(6),
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    <EvilIcons name="calendar" size={calcWidth(5.5)} color="white" />
                    <Text
                        style={{
                            color: 'white',
                            fontSize: getFontSizeByWindowWidth(11),
                            fontWeight: '500',
                            marginLeft: calcWidth(1.7),
                        }}
                    >
                        {getDateAndMonth(createdAt)}
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    <Text style={{ color: 'white', fontSize: getFontSizeByWindowWidth(9) }}>{convertToCustomTimeFormat(createdAt)}</Text>
                    {synced === false && (
                        <Image
                            source={ClockIcon}
                            style={{
                                height: calcWidth(2.5),
                                width: calcWidth(2.5),
                                margin: 'auto',
                                marginLeft: calcWidth(1.2),
                            }}
                        />
                    )}
                </View>
            </View>
        </Pressable>
    );
}

function PaymentActivity({ payment, contacts }) {
    const { user } = useAuth();
    const [payer, receiver] = editNames([payment.payer, payment.receiver], user._id, contacts);
    return (
        <>
            <View
                style={{
                    gap: calcWidth(3),
                }}
            >
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(11),
                        color: 'white',
                        marginLeft: calcWidth(2),
                        fontWeight: '500',
                    }}
                >
                    {payer.name} paid {receiver.name}
                </Text>
                <Amount amount={payment.amount} description={payment.description} />
            </View>
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
                        color: '#FFFFFF',
                        fontSize: getFontSizeByWindowWidth(9),
                    }}
                >
                    {convertToCustomTimeFormat(payment.createdAt)}
                </Text>
            </View>
        </>
    );
}

function ChatActivity({ chat, synced }) {
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
                        color: '#FFFFFF',
                        fontSize: getFontSizeByWindowWidth(9),
                    }}
                >
                    {convertToCustomTimeFormat(chat.createdAt)}
                </Text>
                {/* incase sync is missing for the data comming from the backend it should have the right sync */}
                {synced === false && <Image source={ClockIcon} style={{ height: calcWidth(2.5), width: calcWidth(2.5) }} />}
            </View>
        </View>
    );
}

function Feed(props) {
    const { user } = useAuth();
    const { creator, activityType, createdAt, showCreator, showDate } = props;

    const renderActivity = () => {
        const activityStrategy = ActivityStrategyFactory(activityType);
        if (activityStrategy) {
            return activityStrategy.renderActivity(props);
        }
        return null;
    };

    return (
        <>
            {showDate && (
                <View
                    style={{
                        alignItems: 'center',
                        marginTop: calcWidth(5),
                        marginBottom: calcWidth(5),
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            borderWidth: 1,
                            paddingHorizontal: calcWidth(3),
                            paddingVertical: calcWidth(2),
                            borderColor: 'white',
                            borderRadius: calcWidth(4),
                            fontSize: getFontSizeByWindowWidth(10),
                            fontWeight: '500',
                        }}
                    >
                        {convertToCustomFormatDate(createdAt)}
                    </Text>
                </View>
            )}
            <View
                style={[
                    styles.activityContainer,
                    {
                        justifyContent: user._id === creator?._id ? 'flex-end' : 'flex-start',
                        marginTop: showCreator ? calcWidth(4) : 0,
                    },
                ]}
            >
                {user._id !== creator?._id && (
                    <View
                        style={{
                            height: calcHeight(SELECTOR_SIZE),
                            width: calcHeight(SELECTOR_SIZE),
                        }}
                    >
                        {showCreator && <UserAvatar user={creator} size={SELECTOR_SIZE} />}
                    </View>
                )}
                <View
                    style={{
                        marginLeft: user._id === creator?._id ? 0 : calcWidth(2),
                    }}
                >
                    {user._id !== creator?._id && showCreator && (
                        <View
                            style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                            }}
                        >
                            <Text
                                style={{
                                    color: COLOR.BUTTON,
                                    fontSize: getFontSizeByWindowWidth(12),
                                    fontWeight: '700',
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
                                          borderTopLeftRadius: calcWidth(5),
                                          borderBottomRightRadius: calcWidth(5),
                                      }
                                    : {
                                          borderTopRightRadius: calcWidth(5),
                                          borderBottomLeftRadius: calcWidth(5),
                                      }),
                            },
                        ]}
                    >
                        {renderActivity()}
                    </View>
                </View>
            </View>
        </>
    );
}

const ActivityStrategyFactory = (activityType) => {
    switch (activityType) {
        case 'transaction':
            return {
                renderActivity: ({ relatedId: transaction, createdAt, contacts, isSynced: synced, creator }) => (
                    <TransactionActivity
                        transaction={transaction}
                        createdAt={createdAt}
                        contacts={contacts}
                        synced={synced}
                        creator={creator}
                    />
                ),
            };
        case 'payment':
            return {
                renderActivity: ({ relatedId: payment, contacts }) => <PaymentActivity payment={payment} contacts={contacts} />,
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
        marginHorizontal: calcWidth(3),
    },
    activityCard: {
        padding: calcWidth(5),
        width: calcWidth(70),
        marginTop: calcWidth(2),
    },
    description: {
        fontSize: getFontSizeByWindowWidth(11),
        color: 'white',
        marginLeft: calcWidth(2),
        marginRight: calcWidth(2),
        marginTop: calcWidth(1),
    },
    header: {
        flexDirection: 'row',
        gap: calcWidth(4),
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
});

export default Feed;
