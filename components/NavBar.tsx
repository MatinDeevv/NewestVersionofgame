'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaMoneyBillWave, FaBitcoin, FaStore, FaUserCircle, FaBriefcase, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-background border-b border-yellow-600">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <span className="text-2xl font-extrabold text-yellow-300 cursor-pointer">
            Business Empire
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="flex items-center text-gray-300 hover:text-yellow-300 transition">
            <FaMoneyBillWave className="mr-2" /> Earning
          </Link>

        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-yellow-600">
          <div className="px-4 py-4 space-y-2">
            <Link href="/earning" className="flex items-center block text-gray-300 hover:text-yellow-300 transition">
              <FaMoneyBillWave className="mr-2" /> Earning
            </Link>
            <Link href="/crypto" className="flex items-center block text-gray-300 hover:text-yellow-300 transition">
              <FaBitcoin className="mr-2" /> Crypto
            </Link>
            <Link href="/shops" className="flex items-center block text-gray-300 hover:text-yellow-300 transition">
              <FaStore className="mr-2" /> Shops
            </Link>
            <Link href="/profile" className="flex items-center block text-gray-300 hover:text-yellow-300 transition">
              <FaUserCircle className="mr-2" /> Profile
            </Link>
            <Link href="/bussiness" className="flex items-center block text-gray-300 hover:text-yellow-300 transition">
              <FaBriefcase className="mr-2" /> Bussiness
            </Link>
            <button className="flex items-center w-full text-left text-gray-300 hover:text-yellow-300 transition">
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
