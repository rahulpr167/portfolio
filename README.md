# 🎨 Rahul Pr — Creative Visual Designer Portfolio

A **personal portfolio website** for a multimedia / graphic designer, built to showcase categorised design work (images & videos) pulled live from the cloud. Visitors can browse project categories, open a fullscreen lightbox, and contact the designer — all in a single-page experience deployed on Vercel.

---

## What It Does

| Feature | Description |
|---|---|
| **Hero / Landing** | Animated intro section with name, title, and CTA |
| **About** | Brief bio and background |
| **Software Skills** | Visual display of design tools (Photoshop, Illustrator, Premiere Pro, After Effects, etc.) |
| **Key Skills** | Tag-based highlights of core competencies |
| **Projects Grid** | Card-based gallery of all design categories; clickable cards navigate to a category page |
| **Category Page** | Fetches images & videos from Cloudinary for that category; supports infinite-scroll-style grid |
| **Lightbox Modal** | Click any media item to open a fullscreen overlay with navigation arrows |
| **Contact** | Direct contact section at the bottom of the page |

### Design Categories Showcased
- Social Media Creatives
- Business Card Designs
- Catalogue Designs
- Label Designs
- Packaging Designs
- Motion Graphic Works
- Video Editing Works

---

## Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| **React 19** | UI framework — component-based architecture |
| **React Router DOM v7** | Client-side routing (`HashRouter` for static-host compatibility) |
| **Vite 8** | Build tool & dev server with HMR |
| **Vanilla CSS (per component)** | Scoped styling — glassmorphism cards, glow effects, animations |
| **Lucide React** | Icon library used across the UI |

### Backend / API
| Tech | Purpose |
|---|---|
| **Express 5** (`server.js`) | Local dev API server — mirrors the Vercel serverless function |
| **Cloudinary SDK** | Fetches images & videos from cloud storage in real time via `cloudinary.api.resources()` |
| **dotenv** | Loads `CLOUDINARY_*` secrets from `.env` at dev time |

### Deployment & Infrastructure
| Tech | Purpose |
|---|---|
| **Vercel** | Hosting — static frontend + serverless API functions under `/api/` |
| **`vercel.json`** | Configures build command, output dir, and URL rewrites so both the SPA and `/api/*` routes work correctly |
| **Cloudinary** | Cloud media storage — all project images and videos are stored here, organised into named folders per category |

### Tooling
| Tech | Purpose |
|---|---|
| **`upload.mjs`** | CLI helper script to upload a local file to a specific Cloudinary folder (`node upload.mjs <file> <folder>`) |
| **`concurrently`** | `npm run dev` starts both the Express API server and Vite in parallel |
| **ESLint** | Code quality — configured with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` |

---

## Project Structure

```
portfolio/
├── api/
│   └── projects/
│       └── [folder].js       # Vercel serverless function — fetches Cloudinary resources
├── src/
│   ├── components/
│   │   ├── Navbar            # Top navigation bar
│   │   ├── Hero              # Landing hero section
│   │   ├── About             # About section
│   │   ├── SoftwareSkills    # Tools / software proficiency display
│   │   ├── KeySkills         # Core competency tags
│   │   ├── Projects          # Project category card grid
│   │   ├── Contact           # Contact section
│   │   └── LightboxModal     # Fullscreen media overlay
│   ├── pages/
│   │   └── CategoryPage      # Dynamic page: fetches & grids media per category
│   ├── mediaManifest.js      # Single source of truth: category slugs ↔ Cloudinary folder names
│   ├── App.jsx               # Router setup (HashRouter)
│   └── main.jsx              # React entry point
├── server.js                 # Local Express API server (dev only)
├── upload.mjs                # CLI tool: upload files to Cloudinary
├── vercel.json               # Vercel deployment config
└── .env                      # Cloudinary credentials (not committed)
```

---

## Environment Variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (Vite + local Express API together)
npm run dev

# Build for production
npm run build

# Upload a media file to Cloudinary
node upload.mjs ./my-design.png "Social Media Creatives"
```

---

## How Media Management Works

1. Designer uploads images/videos to **Cloudinary** (manually or via `upload.mjs`), organised into folders like `portfolio/images/Social Media Creatives/`.
2. `mediaManifest.js` maps each category **slug** (used in the URL) to its **Cloudinary folder name**.
3. When a visitor opens a category page, the React app calls `/api/projects/<slug>`.
4. In production, Vercel routes this to `api/projects/[folder].js` (a serverless function); in dev, it proxies to `server.js` running on port 3001.
5. Both fetch **images and videos** in parallel from Cloudinary and return the URLs as JSON.
6. `CategoryPage.jsx` renders a responsive grid, and clicking any item opens it in the **LightboxModal**.
