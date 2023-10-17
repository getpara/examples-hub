import { useState } from 'react';
import { STORAGE_PREFIX } from '../../library/modal/utils';

const useInitiatedAtState = (initialValue: Date | null) => {
    const [state, setState] = useState<Date | null>(() => {
        const storedValue = localStorage.getItem(`${STORAGE_PREFIX}initiatedAt`);
        return storedValue !== null ? new Date(storedValue) : initialValue;
    });

    const setInitiatedAt = (value: Date | string | null) => {
        let dateValue: Date | null;

        if (typeof value === 'string') {
            dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) {
                throw new Error('invalid date string provided');
            }
        } else {
            dateValue = value;
        }

        setState(dateValue);

        if (dateValue === null) {
            localStorage.removeItem(`${STORAGE_PREFIX}initiatedAt`);
        } else {
            localStorage.setItem(`${STORAGE_PREFIX}initiatedAt`, dateValue.toISOString());
        }
    };

    return [state, setInitiatedAt] as const;
};

export default useInitiatedAtState;
