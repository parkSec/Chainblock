import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { Web3Context } from '../context/Web3Context'
import { parseEther } from 'ethers'

export function PostQuestion() {
  const navigate = useNavigate()
  const { isDarkMode } = useContext(ThemeContext)
  const { isConnected, account, contract } = useContext(Web3Context)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    category: 'React',
    reward: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('지갑을 연결해주세요')
      return
    }

    if (!formData.title || !formData.description || !formData.reward) {
      alert('모든 필수 항목을 입력해주세요')
      return
    }

    try {
      setIsSubmitting(true)
      setStatusMsg('⏳ IPFS에 데이터를 업로드하는 중...')
      
      // IPFS에 업로드 (간단한 JSON으로 임시 처리)
      const questionData = {
        title: formData.title,
        description: formData.description,
        code: formData.code,
        category: formData.category,
        author: account,
        timestamp: new Date().toISOString()
      }
      
      // 실제 구현에서는 Pinata 사용
      const ipfsCID = 'Qm' + Math.random().toString(36).substring(2, 15)
      
      setStatusMsg('⏳ 지갑에서 서명을 대기 중...')
      const bountyInWei = parseEther(formData.reward.toString())
      
      console.log('컨트랙트:', contract)
      console.log('IPFS CID:', ipfsCID)
      console.log('Bounty:', bountyInWei.toString())
      
      // 실제 블록체인 호출
      if (!contract) {
        throw new Error('스마트 컨트랙트를 로드할 수 없습니다. 지갑을 다시 연결해주세요.')
      }
      
      setStatusMsg('⏳ 블록체인에 트랜잭션 전송 중...')
      const tx = await contract.createQuestion(ipfsCID, bountyInWei)
      console.log('트랜잭션 해시:', tx.hash)
      
      setStatusMsg(`⏳ 트랜잭션 확인 대기 중... (${tx.hash.substring(0, 10)}...)`)
      const receipt = await tx.wait()
      console.log('트랜잭션 영수증:', receipt)
      
      setStatusMsg(`✅ 성공적으로 등록되었습니다! (Tx: ${tx.hash.substring(0, 10)}...)`)
      setTimeout(() => {
        navigate('/bounties')
      }, 3000)
    } catch (error) {
      console.error('등록 오류:', error)
      const errorMsg = error.message || error.reason || JSON.stringify(error)
      setStatusMsg(`❌ 오류: ${errorMsg}`)
      setTimeout(() => {
        setStatusMsg('')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-center p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            지갑 연결 필요
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            질문을 등록하려면 먼저 MetaMask 지갑을 연결해주세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-8 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ✍️ 새로운 바운티 등록하기
        </h1>

        <form onSubmit={handleSubmit} className={`p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* 제목 */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="예: [React] useEffect 무한 루프 발생"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            />
          </div>

          {/* 카테고리 */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              카테고리
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              <option>React</option>
              <option>Blockchain</option>
              <option>Backend</option>
              <option>TypeScript</option>
              <option>기타</option>
            </select>
          </div>

          {/* 설명 */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              설명 및 에러 메시지 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="어떤 것을 하려고 했고 어떤 에러가 발생했는지 설명해주세요..."
              rows="5"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 resize-y ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            />
          </div>

          {/* 코드 */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              현재 코드 (선택사항)
            </label>
            <textarea
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="여기에 코드를 붙여넣으세요..."
              rows="8"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 font-mono text-sm resize-y ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            />
          </div>

          {/* 보상 */}
          <div className="mb-8">
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              바운티 보상 (ETH) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className={`mr-2 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>💰</span>
              <input
                type="number"
                name="reward"
                value={formData.reward}
                onChange={handleChange}
                placeholder="0.5"
                step="0.001"
                min="0"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 font-mono ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              />
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              이 금액은 나중에 답변을 열람할 때 지불됩니다
            </p>
          </div>

          {/* 상태 메시지 */}
          {statusMsg && (
            <div className={`mb-6 p-4 rounded-lg font-semibold text-sm ${
              statusMsg.includes('❌') 
                ? isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'
                : statusMsg.includes('✅')
                ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800'
                : isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                <span>{statusMsg.includes('⏳') ? '⌛' : statusMsg.includes('✅') ? '✅' : '❌'}</span>
                <span>{statusMsg}</span>
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '처리 중...' : '질문 등록하기'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}