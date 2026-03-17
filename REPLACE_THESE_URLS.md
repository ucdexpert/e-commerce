# 🔧 Quick Replace Guide - Update These Before Launch!

## Replace ALL instances of these placeholders:

### 1. Domain/URL
```
FROM: https://yoursite.com
TO:   https://youractualdomain.com

Files to update:
- frontend/src/app/(shop)/layout.tsx (line ~18)
- frontend/src/app/sitemap.ts (line ~5)
- frontend/src/app/robots.ts (line ~11)
```

---

### 2. Google Analytics ID
```
FROM: G-XXXXXXXXXX
TO:   G-YOURACTUALID

Files to update:
- frontend/src/app/(shop)/layout.tsx (line ~65, ~73)
```

---

### 3. Google Verification Code
```
FROM: your-google-verification-code
TO:   your-actual-verification-code

Files to update:
- frontend/src/app/(shop)/layout.tsx (line ~52)
```

---

### 4. Support Email
```
FROM: support@eshop.com
TO:   your-real-support-email@yourdomain.com

Files to update:
- frontend/src/components/Footer.tsx (line ~105)
- frontend/src/app/(shop)/contact/page.tsx (line ~180)
- frontend/src/app/(shop)/privacy/page.tsx (line ~200)
- frontend/src/app/(shop)/terms/page.tsx (line ~280)
```

---

### 5. Phone Number
```
FROM: +1 (555) 123-4567
TO:   your-real-phone-number

Files to update:
- frontend/src/components/Footer.tsx (line ~117)
- frontend/src/app/(shop)/privacy/page.tsx (line ~205)
- frontend/src/app/(shop)/terms/page.tsx (line ~285)
```

---

### 6. Physical Address
```
FROM: 123 Commerce Street, New York, NY 10001
TO:   your-real-business-address

Files to update:
- frontend/src/components/Footer.tsx (line ~123)
- frontend/src/app/(shop)/privacy/page.tsx (line ~210)
- frontend/src/app/(shop)/terms/page.tsx (line ~290)
```

---

### 7. WhatsApp Number
```
FROM: https://wa.me/923001234567
TO:   https://wa.me/your-real-whatsapp-number

Files to update:
- frontend/src/app/(shop)/contact/page.tsx (line ~165)
```

---

### 8. Contact Phone (Pakistan format)
```
FROM: +92-300-1234567
TO:   your-real-contact-number

Files to update:
- frontend/src/app/(shop)/contact/page.tsx (line ~185)
```

---

### 9. Tawk.to Live Chat ID
```
CURRENT: https://embed.tawk.to/69b96d53bb328c1c365c93e0/1jju563rc

This is already configured! Just verify it works.
If you need to change it, update:
- frontend/src/app/(shop)/layout.tsx (line ~88)
```

---

### 10. Cloudinary Credentials
```
CURRENT: Already configured in backend/.env

CLOUDINARY_CLOUD_NAME=e-comarce
CLOUDINARY_API_KEY=285783984167496
CLOUDINARY_API_SECRET=aTD0-uR_zUiu5z40CyKb0iSqGkg

Verify these work by uploading a test product image.
```

---

### 11. Stripe API Keys (if using)
```
FROM: sk_test_your_stripe_secret_key
FROM: pk_test_your_stripe_publishable_key
TO:   sk_live_your_live_key
TO:   pk_live_your_live_key

Files to update:
- backend/.env
```

---

### 12. SMTP Email Credentials
```
FROM: your @gmail.com
FROM: your-app-password
TO:   your-real-email@gmail.com
TO:   your-actual-app-password

Files to update:
- backend/.env
```

---

## 📋 Quick Test After Updates:

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   Should complete without errors.

2. **Check for remaining placeholders:**
   ```bash
   cd frontend
   grep -r "yoursite.com" src/
   grep -r "eshop.com" src/
   grep -r "555" src/
   ```
   Should return NO results.

3. **Test in browser:**
   - Visit homepage
   - Click footer links
   - Open contact page
   - Verify all emails/phones are your real ones

---

## 🎨 Create OG Image

**File to create:** `frontend/public/og-image.jpg`

**Specifications:**
- Size: 1200x630 pixels
- Format: JPG or PNG
- Content: Your logo + shop name

**Quick creation:**
1. Go to https://canva.com
2. Search "Facebook Cover"
3. Design with your branding
4. Download as `og-image.jpg`
5. Move to `frontend/public/` folder

---

## ✅ Verification Commands

After making all changes:

```bash
# Check for remaining placeholders
cd frontend
grep -r "yoursite" src/
grep -r "eshop.com" src/
grep -r "555" src/
grep -r "G-XXXXXXXXXX" src/
grep -r "your-google" src/

# All should return NO results
```

---

## 🚀 Deploy Checklist

Before deploying:

- [ ] All 12 placeholders replaced
- [ ] OG image created in `/public` folder
- [ ] `npm run build` succeeds
- [ ] No console errors in browser
- [ ] All footer links work
- [ ] Contact form has real email
- [ ] Phone numbers are clickable
- [ ] WhatsApp link works
- [ ] Google Analytics ID updated
- [ ] Sitemap has real domain

After deploying:

- [ ] Test on production URL
- [ ] Submit sitemap to Google
- [ ] Verify analytics is tracking
- [ ] Test all critical flows
- [ ] Check emails are sending

---

**Good luck with your launch!** 🎉
