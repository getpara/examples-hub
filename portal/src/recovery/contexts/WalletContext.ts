import React from 'react';
import emptyFunction from '../emptyFunction';

interface WalletContextType {
    address: string | null;
    setAddress: (address: string | null) => void;
    id: string | null;
    setId: (id: string | null) => void;
}

const WalletContext = React.createContext<WalletContextType>({
    address: null,
    setAddress: emptyFunction,
    id: null,
    setId: emptyFunction,
});

export default WalletContext;