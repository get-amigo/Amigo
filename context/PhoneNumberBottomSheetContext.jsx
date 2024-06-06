import React, { createContext, useCallback, useMemo, useRef, useState } from 'react';

export const PhoneNumberBottomSheetContext = createContext();

const PhoneNumberBottomSheetProvider = ({ children }) => {
    const bottomSheetRef = useRef(null);
    const [phoneNumber, setPhoneNumber] = useState();
    return (
        <>
            <PhoneNumberBottomSheetContext.Provider value={{ bottomSheetRef, phoneNumber, setPhoneNumber }}>
                {children}
            </PhoneNumberBottomSheetContext.Provider>
        </>
    );
};

export default PhoneNumberBottomSheetProvider;
