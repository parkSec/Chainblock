import hre from "hardhat";

async function main() {
  console.log('📋 블록체인 상태 확인:');
  
  const contractAddress = '0x74EAc8c335DB0F23f046f6A32D77FDA201063b2B';
  const userAddress = '0x0969cFec9485B2D7cc59B6fCcbeA8689eA8758Be';
  
  console.log('사용자:', userAddress);
  console.log('컨트랙트:', contractAddress);
  console.log('');
  
  const BugBounty = await hre.ethers.getContractAt("BugBounty", contractAddress);
  
  try {
    const questionCount = await BugBounty.questionCounter();
    console.log('✅ 전체 질문 개수:', questionCount.toString());
    console.log('');
    
    if (questionCount > 0) {
      console.log('📝 모든 질문 확인:');
      for (let i = 1n; i <= questionCount; i++) {
        try {
          const q = await BugBounty.questions(i);
          console.log(`  질문 #${i}:`);
          console.log(`    - Author: ${q.author}`);
          console.log(`    - Bounty: ${q.bountyAmount.toString()} Wei`);
          console.log(`    - IPFS CID: ${q.ipfsCID}`);
          console.log(`    - isResolved: ${q.isResolved}`);
          console.log(`    - 매칭: ${q.author.toLowerCase() === userAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`);
          console.log('');
        } catch (err) {
          console.log(`  질문 #${i}: 읽기 오류 - ${err.message}`);
        }
      }
    } else {
      console.log('⚠️  등록된 질문이 없습니다!');
    }
  } catch (err) {
    console.error('❌ 오류:', err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
