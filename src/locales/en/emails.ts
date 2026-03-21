const emails = {
  bookingStatus: {
    creatorSubject: "Booking status update — {locationTitle}",
    hostSubject: "Booking request status update — {locationTitle}",
    creatorIntro: "Hello {creatorName},",
    hostIntro: "Hello,",
    statusLine: "Request status for {locationTitle}: {statusLabel}",
    bookingId: "Request ID",
    viewInApp: "Sign in to your dashboard for full details.",
  },
  bookingStatusLabels: {
    requested: "Pending approval",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  },
} as const;

export default emails;
