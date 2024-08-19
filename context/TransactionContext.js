import React, { createContext, useContext, useEffect, useState } from 'react';
import apiHelper from '../helper/apiHelper';
import { useAuth } from '../stores/auth';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const { user } = useAuth();
    const [transactionData, setTransactionData] = useState({});
    const [upiParams, setUpiParams] = useState({});
    const [newGroup, setNewGroup] = useState(null);

    const resetTransaction = () => {
        setTransactionData((prev) => ({
            ...prev,
            amount: '',
            description: '',
            date: new Date(),
            type: 'General',
            splitAmong: [],
            group: {},
            paidBy: { _id: user?._id, name: 'You' },
        }));
    };

    useEffect(() => {
        const fetchNewGroupData = async () => {
            if (newGroup) {
                try {
                    const data = await apiHelper(`/group/`);
                    const fetchedGroups = data.data;
                    const matchingGroup = fetchedGroups.find((group) => group.name === newGroup.name);

                    if (matchingGroup) {
                        setTransactionData((prev) => ({
                            ...prev,
                            group: matchingGroup,
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching group data:', error);
                }
            }
        };
        fetchNewGroupData();
    }, [newGroup]);

    return (
        <TransactionContext.Provider
            value={{
                transactionData,
                setTransactionData,
                resetTransaction,
                upiParams,
                setUpiParams,
                newGroup,
                setNewGroup,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransaction = () => {
    return useContext(TransactionContext);
};
