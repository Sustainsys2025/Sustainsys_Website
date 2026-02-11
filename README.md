# SustainSys - AI-Powered Engineering Solutions

[![Website](https://img.shields.io/badge/website-sustainsys.co.uk-00d4e6)](https://sustainsys.co.uk)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

> GenAI-powered engineering advisory platform delivering AI-assisted agile software development and digital transformation.

## Overview

SustainSys is a consulting firm based in Cambridge, UK, specialising in AI-powered engineering advisory. The platform combines deep subject-matter expertise, curated engineering best practices, and large language models to accelerate software delivery across the full SDLC.

**Core offerings:**
- GenAI-powered engineering advisory and delivery platform
- Cloud transformations (AWS, Azure, GCP, Oracle)
- Murex consultancy and regulatory compliance (FRTB, IBOR, XVA, ISDA SIMM)
- Corporate AI training and learning programmes
- Sustainability and ESG services

## Tech Stack

- **Frontend:** Pure HTML5, CSS3, vanilla JavaScript (no frameworks)
- **Fonts:** Google Fonts (Orbitron, Inter, JetBrains Mono)
- **Hosting:** Static site deployed via GitHub Pages with custom domain (CNAME)
- **Assets:** MP4 animated logo, PNG static logo, WebP thumbnails
- **No build step required** - open `index.html` directly or serve with any static server

## Folder Structure

```
sustainsys.co.uk/
├── index.html                          # Landing page (home)
├── services.html                       # Cloud, Murex, Support, ESG services
├── projects.html                       # Project portfolio
├── Future_Forward.html                 # Research initiatives & future work
├── job-openings.html                   # Career opportunities
├── ai-learn.html                       # AI Academy - training courses
├── sustainsys-ai-powered.html         # AI Platform details & events
├── intelliquest-framework-guide.html  # Intelliquest Agentic Framework docs
│
├── styles.css                          # Shared design system & components
├── main.js                             # Shared JavaScript (nav, effects, etc.)
│
├── Sustainsys_Logo.mp4               # Animated video logo
├── logo_only.png                       # Static PNG logo (footer)
├── thumbnails/                         # WebP image thumbnails
│   └── thumbnail-1.webp ... thumbnail-12.webp
│
├── CNAME                               # Custom domain config (sustainsys.co.uk)
├── EVENTS_MANAGEMENT_GUIDE.md         # Guide for managing events config
├── Intelliquest_Agentic_Framework_Guide.pdf  # Framework reference PDF
└── README.md                           # This file
```

## Design System

### Colour Palette (Refined)

```css
--primary: #080114;        /* Deep space */
--secondary: #16102b;      /* Dark purple */
--accent-cyan: #00d4e6;    /* Teal cyan (toned down) */
--accent-purple: #8b5cf6;  /* Soft violet */
--accent-pink: #ec4899;    /* Warm pink */
--accent-green: #10b981;   /* Emerald */
--accent-gold: #f59e0b;    /* Amber (AI Academy) */
--text: #e2e8f0;           /* Light slate */
--text-dim: #94a3b8;       /* Muted slate */
```

### Typography

| Usage | Font | Weights |
|-------|------|---------|
| Headlines | Orbitron | 700, 900 |
| Body text | Inter | 300, 400, 600, 700 |
| Code / labels | JetBrains Mono | 400, 700 |

### Component Library (styles.css)

The shared stylesheet provides these reusable components:
- **Navigation:** Fixed header with video logo, desktop links, mobile drawer
- **Layout:** `.container`, `.container--wide`, `.grid-2`, `.grid-3`, `.grid-auto`
- **Cards:** `.card`, `.card-icon`, with hover effects
- **Buttons:** `.btn`, `.btn-primary`, `.btn-outline`
- **Sections:** `.hero`, `.page-header`, `.section`, `.cta-section`
- **Stats:** `.stats`, `.stat-card`, `.stat-number`, `.stat-label`
- **Footer:** `.footer-inner`, `.footer-top`, `.footer-brand`, `.footer-location`, `.footer-bottom`
- **Utilities:** `.collapsible-toggle`, `.collapsible-content`, animations

### Visual Effects

- Animated neural network background (canvas-like, CSS-only)
- Gradient text animations on headings
- Scroll progress ring indicator
- Mouse trail effect (desktop only)
- Card hover transforms with glow

## Setup Instructions

### Local Development

```bash
# Clone the repository
git clone https://github.com/sustainsys/sustainsys.co.uk.git
cd sustainsys.co.uk

# Serve locally (pick one):
python -m http.server 8000        # Python
npx http-server                    # Node.js
open index.html                    # Direct file access
```

Then visit `http://localhost:8000`.

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools, npm packages, or compilers needed

## Deployment

The site is deployed as a static website. Compatible with:

| Platform | Method |
|----------|--------|
| **GitHub Pages** | Push to `main`, enable Pages in repo settings |
| **Netlify** | Connect repo or drag-and-drop |
| **Vercel** | Connect repo, zero-config |
| **AWS S3 + CloudFront** | Upload static files, configure CDN |
| **Any web host** | FTP/SFTP upload of all files |

The `CNAME` file maps the custom domain `sustainsys.co.uk`.

## Pages

| Page | File | Description |
|------|------|-------------|
| **Home** | `index.html` | Landing page with hero, platform overview, impact cards, CTA |
| **Services** | `services.html` | Cloud, Murex, Support, and ESG service offerings |
| **Projects** | `projects.html` | GenAI Engineering Platform and Regulatory Reporting showcase |
| **Future Forward** | `Future_Forward.html` | Research focus areas and target industries |
| **Careers** | `job-openings.html` | Job listings with expandable descriptions |
| **AI Academy** | `ai-learn.html` | 10 AI/ML training courses with featured learning paths |
| **AI Platform** | `sustainsys-ai-powered.html` | Detailed platform features, stats, events |
| **Framework Guide** | `intelliquest-framework-guide.html` | Intelliquest Agentic Framework documentation |

## Design Decisions

1. **No frameworks** - Pure HTML/CSS/JS for zero dependencies and fast loading
2. **Shared CSS/JS** - `styles.css` and `main.js` provide consistency across all pages
3. **Video logo** - Animated MP4 logo used consistently in all page headers
4. **Dark theme** - Deep space background with cyan/purple accents conveys AI/tech identity
5. **Refined palette** - Original neon colours toned down for professionalism while retaining energy
6. **Mobile-first responsive** - Breakpoints at 480px, 768px, 1024px
7. **Collapsible content** - Used on careers page to reduce scroll length
8. **Cards-based layout** - Consistent `.card` component across all pages

## Future Improvements

- [ ] Blog / news section
- [ ] Case studies with metrics
- [ ] Interactive platform demo
- [ ] Client testimonials
- [ ] Resource library / downloads
- [ ] Multi-language support
- [ ] Contact form with backend integration
- [ ] Analytics integration
- [ ] Service worker for offline support

## Contact

- **Website:** [sustainsys.co.uk](https://sustainsys.co.uk)
- **Email:** accounts@sustainsys.co.uk
- **Twitter:** [@Sustain_IT_uk](https://twitter.com/Sustain_IT_uk)
- **Location:** Cambridge, UK

---

Copyright 2026 SustainSys Consulting Ltd. All rights reserved.
