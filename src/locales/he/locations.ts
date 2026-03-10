/** Locale strings for mock location/category content (marketing discovery). */
const locations = {
  emptyCategory: "אין לוקיישנים בקטגוריה זו כרגע.",
  categories: {
    studio: "סטודיו",
    podcast: "פודקאסט",
    "outdoor-photography": "צילומי חוץ",
    "event-hall": "אולם להשכרה",
    offices: "משרדים להשכרה",
    "office-floor": "קומה להשכרה",
    office: "משרד",
    "meeting-room": "חדר ישיבות",
  },
  cities: {
    telAviv: "תל אביב",
    ramatGan: "רמת גן",
    jaffa: "יפו",
    hertzliya: "הרצליה",
    kfarSaba: "כפר סבא",
  },
  locations: {
    studioNorth: "סטודיו צפון תל אביב",
    officeRamatGan: "משרד מודרני רמת גן",
    loftJaffa: "לופט יפו",
    rooftopTlv: "סטודיו גג תל אביב",
    officeHertzliya: "משרד מינימלי הרצליה",
    gardenStudio: "סטודיו גן כפר סבא",
  },
  desc: {
    studioNorth: "סטודיו מקצועי עם תאורה טבעית ומלאכותית. מתאים לצילומי מוצר ודיוקן.",
    officeRamatGan: "משרד מרווח עם חלונות גדולים. אידיאלי לראיונות וצילומי cooperate.",
    loftJaffa: "לופט עם חלל גבוה ואווירה תעשייתית. מתאים לצילומי אופנה וקמפיינים.",
    rooftopTlv: "סטודיו על הגג עם נוף לעיר. שעות זהב מושלמות.",
    officeHertzliya: "משרד נקי ומינימלי. WiFi מהיר וחניה.",
    gardenStudio: "סטודיו עם גישה לגן. אור יום וטבע ברקע.",
  },
  amenities: {
    wifi: "WiFi",
    ac: "מיזוג",
    parking: "חניה",
    backdrop: "רקעים לצילום",
    whiteboard: "לוח",
    naturalLight: "תאורה טבעית",
    rooftop: "גג",
    garden: "גן",
  },
  rules: {
    noSmoking: "אין עישון",
    quietHours: "שעות שקט",
    noPets: "אין חיות",
  },
  hosts: {
    mika: "מיקה",
    david: "דוד",
    yael: "יעל",
    ron: "רון",
  },
  showcaseVideos: {
    studioReel: "ריל מהסטודיו",
    behindTheScenes: "מאחורי הקלעים",
    officeShoot: "צילום במשרד",
    loftCampaign: "קמפיין בלופט",
  },
} as const;

export default locations;
