export const featureGuide = [
  {
    match: (path) => path === "/dashboard",
    title: "Dashboard",
    description: "Your pipeline at a glance — candidate counts, average scores, and recent activity.",
    why: "Exists so you never have to dig through the full candidate list just to know where hiring stands today.",
    docsTab: "workspace",
  },
  {
    match: (path) => path === "/upload",
    title: "Upload Resumes",
    description: "Drop in PDF/DOCX resumes alongside a job description to get an instant AI score and breakdown.",
    why: "Turns a pile of resumes into a ranked, structured shortlist in seconds instead of hours of manual reading.",
    docsTab: "basics",
  },
  {
    match: (path) => path === "/candidates/compare",
    title: "Compare",
    description: "Put two or more shortlisted candidates side-by-side and let AI weigh the trade-offs.",
    why: "Surfaces who has the highest ceiling vs. the lowest-risk hire, so the final call isn't just a gut feeling.",
    docsTab: "workspace",
  },
  {
    match: (path) => path === "/candidates/mapping",
    title: "Talent Mapping",
    description: "A visual map of your whole candidate pool by skill density and seniority.",
    why: "Helps you spot gaps in your hiring pipeline before they become a hiring crisis.",
    docsTab: "workspace",
  },
  {
    match: (path) => path.startsWith("/candidates/") && path !== "/candidates/compare" && path !== "/candidates/mapping",
    title: "Candidate Profile",
    description: "Full breakdown for one candidate — score, strengths/weaknesses, AI Ghost Chat, outreach, and more.",
    why: "Everything you'd ask in a screening call, available instantly and grounded strictly in their resume.",
    docsTab: "genai",
  },
  {
    match: (path) => path === "/candidates",
    title: "Candidates",
    description: "Every resume you've uploaded, scored, and saved — searchable and filterable.",
    why: "Your single source of truth per role, so nothing falls through the cracks between screening rounds.",
    docsTab: "workspace",
  },
  {
    match: (path) => path === "/analytics/market",
    title: "Market Intel",
    description: "Global trends comparing your candidate pool against real-time industry demand.",
    why: "Tells you if your shortlist is competitive before you make an offer, not after a candidate ghosts you.",
    docsTab: "predictive",
  },
  {
    match: (path) => path === "/analytics",
    title: "Analytics",
    description: "Trends across every candidate you've evaluated — score distributions, skill demand, and more.",
    why: "Lets you justify hiring decisions with data, not just instinct.",
    docsTab: "workspace",
  },
  {
    match: (path) => path === "/jd-engine",
    title: "JD Engine",
    description: "Build a high-converting job description from a role title and a few key requirements.",
    why: "Skips the blank-page problem and keeps every JD optimized for both ATS and human readers.",
    docsTab: "jd",
  },
  {
    match: (path) => path === "/settings",
    title: "Settings",
    description: "Manage your profile and account.",
    why: "Your login is the only key to your data — nobody else can see your candidates, chats, or scoring history.",
    docsTab: "workspace",
  },
];

export function getFeatureGuide(pathname) {
  return featureGuide.find((entry) => entry.match(pathname)) || null;
}
