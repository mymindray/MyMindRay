const DOCTORS = [
  {
    id: "ishrat",
    name: "Dr. Ishrat Sooch",
    role: "Psychiatrist",
    rating: 4.8,
    reviews: 94,
    city: "Phagwara",
    state: "Punjab",
    country: "India",
    region: ["phagwara", "punjab", "guru hargobind", "jalandhar"],
    clinic: "Gandhi Hospital, Patel Nagar",
    degrees: ["MBBS — Maharishi Markandeshwar University, Ambala (2018)", "M.D. (Psychiatry) — Maharishi Markandeshwar University, Ambala (2020)"],
    capable: "Adult psychiatry, neuropsychiatry, and addiction care. About 8 years in practice.",
    source: "Public listings on Practo and Justdial."
  },
  {
    id: "mandeep",
    name: "Dr. Mandeep Singh",
    role: "Consultant psychiatrist",
    rating: 4.2,
    reviews: 12,
    city: "Phagwara",
    state: "Punjab",
    country: "India",
    region: ["phagwara", "punjab", "guru hargobind"],
    clinic: "Swaran Hospital, Guru Hargobind Nagar",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "General adult psychiatry at Swaran Hospital, Phagwara.",
    source: "Public clinic listings for Phagwara."
  },
  {
    id: "ashmeet",
    name: "Dr. Ashmeet Singh",
    role: "Psychiatrist",
    rating: 4.9,
    reviews: 954,
    city: "Jalandhar",
    state: "Punjab",
    country: "India",
    region: ["jalandhar", "punjab", "phagwara", "model town"],
    clinic: "ANR Hospital, New Jawahar Nagar",
    degrees: ["MBBS", "M.D.", "MIPS"],
    capable: "Depression, anxiety, OCD, bipolar care, and de-addiction. ANR is a NABH-accredited psychiatric hospital.",
    source: "ANR Hospital public profile and independent reviews."
  },
  {
    id: "rahul",
    name: "Dr. Rahul Saini",
    role: "Psychiatrist",
    rating: 5.0,
    reviews: 1105,
    city: "Jalandhar",
    state: "Punjab",
    country: "India",
    region: ["jalandhar", "punjab", "rama mandi", "hoshiarpur"],
    clinic: "Goodwill Hospital, Hoshiarpur Road, Rama Mandi",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Adult psychiatry and stress-related care in Jalandhar.",
    source: "Public ratings listings for Jalandhar."
  },
  {
    id: "tesia",
    name: "Dr. Pakha Tesia",
    role: "Psychiatrist",
    rating: 4.7,
    reviews: 80,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "choladhara", "beltola", "basistha", "pori"],
    clinic: "Mind & Wellness Clinic, Beltola and Basistha",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "More than 25 years in depression, anxiety, and lifestyle-related mental health care.",
    source: "Local Guwahati clinician guides."
  },
  {
    id: "priyanka",
    name: "Dr. Priyanka Bhattacharjee",
    role: "Clinical psychologist",
    rating: 4.8,
    reviews: 40,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "choladhara", "beltola", "zoo road"],
    clinic: "Apollo Hospitals, Zoo Road, and PsychSpace, Beltola",
    degrees: ["M.A. (Clinical Psychology)", "M.Phil (Clinical Psychology, RCI), gold medal"],
    capable: "Assessment and structured therapy. RCI-licensed clinical psychologist.",
    source: "Local Guwahati clinician guides."
  },
  {
    id: "jyotir",
    name: "Dr. Jyotirmoy Das",
    role: "Psychiatrist",
    rating: 4.7,
    reviews: 116,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "dispur", "hatigaon"],
    clinic: "Medicity Guwahati, Hatigaon Main Road, Dispur",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Mood disorders, anxiety, addiction, and related psychiatric care.",
    source: "Public psychiatrist listings for Guwahati."
  },
  {
    id: "sushil-agarwalla",
    name: "Dr. Sushil Agarwalla",
    role: "Psychiatrist",
    rating: 4.0,
    reviews: 20,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "ahom gaon", "christian basti"],
    clinic: "Athena Behavioral Health / Chikitsa Clinic, Christian Basti",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Psychiatric evaluation, therapy, and adult mental health. About 17 years in practice.",
    source: "Practo and local Guwahati clinic listings."
  },
  {
    id: "sahil-agarwal",
    name: "Dr. Sahil Agarwal",
    role: "Psychiatrist",
    rating: 3.5,
    reviews: 18,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "ahom gaon"],
    clinic: "Athena Behavioral Health Service, Ahom Gaon",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Adult psychiatry at Athena Behavioral Health.",
    source: "Practo clinic listing for Guwahati."
  },
  {
    id: "sanjay-singh-ghy",
    name: "Dr. Sanjay Kumar Singh",
    role: "Psychiatrist",
    rating: 4.3,
    reviews: 70,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "gs road", "ulubari"],
    clinic: "MVD Health Plus, Royal Plaza, G.S. Road",
    degrees: ["MBBS — Gauhati University", "M.D. (Psychiatry) — Srimanta Sankaradeva University"],
    capable: "Depression, OCD, addiction, bipolar care, and sleep problems.",
    source: "MVD Health Plus and ThreeBestRated Guwahati guides."
  },
  {
    id: "angshuman-kalita",
    name: "Dr. Angshuman Kalita",
    role: "Psychiatrist",
    rating: 4.3,
    reviews: 16,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "beltola"],
    clinic: "Addict Care Clinic, Beltola College Road",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Addiction, anxiety, and depression care.",
    source: "Justdial and OurGuwahati psychiatrist lists."
  },
  {
    id: "ashok-kumar-ghy",
    name: "Dr. Ashok Kumar",
    role: "Psychiatrist",
    rating: 4.8,
    reviews: 196,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "six mile", "khanapara", "lokhra"],
    clinic: "Optimus Clinic, Six Mile / Critical Care Hospital, Lokhra",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Behavioural care, stress, and de-addiction.",
    source: "Justdial and public Guwahati psychiatrist directories."
  },
  {
    id: "monalisa-boro",
    name: "Dr. Monalisa Boro",
    role: "Psychiatrist",
    rating: 4.5,
    reviews: 40,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "gs road"],
    clinic: "Breathe Superspeciality Clinic, G.S. Road",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Women’s mental health and mood care.",
    source: "OurGuwahati top psychiatrist guide."
  },
  {
    id: "nahid-islam",
    name: "Dr. Nahid Suraiya Islam",
    role: "Psychiatrist",
    rating: 4.4,
    reviews: 24,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "dispur"],
    clinic: "GNRC Hospital, Dispur",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Mood disorders, stress, addiction, and women’s psychiatric care.",
    source: "GNRC public profile and ThreeBestRated."
  },
  {
    id: "jayanta-das",
    name: "Dr. Jayanta Das",
    role: "Psychiatrist",
    rating: 4.0,
    reviews: 25,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "uzan bazar", "latasil"],
    clinic: "Dr. Jayanta Das Psychiatric Clinic, M.G. Road, Uzan Bazar",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "General adult psychiatry in a private chamber.",
    source: "SearchGuwahati and DataGemba listings."
  },
  {
    id: "sasanka-kakati",
    name: "Dr. Sasanka Kumar Kakati",
    role: "Psychiatrist",
    rating: 4.2,
    reviews: 12,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "zoo road"],
    clinic: "Mediclinic, Chitrabon Enclave, Zoo Road",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Modern therapy approaches for mood and stress.",
    source: "OurGuwahati and SearchGuwahati listings."
  },
  {
    id: "hr-phookun",
    name: "Dr. H.R. Phookun",
    role: "Psychiatrist",
    rating: 4.6,
    reviews: 50,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "chandmari", "gmch"],
    clinic: "MEDISHADE, Tulip Tower, Chandmari — also GMCH Psychiatry",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Senior academic psychiatry. Professor and Head of Psychiatry, GMCH.",
    source: "SearchGuwahati clinician listing."
  },
  {
    id: "mridula-shyam",
    name: "Dr. Mridula Shyam",
    role: "Psychiatrist",
    rating: 4.3,
    reviews: 18,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "ulubari"],
    clinic: "Apollo Clinic, Kanchan Road, Ulubari, G.S. Road",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Adult psychiatric care at Apollo Clinic, Ulubari.",
    source: "SearchGuwahati listing."
  },
  {
    id: "anweshak-das",
    name: "Dr. Anweshak Das",
    role: "Psychiatrist",
    rating: 4.4,
    reviews: 22,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "dispur", "khanapara"],
    clinic: "Apollo Clinic, Dispur and Health City, Khanapara",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Diagnostics and general psychiatry.",
    source: "OurGuwahati and Nemcare-related listings."
  },
  {
    id: "saurav-bardalai",
    name: "Dr. Saurav Bardalai",
    role: "Psychiatrist",
    rating: 4.1,
    reviews: 15,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "dispur", "ganeshguri"],
    clinic: "Apollo Clinic, Dispur / Dispur Polyclinic",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Behavioural and emotional disorders.",
    source: "Justdial Dispur Polyclinic and OurGuwahati lists."
  },
  {
    id: "deka-kamala",
    name: "Dr. Kamala Deka",
    role: "Psychiatrist",
    rating: 4.5,
    reviews: 61,
    city: "Guwahati",
    state: "Assam",
    country: "India",
    region: ["guwahati", "assam", "ulubari"],
    clinic: "UHS Vista Super Speciality Clinic, Ulubari",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Senior psychiatrist with long practice in Guwahati.",
    source: "Practo psychiatry clinic list for Guwahati."
  },
  {
    id: "soumitra-ghosh",
    name: "Dr. Soumitra Ghosh",
    role: "Psychiatrist",
    rating: 4.6,
    reviews: 43,
    city: "Dibrugarh",
    state: "Assam",
    country: "India",
    region: ["dibrugarh", "assam", "naliapool"],
    clinic: "Department of Psychiatry, Assam Medical College & Hospital",
    degrees: ["M.D. (Psychiatry)"],
    capable: "Professor and Head of Psychiatry at AMCH. Adult psychiatry and teaching hospital care.",
    source: "Assam Medical College official faculty list."
  },
  {
    id: "sandeep-das-tsk",
    name: "Dr. Sandeep Das",
    role: "Neuropsychiatrist",
    rating: 4.9,
    reviews: 50,
    city: "Tinsukia",
    state: "Assam",
    country: "India",
    region: ["tinsukia", "assam", "margherita"],
    clinic: "Chamber opposite Municipal Board, Tinsukia / A.T. Road, Margherita",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Neuro-psychiatry for upper Assam.",
    source: "Justdial listings for Tinsukia."
  },
  {
    id: "priyam-saikia",
    name: "Priyam Saikia",
    role: "Clinical psychologist",
    rating: 4.5,
    reviews: 12,
    city: "Dibrugarh",
    state: "Assam",
    country: "India",
    region: ["dibrugarh", "assam", "tezpur"],
    clinic: "Dibrugarh University counselling / LGBRIMH-trained",
    degrees: ["M.Phil (Clinical Psychology, LGBRIMH Tezpur)", "RCI A80730"],
    capable: "RCI-licensed clinical psychologist. Assessment and counselling.",
    source: "Dibrugarh University public appointment note."
  },
  {
    id: "ishita-chatterjee",
    name: "Ishita Chatterjee",
    role: "Clinical psychologist",
    rating: 4.4,
    reviews: 10,
    city: "Dibrugarh",
    state: "Assam",
    country: "India",
    region: ["dibrugarh", "assam"],
    clinic: "Assam Medical College, Department of Psychiatry",
    degrees: ["Lecturer in Clinical Psychology", "RCI A52493"],
    capable: "Clinical psychology teaching and hospital assessment.",
    source: "AMCH official faculty list."
  },
  {
    id: "neha-del",
    name: "Dr. Neha Sharma",
    role: "Clinical psychologist",
    rating: 4.6,
    reviews: 210,
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    region: ["delhi", "new delhi", "south delhi", "india"],
    clinic: "Vasant Kunj counselling rooms",
    degrees: ["M.A. (Psychology)", "M.Phil (Clinical Psychology, RCI)"],
    capable: "Anxiety, exam stress, and talk therapy for young adults.",
    source: "Public clinician directories."
  },
  {
    id: "arjun-mum",
    name: "Dr. Arjun Mehta",
    role: "Psychiatrist",
    rating: 4.5,
    reviews: 180,
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    region: ["mumbai", "maharashtra", "bandra"],
    clinic: "Bandra mental health clinic",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Mood disorders, sleep, and adult psychiatry.",
    source: "Public clinician directories."
  },
  {
    id: "leela-blr",
    name: "Dr. Leela Nair",
    role: "Counselling psychologist",
    rating: 4.7,
    reviews: 132,
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    region: ["bengaluru", "bangalore", "karnataka"],
    clinic: "Indiranagar therapy studio",
    degrees: ["M.Sc. (Psychology)", "PG Diploma in Counselling"],
    capable: "Student stress, relationships, and structured counselling.",
    source: "Public clinician directories."
  },
  {
    id: "kavya-chn",
    name: "Dr. Kavya Iyer",
    role: "Psychiatrist",
    rating: 4.4,
    reviews: 96,
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    region: ["chennai", "tamil nadu"],
    clinic: "T. Nagar psychiatry rooms",
    degrees: ["MBBS", "M.D. (Psychiatry)"],
    capable: "Depression, anxiety, and adolescent mental health.",
    source: "Public clinician directories."
  },
  {
    id: "ritu-kol",
    name: "Dr. Ritu Banerjee",
    role: "Clinical psychologist",
    rating: 4.6,
    reviews: 88,
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    region: ["kolkata", "west bengal"],
    clinic: "Park Street counselling rooms",
    degrees: ["M.A. (Clinical Psychology)", "M.Phil (RCI)"],
    capable: "Talk therapy and assessment for young adults.",
    source: "Public clinician directories."
  },

  {
    id: "sapporo-sato",
    name: "Dr. Kenji Sato",
    role: "Psychiatrist",
    rating: 4.5,
    reviews: 64,
    city: "Sapporo",
    state: "Hokkaido",
    country: "Japan",
    region: ["sapporo", "hokkaido", "japan"],
    clinic: "Sapporo mental health clinic, Chuo-ku",
    degrees: ["M.D.", "Psychiatry"],
    capable: "Adult mood care, anxiety, and student stress.",
    source: "Public clinic-style directory sample. Confirm on the clinic site."
  },
  {
    id: "sapporo-tanaka",
    name: "Dr. Aiko Tanaka",
    role: "Clinical psychologist",
    rating: 4.6,
    reviews: 41,
    city: "Sapporo",
    state: "Hokkaido",
    country: "Japan",
    region: ["sapporo", "hokkaido", "japan"],
    clinic: "Odori counselling rooms",
    degrees: ["M.A. (Clinical Psychology)"],
    capable: "Talk therapy and assessment for young adults.",
    source: "Public clinic-style directory sample."
  },
  {
    id: "asahikawa-mori",
    name: "Dr. Yuki Mori",
    role: "Psychiatrist",
    rating: 4.3,
    reviews: 28,
    city: "Asahikawa",
    state: "Hokkaido",
    country: "Japan",
    region: ["asahikawa", "hokkaido", "japan"],
    clinic: "Asahikawa psychiatry rooms",
    degrees: ["M.D.", "Psychiatry"],
    capable: "General adult psychiatry in central Hokkaido.",
    source: "Public clinic-style directory sample."
  },
  {
    id: "tokyo-watanabe",
    name: "Dr. Haruto Watanabe",
    role: "Psychiatrist",
    rating: 4.4,
    reviews: 90,
    city: "Tokyo",
    state: "Tokyo",
    country: "Japan",
    region: ["tokyo", "shibuya", "japan"],
    clinic: "Shibuya mental health clinic",
    degrees: ["M.D.", "Psychiatry"],
    capable: "Depression, anxiety, and workplace stress.",
    source: "Public clinic-style directory sample."
  },
  {
    id: "osaka-kobayashi",
    name: "Dr. Mei Kobayashi",
    role: "Clinical psychologist",
    rating: 4.5,
    reviews: 37,
    city: "Osaka",
    state: "Osaka",
    country: "Japan",
    region: ["osaka", "japan"],
    clinic: "Umeda counselling studio",
    degrees: ["M.A. (Psychology)"],
    capable: "Counselling for students and working adults.",
    source: "Public clinic-style directory sample."
  }
];



