import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Loader from '../components/Loader';
import Search from '../components/Search';
import safeAreaStyle from '../constants/safeAreaStyle';
import apiHelper from '../helper/apiHelper';

const size = 10; // api page fetch size

const SearchScreen = () => {
    const [loading, setLoading] = useState(false);
    const [searchString, setSearchString] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [page, setPage] = useState(1);

    // Debounce function
    const debounce = (func, delay) => {
        let inDebounce;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // Handler for performing the search
    const handleSearch = useCallback(
        debounce(async () => {
            setLoading(true);
            try {
                const response = await apiHelper.get(`/group/search`, {
                    params: { searchString, size, page },
                });
                setSearchResults(response.data.groups); // Assuming the API returns an array of groups
            } catch {
                Alert.alert('Error', 'Failed to fetch search results.');
            }
            setLoading(false);
        }, 500),
        [page],
    ); // 500ms delay, re-run on page/size change

    useEffect(() => {
        handleSearch();
    }, [searchString, handleSearch]);

    // Pagination handlers
    const handleNextPage = () => {
        setPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        setPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    return (
        <SafeAreaView style={safeAreaStyle}>
            <Search setSearch={setSearchString} search={searchString} />
            <ScrollView style={{ width: '100%' }}>
                {searchResults.map((group, index) => (
                    <View key={index} style={styles.groupItem}>
                        <Text style={styles.groupText}>{group.name}</Text>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.pagination}>
                <Button title="Previous" onPress={handlePrevPage} disabled={page === 1} />
                <Text style={styles.pageNumber}>Page: {page}</Text>
                <Button title="Next" onPress={handleNextPage} />
            </View>
            {loading && <Loader />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // ... existing styles ...
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    pageNumber: {
        fontSize: 16,
    },
    // ... other styles ...
});

export default SearchScreen;
