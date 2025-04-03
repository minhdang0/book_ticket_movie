import { useContext } from "react";
import { LoadingContext } from "../contexts/LoadingContext";

function useLoading() {
    const context = useContext(LoadingContext);
    
    if (!context) {
        throw new Error("error");
    }
    return context; 
}

export default useLoading;
