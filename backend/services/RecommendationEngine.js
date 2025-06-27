class RecommendationEngine {
  constructor(engine, houses) {
    this.engine = engine
    this.houses = houses
  }

  calculateHouseScore(house) {
    let score = 0
    const matchedCriteria = []
    const reasoning = []
    const facts = this.engine.getFacts()
    const conclusions = this.engine.getConclusions()

    // Budget matching dengan penalty yang lebih realistis
    const budget = facts.find((f) => f.name === "budget")?.value
    if (budget) {
      if (house.price <= budget * 0.8) {
        score += 25
        matchedCriteria.push("budget_comfortable")
        reasoning.push(`Harga rumah (${this.formatPrice(house.price)}) sangat sesuai dengan budget Anda`)
      } else if (house.price <= budget) {
        score += 15
        matchedCriteria.push("budget_match")
        reasoning.push(`Harga rumah (${this.formatPrice(house.price)}) pas dengan budget maksimal Anda`)
      } else if (house.price <= budget * 1.1) {
        score += 5
        reasoning.push(`Harga rumah (${this.formatPrice(house.price)}) sedikit melebihi budget, tapi masih terjangkau`)
      } else {
        score -= 20
        reasoning.push(`Harga rumah (${this.formatPrice(house.price)}) melebihi budget Anda secara signifikan`)
      }
    }

    // Transportation logic - jika butuh transportasi umum, garasi kurang penting
    const needTransport = facts.find((f) => f.name === "need_transport")?.value
    const ownCar = facts.find((f) => f.name === "own_car")?.value
    const ownMotorcycle = facts.find((f) => f.name === "own_motorcycle")?.value

    if (needTransport === true && house.nearTransport) {
      score += 20
      matchedCriteria.push("transport_access")
      reasoning.push("Rumah dekat dengan transportasi umum sesuai kebutuhan Anda")

      // Jika butuh transportasi umum dan tidak punya mobil, garasi tidak terlalu penting
      if (ownCar === false && !house.hasGarage) {
        score += 5
        reasoning.push("Tidak ada garasi, cocok karena Anda mengandalkan transportasi umum")
      }
    }

    // Vehicle ownership logic
    if (ownCar === true && house.hasGarage) {
      score += 15
      matchedCriteria.push("garage_available")
      reasoning.push("Rumah memiliki garasi untuk mobil Anda")
    } else if (ownCar === true && !house.hasGarage) {
      score -= 10
      reasoning.push("Rumah tidak memiliki garasi padahal Anda punya mobil")
    }

    if (ownMotorcycle === true && house.hasGarden) {
      score += 5
      reasoning.push("Ada halaman untuk parkir motor")
    }

    // Family size dengan logika yang lebih detail
    const familySize = facts.find((f) => f.name === "family_size")?.value
    if (familySize) {
      const idealBedrooms = Math.ceil(familySize / 2) + (familySize > 4 ? 1 : 0)
      if (house.bedrooms >= idealBedrooms) {
        score += 20
        matchedCriteria.push("bedroom_adequate")
        reasoning.push(`Jumlah kamar tidur (${house.bedrooms}) cocok untuk keluarga ${familySize} orang`)
      } else if (house.bedrooms >= Math.ceil(familySize / 2)) {
        score += 10
        reasoning.push(`Jumlah kamar tidur (${house.bedrooms}) cukup untuk keluarga ${familySize} orang`)
      } else {
        score -= 15
        reasoning.push(`Jumlah kamar tidur (${house.bedrooms}) kurang untuk keluarga ${familySize} orang`)
      }
    }

    // Work from home considerations
    const workFromHome = facts.find((f) => f.name === "work_from_home")?.value
    if (workFromHome === true) {
      if (house.bedrooms > (familySize || 2) / 2 + 1) {
        score += 15
        matchedCriteria.push("home_office_space")
        reasoning.push("Ada ruang ekstra yang bisa dijadikan kantor rumah")
      } else {
        score -= 5
        reasoning.push("Mungkin kurang ruang untuk kantor rumah")
      }
    }

    // Children and school proximity
    const haveChildren = facts.find((f) => f.name === "have_children")?.value
    const childAgeSchool = facts.find((f) => f.name === "child_age_school")?.value
    if (haveChildren === true && childAgeSchool === true && house.nearSchool) {
      score += 25
      matchedCriteria.push("school_access")
      reasoning.push("Rumah dekat dengan sekolah, cocok untuk anak Anda")
    } else if (haveChildren === true && childAgeSchool === true && !house.nearSchool) {
      score -= 15
      reasoning.push("Rumah agak jauh dari sekolah, perlu pertimbangan transportasi anak")
    }

    // Elderly considerations
    const haveElderly = facts.find((f) => f.name === "have_elderly")?.value
    if (haveElderly === true) {
      // Prefer single floor (assume houses with area < 150m² are likely single floor)
      if (house.area < 150 || house.type === "apartemen") {
        score += 15
        matchedCriteria.push("elderly_friendly")
        reasoning.push("Rumah cocok untuk lansia (kemungkinan satu lantai atau ada lift)")
      }

      if (house.nearMall) {
        score += 10
        reasoning.push("Dekat dengan fasilitas umum, memudahkan lansia")
      }
    }

    // Location preferences dengan work location
    const workLocation = facts.find((f) => f.name === "work_location")?.value
    const longCommuteOk = facts.find((f) => f.name === "long_commute_ok")?.value

    if (workLocation && longCommuteOk === false) {
      if (house.location === workLocation) {
        score += 30
        matchedCriteria.push("optimal_location")
        reasoning.push("Lokasi rumah sangat dekat dengan tempat kerja")
      } else if (this.isNearbyLocation(house.location, workLocation)) {
        score += 20
        matchedCriteria.push("good_location")
        reasoning.push("Lokasi rumah masih dalam area yang mudah dijangkau dari tempat kerja")
      } else {
        score -= 20
        reasoning.push("Lokasi rumah cukup jauh dari tempat kerja")
      }
    }

    // Lifestyle matching
    const lifestyle = facts.find((f) => f.name === "lifestyle")?.value
    if (lifestyle === "urban") {
      if (house.location.includes("jakarta") && house.nearTransport && house.nearMall) {
        score += 20
        matchedCriteria.push("urban_lifestyle")
        reasoning.push("Rumah sangat cocok untuk gaya hidup urban")
      } else if (house.type === "apartemen") {
        score += 15
        reasoning.push("Apartemen cocok untuk gaya hidup urban")
      }
    } else if (lifestyle === "suburban") {
      if ((house.type === "cluster" || house.type === "townhouse") && house.hasGarden) {
        score += 20
        matchedCriteria.push("suburban_lifestyle")
        reasoning.push("Rumah cocok untuk gaya hidup suburban yang tenang")
      }
    }

    // Hobby considerations
    const hobbyGardening = facts.find((f) => f.name === "hobby_gardening")?.value
    if (hobbyGardening === true && house.hasGarden && house.area > 150) {
      score += 15
      matchedCriteria.push("gardening_space")
      reasoning.push("Ada ruang yang cukup untuk berkebun")
    }

    const hobbySwimming = facts.find((f) => f.name === "hobby_swimming")?.value
    if (hobbySwimming === true && house.hasPool) {
      score += 20
      matchedCriteria.push("swimming_facility")
      reasoning.push("Rumah memiliki kolam renang sesuai hobi Anda")
    }

    const petOwner = facts.find((f) => f.name === "pet_owner")?.value
    if (petOwner === true && house.hasGarden && house.area > 100) {
      score += 15
      matchedCriteria.push("pet_friendly")
      reasoning.push("Ada halaman yang cukup untuk hewan peliharaan")
    }

    // Security considerations
    const securityImportant = facts.find((f) => f.name === "security_important")?.value
    const workLateHours = facts.find((f) => f.name === "work_late_hours")?.value

    if (securityImportant === true || workLateHours === true) {
      if (house.securityLevel === "high") {
        score += 20
        matchedCriteria.push("high_security")
        reasoning.push("Rumah memiliki sistem keamanan yang baik")
      } else if (house.securityLevel === "medium") {
        score += 10
        reasoning.push("Rumah memiliki keamanan yang cukup")
      } else {
        score -= 10
        reasoning.push("Keamanan rumah mungkin kurang sesuai kebutuhan Anda")
      }
    }

    // Investment considerations
    const investmentPurpose = facts.find((f) => f.name === "investment_purpose")?.value
    if (investmentPurpose === true) {
      if (house.nearTransport && house.nearMall && house.location.includes("jakarta")) {
        score += 25
        matchedCriteria.push("investment_potential")
        reasoning.push("Lokasi strategis dengan potensi investasi yang baik")
      }

      if (house.isNewBuild) {
        score += 10
        reasoning.push("Rumah baru dengan potensi apresiasi harga")
      }
    }

    // First time buyer considerations
    const firstTimeBuyer = facts.find((f) => f.name === "first_time_buyer")?.value
    if (firstTimeBuyer === true) {
      if (house.type === "subsidi" || house.price < 1000000000) {
        score += 25
        matchedCriteria.push("first_buyer_friendly")
        reasoning.push("Rumah cocok dan terjangkau untuk pembeli pertama")
      }

      if (house.nearTransport && house.nearSchool && house.nearMall) {
        score += 15
        reasoning.push("Lokasi strategis dengan fasilitas lengkap")
      }
    }

    // Conclusion-based scoring from forward chaining
    if (conclusions.villa_recommended && house.type === "villa") {
      score += 30
      matchedCriteria.push("ai_villa_recommendation")
      reasoning.push("Villa sangat direkomendasikan berdasarkan profil lengkap Anda")
    }

    if (conclusions.apartment_recommended && house.type === "apartemen") {
      score += 30
      matchedCriteria.push("ai_apartment_recommendation")
      reasoning.push("Apartemen sangat direkomendasikan berdasarkan analisis AI")
    }

    if (conclusions.subsidi_recommended && house.type === "subsidi") {
      score += 30
      matchedCriteria.push("ai_subsidi_recommendation")
      reasoning.push("Rumah subsidi direkomendasikan sistem pakar")
    }

    if (conclusions.cluster_recommended && house.type === "cluster") {
      score += 25
      matchedCriteria.push("ai_cluster_recommendation")
      reasoning.push("Rumah cluster direkomendasikan berdasarkan preferensi Anda")
    }

    if (conclusions.townhouse_recommended && house.type === "townhouse") {
      score += 25
      matchedCriteria.push("ai_townhouse_recommendation")
      reasoning.push("Townhouse direkomendasikan sistem pakar")
    }

    // Bonus for furnished if needed
    const socialLifestyle = facts.find((f) => f.name === "social_lifestyle")?.value
    if (socialLifestyle === true && house.furnished) {
      score += 10
      reasoning.push("Rumah sudah furnished, siap untuk menerima tamu")
    }

    return { score: Math.max(0, score), matchedCriteria, reasoning }
  }

  isNearbyLocation(houseLocation, workLocation) {
    const locationGroups = {
      jakarta: ["jakarta_pusat", "jakarta_selatan", "jakarta_utara", "jakarta_barat", "jakarta_timur"],
      tangerang: ["tangerang_selatan", "tangerang"],
      bogor: ["bogor", "depok"],
      bekasi: ["bekasi"],
    }

    for (const group of Object.values(locationGroups)) {
      if (group.includes(houseLocation) && group.includes(workLocation)) {
        return true
      }
    }
    return false
  }

  formatPrice(price) {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toFixed(1)} miliar`
    } else if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(0)} juta`
    }
    return `Rp ${price.toLocaleString()}`
  }

  getRecommendations(limit = 5) {
    const recommendations = []

    for (const house of this.houses) {
      const { score, matchedCriteria, reasoning } = this.calculateHouseScore(house)

      recommendations.push({
        house,
        score,
        matchedCriteria,
        reasoning,
      })
    }

    // Sort by score and return top recommendations
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
  }
}

module.exports = RecommendationEngine
