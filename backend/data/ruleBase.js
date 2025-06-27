const RULE_BASE = [
  // Rules untuk budget classification
  {
    id: "R001",
    conditions: [{ fact: "budget", operator: "less_than", value: 1000000000 }],
    conclusion: "budget_low",
    weight: 10,
  },
  {
    id: "R002",
    conditions: [
      { fact: "budget", operator: "greater_equal", value: 1000000000 },
      { fact: "budget", operator: "less_than", value: 3000000000 },
    ],
    conclusion: "budget_medium",
    weight: 10,
  },
  {
    id: "R003",
    conditions: [
      { fact: "budget", operator: "greater_equal", value: 3000000000 },
      { fact: "budget", operator: "less_than", value: 8000000000 },
    ],
    conclusion: "budget_high",
    weight: 10,
  },
  {
    id: "R004",
    conditions: [{ fact: "budget", operator: "greater_equal", value: 8000000000 }],
    conclusion: "budget_luxury",
    weight: 10,
  },

  // Rules untuk family composition
  {
    id: "R005",
    conditions: [{ fact: "family_size", operator: "less_equal", value: 2 }],
    conclusion: "small_family",
    weight: 8,
  },
  {
    id: "R006",
    conditions: [
      { fact: "family_size", operator: "greater_than", value: 2 },
      { fact: "family_size", operator: "less_equal", value: 4 },
    ],
    conclusion: "medium_family",
    weight: 8,
  },
  {
    id: "R007",
    conditions: [{ fact: "family_size", operator: "greater_than", value: 4 }],
    conclusion: "large_family",
    weight: 8,
  },

  // Rules untuk transportation logic
  {
    id: "R008",
    conditions: [{ fact: "need_transport", operator: "equals", value: true }],
    conclusion: "prefer_public_transport",
    weight: 7,
  },
  {
    id: "R009",
    conditions: [
      { fact: "prefer_public_transport", operator: "equals", value: true },
      { fact: "own_car", operator: "equals", value: false },
    ],
    conclusion: "no_garage_needed",
    weight: 6,
  },
  {
    id: "R010",
    conditions: [
      { fact: "prefer_public_transport", operator: "equals", value: true },
      { fact: "own_motorcycle", operator: "equals", value: true },
    ],
    conclusion: "small_parking_needed",
    weight: 5,
  },

  // Rules untuk work-life balance
  {
    id: "R011",
    conditions: [{ fact: "work_from_home", operator: "equals", value: true }],
    conclusion: "need_home_office",
    weight: 7,
  },
  {
    id: "R012",
    conditions: [
      { fact: "need_home_office", operator: "equals", value: true },
      { fact: "medium_family", operator: "equals", value: true },
    ],
    conclusion: "need_extra_room",
    weight: 6,
  },
  {
    id: "R013",
    conditions: [{ fact: "long_commute_ok", operator: "equals", value: false }],
    conclusion: "prioritize_location",
    weight: 8,
  },

  // Rules untuk lifestyle preferences
  {
    id: "R014",
    conditions: [{ fact: "lifestyle", operator: "equals", value: "urban" }],
    conclusion: "prefer_urban",
    weight: 7,
  },
  {
    id: "R015",
    conditions: [{ fact: "lifestyle", operator: "equals", value: "suburban" }],
    conclusion: "prefer_suburban",
    weight: 7,
  },
  {
    id: "R016",
    conditions: [
      { fact: "prefer_urban", operator: "equals", value: true },
      { fact: "small_family", operator: "equals", value: true },
    ],
    conclusion: "apartment_suitable",
    weight: 8,
  },

  // Rules untuk family needs
  {
    id: "R017",
    conditions: [{ fact: "have_children", operator: "equals", value: true }],
    conclusion: "need_child_facilities",
    weight: 9,
  },
  {
    id: "R018",
    conditions: [
      { fact: "need_child_facilities", operator: "equals", value: true },
      { fact: "child_age_school", operator: "equals", value: true },
    ],
    conclusion: "school_proximity_critical",
    weight: 10,
  },
  {
    id: "R019",
    conditions: [
      { fact: "have_children", operator: "equals", value: true },
      { fact: "prefer_urban", operator: "equals", value: true },
    ],
    conclusion: "need_safe_environment",
    weight: 8,
  },

  // Rules untuk elderly considerations
  {
    id: "R020",
    conditions: [{ fact: "have_elderly", operator: "equals", value: true }],
    conclusion: "elderly_friendly_needed",
    weight: 9,
  },
  {
    id: "R021",
    conditions: [{ fact: "elderly_friendly_needed", operator: "equals", value: true }],
    conclusion: "single_floor_preferred",
    weight: 7,
  },
  {
    id: "R022",
    conditions: [{ fact: "elderly_friendly_needed", operator: "equals", value: true }],
    conclusion: "medical_access_important",
    weight: 6,
  },

  // Rules untuk hobbies and interests
  {
    id: "R023",
    conditions: [{ fact: "hobby_gardening", operator: "equals", value: true }],
    conclusion: "large_garden_needed",
    weight: 6,
  },
  {
    id: "R024",
    conditions: [{ fact: "hobby_swimming", operator: "equals", value: true }],
    conclusion: "pool_preferred",
    weight: 5,
  },
  {
    id: "R025",
    conditions: [{ fact: "hobby_cooking", operator: "equals", value: true }],
    conclusion: "large_kitchen_needed",
    weight: 4,
  },

  // Rules untuk investment considerations
  {
    id: "R026",
    conditions: [{ fact: "investment_purpose", operator: "equals", value: true }],
    conclusion: "strategic_location_important",
    weight: 8,
  },
  {
    id: "R027",
    conditions: [
      { fact: "strategic_location_important", operator: "equals", value: true },
      { fact: "budget_high", operator: "equals", value: true },
    ],
    conclusion: "commercial_area_preferred",
    weight: 7,
  },

  // Rules untuk security needs
  {
    id: "R028",
    conditions: [
      { fact: "security_important", operator: "equals", value: true },
      { fact: "have_children", operator: "equals", value: true },
    ],
    conclusion: "gated_community_preferred",
    weight: 8,
  },
  {
    id: "R029",
    conditions: [
      { fact: "work_late_hours", operator: "equals", value: true },
      { fact: "security_important", operator: "equals", value: true },
    ],
    conclusion: "high_security_essential",
    weight: 9,
  },

  // Rules untuk entertainment needs
  {
    id: "R030",
    conditions: [{ fact: "entertainment_important", operator: "equals", value: true }],
    conclusion: "mall_proximity_preferred",
    weight: 5,
  },
  {
    id: "R031",
    conditions: [
      { fact: "social_lifestyle", operator: "equals", value: true },
      { fact: "prefer_urban", operator: "equals", value: true },
    ],
    conclusion: "nightlife_access_preferred",
    weight: 4,
  },

  // Rules untuk house type recommendations
  {
    id: "R032",
    conditions: [
      { fact: "budget_luxury", operator: "equals", value: true },
      { fact: "large_garden_needed", operator: "equals", value: true },
    ],
    conclusion: "villa_recommended",
    weight: 10,
  },
  {
    id: "R033",
    conditions: [
      { fact: "apartment_suitable", operator: "equals", value: true },
      { fact: "no_garage_needed", operator: "equals", value: true },
    ],
    conclusion: "apartment_recommended",
    weight: 9,
  },
  {
    id: "R034",
    conditions: [
      { fact: "budget_low", operator: "equals", value: true },
      { fact: "first_time_buyer", operator: "equals", value: true },
    ],
    conclusion: "subsidi_recommended",
    weight: 10,
  },
  {
    id: "R035",
    conditions: [
      { fact: "medium_family", operator: "equals", value: true },
      { fact: "prefer_suburban", operator: "equals", value: true },
      { fact: "budget_medium", operator: "equals", value: true },
    ],
    conclusion: "cluster_recommended",
    weight: 8,
  },
  {
    id: "R036",
    conditions: [
      { fact: "gated_community_preferred", operator: "equals", value: true },
      { fact: "budget_high", operator: "equals", value: true },
    ],
    conclusion: "townhouse_recommended",
    weight: 8,
  },

  // Rules untuk location preferences
  {
    id: "R037",
    conditions: [
      { fact: "work_location", operator: "equals", value: "jakarta_pusat" },
      { fact: "prioritize_location", operator: "equals", value: true },
    ],
    conclusion: "central_jakarta_preferred",
    weight: 9,
  },
  {
    id: "R038",
    conditions: [
      { fact: "budget_medium", operator: "equals", value: true },
      { fact: "prefer_suburban", operator: "equals", value: true },
    ],
    conclusion: "satellite_city_suitable",
    weight: 7,
  },

  // Rules untuk special considerations
  {
    id: "R039",
    conditions: [
      { fact: "frequent_travel", operator: "equals", value: true },
      { fact: "prioritize_location", operator: "equals", value: true },
    ],
    conclusion: "airport_access_important",
    weight: 6,
  },
  {
    id: "R040",
    conditions: [
      { fact: "pet_owner", operator: "equals", value: true },
      { fact: "large_garden_needed", operator: "equals", value: true },
    ],
    conclusion: "pet_friendly_essential",
    weight: 7,
  },
]

module.exports = { RULE_BASE }