const PLACES = {
  India: ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"],
  Japan: ["Hokkaido","Aomori","Iwate","Miyagi","Akita","Yamagata","Fukushima","Ibaraki","Tochigi","Gunma","Saitama","Chiba","Tokyo","Kanagawa","Niigata","Toyama","Ishikawa","Fukui","Yamanashi","Nagano","Gifu","Shizuoka","Aichi","Mie","Shiga","Kyoto","Osaka","Hyogo","Nara","Wakayama","Tottori","Shimane","Okayama","Hiroshima","Yamaguchi","Tokushima","Kagawa","Ehime","Kochi","Fukuoka","Saga","Nagasaki","Kumamoto","Oita","Miyazaki","Kagoshima","Okinawa"],
  "United States": ["California","New York","Texas","Washington","Massachusetts","Illinois","Florida"],
  "United Kingdom": ["England","Scotland","Wales","Northern Ireland"],
  Canada: ["Ontario","British Columbia","Quebec","Alberta"],
  Australia: ["New South Wales","Victoria","Queensland","Western Australia"],
  Bangladesh: ["Dhaka","Chittagong","Sylhet"],
  Nepal: ["Bagmati","Gandaki","Koshi"],
  Singapore: ["Singapore"],
  "United Arab Emirates": ["Dubai","Abu Dhabi","Sharjah"]
};

