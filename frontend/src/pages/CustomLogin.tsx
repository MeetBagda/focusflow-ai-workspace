import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const CustomLogin: React.FC = () => {
  const { signIn, isLoaded, setActive } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return; // Ensure Clerk is loaded before proceeding

    setError('');
    setLoading(true);

    try {
      // Attempt to create a sign-in session with the provided credentials
      const result = await signIn.create({
        identifier: email,
        password,
      });

      // If the sign-in is complete, set the active session and navigate
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/dashboard'); // Navigate to the dashboard upon successful login
      } else {
        // Log unexpected statuses for debugging
        console.log('Unexpected status:', result);
      }
    } catch (err: any) {
      // Catch and display any errors from the sign-in process
      setError(err.errors?.[0]?.message || 'Something went wrong');
    } finally {
      // Always set loading to false after the sign-in attempt
      setLoading(false);
    }
  };

  // Function to handle social login redirection
  const handleSocialSignIn = async (strategy: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;

    try {
      // Use Clerk's authenticateWithRedirect for social logins
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback', // This URL should be configured in your Clerk application
        redirectUrlComplete: '/dashboard', // Where to go after successful sign-in
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong with social login');
    }
  };

  return (
    // Main container with dark background from the UI
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] font-sans">
      {/* Login card with a slightly lighter dark background */}
      <div className="w-full max-w-md p-6 bg-[#282828] shadow-xl rounded-lg border border-[#3A3A3A]">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400">Sign in to continue with FocusFlow AI</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialSignIn('oauth_google')}
            className="w-full flex items-center justify-center px-4 py-2 border border-[#3A3A3A] rounded-md shadow-sm text-sm font-medium text-white bg-[#3A3A3A] hover:bg-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition duration-200 ease-in-out"
          >
            {/* Corrected Google Icon (inline SVG) */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.297v2.416h6.727c-.286 1.778-2.128 4.71-6.727 4.71-4.067 0-7.382-3.35-7.382-7.469 0-4.118 3.315-7.469 7.382-7.469 2.213 0 3.696.945 4.544 1.75l2.122-2.06c-1.31-1.23-3.003-2.01-6.666-2.01-5.59 0-10.133 4.58-10.133 10.299s4.543 10.299 10.133 10.299c5.845 0 9.775-4.144 9.775-9.999 0-.685-.078-1.346-.188-1.996h-9.587z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialSignIn('oauth_github')}
            className="w-full flex items-center justify-center px-4 py-2 border border-[#3A3A3A] rounded-md shadow-sm text-sm font-medium text-white bg-[#3A3A3A] hover:bg-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition duration-200 ease-in-out"
          >
            {/* GitHub Icon (inline SVG for simplicity) */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.087-.744.084-.729.084-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.492.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.333-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.3-.535-1.524.118-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.293-1.552 3.301-1.23 3.301-1.23.653 1.653.242 2.876.118 3.176.766.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.807 24 17.306 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            Sign in with GitHub
          </button>
        </div>

        {/* Divider with updated colors */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-600 rounded-md bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition duration-200 ease-in-out"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-600 rounded-md bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition duration-200 ease-in-out"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF8C00] hover:bg-[#E67E00] text-white py-2 rounded-md font-semibold transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            aria-live="polite"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Don’t have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-[#FF8C00] hover:text-[#E67E00] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF8C00] rounded-md transition duration-200 ease-in-out"
              type="button"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomLogin;
