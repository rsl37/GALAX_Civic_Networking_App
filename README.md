# GALAX: Web-3 Civic Networking Platform - Full Project Workspace

[![CI](https://github.com/rsl37/GALAX_App/workflows/Continuous%20Integration/badge.svg)](https://github.com/rsl37/GALAX_App/actions/workflows/ci.yml)
[![Security](https://github.com/rsl37/GALAX_App/workflows/Security%20Checks/badge.svg)](https://github.com/rsl37/GALAX_App/actions/workflows/security.yml)
[![Tests](https://github.com/rsl37/GALAX_App/workflows/Testing/badge.svg)](https://github.com/rsl37/GALAX_App/actions/workflows/testing.yml)
[![Code Quality](https://github.com/rsl37/GALAX_App/workflows/Code%20Quality/badge.svg)](https://github.com/rsl37/GALAX_App/actions/workflows/code-quality.yml)
[![Performance](https://github.com/rsl37/GALAX_App/workflows/Performance%20Checks/badge.svg)](https://github.com/rsl37/GALAX_App/actions/workflows/performance.yml)
[![Deployment](https://github.com/rsl37/GALAX_App/workflows/Deployment%20Readiness/badge.svg)](https://github.com/rsl37/GALAX_App/actions/workflows/deployment.yml)

Welcome to the **GALAX** project workspace!  
This repository contains the complete project structure, documentation, and technical plans for developing *GALAX*, a next-generation, web3-enabled civic/social networking platform.

---

## 🌌 Project Overview

GALAX is a web3 civic networking platform designed to empower individuals and communities to connect, organize, and collaborate for social good.  
It features real-time help requests, skill and interest-based matching, decentralized reputation, trust networks, gamified achievement systems, democratic governance, and privacy-forward identity management.

---

## 📁 Project Structure

The repository is organized as follows:

```
GALAX_App_files/
├── README.md                     # (This file)
├── PROJECT_STRUCTURE.md          # Directory diagram and explanation
├── components.json               # UI framework settings
├── IMPLEMENTATION_STATUS.md      # Implementation progress
├── package.json                  # NPM project config
├── package-lock.json             # NPM lockfile
├── postcss.config.js             # PostCSS config
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config (frontend)
├── tsconfig.server.json          # TypeScript config (server)
├── vite.config.js                # Vite config
├── client/                       # Frontend app (React, TypeScript, Tailwind)
│   ├── index.html
│   ├── public/                   # Static assets
│   └── src/                      # Source code
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── components/
│       │   ├── AnimatedBackground.tsx
│       │   ├── BottomNavigation.tsx
│       │   ├── ChatInterface.tsx
│       │   ├── EmailVerificationBanner.tsx
│       │   ├── MediaUpload.tsx
│       │   ├── OpenStreetMap.tsx
│       │   └── ui/
│       ├── contexts/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── data/                         # Database and uploads
│   ├── uploads/
│   ├── database.sqlite
│   └── ...
├── docs/                         # Detailed documentation and assessments
│   ├── SOCIAL_IMPACT_INTEGRATION_ASSESSMENT.md
│   ├── TECHNICAL_INTERFACE_DESIGN_ASSESSMENT.md
│   └── (other .md docs)
├── scripts/
│   └── dev.ts
└── server/                       # Backend API, WebSockets, DB
    ├── auth.ts
    ├── database.ts
    ├── index.ts
    ├── (other .ts files)
    └── middleware/
```

---

## 📑 Key Documentation

- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md)  
  *Complete directory tree and file/folder explanations.*

- [`SOCIAL_IMPACT_INTEGRATION_ASSESSMENT.md`](GALAX_App_files/docs/SOCIAL_IMPACT_INTEGRATION_ASSESSMENT.md)  
  *Analysis of social features, feedback systems, reputation, and gamification.*

- [`TECHNICAL_INTERFACE_DESIGN_ASSESSMENT.md`](GALAX_App_files/docs/TECHNICAL_INTERFACE_DESIGN_ASSESSMENT.md)  
  *Technical UI/UX, real-time architecture, accessibility, and recommendations.*

- [`IMPLEMENTATION_STATUS.md`](GALAX_App_files/IMPLEMENTATION_STATUS.md)  
  *Progress report, missing features, and action priorities.*

---

## 🚀 How To Use This Workspace

1. **Install dependencies:**  
   ```bash
   npm install
   ```

2. **Run the development server:**  
   ```bash
   npm run start
   ```

3. **Open the app:**  
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Explore the codebase:**  
   - Frontend: `client/src/`
   - Backend/API: `server/`
   - Database: `data/`
   - Docs: `docs/`

---

## 🛠️ Features & Roadmap

- **Mobile-first, responsive UI**
- **Real-time help requests and chat** (Socket.IO)
- **Skill & interest-based matching**
- **Reputation and badge system**
- **Trust and rating networks**
- **Event and group organization**
- **Democratic governance mechanisms**
- **Web3/crypto identity integration (planned)**
- **Accessibility and internationalization (in progress)**

See [`IMPLEMENTATION_STATUS.md`](GALAX_App_files/IMPLEMENTATION_STATUS.md) for priorities and remaining tasks.

---

## 🧑‍💻 Contributing

1. Fork this repo and create a new branch.
2. Add your changes or new features.
3. Submit a pull request with a detailed description.

### 🔍 Merge Conflict Detection

Use our conflict detection script to check for unmerged files:

```bash
./scripts/check-conflicts.sh
```

This script will:
- ✅ Check for unmerged files (`git ls-files -u`)
- ✅ Scan for conflict markers in source code  
- ✅ Verify build system functionality
- ✅ Provide summary of repository health

For detailed analysis, see [`MERGE_CONFLICT_STATUS_REPORT.md`](MERGE_CONFLICT_STATUS_REPORT.md).

---

## 📜 License

This project is licensed under the **PolyForm Shield License 1.0.0**.  
See the [LICENSE](LICENSE) file for complete terms and conditions.

The PolyForm Shield license allows for broad usage while protecting against direct competition with the software.

---

## 👩‍🚀 Authors & Contact

- **Product Owner:** rsl37
- **Copilot Assistant:** GitHub Copilot

---

## 🚀 Deployment & Hosting

### Production Hosting Transition
The GALAX Civic Networking App has transitioned from its prototype hosting environment to production:

- **Prototype Phase**: Initially developed and tested using instance.so/build
- **Production Phase**: Now hosted on **Vercel** for optimal performance, scalability, and reliability

This transition enables enhanced features including:
- Improved SSL/TLS security
- Global CDN distribution
- Automatic deployments from GitHub
- Enhanced performance monitoring

### Custom Domain SSL Setup
If you're experiencing SSL errors with the custom domain, refer to our comprehensive guide:

- **[Vercel Domain Setup Guide](GALAX_App_files/docs/VERCEL_DOMAIN_SETUP.md)** - Complete SSL and domain configuration for Vercel

### Common SSL Issues
The `ERR_SSL_PROTOCOL_ERROR` on custom domains is typically caused by:
- Incomplete domain verification in Vercel
- DNS records not properly configured
- SSL certificate still being issued

See the domain setup guide for step-by-step resolution.

## 🔒 Network & Firewall Configuration

This repository requires access to various external services for proper operation. If you are experiencing connectivity issues behind a corporate firewall or restrictive network, please refer to our comprehensive firewall documentation:

- **[FIREWALL_CONFIGURATION.md](FIREWALL_CONFIGURATION.md)** - Complete firewall allowlist and network requirements
- **[GITHUB_SERVICES_FIREWALL.md](GITHUB_SERVICES_FIREWALL.md)** - Detailed GitHub services and endpoints

### Quick Firewall Fix
For immediate access, ensure these domains are allowlisted:
```
github.com, *.github.com, *.githubusercontent.com
registry.npmjs.org, *.npmjs.org
*.tile.openstreetmap.org
cdnjs.cloudflare.com
```

---

## 🔗 Notes

- This workspace was generated by GitHub Copilot using a series of detailed design, assessment, and planning chats.
- For the full history and design rationale, see the chat logs and included documentation.

---
