import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  // 1. Not logged in? Send to login
  if (!token) return <Navigate to="/login" />;

  // 2. Logged in but wrong role? Send to home (or a 403 page)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;