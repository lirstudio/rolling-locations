# קוד אימות במייל (OTP) — Supabase

האפליקציה משתמשת בכניסה עם **קוד אימות בן 6 ספרות** שנשלח למייל (ללא magic link).

כדי שהמייל יכיל את הקוד, צריך לעדכן את **תבנית המייל** ב-Supabase כך שתכלול את המשתנה `{{ .Token }}`.

## עדכון תבנית המייל ב-Supabase

1. היכנס ל-[Supabase Dashboard](https://supabase.com/dashboard) ובחר את הפרויקט.
2. **Authentication** → **Email Templates**.
3. בחר **Magic Link**.
4. עדכן את **גוף המייל (Body)** כך שיכלול את קוד האימות, לדוגמה:

```html
<h2>Rollin Locations — קוד כניסה</h2>
<p>קוד האימות שלך:</p>
<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">{{ .Token }}</p>
<p>הזן את הקוד בדף הכניסה. הקוד תקף למשך זמן מוגבל.</p>
```

או באנגלית:

```html
<h2>Rollin Locations — Sign-in code</h2>
<p>Your verification code:</p>
<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">{{ .Token }}</p>
<p>Enter this code on the sign-in page. The code expires after a short time.</p>
```

5. שמור את התבנית.

משתנים שימושיים:
- `{{ .Token }}` — קוד האימות בן 6 הספרות.
- `{{ .Email }}` — כתובת המייל של המשתמש.

אם התבנית תכלול רק קישור (ConfirmationURL) בלי `{{ .Token }}`, המשתמש יקבל לינק לכניסה ולא קוד. אחרי הוספת `{{ .Token }}` המייל יכלול את הקוד והמשתמש יוכל להזין אותו במסך "הזן את הקוד".
