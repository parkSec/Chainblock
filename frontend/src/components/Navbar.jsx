import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { Web3Context } from '../context/Web3Context'

export function Navbar() {
  const location = useLocation()
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)
  const { account, isConnected, connectWallet, disconnectWallet } = useContext(Web3Context)

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`${isDarkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'} border-b sticky top-0 z-50 shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🐛 BugBounty
            </span>
          </Link>

          {/* 네비게이션 링크 */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`font-semibold transition-colors ${isActive('/') ? 'text-blue-600' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              홈
            </Link>
            <Link
              to="/bounties"
              className={`font-semibold transition-colors ${isActive('/bounties') ? 'text-blue-600' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              바운티 찾기
            </Link>
            <Link
              to="/post"
              className={`font-semibold transition-colors ${isActive('/post') ? 'text-blue-600' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              질문 등록
            </Link>
            <Link
              to="/profile"
              className={`font-semibold transition-colors ${isActive('/profile') ? 'text-blue-600' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              마이페이지
            </Link>
          </div>

          {/* 오른쪽 버튼 */}
          <div className="flex items-center gap-4">
            {/* 다크모드 토글 */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}
              title="다크모드 토글"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* 지갑 연결 버튼 */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-lg font-mono text-sm ${isDarkMode ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600'}`}>
                  {formatAddress(account)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  연결 해제
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                지갑 연결
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}