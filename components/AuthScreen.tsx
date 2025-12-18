import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';

interface AuthScreenProps {
  onLogin: (token: string, user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <LoginPage
      onLogin={onLogin}
      onSwitchToSignup={() => setIsLogin(false)}
    />
  ) : (
    <SignupPage
      onSignup={onLogin}
      onSwitchToLogin={() => setIsLogin(true)}
    />
  );
};
