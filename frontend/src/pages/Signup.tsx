import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-1">Create an account</h1>
          <p className="text-slate-300">Start organizing your tasks with FocusFlow AI</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg p-6">
          <SignUp 
            routing="path" 
            path="/signup" 
            signInUrl="/login"
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
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign in
            </button>
          </p>
          
          <p className="text-xs text-slate-400 mt-6">
            By signing up, you agree to our
            <button className="text-slate-300 ml-1 hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button className="text-slate-300 hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;