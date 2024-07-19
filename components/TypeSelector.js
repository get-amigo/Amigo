import { AntDesign } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Image, Modal, View, FlatList, Pressable, StyleSheet } from 'react-native';

import typeIcon from '../assets/icons/type.png';
import CheckBox from '../components/CheckBox';
import Categories, { getCategoryIcon } from '../constants/Categories';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useExpense } from '../stores/expense';

const TypeSelector = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const { loading, setType, fetchExpense, type } = useExpense();
    useEffect(() => {
        // Initialize selectedTypes with the provided type prop
        if (type) {
            setSelectedTypes(Array.isArray(type) ? type : [type]);
        }
        return () => setSelectedTypes([]);
    }, [type]);

    if (loading)
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Type</Text>
                <Image style={styles.loadingIcon} source={typeIcon} />
            </View>
        );

    const toggleTypeSelection = (item) => {
        const isSelected = selectedTypes.includes(item);

        if (isSelected) {
            setSelectedTypes((prevSelectedTypes) => prevSelectedTypes.filter((type) => type !== item));
        } else {
            setSelectedTypes((prevSelectedTypes) => [...prevSelectedTypes, item]);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => toggleTypeSelection(item.name)}>
            <View style={styles.itemContent}>
                {item.icon}
                <Text style={styles.itemText}>{item.name}</Text>
            </View>
            <CheckBox selected={selectedTypes.includes(item.name)} />
        </TouchableOpacity>
    );

    const applySelectionAndCloseModal = () => {
        setType(selectedTypes);
        fetchExpense();
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => setModalVisible(true)}>
                {selectedTypes.length == 0 ? (
                    <>
                        <Text style={styles.buttonText}>Type</Text>
                        <Image style={styles.buttonIcon} source={typeIcon} />
                    </>
                ) : (
                    <>
                        {getCategoryIcon(selectedTypes[0])}
                        <Text style={styles.buttonText}>{selectedTypes[0]}</Text>
                        {selectedTypes.length > 1 && (
                            <View style={styles.countContainer}>
                                <Text style={styles.countText}>+{selectedTypes.length - 1}</Text>
                            </View>
                        )}
                    </>
                )}
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Type</Text>
                            <TouchableOpacity onPress={applySelectionAndCloseModal}>
                                <Text style={styles.modalHeaderButton}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList data={Categories} renderItem={renderItem} keyExtractor={(item) => item.name} />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

export default TypeSelector;

const styles = StyleSheet.create({
    loadingContainer: {
        backgroundColor: COLOR.SKELETON_MASK_COLOR,
        padding: 10,
        flexDirection: 'row',
        gap: calcWidth(4),
        alignItems: 'center',
        borderRadius: 5,
    },
    loadingText: {
        fontSize: getFontSizeByWindowWidth(15),
        color: COLOR.TEXT,
        opacity: 0,
    },
    loadingIcon: {
        height: calcWidth(3),
        width: calcWidth(5),
        opacity: 0,
    },
    itemContainer: {
        paddingVertical: calcHeight(2),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemContent: {
        flexDirection: 'row',
        gap: calcWidth(8),
    },
    itemText: {
        fontSize: getFontSizeByWindowWidth(12),
        color: COLOR.TEXT,
    },
    buttonContainer: {
        backgroundColor: '#342F4F',
        padding: 10,
        flexDirection: 'row',
        gap: calcWidth(2),
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: getFontSizeByWindowWidth(10),
        color: COLOR.TEXT,
    },
    buttonIcon: {
        height: calcWidth(1.5),
        width: calcWidth(2.5),
    },
    countContainer: {
        backgroundColor: COLOR.BUTTON,
        padding: calcWidth(0.8),
        borderRadius: calcWidth(5),
    },
    countText: {
        color: COLOR.TEXT,
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(5),
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: calcHeight(4),
        backgroundColor: COLOR.APP_BACKGROUND,
        paddingBottom: calcHeight(7),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: calcHeight(2),
    },
    modalHeaderText: {
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
        color: COLOR.TEXT,
    },
    modalHeaderButton: {
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
        color: COLOR.BUTTON,
    },
});
