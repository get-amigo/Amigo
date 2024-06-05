import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import COLOR from '../constants/Colors';
import faqArray from '../constants/faq';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

const FAQ = () => {
    // This state will track which FAQ is expanded
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    // Function to toggle the expanded FAQ
    const toggleExpand = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{
                    paddingVertical: calcHeight(4),
                    paddingHorizontal: calcWidth(6),
                }}
            >
                {faqArray.map((faq, index) => (
                    <TouchableOpacity activeOpacity={1} style={styles.faqItem} onPress={() => toggleExpand(index)}>
                        <View style={styles.questionContainer}>
                            <Text style={styles.question}>{faq.question}</Text>
                            <MaterialIcons
                                name={expandedFAQ === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={calcHeight(2)}
                                color="rgba(255,255,255,0.75)"
                                style={styles.arrowIcon}
                            />
                        </View>
                        <MotiView
                            from={{ height: 0 }}
                            animate={{ height: expandedFAQ === index ? calcHeight(8) : 0 }}
                            transition={{ type: 'timing', duration: 300 }}
                            style={{
                                marginTop: calcWidth(2),
                            }}
                        >
                            <Text style={styles.answer}>{faq.answer}</Text>
                        </MotiView>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    faqItem: {
        // borderBottomWidth: 1,
        borderBottomColor: '#fff',
        paddingVertical: calcHeight(2.4),
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        marginBottom: calcWidth(4),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingHorizontal: calcWidth(4),
    },
    questionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
        gap: calcWidth(1.2),
    },
    question: {
        flex: 1,
        fontSize: getFontSizeByWindowWidth(12),
        color: 'rgba(255,255,255,1)',
        // color:COLOR.BUTTON,
        // color:"rgba(135, 64, 253, 0.85)"
    },
    answer: {
        paddingTop: calcWidth(2),
        // color:COLOR.TEXT
        color: 'rgba(255,255,255,0.8)',
        lineHeight: calcHeight(2.4),
    },
    arrowIcon: {
        backgroundColor: COLOR.BUTTON,
        borderRadius: 100,
    },
});

export default FAQ;
