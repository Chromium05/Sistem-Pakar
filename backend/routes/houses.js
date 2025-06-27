const express = require("express")
const router = express.Router()
const { HOUSE_DATABASE } = require("../data/knowledgeBase")

// Get all houses
router.get("/", (req, res) => {
  try {
    const {
      type,
      location,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      hasGarden,
      hasPool,
      hasGarage,
      nearTransport,
      nearSchool,
      nearMall,
    } = req.query

    let filteredHouses = [...HOUSE_DATABASE]

    // Apply filters
    if (type) {
      filteredHouses = filteredHouses.filter((house) => house.type === type)
    }

    if (location) {
      filteredHouses = filteredHouses.filter((house) => house.location === location)
    }

    if (minPrice) {
      filteredHouses = filteredHouses.filter((house) => house.price >= Number.parseInt(minPrice))
    }

    if (maxPrice) {
      filteredHouses = filteredHouses.filter((house) => house.price <= Number.parseInt(maxPrice))
    }

    if (minBedrooms) {
      filteredHouses = filteredHouses.filter((house) => house.bedrooms >= Number.parseInt(minBedrooms))
    }

    if (maxBedrooms) {
      filteredHouses = filteredHouses.filter((house) => house.bedrooms <= Number.parseInt(maxBedrooms))
    }

    // Boolean filters
    if (hasGarden === "true") {
      filteredHouses = filteredHouses.filter((house) => house.hasGarden)
    }

    if (hasPool === "true") {
      filteredHouses = filteredHouses.filter((house) => house.hasPool)
    }

    if (hasGarage === "true") {
      filteredHouses = filteredHouses.filter((house) => house.hasGarage)
    }

    if (nearTransport === "true") {
      filteredHouses = filteredHouses.filter((house) => house.nearTransport)
    }

    if (nearSchool === "true") {
      filteredHouses = filteredHouses.filter((house) => house.nearSchool)
    }

    if (nearMall === "true") {
      filteredHouses = filteredHouses.filter((house) => house.nearMall)
    }

    res.json({
      success: true,
      houses: filteredHouses,
      total: filteredHouses.length,
      filters: req.query,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Get house by ID
router.get("/:houseId", (req, res) => {
  try {
    const { houseId } = req.params
    const house = HOUSE_DATABASE.find((h) => h.id === houseId)

    if (!house) {
      return res.status(404).json({
        success: false,
        error: "House not found",
      })
    }

    res.json({
      success: true,
      house,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Get house statistics
router.get("/stats/overview", (req, res) => {
  try {
    const stats = {
      total: HOUSE_DATABASE.length,
      byType: {},
      byLocation: {},
      priceRange: {
        min: Math.min(...HOUSE_DATABASE.map((h) => h.price)),
        max: Math.max(...HOUSE_DATABASE.map((h) => h.price)),
        average: HOUSE_DATABASE.reduce((sum, h) => sum + h.price, 0) / HOUSE_DATABASE.length,
      },
      features: {
        withGarden: HOUSE_DATABASE.filter((h) => h.hasGarden).length,
        withPool: HOUSE_DATABASE.filter((h) => h.hasPool).length,
        withGarage: HOUSE_DATABASE.filter((h) => h.hasGarage).length,
        nearTransport: HOUSE_DATABASE.filter((h) => h.nearTransport).length,
        nearSchool: HOUSE_DATABASE.filter((h) => h.nearSchool).length,
        nearMall: HOUSE_DATABASE.filter((h) => h.nearMall).length,
      },
    }

    // Count by type
    HOUSE_DATABASE.forEach((house) => {
      stats.byType[house.type] = (stats.byType[house.type] || 0) + 1
    })

    // Count by location
    HOUSE_DATABASE.forEach((house) => {
      stats.byLocation[house.location] = (stats.byLocation[house.location] || 0) + 1
    })

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

module.exports = router
