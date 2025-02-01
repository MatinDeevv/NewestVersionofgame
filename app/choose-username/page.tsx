'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/types/supabaseClient';

export default function ChooseUsernamePage() {
  const [username, setUsername] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Refresh JWT token when it expires, redirect on SIGNED_OUT.
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [router]);

  const handleUsernameSubmit = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setErrorMessage('No authenticated user found. Please log in again.');
        router.push('/login');
        return;
      }

      const user = session.user;

      if (!username.trim()) {
        setErrorMessage('Username cannot be empty.');
        return;
      }

      // Update or insert the username in the database
      const { error } = await supabase.from('players').upsert({
        id: user.id, // Use the authenticated user's ID
        username,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Username saved successfully! Redirecting to the game...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(`An unexpected error occurred: ${err.message}`);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-900 to-black">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-2xl rounded-lg border border-yellow-600">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-yellow-300">
          Choose a Username
        </h1>

        {errorMessage && (
          <div className="mb-4 text-red-400 text-center">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="mb-4 text-green-400 text-center">{successMessage}</div>
        )}

        <div className="mb-6">
          <label className="block mb-2 text-yellow-300">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <button
          onClick={handleUsernameSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Save Username
        </button>
      </div>
    </div>
  );
}
