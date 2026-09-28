# My MindRay

**A calmer desk for your mind.**

[Live site](https://mymindray.vercel.app) · Mood, sessions, exercises, and notes in one still place.

My MindRay is a student-built web app for daily mental-wellness check-in and progress tracking. It keeps a short day on a graph, a streak, a journal page, and a next visit. It is support that stays with you — not a hospital, and not a replacement for a counsellor.

---

## Preview

| Home | Dashboard | Relax |
| :---: | :---: | :---: |
| Sign in or walk the demo | Streaks, graph, sources | Video, tones, quiet games |

Live: **[mymindray.vercel.app](https://mymindray.vercel.app)**

---

## What it does

- **Daily check-in** — mood, sleep, energy, and an optional note, once per day  
- **AI desk** — tap a mood; it writes today’s graph and follows you to Relax  
- **Dashboard** — wellness streak, check-in streak, educational sources, WHO-5 style bar, upcoming visits  
- **Relax** — yoga video for the day, breathing circle, tones, calm games  
- **Journal** — private notes stored with the signed-in account  
- **Doctors** — sample clinician list by country and state  
- **Care** — public helplines when a week has been low  

Demo mode is available while logged out. After login the demo button is hidden and the dashboard starts from that account’s own record.

---

## Stack

| Layer | Choice |
| --- | --- |
| Interface | HTML5, CSS3, vanilla JavaScript |
| Auth | Supabase Auth (email + Google) |
| Data | PostgreSQL on Supabase (`profiles`, `user_state`) |
| Client copy | `localStorage` / `sessionStorage` |
| Media | YouTube embed, Web Audio, camera / gallery |
| Hosting | [Vercel](https://mymindray.vercel.app) |

---

## Pages

```
index.html          Home
login.html          Sign in / create account
dashboard.html      Live dashboard
demodashboard.html  Sample walkthrough
ai.html             AI desk
relax.html          Practice and games
journal.html        Private notes
calendar.html       Week view and visits
doctors.html        Clinician directory
profile.html        Account
notifications.html  Reminders
```

---

## Run locally

```bash
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO
```

Serve the folder with any static server (example):

```bash
npx serve -l 7700
```

Open `http://localhost:7700`.

### Environment

Create `supabase-config.js` in the project root (do not commit secret keys):

```js
window.SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR_PUBLISHABLE_KEY";
```

In the Supabase project:

1. Enable **Email** and **Google** auth.  
2. Add the site URL and redirect URLs (`http://localhost:7700` and `https://mymindray.vercel.app`).  
3. Tables used: `profiles`, `user_state`.

Password rule on email sign-up: 8+ characters, letters and numbers only, at least one number, no symbols.

---

## How a day flows

1. Sign in (or open the demo).  
2. Complete the daily check-in, or tap a mood on the AI desk.  
3. The graph, streaks, and Relax video follow that mood.  
4. Mark a source or a Relax practice when it is done.  
5. Schedule, postpone, or cancel a visit from Upcoming / Calendar.

---

## What this project is not

- Not a diagnosis  
- Not emergency care  
- Not face-to-face or video treatment  
- Not a verified hospital roster  

If someone is in immediate danger, they should use local emergency services. In India, public lines listed in the app include KIRAN (`1800-599-0019`) and iCall (`9152987821`). Tele-MANAS (`14416`) is also widely used.

---

## Team

Built as a student project under the guidance of **Farhaz Liaquat Hussain**, Department of Science, Luit Valley Academy.

| Name | Class | Roll |
| --- | --- | --- |
| Abhinab Neog | 12 | 19 |
| Kundan Kamat | 12 | 30 |
| Probal Gogoi | 11 | 11 |

---

## License

Private student project. Ask the team before reuse.

---

**[Open My MindRay](https://mymindray.vercel.app)**
