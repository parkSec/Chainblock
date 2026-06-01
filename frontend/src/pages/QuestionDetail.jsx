import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { Web3Context } from '../context/Web3Context'
import { parseEther } from 'ethers'

export function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDarkMode } = useContext(ThemeContext)
  const { getReadContract, isConnected, account, contract } = useContext(Web3Context)

  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthor, setIsAuthor] = useState(false)

  const [answerSummary, setAnswerSummary] = useState('')
  const [answerCode, setAnswerCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const readContract = getReadContract()
        const q = await readContract.questions(id)

        if (q.id.toString() === '0') {
          throw new Error('질문을 찾을 수 없습니다')
        }

        const bountyAmount = Number(q.bountyAmount) / 1e18
        
        // localStorage에서 질문 데이터 조회
        let questionData = {
          title: `Question #${q.id}`,
          description: '설명을 불러올 수 없습니다',
          code: ''
        }
        
        try {
          const stored = localStorage.getItem(q.ipfsCID)
          if (stored) {
            const parsed = JSON.parse(stored)
            questionData = {
              title: parsed.title || questionData.title,
              description: parsed.description || questionData.description,
              code: parsed.code || questionData.code
            }
          }
        } catch (err) {
          console.warn('localStorage 데이터 로드 실패:', err)
        }
        
        setQuestion({
          id: Number(q.id),
          title: questionData.title,
          author: q.author,
          bountyAmount: bountyAmount.toFixed(4),
          isResolved: q.isResolved,
          ipfsCID: q.ipfsCID,
          description: questionData.description,
          code: questionData.code
        })

        // 작성자 확인
        if (isConnected && account && account.toLowerCase() === q.author.toLowerCase()) {
          setIsAuthor(true)
        }

        // 답변 조회
        const answerCount = await readContract.answerCount()
        const fetchedAnswers = []

        for (let i = 1; i <= Number(answerCount); i++) {
          const a = await readContract.answers(i)
          if (a.questionId.toString() === id.toString()) {
            fetchedAnswers.push({
              id: Number(a.id),
              solver: a.solver,
              summary: a.summary,
              isUnlocked: a.isUnlocked,
              encryptedAnswerCID: a.encryptedAnswerCID
            })
          }
        }

        setAnswers(fetchedAnswers)
      } catch (error) {
        console.error('질문 조회 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchQuestion()
    }
  }, [id, isConnected, account])

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()

    if (!isConnected) {
      alert('지갑을 연결해주세요')
      return
    }

    if (!answerSummary || !answerCode) {
      alert('모든 필수 항목을 입력해주세요')
      return
    }

    try {
      setIsSubmitting(true)
      setStatusMsg('⏳ 답변을 블록체인에 등록하는 중...')

      if (!contract) {
        throw new Error('스마트 컨트랙트를 로드할 수 없습니다')
      }

      // 간단한 암호화 (실제로는 MetaMask 암호화 사용)
      const encryptedCode = btoa(answerCode) // Base64 인코딩
      const answerCID = 'Qm' + Math.random().toString(36).substring(2, 15)

      const tx = await contract.submitAnswer(id, answerCID, answerSummary)
      setStatusMsg('⏳ 트랜잭션 확인 대기 중...')
      
      await tx.wait()

      setStatusMsg('✅ 답변이 성공적으로 등록되었습니다!')
      setAnswerSummary('')
      setAnswerCode('')
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('답변 등록 오류:', error)
      setStatusMsg('❌ 오류: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnlock = async (answerId) => {
    if (!isConnected) {
      alert('지갑을 연결해주세요')
      return
    }

    try {
      setIsSubmitting(true)
      setStatusMsg('⏳ 답변을 잠금 해제하는 중...')

      if (!contract || !question) {
        throw new Error('컨트랙트 또는 질문 정보를 찾을 수 없습니다')
      }

      const bountyInWei = parseEther(question.bountyAmount.toString())
      const tx = await contract.unlockAnswer(id, answerId, { value: bountyInWei })
      
      setStatusMsg('⏳ 트랜잭션 확인 대기 중...')
      await tx.wait()

      setStatusMsg('✅ 답변이 잠금 해제되었습니다!')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('잠금 해제 오류:', error)
      setStatusMsg('❌ 오류: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>질문을 로드하는 중...</p>
      </div>
    )
  }

  if (!question) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={isDarkMode ? 'text-red-400' : 'text-red-600'}>질문을 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/bounties')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            바운티 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-8 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* 질문 상세 */}
        <div className={`mb-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {question.title}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                작성자: <span className="font-mono">{formatAddress(question.author)}</span>
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                question.isResolved
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {question.isResolved ? '해결됨' : '진행 중'}
              </span>
              <p className="text-2xl font-bold text-blue-600">💰 {question.bountyAmount} ETH</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>설명</h3>
              <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {question.description}
              </p>
            </div>

            {question.code && (
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>코드</h3>
                <pre className={`p-4 rounded-lg border overflow-x-auto text-sm font-mono ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300 text-gray-800'
                }`}>
                  {question.code}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 답변 목록 */}
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          답변 ({answers.length})
        </h2>

        <div className="space-y-4 mb-8">
          {answers.length === 0 ? (
            <div className={`p-6 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>아직 등록된 답변이 없습니다</p>
            </div>
          ) : (
            answers.map(ans => (
              <div key={ans.id} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-3">
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    풀이자: <span className="font-mono font-semibold">{formatAddress(ans.solver)}</span>
                  </p>
                  {ans.isUnlocked && (
                    <span className="text-green-600 font-bold text-sm">✅ 잠금 해제됨</span>
                  )}
                </div>

                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  해결 방법 요약
                </h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {ans.summary}
                </p>

                {/* 잠금 해제 버튼 (작성자만) */}
                {isAuthor && !ans.isUnlocked && (
                  <button
                    onClick={() => handleUnlock(ans.id)}
                    disabled={isSubmitting || question.isResolved}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
                  >
                    💰 답변 잠금 해제 ({question.bountyAmount} ETH)
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 답변 제출 폼 (질문 미해결 & 비작성자만) */}
        {!question.isResolved && !isAuthor && isConnected && (
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              답변 제출하기
            </h2>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  해결 방법 요약 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={answerSummary}
                  onChange={(e) => setAnswerSummary(e.target.value)}
                  placeholder="어떻게 버그를 고쳤는지 설명해주세요..."
                  rows="4"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  정답 코드 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={answerCode}
                  onChange={(e) => setAnswerCode(e.target.value)}
                  placeholder="수정된 코드를 붙여넣으세요..."
                  rows="8"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 font-mono text-sm resize-y ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                />
              </div>

              {statusMsg && (
                <div className={`p-4 rounded-lg font-semibold text-sm ${
                  statusMsg.includes('❌')
                    ? isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'
                    : statusMsg.includes('✅')
                    ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800'
                    : isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800'
                }`}>
                  {statusMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {isSubmitting ? '처리 중...' : '답변 제출하기'}
              </button>
            </form>
          </div>
        )}

        {/* 지갑 연결 안 됨 */}
        {!isConnected && (
          <div className={`p-6 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              답변을 제출하려면 지갑을 연결해주세요
            </p>
          </div>
        )}

        {/* 뒤로 가기 버튼 */}
        <button
          onClick={() => navigate('/bounties')}
          className={`mt-8 px-6 py-2 rounded-lg font-semibold transition-colors ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          ← 바운티 목록으로 돌아가기
        </button>
      </div>
    </div>
  )
}