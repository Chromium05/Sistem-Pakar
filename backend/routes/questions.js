const express = require("express")
const router = express.Router()
const { QUESTION_TREE } = require("../data/questionTree")

// Get all questions
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      questions: QUESTION_TREE,
      total: QUESTION_TREE.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Get specific question by ID
router.get("/:questionId", (req, res) => {
  try {
    const { questionId } = req.params
    const question = QUESTION_TREE.find((q) => q.id === questionId)

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      })
    }

    res.json({
      success: true,
      question,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Get next question based on current question and answer
router.post("/next-question", (req, res) => {
  try {
    const { currentQuestionId, answer } = req.body

    const currentQuestion = QUESTION_TREE.find((q) => q.id === currentQuestionId)

    if (!currentQuestion) {
      return res.status(404).json({
        success: false,
        error: "Current question not found",
      })
    }

    let nextQuestionId = null

    if (currentQuestion.followUp) {
      const followUp = currentQuestion.followUp.find((f) => f.condition === answer)
      if (followUp) {
        nextQuestionId = followUp.nextQuestionId
      }
    }

    if (nextQuestionId) {
      const nextQuestion = QUESTION_TREE.find((q) => q.id === nextQuestionId)
      if (nextQuestion) {
        return res.json({
          success: true,
          nextQuestion,
          hasNext: true,
        })
      }
    }

    res.json({
      success: true,
      nextQuestion: null,
      hasNext: false,
      message: "No more questions available",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

module.exports = router
