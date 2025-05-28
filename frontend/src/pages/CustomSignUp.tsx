import React, { useState, useEffect } from 'react';
import { useSignUp, useAuth } from '@clerk/clerk-react'; // Import useAuth
import { useNavigate } from 'react-router-dom';

const CustomSignUp: React.FC = () => {
  // Destructure signUp and isLoaded from useSignUp hook
  // setActive is also available from useSignUp to set the active session after sign-up
  const { signUp, isLoaded, setActive } = useSignUp();
  const { isSignedIn } = useAuth(); // Get isSignedIn status
  const navigate = useNavigate();

  // State variables for form inputs, error messages, and loading status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false); // State for email verification

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/app'); // Redirect to dashboard if already logged in
    }
  }, [isSignedIn, navigate]);

  // Function to handle the sign-up form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return; // Ensure Clerk is loaded before proceeding

    // Clear previous errors and set loading state
    setError('');
    setLoading(true);

    // Basic client-side validation for password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Attempt to create a new user with the provided credentials
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      // Check the status of the sign-up process
      if (result.status === 'complete') {
        // If sign-up is complete, set the active session and navigate to dashboard
        await setActive({ session: result.createdSessionId });
        navigate('/app');
      } else if ((result.status as string) === 'needs_email_verification') { // Added type assertion here
        // If email verification is required, send a verification email
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true); // Update state to show verification UI
        // Optionally, navigate to a verification page or show a modal
        // For this example, we'll assume the user will be prompted to verify on the same page
      } else {
        // Log any unexpected statuses for debugging
        console.log('Unexpected sign-up status:', result);
      }
    } catch (err: any) {
      // Catch and display any errors from the sign-up process (e.g., email already exists)
      setError(err.errors?.[0]?.message || 'Something went wrong during sign-up');
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  // Function to handle social sign-up redirection
  const handleSocialSignUp = async (strategy: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;

    try {
      // Use Clerk's authenticateWithRedirect for social sign-ups
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback', // This URL should be configured in your Clerk application
        redirectUrlComplete: '/app', // Where to go after successful sign-up
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong with social sign-up');
    }
  };

  // If email verification is pending, you might show a different UI here
  if (pendingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] font-sans">
        <div className="w-full max-w-md p-6 bg-[#282828] shadow-xl rounded-lg border border-[#3A3A3A] text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
          <p className="mb-4">A verification code has been sent to {email}. Please check your inbox and enter the code to complete your registration.</p>
          {/* You would typically add an input field for the code and a button to submit it here */}
          {/* For simplicity, this example just shows the message. */}
          <button
            onClick={() => navigate('/login')}
            className="mt-4 text-[#FF8C00] hover:text-[#E67E00] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF8C00] rounded-md transition duration-200 ease-in-out"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Only render the signup form if Clerk is loaded and user is not signed in
  if (!isLoaded || isSignedIn) {
    return null; // Or a loading spinner if needed
  }

  return (
    // Main container with dark background from the UI
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] font-sans">
      {/* Sign-up card with a slightly lighter dark background */}
      <div className="w-full max-w-md p-6 bg-[#282828] shadow-xl rounded-lg border border-[#3A3A3A]">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Create an account</h1>
          <p className="text-gray-400">Sign up to start with FocusFlow AI</p>
        </div>

        {/* Social Sign-up Buttons */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialSignUp('oauth_google')}
            className="w-full flex items-center justify-center px-4 py-2 border border-[#3A3A3A] rounded-md shadow-sm text-sm font-medium text-white bg-[#3A3A3A] hover:bg-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition duration-200 ease-in-out"
          >
            {/* Google Icon (inline SVG) */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.297v2.416h6.727c-.286 1.778-2.128 4.71-6.727 4.71-4.067 0-7.382-3.35-7.382-7.469 0-4.118 3.315-7.469 7.382-7.469 2.213 0 3.696.945 4.544 1.75l2.122-2.06c-1.31-1.23-3.003-2.01-6.666-2.01-5.59 0-10.133 4.58-10.133 10.299s4.543 10.299 10.133 10.299c5.845 0 9.775-4.144 9.775-9.999 0-.685-.078-1.346-.188-1.996h-9.587z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialSignUp('oauth_github')}
            className="w-full flex items-center justify-center px-4 py-2 border border-[#3A3A3A] rounded-md shadow-sm text-sm font-medium text-white bg-[#3A3A3A] hover:bg-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition duration-200 ease-in-out"
          >
            {/* GitHub Icon (inline SVG for simplicity) */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.087-.744.084-.729.084-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.492.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.333-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.3-.535-1.524.118-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.293-1.552 3.301-1.23 3.301-1.23.653 1.653.242 2.876.118 3.176.766.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.807 24 17.306 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            Sign up with GitHub
          </button>
        </div>

        {/* Divider with updated colors */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
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

          <div>
            <label className="block text-white text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-4 py-2 border border-gray-600 rounded-md bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition duration-200 ease-in-out"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-label="Confirm Password"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF8C00] hover:bg-[#E67E00] text-white py-2 rounded-md font-semibold transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            aria-live="polite"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#FF8C00] hover:text-[#E67E00] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF8C00] rounded-md transition duration-200 ease-in-out"
              type="button"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomSignUp;