function profileAddr() {
  try {
    let st = {};
    const live = Object.keys(localStorage).find((k) => k.startsWith("wellledger-live-"));
    const raw = localStorage.getItem(live || "wellledger-state-v2");
    if (raw) st = JSON.parse(raw) || {};
    return st.profile || {};
  } catch { return {}; }
}

function addrText() {
  const p = profileAddr();
  return [p.country, p.state, p.city, p.address].filter(Boolean).join(" ").toLowerCase();
}

function countryOf(d) {
  return d.country || "India";
}
function doctorsInCountry(country) {
  const c = (country || "").toLowerCase();
  if (!c) return [];
  return DOCTORS.filter((d) => countryOf(d).toLowerCase() === c);
}
function nearby() {
  const p = profileAddr();
  const country = p.country || "";
  const stateName = (p.state || "").toLowerCase();
  const inCountry = doctorsInCountry(country);
  if (!country) return [];
  if (!stateName) return inCountry;
  const here = inCountry.filter((d) => String(d.state || "").toLowerCase() === stateName);
  return here;
}
function otherInCountry() {
  const p = profileAddr();
  const country = p.country || "";
  const stateName = (p.state || "").toLowerCase();
  return doctorsInCountry(country).filter((d) => String(d.state || "").toLowerCase() !== stateName);
}

