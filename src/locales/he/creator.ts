const creator = {
  nav: {
    overview: "סקירה",
    myBookings: "ההזמנות שלי",
    invoices: "חשבוניות",
    settings: "הגדרות",
  },
  overview: {
    title: "לוח בקרה - יוצר",
    activeBookings: "הזמנות פעילות",
    pendingRequests: "בקשות ממתינות",
    completedBookings: "הזמנות שהושלמו",
  },
  bookings: {
    title: "ההזמנות שלי",
    requestBooking: "בקשת הזמנה",
    bookingDetails: "פרטי הזמנה",
    status: {
      requested: "נשלח",
      approved: "מאושר",
      rejected: "נדחה",
      cancelled: "בוטל",
    },
    cancel: "בטל הזמנה",
    location: "לוקיישן",
    date: "תאריך",
    time: "שעות",
    duration: "משך",
    priceEstimate: "הערכת מחיר",
    notes: "הערות",
  },
  invoices: {
    title: "חשבוניות",
    comingSoon: "בקרוב",
  },
} as const;

export default creator;
