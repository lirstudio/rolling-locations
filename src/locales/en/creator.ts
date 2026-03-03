const creator = {
  nav: {
    overview: "Overview",
    myBookings: "My Bookings",
    invoices: "Invoices",
    settings: "Settings",
  },
  overview: {
    title: "Creator Dashboard",
    activeBookings: "Active Bookings",
    pendingRequests: "Pending Requests",
    completedBookings: "Completed Bookings",
  },
  bookings: {
    title: "My Bookings",
    requestBooking: "Request a Booking",
    bookingDetails: "Booking Details",
    status: {
      requested: "Requested",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled",
    },
    cancel: "Cancel Booking",
    location: "Location",
    date: "Date",
    time: "Time",
    duration: "Duration",
    priceEstimate: "Price Estimate",
    notes: "Notes",
  },
  invoices: {
    title: "Invoices",
    comingSoon: "Coming soon",
  },
} as const;

export default creator;
