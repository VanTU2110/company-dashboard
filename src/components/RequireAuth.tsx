// components/RequireAuth.tsx
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
interface RequireAuthProps {
    children: ReactNode;
  }
  const RequireAuth = ({ children }: RequireAuthProps) => {
    const userUuid = localStorage.getItem('useruuid');
    return userUuid ? children : <Navigate to="/login" replace />;
  };
  
  export default RequireAuth;