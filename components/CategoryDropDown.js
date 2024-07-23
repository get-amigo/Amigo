import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome'; // Ensure you have this package installed

function CategoryDropDown({ selectedCategory, setSelectedCategory }) {
    const categories = ['General', 'JavaScript', 'Python', 'React']; // Added "React" category

    return (
        <View style={styles.container}>
            <SelectDropdown
                data={categories}
                onSelect={(selectedItem, index) => {
                    setSelectedCategory(selectedItem);
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                    // You can include an icon as part of the text by returning a component
                    return (
                        <View style={styles.dropdownItem}>
                            <Icon name="check-circle" size={18} color="#6e6e6e" />
                            <Text>{selectedItem}</Text>
                        </View>
                    );
                }}
                rowTextForSelection={(item, index) => {
                    return (
                        <View style={styles.dropdownItem}>
                            <Icon name="check-circle" size={18} color="#6e6e6e" />
                            <Text>{item}</Text>
                        </View>
                    );
                }}
                buttonStyle={styles.dropdownButton}
                buttonTextStyle={styles.dropdownButtonText}
                defaultValue={selectedCategory}
                // Add more props and styling as needed
                renderDropdownIcon={() => {
                    return <Icon name="chevron-down" size={18} color="#6e6e6e" />;
                }}
                dropdownIconPosition="right"
            />
        </View>
    );
}

export default CategoryDropDown;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        alignItems: 'center',
    },
    dropdownButton: {
        width: 150,
        height: 50,
        backgroundColor: '#00BFFF', // Changed background color to sky blue
        borderRadius: 8,
        // Additional styling for the dropdown button
    },
    dropdownButtonText: {
        textAlign: 'left',
        // Additional styling for the dropdown button text
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
