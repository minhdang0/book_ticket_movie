import config from '../../config';
import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

type ProtectedRouteProps = {
    children: ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const location = useLocation();

    useEffect(() => {
        setLoading(true);

        (async () => {
            try {
                const data = await authService.currentUser();
                console.log(data.user);
                setCurrentUser(data.user);
                setLoading(false)
            } catch (error) {
                console.error(error);
                setLoading(false)
            }
        })();
    }, []);

    if (loading) {
        return <div>...Loading</div>;
    }

    if (!currentUser) {
        const path = encodeURIComponent(location.pathname);
        return <Navigate to={`${config.routes.login}${path ? `?continue=${path}` : ''}`} />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
