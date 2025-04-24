import React, { createContext, useContext, useState } from "react";

type CinemaContextType = {
    selectedCinema: number | null;
    setSelectedCinema: (cinemaId: number | null) => void;
};

const CinemaContext = createContext<CinemaContextType>({
    selectedCinema: null,
    setSelectedCinema: () => { },
});

export const useCinema = () => useContext(CinemaContext);

export const CinemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedCinema, setSelectedCinema] = useState<number | null>(null);

    return (
        <CinemaContext.Provider value={{ selectedCinema, setSelectedCinema }}>
            {children}
        </CinemaContext.Provider>
    );
};
