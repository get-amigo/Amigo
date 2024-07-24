import React, { createContext, useContext, useState } from 'react';
const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
    const [group, setGroup] = useState({});

    return (
        <GroupContext.Provider
            value={{
                group,
                setGroup,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
};

export const useGroup = () => {
    return useContext(GroupContext);
};
