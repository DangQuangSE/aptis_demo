import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { answers, testData, partNum } = await req.json();

    const explanations = [];
    let totalScore = 0;
    let maxScore = 0;

    // Evaluate Part 1
    if (partNum === 1 && testData.questions) {
      maxScore = testData.questions.length;
      testData.questions.forEach((q, idx) => {
        const userAnswer = answers[q.id] || "";
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) {
          totalScore++;
        } else {
          explanations.push({
            questionId: `Question ${idx + 1}`,
            correctAnswer: q.correctAnswer,
            userAnswer: userAnswer || "(blank)",
            explanation: "Incorrect word chosen."
          });
        }
      });
    }

    // Evaluate Part 2
    else if (partNum === 2 && testData.correctOrder) {
      maxScore = testData.correctOrder.length;
      const userOrderMap = answers.part2Order || {};
      const userOrderedIds = Object.keys(userOrderMap).sort((a, b) => userOrderMap[a] - userOrderMap[b]);
      
      testData.correctOrder.forEach((correctId, idx) => {
        const userAnswerId = userOrderedIds[idx] || "";
        const isCorrect = userAnswerId === correctId;
        
        if (isCorrect) {
          totalScore++;
        } else {
          const correctSentence = testData.sentences.find(s => s.id === correctId)?.text || correctId;
          const userSentence = testData.sentences.find(s => s.id === userAnswerId)?.text || userAnswerId || "(blank)";
          
          explanations.push({
            questionId: `Sentence ${idx + 1}`,
            correctAnswer: correctSentence,
            userAnswer: userSentence,
            explanation: "Sentence placed in the wrong order."
          });
        }
      });
    }

    // Evaluate Part 3
    else if (partNum === 3 && testData.questions) {
      maxScore = testData.questions.length;
      testData.questions.forEach((q, idx) => {
        const userAnswer = answers[q.id] || "";
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) {
          totalScore++;
        } else {
          explanations.push({
            questionId: `Question ${idx + 1}`,
            correctAnswer: q.correctAnswer,
            userAnswer: userAnswer || "(blank)",
            explanation: "Matched with the wrong person."
          });
        }
      });
    }

    // Evaluate Part 4
    else if (partNum === 4 && testData.correctAnswers) {
      maxScore = Object.keys(testData.correctAnswers).length;
      Object.keys(testData.correctAnswers).forEach((paraId, idx) => {
        const correctHeadingId = testData.correctAnswers[paraId];
        const userAnswerHeadingId = answers[paraId] || "";
        const isCorrect = userAnswerHeadingId === correctHeadingId;
        
        if (isCorrect) {
          totalScore++;
        } else {
          const correctHeading = testData.headings.find(h => h.id === correctHeadingId)?.text || correctHeadingId;
          const userHeading = testData.headings.find(h => h.id === userAnswerHeadingId)?.text || userAnswerHeadingId || "(blank)";

          explanations.push({
            questionId: `Paragraph ${idx + 1}`,
            correctAnswer: correctHeading,
            userAnswer: userHeading,
            explanation: "Incorrect heading for this paragraph."
          });
        }
      });
    }

    if (maxScore === 0) maxScore = 1;

    const percentage = totalScore / maxScore;
    let estimatedCEFR = "A2";
    let overallSummary = "";
    
    if (percentage >= 0.8) {
      estimatedCEFR = "C";
      overallSummary = "Excellent! You have a very strong grasp of comprehension.";
    } else if (percentage >= 0.6) {
      estimatedCEFR = "B2";
      overallSummary = "Good job. You understood most of the text, but there is still room for improvement.";
    } else if (percentage >= 0.4) {
      estimatedCEFR = "B1";
      overallSummary = "Fair attempt. You need more practice with complex texts and cohesion.";
    } else {
      estimatedCEFR = "A2";
      overallSummary = "You scored below average. We recommend focusing on vocabulary building and reading more English materials.";
    }

    const resultData = {
      totalScore: `${totalScore} / ${maxScore}`,
      estimatedCEFR,
      overallSummary,
      explanations
    };

    return NextResponse.json(resultData);

  } catch (error) {
    console.error("Error evaluating reading:", error);
    return NextResponse.json(
      { error: "Failed to evaluate reading: " + error.message },
      { status: 500 }
    );
  }
}
