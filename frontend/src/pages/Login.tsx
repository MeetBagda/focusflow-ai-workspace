import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-300">Sign in to continue with FocusFlow AI</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg p-6">
          <SignIn 
            routing="path" 
            path="/login" 
            signUpUrl="/signup"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0",
                header: "text-center",
                footer: "text-center",
              }
            }}
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-slate-300 text-sm">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/signup')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;