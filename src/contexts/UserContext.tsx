import React, { createContext, useEffect, useState } from "react";
import authService from "../services/authService";

interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    age?: number;
    birthDate?: Date;
    gender?: string
}

interface UserContextType {
    user: User | null;
    loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

type Props = {
    children: React.ReactNode;
};

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserApi = async () => {
            setLoading(true);
            try {
                const data = await authService.currentUser();
                setUser(data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };
        getUserApi();
    }, []);
    return (
        <UserContext.Provider value={{ user, loading }}>
            {children}
        </UserContext.Provider>
    );
};
