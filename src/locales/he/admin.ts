const admin = {
  nav: {
    dashboard: "לוח בקרה",
    users: "משתמשים",
    categories: "קטגוריות",
    locations: "לוקיישנים",
    bookings: "הזמנות",
    settings: "הגדרות",
  },
  users: {
    title: "משתמשים",
    role: {
      guest: "אורח",
      creator: "יוצר",
      host: "מארח",
      admin: "מנהל",
    },
  },
  categories: {
    title: "קטגוריות",
    addNew: "קטגוריה חדשה",
    name: "שם",
    slug: "slug",
    order: "סדר",
    visible: "גלוי",
    hide: "הסתר",
    show: "הצג",
  },
  locations: {
    title: "מודרציית לוקיישנים",
    pause: "השהה",
    unpause: "הפעל מחדש",
    status: {
      draft: "טיוטה",
      published: "פורסם",
      paused: "מושהה",
    },
  },
  bookings: {
    title: "סקירת הזמנות",
  },
} as const;

export default admin;
