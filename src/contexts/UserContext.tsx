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
    setUser: (value: User) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

type Props = {
    children: React.ReactNode;
};

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const getUserApi = async () => {

            try {
                const data = await authService.currentUser();
                setUser(data);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        getUserApi();
    }, []);
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
