const admin = {
  nav: {
    dashboard: "Dashboard",
    users: "Users",
    categories: "Categories",
    locations: "Locations",
    bookings: "Bookings",
    settings: "Settings",
  },
  users: {
    title: "Users",
    role: {
      guest: "Guest",
      creator: "Creator",
      host: "Host",
      admin: "Admin",
    },
  },
  categories: {
    title: "Categories",
    addNew: "New Category",
    name: "Name",
    slug: "Slug",
    order: "Order",
    visible: "Visible",
    hide: "Hide",
    show: "Show",
  },
  locations: {
    title: "Location Moderation",
    pause: "Pause",
    unpause: "Unpause",
    status: {
      draft: "Draft",
      published: "Published",
      paused: "Paused",
    },
  },
  bookings: {
    title: "Bookings Overview",
  },
} as const;

export default admin;
