import React from 'react';
import emptyFunction from '../emptyFunction';

interface UserContextType {
  id: string | null;
  setId: (id: string | null) => void;
}

const UserContext = React.createContext<UserContextType>({
  id: null,
  setId: emptyFunction,
});

export default UserContext;
