const express = require("express")
const router = express.Router()
const ForwardChainingEngine = require("../models/ForwardChainingEngine")
const RecommendationEngine = require("../services/RecommendationEngine")
const { RULE_BASE } = require("../data/ruleBase")
const { HOUSE_DATABASE } = require("../data/knowledgeBase")

// Store sessions in memory (in production, use Redis or database)
const sessions = new Map()

// Start new consultation session
router.post("/start-session", (req, res) => {
  try {
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const engine = new ForwardChainingEngine()

    sessions.set(sessionId, {
      engine,
      answers: new Map(),
      startTime: new Date(),
      currentQuestionIndex: 0,
    })

    res.json({
      success: true,
      sessionId,
      message: "New consultation session started",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Add fact to session
router.post("/add-fact/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params
    const { factName, value } = req.body

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      })
    }

    const session = sessions.get(sessionId)
    session.engine.addFact(factName, value)
    session.answers.set(factName, value)

    res.json({
      success: true,
      message: "Fact added successfully",
      facts: session.engine.getFacts(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Run inference and get recommendations
router.post("/get-recommendations/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      })
    }

    const session = sessions.get(sessionId)

    // Run forward chaining inference
    const conclusions = session.engine.runInference(RULE_BASE)

    // Generate recommendations
    const recommendationEngine = new RecommendationEngine(session.engine, HOUSE_DATABASE)
    const recommendations = recommendationEngine.getRecommendations(5)

    // Get engine state for debugging
    const engineState = session.engine.getState()

    res.json({
      success: true,
      recommendations,
      conclusions,
      engineState,
      sessionInfo: {
        totalFacts: session.engine.getFacts().length,
        totalRulesFired: session.engine.getFiredRules().length,
        sessionDuration: Date.now() - session.startTime.getTime(),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Get session state
router.get("/session/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      })
    }

    const session = sessions.get(sessionId)

    res.json({
      success: true,
      sessionId,
      facts: session.engine.getFacts(),
      conclusions: session.engine.getConclusions(),
      answers: Object.fromEntries(session.answers),
      startTime: session.startTime,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Delete session
router.delete("/session/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      })
    }

    sessions.delete(sessionId)

    res.json({
      success: true,
      message: "Session deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

module.exports = router
