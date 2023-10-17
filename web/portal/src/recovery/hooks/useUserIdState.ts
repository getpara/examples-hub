import { useState } from 'react';
import { STORAGE_PREFIX } from '../../library/modal/utils';

const useUserIdState = (initialValue: string | null) => {
    const [state, setState] = useState<string | null>(() => {
        const storedValue = localStorage.getItem(`${STORAGE_PREFIX}userId`);
        return storedValue !== null ? storedValue : initialValue;
    });

    const setUserId = (value: string | null) => {
        setState(value);

        if (value === null) {
            localStorage.removeItem(`${STORAGE_PREFIX}userId`);
        } else {
            localStorage.setItem(`${STORAGE_PREFIX}userId`, value);
        }
    };

    return [state, setUserId] as const;
};

export default useUserIdState;
