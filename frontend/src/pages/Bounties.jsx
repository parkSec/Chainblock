import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { Web3Context } from '../context/Web3Context'

export function Bounties() {
  const navigate = useNavigate()
  const { isDarkMode } = useContext(ThemeContext)
  const { getReadContract } = useContext(Web3Context)
  const [bounties, setBounties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const contract = getReadContract()
        const count = await contract.questionCount()
        const countNum = Number(count)

        const fetchedBounties = []
        for (let i = 1; i <= countNum; i++) {
          const q = await contract.questions(i)
          const bountyAmount = Number(q.bountyAmount) / 1e18

          fetchedBounties.push({
            id: Number(q.id),
            title: `Question #${q.id}`,
            author: q.author,
            reward: bountyAmount.toFixed(4),
            status: q.isResolved ? 'resolved' : 'open',
            category: 'Bug',
            views: Math.floor(Math.random() * 500),
            answers: Math.floor(Math.random() * 10)
          })
        }

        setBounties(fetchedBounties.reverse())
      } catch (error) {
        console.error('바운티 조회 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBounties()
  }, [])

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <div className={`min-h-screen py-8 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🔍 바운티 탐색
        </h1>

        {/* 필터 */}
        <div className={`mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="검색..."
              className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option>모든 상태</option>
              <option>진행 중</option>
              <option>해결됨</option>
            </select>
          </div>
        </div>

        {/* 바운티 리스트 */}
        <div className="space-y-4">
          {loading ? (
            <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                블록체인에서 바운티를 로드하는 중...
              </p>
            </div>
          ) : bounties.length === 0 ? (
            <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                등록된 바운티가 없습니다. 질문을 등록해보세요!
              </p>
            </div>
          ) : (
            bounties.map(bounty => (
              <div
                key={bounty.id}
                className={`p-6 rounded-lg cursor-pointer transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-md'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${bounty.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                        {bounty.status === 'open' ? '진행 중' : '해결됨'}
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {bounty.title}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      작성자: <span className="font-mono">{formatAddress(bounty.author)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      💰 {bounty.reward} ETH
                    </div>
                  </div>
                </div>
                <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex gap-6">
                    <span>👁️ {bounty.views} 조회</span>
                    <span>💬 {bounty.answers} 답변</span>
                  </div>
                  <button
                    onClick={() => navigate(`/question/${bounty.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    상세보기
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}