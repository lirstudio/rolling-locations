const host = {
  nav: {
    overview: "סקירה",
    locations: "הלוקיישנים שלי",
    availability: "זמינות",
    requests: "בקשות",
    settings: "הגדרות",
  },
  overview: {
    title: "לוח בקרה - מארח",
    activeListings: "מודעות פעילות",
    pendingRequests: "בקשות ממתינות",
    approvedThisMonth: "מאושרות החודש",
  },
  locations: {
    title: "הלוקיישנים שלי",
    addNew: "הוסף לוקיישן",
    draft: "טיוטה",
    published: "פורסם",
    paused: "מושהה",
    editLocation: "עריכת לוקיישן",
    newLocation: "לוקיישן חדש",
  },
  availability: {
    title: "ניהול זמינות",
    blockDates: "חסום תאריכים",
    available: "זמין",
    blocked: "חסום",
  },
  requests: {
    title: "בקשות הזמנה",
    approve: "אשר",
    reject: "דחה",
    pending: "ממתין",
    approved: "מאושר",
    rejected: "נדחה",
    cancelled: "בוטל",
  },
} as const;

export default host;
