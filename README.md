# CodersClan

## University Placement and Recruitment Management Portal (PlacementPro)

An end-to-end, enterprise-grade campus placement and recruitment portal built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

### 🌟 Key Features

1. **Role-Based Authentication & Guarded Access**:
   - **Student Portal**: Academic profile verification, live drive exploration with eligibility checks, one-click application submission, and real-time round-by-round status tracking.
   - **Placement In-Charge (TPO) Panel**: Comprehensive analytics dashboard, recruitment drive publishing with custom rounds architecture, corporate partner management, student database search & filtering, application reviews, and offer status updates.
   - **Interactive Demo Switcher**: Instant one-click toggle in the header between *Student View* and *Placement In-Charge View* for testing.

2. **Shared Database Schema (PostgreSQL & Supabase)**:
   - `profiles`: Linked to `auth.users` with role enforcement (`student`, `placement_officer`, `company_rep`, `admin`).
   - `students`: Roll number, department, degree, graduation batch, CGPA, backlogs, technical skills, resume/LinkedIn links, and confirmed placement offer details.
   - `companies`: Recruiting partner records, industry sector, tier level (`Super Dream`, `Dream`, `Tier 1`, `Tier 2`, `Mass`), HR contacts, and logos.
   - `recruitment_drives`: Role title, CTC (LPA), stipend, CGPA and backlog thresholds, eligible branches, registration deadlines, and customizable multi-stage evaluation rounds.
   - `applications`: Student drive submissions, current stage tracking, evaluation statuses (`Applied`, `Shortlisted`, `Interviewing`, `Selected`, `Rejected`), and coordinator notes.
   - `placement_announcements`: Official circulars and drive bulletins.
   - **Row Level Security (RLS)** and automated triggers on new user signups.

3. **Offline & Demo Mode by Default**:
   - Seamlessly boots up in interactive Demo Mode with rich sample data even before Supabase keys are configured.
   - Automatically transitions to your live Supabase database the moment `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided in `.env`.

---

### 🚀 Getting Started Locally

#### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

#### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Karthikeya661982/CodersClan.git
cd CodersClan

# Install dependencies
npm install
```

#### 3. Environment Setup (Optional for Demo Mode)
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your Supabase connection parameters:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*(If left as placeholder, the app runs in interactive local demo mode).*

#### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### 5. Build for Production
```bash
npm run build
npm run preview
```

---

### 🗄️ Database Setup (Supabase)

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the script located at `src/database/schema.sql` (or `supabase/schema.sql`).
3. *(Optional)* Seed demo records by running `src/database/seed.sql`.

---

### 📁 Project Architecture

```
CodersClan/
├── src/
│   ├── components/
│   │   ├── auth/            # ProtectedRoute and role guards
│   │   └── layout/          # DashboardLayout, Navbar, Sidebar
│   ├── context/
│   │   └── AuthContext.tsx  # Central authentication, session state, and demo switcher
│   ├── database/
│   │   ├── schema.sql       # Complete PostgreSQL schema with RLS and triggers
│   │   └── seed.sql         # Sample companies, drives, and circulars
│   ├── lib/
│   │   ├── dataService.ts   # Unified API for Supabase operations + fallback store
│   │   ├── mockData.ts      # Seed data for demo testing
│   │   ├── supabase.ts      # Supabase client initializer
│   │   └── utils.ts         # Formatting & styling helper functions
│   ├── pages/
│   │   ├── auth/            # Login and Register pages
│   │   ├── coordinator/     # TPO Coordinator: Overview, Drives, Companies, Students, Applications
│   │   ├── student/         # Student: Dashboard, Browse Drives, Applications, Profile
│   │   └── NotFound.tsx     # 404 page
│   ├── types/
│   │   └── database.types.ts# Strong TypeScript interfaces for all database entities
│   ├── App.tsx              # Router setup with role-based routing
│   ├── index.css            # Tailwind CSS stylesheet
│   └── main.tsx             # Application entry point
├── supabase/
│   └── schema.sql           # Supabase CLI migration copy
├── .env.example
├── package.json
└── vite.config.ts
```

---

### 🤝 Teammate Integration Guide

This foundation was engineered specifically for seamless module integration by team members:
1. **Interview Slot Scheduler**: Consume `applications` and `recruitment_drives.rounds` to plug in calendar scheduling and Google Meet / Teams link generators.
2. **AI Resume Parser & Matcher**: Read `students.resume_url` and `students.skills` to calculate compatibility scores with `recruitment_drives.description`.
3. **Analytics & Reports Exporter**: Query `dataService.getStudents()` and `dataService.getApplications()` to generate downloadable PDF/Excel placement reports.