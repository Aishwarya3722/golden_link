# Golden Link

**An Engineering Project in Community Service — EPICS Phase II**
VIT Bhopal University · School of Computer Science & Engineering (SCOPE) and School of Computer Science & Artificial Intelligence (SCAI)

Golden Link is a mobile-responsive, senior-first companion app that bridges the digital divide for elderly users. It brings together one-tap emergency response, medicine tracking, home-service booking, and community support into a single, highly accessible platform, built with large touch targets, high-contrast color coding, and a minimal navigation flow.

> Read the full Phase II report (`PR2.pdf`) for the motivation, literature review, and detailed design rationale behind every decision in this codebase.

---

## Team

| Reg. No. | Name | Primary Contribution |
|---|---|---|
| 23BCE11158 | Shivansh Sharma | System architecture, backend workflows, SOS pipeline, hardware integration |
| 23BCE11115 | Ritika Tyagi | Database schema & RLS, OAuth, edge functions (pill scanning, SOS alerts), accessible UI/UX |
| 23BAI10275 | Mokshi Jain | Literature review & research |
| 23BAI11041 | Aishwarya Mazumdar | Report formatting, references, proofreading |
| 23BAI11084 | Ritika Soraj | Technical documentation |

Supervisor: Dr. Gaurav Soni · Reviewers: Dr. Geetanjali Giri, Dr. Abhishekh

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Next.js 14, App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Supabase (Auth, Realtime, Storage, Edge Functions) |
| Database | PostgreSQL (via Supabase) |
| Mobile shell | Capacitor.js |
| AI (pill label reading) | Google Gemini (via a Supabase Edge Function) |
| Email alerts | Resend (via a Supabase Edge Function) |

---

## Project structure

```
golden-link/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Welcome / role selection + GitHub login
│   │   ├── auth/callback/       # OAuth callback route handler
│   │   ├── senior/              # Senior dashboard, Pills, Services, Community
│   │   ├── family/              # Family dashboard (link via 6-digit code)
│   │   └── volunteer/           # Volunteer registration + bookings
│   ├── components/
│   │   ├── auth/                # RoleSelector, LoginButtons, LinkCodeModal
│   │   ├── emergency/           # EmergencyButton, ConfirmCallModal, EmergencyHistory
│   │   ├── medicine/            # AddMedicineForm, MedicineList, ReminderScheduler
│   │   ├── services/            # ServicesList, ServiceCard, SearchBar
│   │   ├── community/           # PostList, PostCard, CommentSection
│   │   └── ui/                  # Button, Card, BottomNav
│   ├── hooks/                   # useAuth, useEmergencyContacts
│   ├── lib/
│   │   ├── supabase/            # client.ts (browser) & server.ts (SSR)
│   │   ├── types.ts             # Shared TypeScript types matching the DB schema
│   │   └── utils.ts
│   └── middleware.ts            # Refreshes the Supabase session on every request
├── supabase/
│   ├── schema.sql                       # Full Postgres schema + Row Level Security policies
│   └── functions/
│       ├── send-sos-alert/              # Emails linked family on SOS (Resend)
│       └── scan-medicine-label/         # Reads pill bottle labels (Gemini vision)
├── capacitor.config.ts          # Mobile shell config
├── tailwind.config.ts           # Senior-first color system & type scale
└── .env.example
```

---

## Getting started

### 1. Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account
- A [GitHub OAuth App](https://github.com/settings/developers) for login
- (Optional, for full functionality) a [Resend](https://resend.com) API key and a [Google AI Studio](https://aistudio.google.com/app/apikey) Gemini API key

### 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Once it's provisioned, open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates every table from the report's ER diagram (`profiles`, `family_links`, `emergency_contacts`, `emergency_logs`, `medicines`, `medicine_history`, `services`, `bookings`, `reviews`, `posts`, `comments`), the auto-profile-creation trigger, and all Row Level Security policies.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.

### 3. Configure GitHub OAuth

1. In Supabase: **Authentication → Providers → GitHub** → toggle it on.
2. Copy the **Callback URL** Supabase shows you (looks like `https://<project-ref>.supabase.co/auth/v1/callback`).
3. In GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**, paste that callback URL as the **Authorization callback URL**.
4. Copy the generated **Client ID** and **Client secret** back into the Supabase GitHub provider settings and save.

### 4. Set environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from step 2. The other keys (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`) are only needed if you deploy the two edge functions in step 6.

### 5. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Pick a role, sign in with GitHub, and you'll land in the matching dashboard.

### 6. (Optional) Deploy the edge functions

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set RESEND_API_KEY=... GEMINI_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=...
supabase functions deploy send-sos-alert
supabase functions deploy scan-medicine-label
```

Without these deployed, the app still runs fully — SOS calls and pill reminders still work end-to-end; you simply won't get the family email alert or auto-filled medicine name from a photo.

### 7. Build the mobile app (Capacitor)

```bash
npm run build          # static export used by the mobile shell
npx cap add android     # first time only
npx cap add ios         # first time only, requires macOS + Xcode
npm run mobile:build    # rebuild + sync web assets into native projects
npm run cap:android     # opens Android Studio
npm run cap:ios         # opens Xcode
```

---

## Pushing this to your own GitHub repository

This project is not pushed to GitHub automatically. From this folder:

```bash
git init
git add .
git commit -m "Initial commit: Golden Link"
git branch -M main
git remote add origin https://github.com/<your-username>/golden-link.git
git push -u origin main
```

Create the empty repository on GitHub first (**github.com/new**, no README/license, so there's no merge conflict), then run the commands above.

---

## Database design

See `supabase/schema.sql` for the authoritative source of truth. It implements the entity relationships from the report's ER diagram (Fig. 2 / Table 2):

- `profiles` — one row per authenticated user, tagged `senior` / `family` / `volunteer`
- `family_links` — the 6-digit-code linking mechanism between a senior and a family member
- `emergency_contacts`, `emergency_logs` — the Emergency module
- `medicines`, `medicine_history` — the Medicine module and its adherence history
- `services`, `bookings`, `reviews` — the Services module, including the 5-star review system
- `posts`, `comments` — the Community module

Every table has Row Level Security enabled: a user can only write their own data, and a family member can only read data for seniors they are actively linked to — enforced in Postgres itself, not just in the frontend.

---

## License

This project was built for academic purposes as part of the EPICS coursework at VIT Bhopal University. See `LICENSE` for terms.