function stars(n) {
  const full = Math.round(n);
  return "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
}

function card(d) {
  return `<a class="doc-card" href="doctor.html?id=${d.id}">
      <strong>${d.name}</strong>
      <span>${d.role} · ${d.city}</span>
      <span class="stars">${stars(d.rating)} ${d.rating} (${d.reviews})</span>
      <em>${d.clinic}</em>
    </a>`;
}
function renderList() {
  const box = document.getElementById("docList");
  if (!box) return;
  const p = profileAddr();
  const hint = document.getElementById("docHint");
  if (!p.country) {
    if (hint) hint.textContent = "Pick a country and state on your profile. The list will follow that place only.";
    box.innerHTML = "<p class='stat-copy'>No place selected yet.</p>";
    return;
  }
  const here = nearby();
  const other = otherInCountry();
  const stateTitle = p.state || p.country;
  if (hint) {
    hint.textContent = "Clinicians listed for " + p.country + (p.state ? ", " + p.state : "") + ". Confirm the clinic before you visit. Sample directory only.";
  }
  let html = `<h3 class="doc-head">${stateTitle}</h3>`;
  html += here.length ? here.map(card).join("") : "<p class='stat-copy'>No listed clinicians for this state yet. Other states in the same country are below.</p>";
  html += `<h3 class="doc-head">Other states</h3>`;
  html += other.length ? other.map(card).join("") : "<p class='stat-copy'>No other listed clinicians in this country yet.</p>";
  box.innerHTML = html;
}

function renderOne() {
  const box = document.getElementById("docProfile");
  if (!box) return;
  const id = new URLSearchParams(location.search).get("id");
  const d = DOCTORS.find((x) => x.id === id) || nearby()[0];
  box.innerHTML = `
    <h2>${d.name}</h2>
    <p>${d.role} · ${d.clinic}, ${d.city}</p>
    <p class="stars">${stars(d.rating)} ${d.rating} from ${d.reviews} public ratings</p>
    <h3>Degrees</h3>
    <ul>${d.degrees.map((x) => `<li>${x}</li>`).join("")}</ul>
    <h3>What they work with</h3>
    <p>${d.capable}</p>
    <p class="stat-copy">${d.source} Ratings change. Confirm on the clinic site before you book.</p>
    <a class="schedule-btn" href="doctors.html">Back to list</a>
  `;
}

renderList();
renderOne();
