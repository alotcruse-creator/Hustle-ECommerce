# HUSTLE — Premium Gym Clothing Website

Three-page premium e-commerce marketing site for **HUSTLE**, a local Malaysian gym lifestyle brand.  
**Payments are not handled on-site** — every Buy CTA opens your official **Shopee Malaysia** listing.

---

## Live site

- **Website:** https://hustle-brand.pages.dev  
- **Admin panel:** https://hustle-brand.pages.dev/admin/

### Admin access (edit products, prices, content)

| | |
|--|--|
| URL | https://hustle-brand.pages.dev/admin/ |
| Default password | `hustle-admin-2026` |

**Change the password** (recommended):

```bash
printf '%s' 'YOUR-NEW-PASSWORD' | npx wrangler pages secret put ADMIN_PASSWORD --project-name=hustle-brand
```

Admin can:
- **Add / edit / delete** clothing products (name, colour, price, images, details, sizes, Shopee URL)
- **Change all prices** + the Black & White **bundle** deal
- **Edit landing & about** page copy
- **Update size chart**
- **Set main Shopee store link**
- **Reset** catalog to launch defaults

Changes save to **Cloudflare KV** and go live immediately (no redeploy).

---

## Quick start (local)

```bash
cd hustle-website
python3 -m http.server 8080
```

Open **http://localhost:8080**  
Note: Admin API needs Cloudflare Functions — use the live site for full admin, or `npx wrangler pages dev .`

| Page | File | Purpose |
|------|------|---------|
| Landing | `index.html` | Hero, brand pillars, featured products, Shopee CTA |
| Shop | `shop.html` | Product gallery, pricing, bundle, size chart, Buy on Shopee |
| About | `about.html` | Brand story, pillars, local brand narrative |

---

## Connect Shopee MY (required)

Edit **`js/config.js`** and paste your real URLs:

```js
shopee: {
  store: "https://shopee.com.my/your-shop-name",
  oversizedTeeBlack: "https://shopee.com.my/product/....",
  oversizedTeeWhite: "https://shopee.com.my/product/....",
  blackWhiteBundle: "https://shopee.com.my/product/....", // or same as store
},
```

All buttons with `data-shopee="black|white|bundle|store"` read from this config.

---

## Tech stack

- **HTML5 + CSS3 + Vanilla JS** (no build step)
- **Cloudflare Pages Functions** + **KV** for admin CMS
- **Fonts:** Bebas Neue (display) + Inter (body) via Google Fonts
- **Design:** Matte black `#0a0a0a` / gold `#D4AF37` / white
- **Checkout:** Outbound links → Shopee MY only

### Redeploy static + functions

```bash
cd hustle-website
npx wrangler pages deploy . --project-name=hustle-brand --commit-dirty=true
```

---

## Brand system

| Token | Value |
|-------|--------|
| Background | `#050505` / `#0a0a0a` |
| Gold | `#D4AF37` |
| Text | `#F5F5F5` / muted `#A0A0A0` |
| Logo treatment | `HU$TLE` (dollar integrated in S) |
| Taglines | *Hustle Hard. Live Easy.* · *Built for the gym. Styled for everyday.* |
| Pillars | Focus · Energy · Ambition · Legacy |

### Product (from client creatives)

- **Oversized Tee** — Black & White  
- **230GSM** 100% Ring Spun Cotton (preshrunk)  
- Loose fit · 2.5cm rib collar · double needle hems  
- Unisex S–XL  
- **RM39.99** each · **RM71.98** pair (10% off, save RM8)

### Size chart (inches)

| Size | Chest | Length | Sleeve |
|------|-------|--------|--------|
| S | 37" | 25.5" | 7.5" |
| M | 39.5" | 26" | 8" |
| L | 42" | 27.5" | 8" |
| XL | 44" | 28.5" | 8.5" |

---

## Project structure

```
hustle-website/
├── index.html
├── shop.html
├── about.html
├── css/styles.css
├── js/config.js          ← Shopee URLs live here
├── js/main.js
├── assets/
│   ├── images/           ← AI lifestyle + campaign shots
│   └── products/         ← Client product creatives
└── README.md
```

---

## AI image prompts (Midjourney / DALL·E)

Use your product flat-lays as **image references** (`--cref` in MJ) so the gold **HU$TLE** logo stays consistent.

### 1. Hero duo (16:9)

```
Premium athletic brand campaign photo, fit male model in black oversized cotton t-shirt with small gold metallic HUSTLE logo (dollar sign integrated into letter S) on chest, fit female model in matching white oversized tee with same gold logo, dark luxury gym background, dramatic rim lighting with subtle gold accents, commercial fashion photography, 85mm lens, cinematic, high detail --ar 16:9 --stylize 150
```

### 2. Male training black tee (3:4)

```
Athletic male model mid deadlift in dark premium gym wearing black oversized heavyweight t-shirt with gold HUSTLE chest logo dollar-sign in S, sweat, intense focus, matte black environment, soft gold accent lights, commercial fitness campaign, photorealistic, 85mm shallow depth of field --ar 3:4 --stylize 120
```

### 3. Female training white tee (3:4)

```
Athletic female model doing cable row in dark gym wearing white oversized HUSTLE t-shirt gold metallic logo with dollar sign in S, loose relaxed fit, powerful pose, cinematic side light, premium sportswear lookbook, photorealistic --ar 3:4 --stylize 120
```

### 4. Logo detail macro (1:1)

```
Close-up product photography of gold foil HUSTLE logo with integrated dollar sign on black heavyweight cotton t-shirt, fabric texture 230GSM visible, dark blurred gym background, commercial apparel detail shot, sharp focus --ar 1:1
```

### 5. Post-workout lifestyle (3:4)

```
Fit male athlete resting on gym bench after workout, white oversized HUSTLE tee gold logo, towel and water bottle, dark premium gym, contemplative confidence, golden rim light, editorial fitness photography --ar 3:4
```

### 6. Product flatlay (16:9)

```
E-commerce product flatlay black and white oversized t-shirts with gold HUSTLE logos on matte black surface, soft dramatic studio lighting, premium athletic brand, sharp logo detail --ar 16:9
```

**Tip:** After generating, replace files in `assets/images/` with the same filenames to drop new shots into the site with zero code changes.

---

## Deploy

- **Netlify / Vercel / Cloudflare Pages:** drag-and-drop the `hustle-website` folder or connect the repo  
- **Shopee:** keep product pages live; only update `js/config.js` when URLs change  

---

## Next steps (optional)

1. Paste real Shopee product URLs into `js/config.js`  
2. Swap AI lifestyle images with your own photoshoots when ready  
3. Add Open Graph meta + favicon for social sharing  
4. Add Google Analytics / Meta Pixel if needed  
5. Create a dedicated Shopee bundle listing for the 10% pair deal  

---

© HUSTLE — Hustle Hard. Live Easy.
