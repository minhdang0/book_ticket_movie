import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getCurrentUser } from "../../features/auth/authAsync";
import type { AppDispatch } from "../../store";

function UserProvider() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(getCurrentUser());
    }, [dispatch]);

    return null;
}

export default UserProvider;
