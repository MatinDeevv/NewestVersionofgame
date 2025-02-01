'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import supabase from '@/types/supabaseClient';
import Navbar from '@/components/NavBar';

interface BalanceCardProps {
  balance: number;
  username: string;
  multiplier: number;
  cardNumber: string;
}

const BalanceCard = ({ balance, username, multiplier, cardNumber }: BalanceCardProps) => {
  const [copied, setCopied] = useState(false);

  // Copy card number to clipboard and show temporary feedback.
  const handleCopy = () => {
    navigator.clipboard.writeText(cardNumber)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <section className="w-full mb-8 border-2 border-yellow-600 p-8 md:p-16 rounded-lg">
      {/* Card Number & Copy Option */}
      <section className="flex items-center justify-between">
        <div>
          <p className="text-xs text-yellow-300 uppercase">Card Number</p>
          <p className="text-lg font-bold">{cardNumber}</p>
        </div>
        <button 
          onClick={handleCopy} 
          className="text-sm text-yellow-300 border border-yellow-600 px-2 py-1 rounded"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </section>
      {/* Balance Display */}
      <section className="mt-4">
        <p className="text-xl text-yellow-300">Balance</p>
        <h2 className="text-6xl font-bold mt-2">${balance.toFixed(2)}</h2>
      </section>
      {/* Additional Info */}
      <section className="mt-4 flex justify-between text-md text-yellow-300">
        <p>{username}</p>
        <p>Multiplier: {multiplier.toFixed(2)}x</p>
      </section>
    </section>
  );
};

export default function Page() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [upgradeCost, setUpgradeCost] = useState(10);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  // Helper: generate a random card number in "XXXX XXXX XXXX XXXX" format.
  const generateCardNumber = () => {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      const randomSegment = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      segments.push(randomSegment);
    }
    return segments.join(" ");
  };

  // Check authentication and fetch player data.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          router.push('/login');
        } else {
          setIsAuthenticated(true);
          await fetchPlayerData(session.user.id);
        }
      } catch (err) {
        console.error('Error during authentication check:', err);
      }
    };
    checkAuth();
  }, [router]);

  // Fetch player data from Supabase.
  // If no card number exists, generate one, update the state and database.
  const fetchPlayerData = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching player data:', error, JSON.stringify(error));
      } else if (data) {
        setBalance(data.balance);
        setMultiplier(data.multiplier);
        setUsername(data.username);
        if (data.card_number) {
          setCardNumber(data.card_number);
        } else {
          const newCardNumber = generateCardNumber();
          setCardNumber(newCardNumber);
          // Update the record with the new card number.
          const { error: updateError } = await supabase
            .from('players')
            .update({ card_number: newCardNumber })
            .eq('id', userId);
          if (updateError) {
            console.error('Error updating card number:', updateError, JSON.stringify(updateError));
          }
        }
      } else {
        // No record found; insert a new record with default values and a generated card number.
        const newCardNumber = generateCardNumber();
        const { data: newData, error: insertError } = await supabase
          .from('players')
          .insert({ id: userId, balance: 0, multiplier: 1, username: "NewPlayer", card_number: newCardNumber })
          .select()
          .maybeSingle();
        if (insertError) {
          console.error('Error creating new player data:', insertError, JSON.stringify(insertError));
        } else if (newData) {
          setBalance(newData.balance);
          setMultiplier(newData.multiplier);
          setUsername(newData.username);
          setCardNumber(newData.card_number);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching player data:', err);
    }
  };

  // Save player data to Supabase.
  const savePlayerData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('players')
          .update({ balance, multiplier })
          .eq('id', session.user.id);
        if (error) {
          console.error('Error saving player data:', error, JSON.stringify(error));
        }
      }
    } catch (err) {
      console.error('Unexpected error saving player data:', err);
    }
  };

  // Handle clicks to earn money.
  const handleClick = () => {
    setBalance((prev) => prev + multiplier);
  };

  // Handle upgrading multiplier.
  const handleUpgrade = () => {
    if (balance >= upgradeCost) {
      setBalance((prev) => prev - upgradeCost);
      setMultiplier((prev) => prev * 1.5);
      setUpgradeCost((prev) => Math.ceil(prev * 7.5));
    }
  };

  // Save player data whenever relevant state changes.
  useEffect(() => {
    if (isAuthenticated) savePlayerData();
  }, [balance, multiplier, upgradeCost, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <section className="text-white text-center mt-10 select-none">
        Loading...
      </section>
    );
  }

  return (
    <section className="min-h-screen text-white select-none">

      <header className="w-full px-6 py-4 border-b border-yellow-600">
        <nav>
          <Navbar />
        </nav>
      </header>

      <section className="w-full px-4 py-8">
        {/* Balance Card Component with card number from database */}
        <BalanceCard
          balance={balance}
          username={username}
          multiplier={multiplier}
          cardNumber={cardNumber}
        />

        {/* Clicker Section */}
        <section onClick={handleClick} className="w-full mb-8 cursor-pointer">
          <Image
            src="/clicker.png"
            alt="Clicker"
            width={250}
            height={250}
            className="mx-auto"
          />
          <section className="w-full flex items-center justify-center mt-4">
            <span className="text-xl text-white bg-blue-900 bg-opacity-50 px-4 py-2 rounded border border-yellow-600">
              Click Me!
            </span>
          </section>
        </section>

        {/* Upgrade Section */}
        <section className="w-full border border-yellow-600 p-6">
          <h2 className="text-2xl font-bold mb-4">Upgrade Your Multiplier</h2>
          <button
            onClick={handleUpgrade}
            disabled={balance < upgradeCost}
            className={`w-full py-3 rounded-lg shadow-lg transition duration-300 ${
              balance >= upgradeCost
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Spend ${upgradeCost} to Increase Multiplier
          </button>
        </section>
      </section>
    </section>
  );
}
