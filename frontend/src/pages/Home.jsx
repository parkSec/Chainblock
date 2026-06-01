import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { Web3Context } from '../context/Web3Context'

export function Home() {
  const navigate = useNavigate()
  const { isDarkMode } = useContext(ThemeContext)
  const { isConnected } = useContext(Web3Context)

  return (
    <div className="min-h-screen">
      {/* 영웅 섹션 */}
      <section className={`py-20 px-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🐛 BugBounty Platform
          </h1>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            블록체인 기반 버그 바운티 플랫폼에서 버그를 찾고 보상을 받으세요
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/bounties')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              🔍 바운티 찾기
            </button>
            {isConnected && (
              <button
                onClick={() => navigate('/post')}
                className={`px-8 py-3 border-2 rounded-lg font-semibold transition-colors ${isDarkMode ? 'border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white' : 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'}`}
              >
                ✍️ 질문 등록
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className={`py-16 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            주요 기능
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="text-4xl mb-4">🔐</div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                안전한 암호화
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                MetaMask 암호화로 답변을 안전하게 보호합니다
              </p>
            </div>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="text-4xl mb-4">⛓️</div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                블록체인 기반
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Sepolia 네트워크에서 투명한 거래를 보장합니다
              </p>
            </div>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="text-4xl mb-4">💰</div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                즉시 보상
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                ETH로 즉시 보상을 받을 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className={`py-16 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">1,234</div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>활성 바운티</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">567</div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>해결된 이슈</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-600 mb-2">89.5 ETH</div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>배분된 보상</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className={`py-20 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            지금 시작하세요
          </h2>
          <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            버그를 찾거나 버그를 해결해서 ETH를 벌어보세요
          </p>
          <button
            onClick={() => navigate('/bounties')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            바운티 탐색하기
          </button>
        </div>
      </section>
    </div>
  )
}