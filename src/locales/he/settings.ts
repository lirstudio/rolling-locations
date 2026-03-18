const settings = {
  title: "הגדרות",

  user: {
    title: "הגדרות פרופיל",
    description: "עדכן את המידע האישי וההעדפות שלך",
    profilePicture: "תמונת פרופיל",
    uploadPhoto: "העלאת תמונה",
    uploading: "מעלה…",
    reset: "איפוס",
    allowedFormats: "JPG, GIF או PNG. גודל מקסימלי 800K",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    email: "אימייל",
    phone: "טלפון",
    language: "שפה",
    bio: "אודות",
    bioPlaceholder: "ספר/י קצת על עצמך...",
  },

  account: {
    title: "הגדרות חשבון",
    description: "נהל את הגדרות החשבון שלך.",
    personalInfo: "מידע אישי",
    personalInfoDescription: "עדכן את המידע האישי שיוצג בפרופיל שלך.",
    changePassword: "שינוי סיסמה",
    changePasswordDescription: "עדכן את הסיסמה שלך כדי לשמור על אבטחת החשבון.",
    currentPassword: "סיסמה נוכחית",
    newPassword: "סיסמה חדשה",
    confirmNewPassword: "אישור סיסמה חדשה",
    dangerZone: "אזור מסוכן",
    dangerZoneDescription: "פעולות בלתי הפיכות.",
    deleteAccount: "מחיקת חשבון",
    deleteAccountDescription: "מחיקת החשבון שלך באופן קבוע וכל המידע הקשור.",
  },

  saveChanges: "שמור שינויים",
  discard: "ביטול שינויים",
  saved: "השינויים נשמרו בהצלחה",

  languages: {
    he: "עברית",
    en: "English",
  },
} as const;

export default settings;
