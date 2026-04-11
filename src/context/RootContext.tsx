import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';
import {Loader} from '../Components';

interface RootContextType {
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const initialValue: RootContextType = {
  setLoading: () => {},
};

const RootContext = createContext<RootContextType>(initialValue);

const RootProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <RootContext.Provider value={{setLoading}}>
      {children}
      <Loader loading={loading} />
    </RootContext.Provider>
  );
};

export {RootContext, RootProvider};
