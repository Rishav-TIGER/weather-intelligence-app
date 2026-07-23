import { SmartRecommendation } from '../types';

export function generateRecommendations(
  temp: number,
  weatherCode: number,
  windSpeed: number,
  precipitation: number = 0,
  humidity: number = 50
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

  // --- 1. Weather-Specific Alerts (High Priority) ---
  const isStorm = [95, 96, 99].includes(weatherCode);
  const isHeavyRain = [65, 82].includes(weatherCode) || precipitation > 10;
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isFog = [45, 48].includes(weatherCode);

  if (isStorm) {
    addRec(
      'alert',
      'Thunderstorm Warning',
      'Severe weather detected. Avoid being outdoors near metal structures or tall trees. Keep electronics unplugged and stay inside.',
      'danger'
    );
  } else if (isHeavyRain) {
    addRec(
      'alert',
      'Heavy Rainfall Alert',
      'Heavy precipitation is expected or occurring. Watch out for localized flooding and reduced road visibility.',
      'warning'
    );
  }

  if (windSpeed > 40) {
    addRec(
      'alert',
      'High Wind Warning',
      `Strong winds detected at ${windSpeed} km/h. Secure loose outdoor objects, avoid parking under old trees, and expect challenging driving conditions.`,
      'danger'
    );
  } else if (windSpeed > 25) {
    addRec(
      'alert',
      'Breezy Conditions',
      `Moderate winds around ${windSpeed} km/h. A light windbreaker is recommended if you're spending prolonged periods outdoors.`,
      'info'
    );
  }

  if (temp < 0) {
    addRec(
      'alert',
      'Sub-Zero Freeze Warning',
      'Freezing conditions exist. Risk of icy roads, black ice, and freezing water pipes. Keep pets indoors and wrap exposed exterior faucets.',
      'danger'
    );
  } else if (temp > 35) {
    addRec(
      'alert',
      'Extreme Heat Warning',
      `High temperatures of ${temp}°C detected. Limit strenuous outdoor work, seek air-conditioned spaces, and watch for symptoms of heat exhaustion.`,
      'danger'
    );
  }

  // --- 2. Clothing Suggestions ---
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
    // sub-zero
    addRec(
      'clothing',
      'Heavy Winter Gear',
      'Freezing temperatures require heavy insulation. Wear a thick down parka, thermal underwear, gloves, a thick wool scarf, and a beanie.',
      'warning'
    );
  }

  // Umbrella check
  const isRainyCode = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
  if (isRainyCode || precipitation > 0.5) {
    addRec(
      'clothing',
      'Bring an Umbrella',
      'Rain or drizzle detected. An umbrella, waterproof jacket, or raincoat is highly recommended to stay dry.',
      'warning'
    );
  } else if (weatherCode === 0) {
    addRec(
      'clothing',
      'UV Defense & Sunglasses',
      'Clear skies mean direct sunlight. Protect your eyes with UV-blocking sunglasses and wear a light layer to guard against direct skin exposure.',
      'info'
    );
  }

  // --- 3. Activity Planning ---
  if (isStorm || isHeavyRain) {
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
  } else if (temp >= 17 && temp <= 27 && windSpeed < 20) {
    addRec(
      'activity',
      'Perfect Day for Outdoor Sports',
      'Stellar conditions for outdoor activities: running, cycling, playing tennis, or planning a picnic in the park.',
      'success'
    );
  } else if (temp >= 10 && temp < 17) {
    addRec(
      'activity',
      'Crisp Outdoor Walks',
      'Excellent cool weather for walking, jogging, or a light hike. You won’t overheat, but keep moving to stay warm!',
      'success'
    );
  } else if (temp > 32) {
    addRec(
      'activity',
      'Limit High-Intensity Workouts',
      'Avoid jogging or intense cardio in the afternoon peak heat. If active, shift training to early morning or air-conditioned gyms.',
      'warning'
    );
  } else if (temp < 5) {
    addRec(
      'activity',
      'Keep Active Workouts Indoors',
      'Chilly air can tighten airways and muscles. Perform stretch sessions or weight routines inside to stay warm and prevent strains.',
      'info'
    );
  } else {
    addRec(
      'activity',
      'Moderate Outdoor Exploration',
      'Weather is acceptable for daily errands and short walks. Keep outdoor sessions reasonable and enjoy the scenery.',
      'info'
    );
  }

  // --- 4. Health & Well-being ---
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
