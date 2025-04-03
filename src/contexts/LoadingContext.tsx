import { createContext, useState, ReactNode } from "react";

interface LoadingType {
    loading: boolean;
    setLoading: (value: boolean) => void;
}
export const LoadingContext = createContext<LoadingType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setLoading] = useState<boolean>(false);

    return (
        <LoadingContext.Provider value={{ loading: isLoading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
