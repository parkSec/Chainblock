const { JsonRpcProvider, Contract } = require('ethers');
const ABI = require('./frontend/src/utils/BugBountyABI.json');

const provider = new JsonRpcProvider('https://sepolia.drpc.org');
const contractAddress = '0x74EAc8c335DB0F23f046f6A32D77FDA201063b2B';
const contract = new Contract(contractAddress, ABI, provider);
const userAddress = '0x0969cFec9485B2D7cc59B6fCcbeA8689eA8758Be';

(async () => {
  try {
    console.log('📋 블록체인 상태 확인:');
    console.log('사용자:', userAddress);
    console.log('컨트랙트:', contractAddress);
    console.log('');
    
    const questionCount = await contract.questionCounter();
    console.log('✅ 전체 질문 개수:', questionCount.toString());
    console.log('');
    
    if (questionCount > 0) {
      console.log('📝 모든 질문 확인:');
      for (let i = 1; i <= questionCount; i++) {
        try {
          const q = await contract.questions(i);
          console.log(`  질문 #${i}:`);
          console.log(`    - Author: ${q.author}`);
          console.log(`    - Bounty: ${q.bountyAmount.toString()} Wei`);
          console.log(`    - IPFS CID: ${q.ipfsCID}`);
          console.log(`    - 매칭: ${q.author.toLowerCase() === userAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`);
        } catch (err) {
          console.log(`  질문 #${i}: 읽기 오류`);
        }
      }
    } else {
      console.log('⚠️  등록된 질문이 없습니다!');
    }
  } catch (err) {
    console.error('❌ 오류:', err.message);
  }
})();
