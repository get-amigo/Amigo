import React, { useState, useEffect } from 'react';
import {
    TouchableOpacity,
    Text,
    Image,
    Modal,
    View,
    FlatList,
} from 'react-native';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import COLOR from '../constants/Colors';
import typeIcon from '../assets/icons/type.png';
import Categories from '../constants/Categories';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

const TypeSelector = ({ setType, type }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);

    const toggleTypeSelection = (item) => {
        const isSelected = selectedTypes.includes(item);

        if (isSelected) {
            setSelectedTypes((prevSelectedTypes) =>
                prevSelectedTypes.filter((type) => type !== item),
            );
        } else {
            setSelectedTypes((prevSelectedTypes) => [
                ...prevSelectedTypes,
                item,
            ]);
        }
    };

    useEffect(() => {
        // Initialize selectedTypes with the provided type prop
        if (type) {
            setSelectedTypes(Array.isArray(type) ? type : [type]);
        }
    }, [type]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={{
                paddingVertical: calcHeight(2),
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}
            onPress={() => toggleTypeSelection(item)}
        >
            <View
                style={{
                    flexDirection: 'row',
                    gap: calcWidth(8),
                }}
            >
                {item.icon}
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(12),
                        color: COLOR.TEXT,
                    }}
                >
                    {item.name}
                </Text>
            </View>
            <AntDesign
                name={
                    selectedTypes.includes(item)
                        ? 'checkcircle'
                        : 'checkcircleo'
                }
                size={calcWidth(7)}
                color={selectedTypes.includes(item) ? COLOR.BUTTON : COLOR.TEXT}
            />
        </TouchableOpacity>
    );

    const applySelectionAndCloseModal = () => {
        setType(selectedTypes);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={{
                    backgroundColor: '#342F4F',
                    padding: 10,
                    flexDirection: 'row',
                    gap: calcWidth(8),
                    alignItems: 'center',
                }}
                onPress={() => setModalVisible(true)}
            >
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(15),
                        color: COLOR.TEXT,
                    }}
                >
                    Type
                </Text>
                <Image
                    style={{
                        height: calcWidth(3),
                        width: calcWidth(5),
                    }}
                    source={typeIcon}
                />
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <View
                        style={{
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: calcHeight(4),
                            backgroundColor: COLOR.APP_BACKGROUND,
                            paddingBottom: calcHeight(7),
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: calcHeight(2),
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: getFontSizeByWindowWidth(15),
                                    fontWeight: 'bold',
                                    color: COLOR.TEXT,
                                }}
                            >
                                Type
                            </Text>
                            <TouchableOpacity
                                onPress={applySelectionAndCloseModal}
                            >
                                <Text
                                    style={{
                                        fontSize: getFontSizeByWindowWidth(15),
                                        fontWeight: 'bold',
                                        color: COLOR.BUTTON,
                                    }}
                                >
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={Categories}
                            renderItem={renderItem}
                            keyExtractor={(item) => item}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default TypeSelector;