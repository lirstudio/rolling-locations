const emails = {
  bookingStatus: {
    creatorSubject: "עדכון סטטוס הזמנה — {locationTitle}",
    hostSubject: "עדכון סטטוס בקשה — {locationTitle}",
    creatorIntro: "שלום {creatorName},",
    hostIntro: "שלום,",
    statusLine: "סטטוס הבקשה עבור {locationTitle}: {statusLabel}",
    bookingId: "מזהה בקשה",
    viewInApp: "התחברו לאזור האישי לצפייה בפרטים המלאים.",
  },
  bookingStatusLabels: {
    requested: "ממתינה לאישור",
    approved: "אושרה",
    rejected: "נדחתה",
    cancelled: "בוטלה",
  },
} as const;

export default emails;
