# Gud In – Intelligence OCR & Finance Tracker

Gud In is a cutting-edge Progressive Web Application (PWA) built on top of the **Next.js 14+ App Router** architecture. The application is engineered specifically for mobile and tablet viewport environments, offering real-time financial logging driven by a client-side **HTML5 Canvas** capture layer and a high-performance decoupling **Tesseract.js OCR (Optical Character Recognition)** semantic text engine.

---

## 🛠️ System Architecture Overview

* **Frontend Framework:** Next.js (React 18+, Client-side Hydration)
* **Styling Engine:** Tailwind CSS (Fluid Mobile-first Grid UI Layout)
* **Database & Auth Layer:** Supabase Client SDK Integration
* **Hardware Interface:** `react-webcam` API stream bound to an independent native HTML5 Offscreen Canvas wrapper to completely circumvent mobile browser browser canvas-stretching distortion.
* **OCR Engine:** Tesseract.js Web Workers operating client-side with synchronous Indonesian (`ind`) and English (`eng`) linguistic trained data packs.
* **Cross-Page Data Telemetry:** Non-blocking Web Storage Session API (`sessionStorage`).

---

## 📋 Prerequisites & Local Environment Setup

Ensure your local environment meets the explicit engineering infrastructure baselines below before initializing the compilation runtime.

### Technical Baselines
* **Node.js:** v18.17.0 LTS or higher (Recommended: v20+)
* **Package Manager:** `npm` v9+ or `yarn` v1.22+
* **Hardware Required for System Verification:** An active camera media capture device (Rear-facing environment mode camera required on real-world smartphone endpoints to bypass desktop simulation restrictions).

### Required Environment Variables (`.env.local`)
Create a `.env.local` file in the root directory to establish system handshakes with your Supabase backend:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_endpoint_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_public_api_key
```

## 🚀 Execution & Deployment Lifecycle

### 1. Dependency Resolution
Initialize your package lock synchronization sequence:

```bash
npm install
# or
yarn install
```

### 2. Launch Local Development Server
Execute the local development script to spin up the local server with hot-reloading features:

```bash
npm run dev
# or
yarn dev
```

### 3. Production Compilation & Optimization
Compile the static chunks and optimize server component asset layers for active production delivery:

Once initialized, map your loopback address via browser at: http://localhost:3000.

```bash
npm run build
```
