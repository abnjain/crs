import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

const ROLE_DASHBOARD_PATHS = {
    admin: '/dashboard/admin',
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
    staff: '/dashboard/staff',
    superadmin: '/dashboard/superadmin',
    // Add more roles and paths as needed
};

const RoleBasedDashboardRedirect = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Assumes user object has a 'role' property

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const roles = user && user.roles ? user.roles.map(r => r.toLowerCase()) : null;
        const path = roles && roles.length > 0 ? ROLE_DASHBOARD_PATHS[roles[0]] || '/login' : '/login';
        navigate(path, { replace: true });
    }, [user, navigate]);

    return null;
};

export default RoleBasedDashboardRedirect;