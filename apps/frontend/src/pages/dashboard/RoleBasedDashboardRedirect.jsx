import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

const ROLE_DASHBOARD_PATHS = {
    admin: '/dashboard/admin',
    // student: '/dashboard/student',
    alumni: '/dashboard/alumni',
    teacher: '/dashboard/teacher',
    // staff: '/dashboard/staff',
    superadmin: '/dashboard/superadmin',
    // Add more roles and paths as needed
};

const RoleBasedDashboardRedirect = () => {
    const navigate = useNavigate();
    const { user, token, refreshToken, setToken, setRefreshToken } = useAuth(); // Assumes user object has a 'role' property

    useEffect(() => {
        if (token && refreshToken) {
            const decodedRefreshToken = JSON.parse(atob(refreshToken.split('.')[1]));
            if (decodedRefreshToken.exp * 1000 < Date.now()) {
                localStorage.removeItem('refresh');
                setRefreshToken(null);
                localStorage.removeItem('token');
                setToken(null);
                navigate('/login');
                return;
            }
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            if (decodedToken.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                setToken(null);
                navigate('/login');
                return;
            }
            const roles = user && user.roles ? user.roles.map(r => r.toLowerCase()) : null;
            const rolePriority = ['superadmin', 'admin', 'alumni', 'teacher'];
            const userRole = rolePriority.find(r => roles.includes(r));
            // const path = roles && roles.length > 0 ? ROLE_DASHBOARD_PATHS[roles[0]] || '/login' : '/login';
            const path = ROLE_DASHBOARD_PATHS[userRole] || '/login';
            navigate(path, { replace: true });
            return;
        }
        if (!user) {
            navigate('/login');
            return;
        }
        // const roles = user && user.roles ? user.roles.map(r => r.toLowerCase()) : null;
        // const rolePriority = ['superadmin', 'admin', 'alumni', 'teacher'];
        // const userRole = rolePriority.find(r => roles.includes(r));
        // const path = roles && roles.length > 0 ? ROLE_DASHBOARD_PATHS[roles[0]] || '/login' : '/login';
        const path = ROLE_DASHBOARD_PATHS[userRole] || '/login';
        navigate(path, { replace: true });
    }, [user, navigate]);

    return null;
};

export default RoleBasedDashboardRedirect;