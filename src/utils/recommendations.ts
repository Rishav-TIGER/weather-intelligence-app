import { SmartRecommendation } from '../types';

export function generateRecommendations(
  temp: number,
  weatherCode: number,
  windSpeed: number,
  precipitation: number = 0,
  humidity: number = 50,
  precipProbability: number = 0
): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  // Helper to add unique IDs
  const addRec = (
    category: SmartRecommendation['category'],
    title: string,
    description: string,
    type: SmartRecommendation['type']
  ) => {
    recommendations.push({
      id: `${category}-${title.toLowerCase().replace(/\s+/g, '-')}-${recommendations.length}`,
      category,
      title,
      description,
      type,
    });
  };

  const isStorm = [95, 96, 99].includes(weatherCode);
  const isRainyCode = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isFog = [45, 48].includes(weatherCode);

  // --- 1. Automated "Weather Planning & Actionable Advice" module (Requested Priority Rules) ---
  
  // Rule 1: Rain Alert
  // If precipitation probability > 50% or weather code indicates rain, show: "🌧️ High chance of rain. Carry an umbrella!"
  if (precipProbability > 50 || isRainyCode) {
    addRec(
      'alert',
      'Rain Alert',
      '🌧️ High chance of rain. Carry an umbrella!',
      'warning'
    );
  }

  // Rule 2: High Temperature
  // If temp > 35°C, show: "☀️ Extreme Heat. Stay hydrated and avoid peak midday sun."
  if (temp > 35) {
    addRec(
      'alert',
      'High Temperature Alert',
      '☀️ Extreme Heat. Stay hydrated and avoid peak midday sun.',
      'danger'
    );
  }

  // Rule 3: Wind Alert
  // If wind speed > 30 km/h, show: "💨 High Wind Warning. Secure loose outdoor objects."
  if (windSpeed > 30) {
    addRec(
      'alert',
      'Wind Alert',
      '💨 High Wind Warning. Secure loose outdoor objects.',
      'danger'
    );
  }

  // Rule 4: Fair Weather
  // If temp is 18°C-28°C with no rain, show: "🌤️ Perfect weather for outdoor activities!"
  const hasRain = (precipProbability > 50 || isRainyCode || precipitation > 0.2);
  if (temp >= 18 && temp <= 28 && !hasRain) {
    addRec(
      'activity',
      'Fair Weather',
      '🌤️ Perfect weather for outdoor activities!',
      'success'
    );
  }

  // --- 2. Secondary General Advisory Guidelines ---
  if (isStorm) {
    addRec(
      'alert',
      'Thunderstorm Warning',
      'Severe weather detected. Avoid being outdoors near metal structures or tall trees. Keep electronics unplugged and stay inside.',
      'danger'
    );
  }

  if (temp < 0) {
    addRec(
      'alert',
      'Sub-Zero Freeze Warning',
      'Freezing conditions exist. Risk of icy roads, black ice, and freezing water pipes. Keep pets indoors and wrap exposed exterior faucets.',
      'danger'
    );
  }

  // --- 3. Clothing Suggestions ---
  if (temp >= 28) {
    addRec(
      'clothing',
      'Lightweight Wear',
      'Very warm outside! Choose light, breathable fabrics like linen or cotton, and wear short sleeves. A wide-brimmed sun hat is excellent.',
      'info'
    );
  } else if (temp >= 18 && temp < 28) {
    addRec(
      'clothing',
      'Comfortable Summer Attire',
      'Mild and pleasant. Perfect for t-shirts, shorts, or light dresses. Bring a very thin sweater or jacket for breezy evenings.',
      'success'
    );
  } else if (temp >= 10 && temp < 18) {
    addRec(
      'clothing',
      'Layered Autumn Wear',
      'Cooler temperatures. Recommend layers: a long-sleeve shirt under a medium jacket, cardigans, or light coats to adapt to changes.',
      'info'
    );
  } else if (temp >= 0 && temp < 10) {
    addRec(
      'clothing',
      'Warm Thermal Layers',
      'Quite cold. Wear a warm winter coat, thermal inner layers, sweaters, and closed shoes or boots to prevent body heat loss.',
      'warning'
    );
  } else {
    addRec(
      'clothing',
      'Heavy Winter Gear',
      'Freezing temperatures require heavy insulation. Wear a thick down parka, thermal underwear, gloves, a thick wool scarf, and a beanie.',
      'warning'
    );
  }

  if (weatherCode === 0) {
    addRec(
      'clothing',
      'UV Defense & Sunglasses',
      'Clear skies mean direct sunlight. Protect your eyes with UV-blocking sunglasses and wear a light layer to guard against direct skin exposure.',
      'info'
    );
  }

  // --- 4. Activity Planning ---
  if (isStorm) {
    addRec(
      'activity',
      'Indoor Recreation Preferred',
      'Adverse weather makes indoor activities optimal. Great day for visiting museums, watching movies, cooking, or reading at home.',
      'info'
    );
  } else if (isSnow) {
    addRec(
      'activity',
      'Winter Activities & Snow Fun',
      'Snow on the forecast! Great for making snowmen, sledding, or skiing if conditions permit. Be careful of slippery pathways.',
      'success'
    );
  } else if (isFog) {
    addRec(
      'activity',
      'Caution: Low Visibility Activities',
      'Foggy conditions will restrict visibility. Keep outdoor hiking, driving, or photography to a minimum and proceed with caution.',
      'warning'
    );
  } else if (temp >= 17 && temp <= 27 && windSpeed < 20 && !hasRain) {
    addRec(
      'activity',
      'Perfect Day for Outdoor Sports',
      'Stellar conditions for outdoor activities: running, cycling, playing tennis, or planning a picnic in the park.',
      'success'
    );
  } else if (temp >= 10 && temp < 17 && !hasRain) {
    addRec(
      'activity',
      'Crisp Outdoor Walks',
      'Excellent cool weather for walking, jogging, or a light hike. You won’t overheat, but keep moving to stay warm!',
      'success'
    );
  }

  // --- 5. Health & Well-being ---
  if (temp >= 28) {
    addRec(
      'health',
      'Hydration Reminder',
      'High temperatures increase fluid loss. Drink plenty of water (at least 2.5-3 liters today), and replenish electrolytes if active.',
      'warning'
    );
  }

  if (weatherCode === 0 && temp > 22) {
    addRec(
      'health',
      'Sunscreen Required (SPF 30+)',
      'High direct solar radiation. Apply broad-spectrum sunscreen of at least SPF 30 every 2 hours if staying outdoors.',
      'warning'
    );
  }

  if (humidity > 80 && temp > 25) {
    addRec(
      'health',
      'Muggy Atmosphere & Heat Index',
      `High relative humidity (${humidity}%) makes the air feel much hotter than it is, hindering sweat evaporation. Cool off with fans or A/C.`,
      'info'
    );
  } else if (humidity < 30) {
    addRec(
      'health',
      'Dry Air Skin Care',
      `Low humidity (${humidity}%) can dry out your airways and skin. Use hydrating lotions, lip balm, and stay well-hydrated.`,
      'info'
    );
  }

  // Ensure we always have a generic recommendation if nothing triggered
  if (recommendations.length === 0) {
    addRec(
      'clothing',
      'Standard Attire',
      'Current weather is highly stable. Dress comfortably for local conditions and proceed with your regular daily routines.',
      'success'
    );
  }

  return recommendations;
}
