# Enchantment

**A high-performance Personal Operating System designed to track heavy PPL lifting, arm wrestling protocols, and B.Tech cybersecurity study modules.**

Enchantment is engineered as a seamless, mobile-first web application featuring a cinematic "Heavenly" UI. It replaces disjointed tracking tools by centralizing rigorous physical training (Push/Pull/Legs) and academic progression (Cybersecurity and IT foundations) into a single, unified dashboard backed by a serverless cloud infrastructure.

---

## ⚡ Tech Stack

- **Framework:** React 18 & Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations & Physics:** Framer Motion
- **Database / Infrastructure:** Neon Serverless Postgres (`@neondatabase/serverless`)

---

## ✨ Core Features

* **Cinematic "Heavenly" UI:** Designed with a strict `bg-neutral-900` dark mode aesthetic, illuminated by "Cyber Green" accents. It utilizes translucent glassmorphic components, delicate `neutral-800` borders, and precise utilitarian typography.
* **Magnetic & Haptic Interactions:** Every button and card recoils smoothly on tap (`whileTap={{ scale: 0.98 }}`). On desktop, components feature spotlight hover effects—a radial gradient tracking the user's cursor across the grid.
* **Mobile-First Bottom Tabs:** On mobile breakpoints, the navigation effortlessly transitions into an iOS-style frosted glass bottom tab bar for ergonomic, thumb-driven use.
* **Framer Motion Gestures:** Seamlessly swipe cards left or right to execute quick actions (e.g., swiping a study module to mark it complete, or archiving a feed item).
* **Live DB Syncing:** Secure, zero-latency state synchronization with a Neon Serverless Postgres instance. Activities logged on the web interface are immediately inserted into the cloud and reflected across the global timeline.
* **Specialized Protocols:** Features custom data structures and interactive toggle widgets specifically designed for heavy Arm Wrestling routines (e.g., switching seamlessly between Hook and Riser training sets).

---

## 🚀 Local Setup Instructions

To run Enchantment locally, follow these steps:

### 1. Install Dependencies
Ensure you have Node.js installed, then install the required packages:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add your Neon Serverless Database URL:
```env
VITE_DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
```
*(Note: Because this relies on `@neondatabase/serverless`, ensure your Postgres connection string is properly permissioned).*

### 3. Initialize the Database
If you are connecting to a fresh database, run the initialization script to generate the required relational schemas (Users, Activities, Study Modules):
```bash
node initDb.js
```

### 4. Run the Dev Server
Fire up Vite to run the application locally:
```bash
npm run dev
```

Visit `http://localhost:5173` (or the port specified by Vite) to explore the dashboard.
