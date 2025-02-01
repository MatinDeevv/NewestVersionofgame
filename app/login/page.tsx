'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/types/supabaseClient';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('players')
          .select('username')
          .eq('id', session.user.id)
          .single();
        if (error || !data?.username) router.push('/choose-username');
        else router.push('/');
      }
    })();
  }, [router]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setErrorMessage(error.message);
  };

  const handleEmailSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setErrorMessage(error.message);
    else alert('Signup successful! You can now log in.');
  };

  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMessage(error.message);
    else {
      const session = await supabase.auth.getSession();
      if (session.data?.session) {
        const { data, error } = await supabase
          .from('players')
          .select('username')
          .eq('id', session.data.session.user.id)
          .single();
        if (error || !data?.username) router.push('/choose-username');
        else router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-2xl rounded-lg border border-yellow-600">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-yellow-300">
          Welcome Back
        </h1>
        {errorMessage && (
          <div className="mb-4 text-red-400 text-center">{errorMessage}</div>
        )}
        <div className="mb-6">
          <label className="block mb-2 text-yellow-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-yellow-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          <label className="text-yellow-300">Remember Me</label>
        </div>
        <button
          onClick={handleEmailSignup}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition mb-4"
        >
          Sign Up
        </button>
        <button
          onClick={handleEmailLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-4"
        >
          Log In
        </button>
        {/* Custom Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="select-none appearance-none bg-[#131314] border border-[#8e918f] rounded-[20px] text-[#e3e3e3] cursor-pointer font-sans text-sm h-10 tracking-[0.25px] w-96 outline-none overflow-hidden px-3 relative text-center transition duration-200 align-middle whitespace-nowrap max-w-[400px] min-w-min hover:shadow-md disabled:cursor-default disabled:bg-[#13131461] disabled:border-[#8e918f1f]"
        >
          <div className="flex items-center w-full">
            <div className="h-5 mr-3 min-w-[20px] w-5">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="block"
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="flex-grow font-medium truncate">Continue with Google</span>
            <span className="hidden">Continue with Google</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
