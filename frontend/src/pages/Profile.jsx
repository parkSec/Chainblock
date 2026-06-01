import React, { useState, useContext, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { Web3Context } from '../context/Web3Context'

export function Profile() {
  const { isDarkMode } = useContext(ThemeContext)
  const { account, isConnected, getReadContract } = useContext(Web3Context)

  const [activeTab, setActiveTab] = useState('questions')
  const [questions, setQuestions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !account) return

    const loadUserQuestions = async () => {
      try {
        setLoading(true)
        const contract = getReadContract()

    const questionCount = await contract.questionCount();
        const userQuestions = []
        const userAnswers = []

        for (let i = 1; i <= questionCount; i++) {
          try {
            const question = await contract.questions(i)
            const answers = await contract.getAnswers(i)

            if (question.author.toLowerCase() === account.toLowerCase()) {
              userQuestions.push({
                id: i,
                title: question.title || `질문 #${i}`,
                status: answers.length > 0 ? 'open' : 'open',
                reward: (BigInt(question.bountyAmount) / BigInt(10 ** 18)).toString(),
                answers: answers.length,
                date: new Date(Number(question.timestamp) * 1000).toLocaleDateString('ko-KR')
              })
            }

            for (const answer of answers) {
              if (answer.answerer.toLowerCase() === account.toLowerCase()) {
                const q = await contract.questions(i)
                userAnswers.push({
                  id: i,
                  answerId: answer.id,
                  title: q.title || `질문 #${i}`,
                  status: answer.isUnlocked ? 'unlocked' : 'pending',
                  reward: answer.isUnlocked ? (BigInt(q.bountyAmount) / BigInt(10 ** 18)).toString() : (BigInt(q.bountyAmount) / BigInt(10 ** 18)).toString(),
                  date: new Date(Number(answer.timestamp) * 1000).toLocaleDateString('ko-KR')
                })
              }
            }
          } catch (err) {
            console.log(`질문 ${i} 조회 실패:`, err.message)
          }
        }

        setQuestions(userQuestions)
        setSubmissions(userAnswers)
      } catch (err) {
        console.error('사용자 질문/답변 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserQuestions()
  }, [isConnected, account, getReadContract])

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
              <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                제출한 답변
              </p>
              <p className="text-3xl font-bold text-purple-600">{submissions.length}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                획득한 보상
              </p>
              <p className="text-3xl font-bold text-green-600">
                {(submissions.reduce((sum, s) => sum + parseFloat(s.reward || 0), 0)).toFixed(2)} ETH
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                성공률
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {submissions.length > 0 ? Math.round((submissions.filter(s => s.status === 'unlocked').length / submissions.length) * 100) : 0}%
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
              📝 내가 등록한 질문
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`pb-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'submissions'
                  ? 'border-blue-600 text-blue-600'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💬 내가 제출한 답변
            </button>
          </div>
        </div>

        {/* 질문 탭 */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {loading ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>로딩 중...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  등록한 질문이 없습니다
                </p>
              </div>
            ) : (
              questions.map(q => (
                <div
                  key={q.id}
                  className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {q.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        등록일: {q.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${q.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                        {q.status === 'open' ? '진행 중' : '해결됨'}
                      </span>
                      <p className="text-lg font-bold text-blue-600">💰 {q.reward} ETH</p>
                    </div>
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    답변 {q.answers}개
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 답변 탭 */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {loading ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>로딩 중...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  제출한 답변이 없습니다
                </p>
              </div>
            ) : (
              submissions.map(s => (
                <div
                  key={s.answerId}
                  className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {s.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        제출일: {s.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${s.status === 'unlocked' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {s.status === 'unlocked' ? '지불됨' : '대기 중'}
                      </span>
                      <p className="text-lg font-bold text-purple-600">💰 {s.reward} ETH</p>
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