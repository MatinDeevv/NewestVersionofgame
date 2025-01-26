'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import supabase from '@/types/supabaseClient';

export default function Page() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [upgradeCost, setUpgradeCost] = useState(10);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  let userId: string;
  // Check if the user is authenticated and fetch their data
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        router.push('https://newest-versionofgame.vercel.app/login');
      } else {
        setIsAuthenticated(true);
        await fetchPlayerData(session.user.id);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch player data from Supabase
  interface PlayerData {
    balance: number;
    multiplier: number;
    username: string;
  }

  const fetchPlayerData = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching player data:', error);
      } else if (data) {
        const playerData: PlayerData = data;
        setBalance(playerData.balance);
        setMultiplier(playerData.multiplier);
        setUsername(playerData.username);
      }
    } catch (err) {
      console.error('Unexpected error fetching player data:', err);
    }
  };

  // Save player data to Supabase
  const savePlayerData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      try {
        const { error } = await supabase
          .from('players')
          .update({
            balance,
            multiplier,
          })
          .eq('id', session.user.id);

        if (error) {
          console.error('Error saving player data:', error);
        }
      } catch (err) {
        console.error('Unexpected error saving player data:', err);
      }
    }
  };

  // Handle clicks to earn money
  const handleClick = () => {
    setBalance((prev) => prev + multiplier);
  };

  // Handle upgrading multiplier
  const handleUpgrade = () => {
    if (balance >= upgradeCost) {
      setBalance((prev) => prev - upgradeCost);
      setMultiplier((prev) => prev * 1.5);
      setUpgradeCost((prev) => Math.ceil(prev * 7.5));
    }
  };

  // Save player data whenever relevant states change
  useEffect(() => {
    if (isAuthenticated) savePlayerData();
  }, [balance, multiplier, upgradeCost, isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="text-white text-center mt-10 select-none">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold tracking-wide">Clicker Game</h1>
        <p className="text-lg text-gray-400">Welcome, {username}</p>
      </header>

      {/* Main Card */}
      <div className="mt-6 mx-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl p-16">
        <p className="text-lg text-gray-400">Balance:</p>
        <h2 className="text-5xl font-bold mt-2 text-white">${balance.toFixed(2)}</h2>
        <div className="flex justify-between mt-4 text-md text-gray-400">
          <p>Username: {username}</p>
          <p>Multiplier: {multiplier.toFixed(2)}x</p>
        </div>
      </div>

      {/* Clicker Area */}
      <div
        onClick={handleClick}
        className="mt-10 mx-4 bg-gradient-to-b from-gray-700 to-gray-950 rounded-lg py-64 shadow-lg text-center cursor-pointer transform transition hover:scale-105"
      >
        <Image
          src="/clicker.png"
          alt="Clicker"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>

      {/* Upgrade Section */}
      <div className="mt-6 mx-4 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Upgrade Your Multiplier</h2>
        <button
          onClick={handleUpgrade}
          disabled={balance < upgradeCost}
          className={`w-full py-3 rounded-lg shadow-lg transform transition ${
            balance >= upgradeCost
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          Spend ${upgradeCost} to Increase Multiplier
        </button>
      </div>
    </div>
  );
}
