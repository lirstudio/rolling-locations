# Rollin Locations 🎬

**Rollin Locations** היא פלטפורמה (Marketplace) למציאת והזמנת לוקיישנים ייחודיים לצילום לפי שעה. הפלטפורמה מחברת בין יוצרי תוכן וצוותי הפקה (Creators) לבין בעלי נכסים ומארחים (Hosts).

---
.
## 🚀 טכנולוגיות (Tech Stack)

הפרויקט בנוי בסטנדרטים הגבוהים ביותר של פיתוח ווב מודרני:

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router) + TypeScript.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/).
- **Icons:** [Lucide React](https://lucide.dev/).
- **State Management:** [Zustand](https://docs.pmnd.rs/zustand/) (Client) & [TanStack Query](https://tanstack.com/query/latest) (Server/Async).
- **Backend & Auth:** [Supabase](https://supabase.com/) (Postgres, Auth, Storage, RLS).
- **Forms:** React Hook Form + Zod.
- **i18n:** `next-intl` עם תמיכה מלאה ב-RTL (עברית כשפת ברירת מחדל).
- **Emails:** [Resend](https://resend.com/) לשליחת מיילים טרנזקציונליים.

---

## 🛠️ מבנה הפרויקט

הפרויקט מאורגן לפי פיצ'רים (Feature-based structure):

```text
src/
 ├── app/              # Next.js App Router (Pages & API)
 ├── components/
 │    ├── ui/          # shadcn/ui primitives (אין לערוך ישירות)
 │    └── <feature>/   # רכיבים לפי דומיין (locations, bookings וכו')
 ├── hooks/            # Custom Hooks משותפים
 ├── lib/              # קונפיגורציה (Supabase client וכו')
 ├── utils/            # פונקציות עזר טהורות
 ├── types/            # הגדרות TypeScript משותפות
 └── locales/          # קבצי תרגום (he, en)
```

---

## 🏁 איך מתחילים?

### 1. התקנת תלויות
```bash
npm install
# או
pnpm install
```

### 2. הגדרת משתני סביבה
יש ליצור קובץ `.env.local` (**לא לעשות commit** — הקובץ ממוען ב-.gitignore) ולהוסיף את המפתחות הבאים:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_key
SEND_EMAIL_HOOK_SECRET=v1,whsec_<base64_secret>
```

**חיבור יומן גוגל (זמינות מארחים):** נדרש עבור "חבר יומן גוגל" בעמוד ניהול זמינות.
```env
GOOGLE_CLIENT_ID=...          # מ-Google Cloud Console → OAuth client (Web)
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://<הדומיין-שלך>/api/google-calendar/callback
ENCRYPTION_KEY=...            # 64 תווים hex (למשל: openssl rand -hex 32)
```
`GOOGLE_REDIRECT_URI` חייב להיות זהה ל-URI שהוגדר ב-Google Cloud ב-Authorized redirect URIs.

אופציונלי: `AUTH_FROM_EMAIL`, `BOOKINGS_FROM_EMAIL`, `ADMIN_HOST_FALLBACK_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_TOKEN` — לפי הצורך (ראו הודעות שגיאה בקוד).

### 3. הרצת שרת הפיתוח
```bash
npm run dev
```
האפליקציה תהיה זמינה בכתובת `http://localhost:3000`.

---

## 📧 מיילי אימות (OTP / Magic link) — לכל המשתמשים

האפליקציה משתמשת ב-**Send Email Hook** של Supabase: כל מיילי האימות (קוד 6 ספרות, magic link, recovery, הזמנות וכו') נשלחים דרך **Resend** מ-route ייעודי, ולכן מגיעים **לכל כתובת** (לא רק לצוות).

**הגדרה (פעם אחת):**

1. **להפוך את ה-API לנגיש מהאינטרנט**  
   ב-production: האתר כבר נגיש. ב-dev: להשתמש ב-ngrok (או דומה) כדי לחשוף `https://your-ngrok-url/api/auth/send-email`.

2. **ב-Supabase Dashboard:** [Authentication → Hooks](https://supabase.com/dashboard/project/_/auth/hooks) → **Send Email** → Create.
   - **URL:** `https://<הדומיין-שלך>/api/auth/send-email`
   - **Generate Secret** — להעתיק את הסוד (פורמט `v1,whsec_...`).
   - לשמור את הסוד ב-`.env.local` כ-`SEND_EMAIL_HOOK_SECRET=v1,whsec_<הערך>`.

3. **משתני סביבה חובה:** `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SEND_EMAIL_HOOK_SECRET`. אופציונלי: `AUTH_FROM_EMAIL` אם רוצים שולח שונה מנoreply@locations.rollin.video.

אחרי ההגדרה, Supabase מנתב את **כל** שליחות מייל האימות ל-hook הזה והאפליקציה שולחת אותן דרך Resend — לכל סוגי המיילים ולכל המשתמשים.

**חשוב — כדי שמיילים יגיעו לכל משתמש (לא רק למנהל):**  
ב-Resend, **לפני אימות דומיין** אפשר לשלוח רק לכתובת בעל החשבון. כדי לשלוח לכל כתובת:
- היכנס ל-[Resend → Domains](https://resend.com/domains), הוסף את הדומיין שממנו אתה שולח (למשל `locations.rollin.video`).
- הוסף את רשומות ה-DNS (SPF, DKIM) לפי ההנחיות ב-Resend.
- אחרי אימות, שליחה תתאפשר לכל נמען.

**הוספת משתני הסביבה ב-Vercel (כדי שמיילים יעבדו בפרודקשן):**

1. ב-Vercel: הפרויקט → **Settings** → **Environment Variables**.
2. הוסף **שני** משתנים (כל אחד בנפרד):
   - **Key:** `SEND_EMAIL_HOOK_SECRET` | **Value:** הערך מ-`.env.local` (כל מה שמופיע אחרי `SEND_EMAIL_HOOK_SECRET=`).
   - **Key:** `RESEND_API_KEY` | **Value:** מפתח ה-API מ-Resend (אותו ערך כמו ב-`.env.local`).
3. לכל משתנה: סמן **Production**, **Preview**, **Development** → **Save**.
4. (מומלץ) **Redeploy** כדי שהמשתנים ייטענו.

---

## 📐 דגשי פיתוח (Rules of Play)

- **UI First:** תמיד להשתמש ברכיבי `shadcn/ui` מתוך `src/components/ui` לפני יצירת אלמנטים חדשים.
- **RTL & i18n:** אין להשתמש בטקסט קשיח (Hardcoded). כל המחרוזות חייבות לעבור דרך מפתחות תרגום ב-`locales/`.
- **Security:** כל הגישה לטבלאות Supabase חייבת להתבצע תחת חוקי RLS (Row Level Security).
- **Icons:** שימוש ב-`lucide-react` בלבד.
- **Server Components:** השתמשו ב-Server Components כברירת מחדל. הוסיפו `"use client"` רק כשצריך Hooks או Events.

---

## 🗺️ מפת דרכים (Roadmap - v1 MVP)

- [ ] **Discovery:** חיפוש, פילטור ודפי קטגוריות.
- [ ] **Booking Flow:** מערכת בקשות הזמנה (Request -> Approve/Reject).
- [ ] **Host Dashboard:** ניהול לוקיישנים, זמינות (Blocks) וגלריית מדיה.
- [ ] **Notifications:** שליחת מיילים אוטומטיים על סטטוס הזמנה דרך Resend.
- [ ] **Admin:** ניהול קטגוריות ומודרציה של לוקיישנים.

---

## 📄 רישיון
כל הזכויות שמורות ל-**Rollin Locations**.
