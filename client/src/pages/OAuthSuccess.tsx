import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const OAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Guard: Only run once
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleOAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login/student?error=oauth_failed');
          return;
        }

        if (!token || !userParam) {
          navigate('/login/student?error=missing_token');
          return;
        }

        // Parse user data from URL
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Update Auth context
        updateUser({
          ...userData,
          token,
        });

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify({ ...userData, token }));
        localStorage.setItem('token', token);

        // Redirect to student dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } catch (error) {
        console.error('OAuth success handler error:', error);
        navigate('/login/student?error=processing_failed');
      }
    };

    handleOAuthSuccess();
  }, [navigate, searchParams, updateUser]); // Empty dependency array - runs only once

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
};
