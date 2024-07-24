import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import faqArray from '../constants/faq';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';

const FAQ = () => {
    // This state will track which FAQ is expanded
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    // Function to toggle the expanded FAQ
    const toggleExpand = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <ScrollView
            contentContainerStyle={{
                padding: calcWidth(10),
            }}
            alwaysBounceVertical={false}
        >
            {faqArray.map((faq, index) => (
                <TouchableOpacity key={index} style={styles.faqItem} onPress={() => toggleExpand(index)}>
                    <View style={styles.questionContainer}>
                        <Text style={styles.question}>{faq.question}</Text>
                        <MaterialIcons
                            name={expandedFAQ === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={calcHeight(2)}
                            color="rgba(255,255,255,0.75)"
                        />
                    </View>
                    {expandedFAQ === index && <Text style={styles.answer}>{faq.answer}</Text>}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        paddingVertical: calcHeight(3),
    },
    questionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    question: {
        flex: 1, // Take up all available space
        fontSize: getFontSizeByWindowWidth(12),
        color: 'rgba(255,255,255,0.75)',
    },
    answer: {
        paddingTop: 10,
        color: '#666',
    },
});

export default FAQ;
