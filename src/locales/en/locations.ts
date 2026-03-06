/** Locale strings for mock location/category content (marketing discovery). */
const locations = {
  categories: {
    studio: "Studio",
    office: "Office",
    loft: "Loft",
    outdoor: "Outdoor",
  },
  cities: {
    telAviv: "Tel Aviv",
    ramatGan: "Ramat Gan",
    jaffa: "Jaffa",
    hertzliya: "Hertzliya",
    kfarSaba: "Kfar Saba",
  },
  locations: {
    studioNorth: "Studio North Tel Aviv",
    officeRamatGan: "Modern Office Ramat Gan",
    loftJaffa: "Loft Jaffa",
    rooftopTlv: "Rooftop Studio Tel Aviv",
    officeHertzliya: "Minimal Office Hertzliya",
    gardenStudio: "Garden Studio Kfar Saba",
  },
  desc: {
    studioNorth: "Professional studio with natural and artificial light. Suited for product and portrait photography.",
    officeRamatGan: "Spacious office with large windows. Ideal for interviews and corporate shoots.",
    loftJaffa: "Loft with high ceiling and industrial vibe. Great for fashion and campaigns.",
    rooftopTlv: "Rooftop studio with city views. Perfect for golden hour.",
    officeHertzliya: "Clean minimal office. Fast WiFi and parking.",
    gardenStudio: "Studio with garden access. Natural light and greenery.",
  },
  amenities: {
    wifi: "WiFi",
    ac: "AC",
    parking: "Parking",
    backdrop: "Backdrops",
    whiteboard: "Whiteboard",
    naturalLight: "Natural light",
    rooftop: "Rooftop",
    garden: "Garden",
  },
  rules: {
    noSmoking: "No smoking",
    quietHours: "Quiet hours",
    noPets: "No pets",
  },
  hosts: {
    mika: "Mika",
    david: "David",
    yael: "Yael",
    ron: "Ron",
  },
  showcaseVideos: {
    studioReel: "Studio reel",
    behindTheScenes: "Behind the scenes",
    officeShoot: "Office shoot",
    loftCampaign: "Loft campaign",
  },
} as const;

export default locations;
