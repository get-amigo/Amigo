import { Entypo } from '@expo/vector-icons';
import { React, useEffect, useLayoutEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import CalendarIcon from '../assets/icons/calendar.png';
import deleteIcon from '../assets/icons/deleteIcon.png';
import dots from '../assets/icons/dots.png';
import editIcon from '../assets/icons/editIcon.png';
import AmountInput from '../components/AmountInput';
import SharedList from '../components/SharedList';
import TransactionDetailsButton from '../components/TransactionDetailsButton';
import { getCategoryIcon } from '../constants/Categories';
import COLOR from '../constants/Colors';
import TransactionNumberOfVisibleNames from '../constants/TransactionNumberOfVisibleNames';
import PAGES from '../constants/pages';
import apiHelper from '../helper/apiHelper';
import formatDateToDDMMYYYY from '../helper/formatDateToDDMMYYYY';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import useCustomColor from '../hooks/useCustomColor';
import { useAuth } from '../stores/auth';

const TransactionDetail = ({
    navigation,
    route: {
        params: { transaction, handleDelete },
    },
}) => {
    const [date, setDate] = useState();
    const [expandNames, setExpandNames] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const transactionId = transaction._id;
 const {user} = useAuth()
    const generateColor = useCustomColor();

    useLayoutEffect(() => {
        if (user._id === transaction.creator._id) {
            navigation.setOptions({
                headerRight: () => (
                    <View>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Image source={dots} />
                        </TouchableOpacity>
                    </View>
                ),
            });
        }
    }, [navigation, handleDelete, transaction._id]);

    useEffect(() => {
        setDate(new Date(transaction.date));
        console.log("T",transaction)
    }, [transaction]);

    const handleEdit = async () => {
        try {
            const response = await apiHelper.get(`/transaction/${transactionId}`);
            const transactionData = response.data;
            navigation.navigate(PAGES.ADD_TRANSACTION, { transaction: transactionData, isEditing: true, setIsEditing });
            setModalVisible(!modalVisible);
        } catch (error) {
            console.error('Error fetching transaction:', error);
        }
    };

    return (
        <ScrollView alwaysBounceVertical={false}>
            <View
                style={{
                    alignItems: 'center',
                    marginTop: calcHeight(5),
                }}
            >
                <AmountInput amount={transaction.amount} isTextInput={false} />
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(14),
                        color: COLOR.TEXT,
                    }}
                >
                    {sliceText(transaction.description, 40)}
                </Text>
                <Text
                    style={{
                        color: 'grey',
                        marginVertical: calcHeight(3),
                        fontSize: getFontSizeByWindowWidth(12),
                    }}
                >
                    Created By {transaction.creator.name}
                </Text>
                <View
                    style={{
                        width: '50%',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: calcWidth(5),
                        marginBottom: calcHeight(4),
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#4D426C',
                            flexDirection: 'row',
                            borderRadius: 10,
                            paddingVertical: calcWidth(1),
                            paddingHorizontal: calcWidth(4),
                            gap: calcWidth(1),
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            style={{
                                width: calcWidth(3),
                                height: calcWidth(3),
                            }}
                            source={CalendarIcon}
                        />
                        <Text
                            style={{
                                fontSize: getFontSizeByWindowWidth(10),
                                color: 'white',
                            }}
                        >
                            {formatDateToDDMMYYYY(date)}
                        </Text>
                    </View>
                    <View
                        style={{
                            backgroundColor: '#4D426C',
                            flexDirection: 'row',
                            borderRadius: 10,
                            paddingVertical: calcWidth(2),
                            paddingHorizontal: calcWidth(4),
                            gap: calcWidth(1),
                            alignItems: 'center',
                        }}
                    >
                        {getCategoryIcon(transaction.type)}
                        <Text
                            style={{
                                fontSize: getFontSizeByWindowWidth(10),
                                color: 'white',
                            }}
                        >
                            {transaction.type}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.boxContainer}>
                <View
                    style={{
                        borderTopLeftRadius: calcWidth(5),
                        borderTopRightRadius: calcWidth(5),
                        backgroundColor: COLOR.BUTTON,
                    }}
                >
                    <Text style={styles.headerLabel}>Paid by</Text>
                </View>
                <View style={styles.headerContainer}>
                    <View style={styles.userDetail}>
                        <View
                            style={[
                                styles.circle,
                                {
                                    backgroundColor: generateColor(transaction.paidBy._id),
                                },
                            ]}
                        />
                        <Text style={styles.userName}>{transaction.paidBy.name}</Text>
                        <Text style={styles.userAmount}>₹ {transaction.amount}</Text>
                    </View>
                </View>
                <SharedList transaction={transaction} generateColor={generateColor} expandNames={expandNames} />
            </View>
            <View
                style={{
                    alignItems: 'center',
                }}
            >
                {transaction.splitAmong.length > TransactionNumberOfVisibleNames && (
                    <TransactionDetailsButton
                        onPress={() => {
                            setExpandNames((prev) => !prev);
                        }}
                        title={
                            <>
                                {expandNames ? (
                                    <Text>Show Less</Text>
                                ) : (
                                    <Text>
                                        {transaction.splitAmong.length - TransactionNumberOfVisibleNames} more participants{'\t'}
                                    </Text>
                                )}
                                <Entypo name={expandNames ? 'chevron-up' : 'chevron-down'} size={calcHeight(2.1)} color="white" />
                            </>
                        }
                    />
                )}
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalBackground}>
                        <View style={styles.modalView}>
                            <TouchableOpacity
                                style={[styles.button, styles.editButton]}
                                onPress={async () => {
                                    try {
                                        await handleEdit();
                                        // navigation.goBack();
                                    } catch (error) {
                                        console.error('Error deleting transaction:', error);
                                    }
                                }}
                            >
                                <Image source={editIcon} />
                                <Text style={styles.textStyle}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton]}
                                onPress={async () => {
                                    try {
                                        await handleDelete(transaction._id);
                                        navigation.goBack();
                                    } catch (error) {
                                        console.error('Error deleting transaction:', error);
                                    }
                                }}
                            >
                                <Image source={deleteIcon} />
                                <Text style={[styles.textStyle, { color: COLOR.ERROR_BORDER }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    boxContainer: {
        backgroundColor: COLOR.PAYMENT_BACKGROUND,
        margin: calcWidth(5),
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
    },
    centeredView: {
        alignItems: 'center',
    },
    amountText: {
        fontSize: getFontSizeByWindowWidth(25),
        color: COLOR.TEXT,
        fontWeight: 'bold',
    },
    descriptionText: {
        fontSize: getFontSizeByWindowWidth(10),
        color: COLOR.TEXT,
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
    },
    createdByText: {
        color: COLOR.TEXT,
    },
    header: {
        borderTopLeftRadius: calcWidth(5),
        borderTopRightRadius: calcWidth(5),
        backgroundColor: COLOR.BUTTON,
    },
    userDetailContainer: {
        padding: calcWidth(2),
    },
    userDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: calcWidth(5),
        marginVertical: calcHeight(3),
    },
    circle: {
        width: calcWidth(2),
        height: calcWidth(2),
        borderRadius: calcWidth(2) / 2,
        marginRight: calcWidth(2),
    },
    userName: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
    },
    userAmount: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
    headerLabel: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
        padding: calcWidth(3),
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        position: 'absolute',
        top: calcHeight(6),
        right: calcWidth(2),
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: COLOR.PAYMENT_BACKGROUND,
        borderRadius: calcHeight(1),
        paddingHorizontal: calcHeight((20 / 390) * 100),
        width: calcWidth((165 / 390) * 100),
        paddingVertical: calcHeight((20 / 844) * 100),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        width: calcWidth(30),
        flexDirection: 'row',
        alignItems: 'center',
        gap: calcWidth(2),
    },
    textStyle: {
        color: 'white',
        fontSize: getFontSizeByWindowWidth(14),
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    editButton: {
        paddingBottom: calcHeight(2),
        borderBottomColor: COLOR.BORDER_COLOR,
        borderBottomWidth: calcHeight(0.2),
    },
    deleteButton: {
        paddingTop: calcHeight(2),
    },
});

export default TransactionDetail;
