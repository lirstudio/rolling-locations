const host = {
  nav: {
    overview: "Overview",
    locations: "My Locations",
    availability: "Availability",
    requests: "Requests",
    settings: "Settings",
  },
  overview: {
    title: "Host Dashboard",
    activeListings: "Active Listings",
    pendingRequests: "Pending Requests",
    approvedThisMonth: "Approved This Month",
  },
  locations: {
    title: "My Locations",
    addNew: "Add Location",
    draft: "Draft",
    published: "Published",
    paused: "Paused",
    editLocation: "Edit Location",
    newLocation: "New Location",
  },
  availability: {
    title: "Availability Manager",
    blockDates: "Block Dates",
    available: "Available",
    blocked: "Blocked",
  },
  requests: {
    title: "Booking Requests",
    approve: "Approve",
    reject: "Reject",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  },
} as const;

export default host;
