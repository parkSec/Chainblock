import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { Web3Context } from '../context/Web3Context'

export function Profile() {
  const navigate = useNavigate()
  const { isDarkMode } = useContext(ThemeContext)
  const { account, isConnected, getReadContract } = useContext(Web3Context)

  const [activeTab, setActiveTab] = useState('questions')
  const [userQuestions, setUserQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !account) return

    const loadProfileData = async () => {
      try {
        setLoading(true)
        const contract = getReadContract()

        const questionCount = await contract.questionCount()
        const answerCount = await contract.answerCount()

        const myQuestions = []
        const myAnswers = []

        // 내가 등록한 질문 찾기
        for (let i = 1n; i <= questionCount; i++) {
          try {
            const q = await contract.questions(i)

            if (q.author.toLowerCase() === account.toLowerCase()) {
              // localStorage에서 실제 질문 데이터 조회
              let questionTitle = `Question #${i}`
              let questionDescription = ''
              let questionCode = ''

              try {
                const stored = localStorage.getItem(q.ipfsCID)
                if (stored) {
                  const data = JSON.parse(stored)
                  questionTitle = data.title || questionTitle
                  questionDescription = data.description || ''
                  questionCode = data.code || ''
                }
              } catch (err) {
                console.warn('질문 데이터 로드 실패:', err)
              }

              myQuestions.push({
                id: Number(i),
                title: questionTitle,
                description: questionDescription,
                code: questionCode,
                bountyAmount: (BigInt(q.bountyAmount) / BigInt(10 ** 18)).toString(),
                isResolved: q.isResolved,
                ipfsCID: q.ipfsCID,
                createdAt: new Date().toLocaleDateString('ko-KR')
              })
            }
          } catch (err) {
            console.error(`질문 ${i} 조회 실패:`, err)
          }
        }

        // 내가 답변한 질문 찾기
        for (let i = 1n; i <= answerCount; i++) {
          try {
            const a = await contract.answers(i)

            if (a.solver.toLowerCase() === account.toLowerCase()) {
              // 해당 질문 정보 조회
              const q = await contract.questions(a.questionId)

              // localStorage에서 질문 데이터 조회
              let questionTitle = `Question #${a.questionId}`
              try {
                const stored = localStorage.getItem(q.ipfsCID)
                if (stored) {
                  const data = JSON.parse(stored)
                  questionTitle = data.title || questionTitle
                }
              } catch (err) {
                console.warn('질문 데이터 로드 실패:', err)
              }

              myAnswers.push({
                id: Number(i),
                questionId: Number(a.questionId),
                questionTitle: questionTitle,
                summary: a.summary,
                isUnlocked: a.isUnlocked,
                bountyAmount: (BigInt(q.bountyAmount) / BigInt(10 ** 18)).toString(),
                createdAt: new Date().toLocaleDateString('ko-KR')
              })
            }
          } catch (err) {
            console.error(`답변 ${i} 조회 실패:`, err)
          }
        }

        setUserQuestions(myQuestions)
        setUserAnswers(myAnswers)
      } catch (err) {
        console.error('프로필 데이터 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [isConnected, account, getReadContract])

  const formatAddress = (addr) => {
    if (!addr) return '알 수 없음'
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  if (!isConnected) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-center p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            지갑 연결 필요
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            마이페이지를 보려면 지갑을 연결해주세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-8 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto">
        {/* 프로필 헤더 */}
        <div className={`mb-8 p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-6 mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'}`}>
              {account?.substring(2, 4).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                내 프로필
              </h1>
              <p className={`font-mono text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {account}
              </p>
            </div>
          </div>

          {/* 통계 */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                등록한 질문
              </p>
              <p className="text-3xl font-bold text-blue-600">{userQuestions.length}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                제출한 답변
              </p>
              <p className="text-3xl font-bold text-purple-600">{userAnswers.length}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                획득한 보상
              </p>
              <p className="text-3xl font-bold text-green-600">
                {(userAnswers.reduce((sum, a) => sum + (a.isUnlocked ? parseFloat(a.bountyAmount) : 0), 0)).toFixed(2)} ETH
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                성공률
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {userAnswers.length > 0 ? Math.round((userAnswers.filter(a => a.isUnlocked).length / userAnswers.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className={`mb-8 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'questions'
                  ? 'border-blue-600 text-blue-600'
                  : isDarkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 내가 등록한 질문 ({userQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`pb-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'answers'
                  ? 'border-blue-600 text-blue-600'
                  : isDarkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💬 내가 답변한 질문 ({userAnswers.length})
            </button>
          </div>
        </div>

        {/* 내가 등록한 질문 탭 */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {loading ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>로딩 중...</p>
              </div>
            ) : userQuestions.length === 0 ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  등록한 질문이 없습니다
                </p>
              </div>
            ) : (
              userQuestions.map(q => (
                <div
                  key={q.id}
                  onClick={() => navigate(`/question/${q.id}`)}
                  className={`p-6 rounded-lg cursor-pointer transition-transform hover:scale-102 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {q.title}
                      </h3>
                      <p className={`text-sm mb-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {q.description || '설명 없음'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        등록일: {q.createdAt}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                        q.isResolved
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {q.isResolved ? '해결됨' : '진행 중'}
                      </span>
                      <p className="text-lg font-bold text-blue-600">💰 {q.bountyAmount} ETH</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 내가 답변한 질문 탭 */}
        {activeTab === 'answers' && (
          <div className="space-y-4">
            {loading ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>로딩 중...</p>
              </div>
            ) : userAnswers.length === 0 ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  답변한 질문이 없습니다
                </p>
              </div>
            ) : (
              userAnswers.map(a => (
                <div
                  key={a.id}
                  onClick={() => navigate(`/question/${a.questionId}`)}
                  className={`p-6 rounded-lg cursor-pointer transition-transform hover:scale-102 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {a.questionTitle}
                      </h3>
                      <p className={`text-sm mb-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {a.summary}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        제출일: {a.createdAt}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                        a.isUnlocked
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {a.isUnlocked ? '✅ 지불됨' : '⏳ 대기 중'}
                      </span>
                      <p className="text-lg font-bold text-purple-600">💰 {a.bountyAmount} ETH</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
