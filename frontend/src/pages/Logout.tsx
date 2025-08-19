import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { RingLoader } from 'react-spinners';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/');
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <RingLoader
          color="#0de5be"
          loading={true}
          size={60}
          speedMultiplier={1}
        />
        <p className="mt-4 text-lg text-foreground">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;