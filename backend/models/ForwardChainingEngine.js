class ForwardChainingEngine {
  constructor() {
    this.facts = new Map()
    this.conclusions = new Map()
    this.firedRules = new Set()
  }

  addFact(name, value) {
    this.facts.set(name, value)
  }

  getFacts() {
    return Array.from(this.facts.entries()).map(([name, value]) => ({ name, value }))
  }

  evaluateCondition(condition) {
    const factValue = this.facts.get(condition.fact)
    if (factValue === undefined) return false

    switch (condition.operator) {
      case "equals":
        return factValue === condition.value
      case "greater_than":
        return factValue > condition.value
      case "less_than":
        return factValue < condition.value
      case "greater_equal":
        return factValue >= condition.value
      case "less_equal":
        return factValue <= condition.value
      default:
        return false
    }
  }

  evaluateRule(rule) {
    return rule.conditions.every((condition) => this.evaluateCondition(condition))
  }

    runInference(rules) {
      let changed = true
      this.firedRules.clear()

      while (changed) {
        changed = false

        for (const rule of rules) {
          if (this.firedRules.has(rule.id)) continue

          if (this.evaluateRule(rule)) {
            // Add conclusion as a new fact
            this.facts.set(rule.conclusion, true)

            // Track conclusion weight
            const currentWeight = this.conclusions.get(rule.conclusion) || 0
            this.conclusions.set(rule.conclusion, currentWeight + rule.weight)

            this.firedRules.add(rule.id)
            changed = true
          }
        }
      }

      // Return conclusions sorted by weight
      return Array.from(this.conclusions.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([conclusion]) => conclusion)
    }

  getConclusions() {
    return Object.fromEntries(this.conclusions)
  }

  getFiredRules() {
    return Array.from(this.firedRules)
  }

  reset() {
    this.facts.clear()
    this.conclusions.clear()
    this.firedRules.clear()
  }

  getState() {
    return {
      facts: this.getFacts(),
      conclusions: this.getConclusions(),
      firedRules: this.getFiredRules(),
    }
  }
}

module.exports = ForwardChainingEngine