// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BugBounty {
    struct Question {
        uint256 id;
        address author;
        uint256 bountyAmount;
        string ipfsCID; // CID for the question content
        bool isResolved;
    }

    struct Answer {
        uint256 id;
        uint256 questionId;
        address solver;
        string encryptedAnswerCID; // CID for the encrypted answer
        string summary; // Plain text summary
        bool isUnlocked;
    }

    uint256 public questionCount;
    uint256 public answerCount;

    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer) public answers;

    // Events
    event QuestionCreated(uint256 indexed questionId, address indexed author, uint256 bountyAmount, string ipfsCID);
    event AnswerSubmitted(uint256 indexed answerId, uint256 indexed questionId, address indexed solver, string summary);
    event AnswerUnlocked(uint256 indexed questionId, uint256 indexed answerId, address indexed solver, uint256 amountPaid);

    modifier onlyQuestionAuthor(uint256 _questionId) {
        require(questions[_questionId].author == msg.sender, "Only the author can perform this action");
        _;
    }

    modifier questionExists(uint256 _questionId) {
        require(_questionId > 0 && _questionId <= questionCount, "Question does not exist");
        _;
    }

    modifier answerExists(uint256 _answerId) {
        require(_answerId > 0 && _answerId <= answerCount, "Answer does not exist");
        _;
    }

    // Create a new question. The bounty is currently NOT locked in the contract, 
    // it will be paid at the time of unlocking the answer.
    function createQuestion(string memory _ipfsCID, uint256 _bountyAmount) external {
        questionCount++;
        questions[questionCount] = Question({
            id: questionCount,
            author: msg.sender,
            bountyAmount: _bountyAmount,
            ipfsCID: _ipfsCID,
            isResolved: false
        });

        emit QuestionCreated(questionCount, msg.sender, _bountyAmount, _ipfsCID);
    }

    // Submit an answer.
    function submitAnswer(uint256 _questionId, string memory _encryptedAnswerCID, string memory _summary) external questionExists(_questionId) {
        answerCount++;
        answers[answerCount] = Answer({
            id: answerCount,
            questionId: _questionId,
            solver: msg.sender,
            encryptedAnswerCID: _encryptedAnswerCID,
            summary: _summary,
            isUnlocked: false
        });

        emit AnswerSubmitted(answerCount, _questionId, msg.sender, _summary);
    }

    // Unlock an answer by paying the bounty amount directly to the solver
    function unlockAnswer(uint256 _questionId, uint256 _answerId) 
        external 
        payable 
        questionExists(_questionId) 
        answerExists(_answerId) 
        onlyQuestionAuthor(_questionId) 
    {
        Question storage q = questions[_questionId];
        Answer storage a = answers[_answerId];

        require(!a.isUnlocked, "Answer is already unlocked");
        require(!q.isResolved, "Question is already resolved");
        require(msg.value >= q.bountyAmount, "Insufficient payment for bounty");

        a.isUnlocked = true;
        q.isResolved = true;

        // Transfer bounty to the solver
        (bool success, ) = payable(a.solver).call{value: q.bountyAmount}("");
        require(success, "Transfer to solver failed");

        // Refund excess payment
        if (msg.value > q.bountyAmount) {
            uint256 excessAmount = msg.value - q.bountyAmount;
            (bool refundSuccess, ) = payable(msg.sender).call{value: excessAmount}("");
            require(refundSuccess, "Refund to author failed");
        }

        emit AnswerUnlocked(_questionId, _answerId, a.solver, q.bountyAmount);
    }

    // Helper to check if an answer is unlocked
    function isUnlocked(uint256 /* _questionId */, uint256 _answerId) external view answerExists(_answerId) returns (bool) {
        return answers[_answerId].isUnlocked;
    }
}
