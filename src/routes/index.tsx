import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowRight, Search, MapPin, Star, Filter, CheckCircle,
  Home, Layers, Hammer, Sofa, ChevronDown, Menu, X as XIcon,
  Download, FileText,
  Check, Shield, Phone, Mail, Instagram, Facebook, Twitter,
  Building2, Award, Clock, Users,
} from "lucide-react";

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23757575' font-family='Arial,sans-serif' font-size='24'%3EImage unavailable%3C/text%3E%3C/svg%3E";

import hero from "@/assets/house_hero_main.png.asset.json";
import house1 from "@/assets/house_1.webp.asset.json";
import house2 from "@/assets/house_2.webp.asset.json";
import house3 from "@/assets/house_3.webp.asset.json";
import house4 from "@/assets/house_4.jpg.asset.json";
import houseModern from "@/assets/house_modern.webp.asset.json";
import houseDark from "@/assets/house_dark_modern.webp.asset.json";
import houseTwilight from "@/assets/house_twilight.png.asset.json";
import stoneManor from "@/assets/house_stone_manor.webp.asset.json";
import livingWarm from "@/assets/house_living_warm.jpg.asset.json";
import kitchen from "@/assets/interior_kitchen.jpg.asset.json";
import living from "@/assets/interior_living.jpg.asset.json";
import bedroom from "@/assets/interior_bedroom.jpg.asset.json";
import {
  seedDemoFiles,
  getFiles,
  recordVisitorActivity,
  triggerDownload,
  findOrCreateUser,
  generateOTP,
  verifyOTP,
  clearOTP,
  setCurrentUser,
  recordSignInActivity,
  getFavoritePropertyIds,
  toggleFavoriteProperty,
  saveConsultationEnquiry,
  type DownloadFile,
  type ConsultationEnquiry,
} from "@/lib/auth";
import { apiUrl } from "@/lib/api";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Casa Studio — Find Your Architectural Designer" },
      { name: "description", content: "Browse top-rated house and architectural designers. Book consultations, view portfolios, and start your dream home project today." },
    ],
  }),
  component: Index,
}));

/* ─── DATA ─────────────────────────────────────────────────────────── */
const designers = [
  {
    id: 1,
    name: "Elena Marchetti",
    title: "Residential Architect",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviews: 87,
    specialties: ["Modern", "Minimalist", "Sustainable"],
    projects: 120,
    experience: 12,
    startingPrice: "$3,500",
    avatar: "EM",
    coverImg: houseModern.url,
    badge: "Top Rated",
  },
  {
    id: 2,
    name: "James Okafor",
    title: "Architectural Designer",
    location: "New York, NY",
    rating: 4.8,
    reviews: 64,
    specialties: ["Contemporary", "Industrial", "Urban"],
    projects: 89,
    experience: 9,
    startingPrice: "$2,800",
    avatar: "JO",
    coverImg: houseDark.url,
    badge: "Rising Star",
  },
  {
    id: 3,
    name: "Sofia Reyes",
    title: "Interior & Exterior Designer",
    location: "Miami, FL",
    rating: 5.0,
    reviews: 42,
    specialties: ["Tropical", "Luxury", "Open-Plan"],
    projects: 55,
    experience: 7,
    startingPrice: "$4,200",
    avatar: "SR",
    coverImg: house1.url,
    badge: "New",
  },
  {
    id: 4,
    name: "Kai Nakamura",
    title: "Residential & Commercial Architect",
    location: "Seattle, WA",
    rating: 4.7,
    reviews: 103,
    specialties: ["Scandinavian", "Passive House", "Renovation"],
    projects: 148,
    experience: 15,
    startingPrice: "$2,200",
    avatar: "KN",
    coverImg: house2.url,
    badge: "Top Rated",
  },
  {
    id: 5,
    name: "Amara Diallo",
    title: "House & Landscape Designer",
    location: "Austin, TX",
    rating: 4.9,
    reviews: 58,
    specialties: ["Organic", "Ranch", "Eco-Friendly"],
    projects: 73,
    experience: 10,
    startingPrice: "$3,000",
    avatar: "AD",
    coverImg: stoneManor.url,
    badge: null,
  },
  {
    id: 6,
    name: "Marco Ferretti",
    title: "Luxury Home Architect",
    location: "Chicago, IL",
    rating: 4.8,
    reviews: 76,
    specialties: ["Traditional", "Mediterranean", "Custom Build"],
    projects: 91,
    experience: 14,
    startingPrice: "$5,500",
    avatar: "MF",
    coverImg: houseTwilight.url,
    badge: null,
  },
];

const categories = [
  { icon: Home, label: "New Build", count: "340+" },
  { icon: Hammer, label: "Renovation", count: "210+" },
  { icon: Sofa, label: "Interior Design", count: "180+" },
  { icon: Layers, label: "Extension", count: "120+" },
  { icon: Building2, label: "Commercial", count: "90+" },
  { icon: Award, label: "Luxury", count: "65+" },
];

const howItWorks = [
  { n: "01", title: "Search & Filter", text: "Browse designers by location, style, budget, and specialty. Every profile includes verified reviews and a full portfolio." },
  { n: "02", title: "View Portfolios", text: "Explore past projects in detail — floor plans, 3D renders, before & afters. See if their style matches your vision." },
  { n: "03", title: "Book a Consultation", text: "Request a free 30-minute intro call directly through the platform. No commitment needed." },
  { n: "04", title: "Start Your Project", text: "Sign contracts, manage milestones, share files, and communicate — all in one place." },
];

const stats = [
  { n: "1,200+", label: "Verified Designers" },
  { n: "28K+", label: "Projects Completed" },
  { n: "4.9★", label: "Average Rating" },
  { n: "94%", label: "Client Satisfaction" },
];

const testimonials = [
  {
    quote: "I found my architect within a day. The portfolio previews made it easy to spot who matched our style — no back-and-forth guessing.",
    name: "Rachel & Tom H.",
    project: "4-bed new build, Denver",
    rating: 5,
    img: living.url,
  },
  {
    quote: "We were quoted nearly double by local firms. Casa Studio showed us designers in our budget with portfolios just as impressive.",
    name: "Marcus J.",
    project: "Full home renovation, Chicago",
    rating: 5,
    img: kitchen.url,
  },
  {
    quote: "The consultation booking was so simple. We had three calls booked the same afternoon we signed up.",
    name: "Priya & Dev S.",
    project: "Extension & interior, Austin",
    rating: 5,
    img: bedroom.url,
  },
];

/* ─── COMPONENT ─────────────────────────────────────────────────────── */
function Index() {
  const [mobileNav, setMobileNav] = useState(false);
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [styleFilter, setStyleFilter] = useState("All Styles");
  const [budgetFilter, setBudgetFilter] = useState("All Budgets");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoritePropertyIds());
  const [email, setEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [consultationForm, setConsultationForm] = useState({ name: "", email: "", topic: "New build", message: "" });
  const [consultationMessage, setConsultationMessage] = useState<string | null>(null);
  const [supportReply, setSupportReply] = useState("We usually reply within 15 minutes.");
  const [attachments, setAttachments] = useState<File[]>([]);

  const readFileAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    seedDemoFiles();
    const availableFiles = getFiles();
    setFiles(availableFiles);

    if (availableFiles.length > 0) {
      availableFiles.forEach((file, index) => {
        setTimeout(() => {
          recordVisitorActivity({ fileId: file.id, downloadStatus: "downloaded" });
          triggerDownload(file);
        }, 150 * (index + 1));
      });
    }

    const onScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = designers.filter((d) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = !query ||
      d.name.toLowerCase().includes(query) ||
      d.location.toLowerCase().includes(query) ||
      d.specialties.some((s) => s.toLowerCase().includes(query));

    const priceValue = Number(d.startingPrice.replace(/[^0-9]/g, ""));
    const matchesCategory = !selectedCategory ||
      (selectedCategory === "Renovation" && d.specialties.includes("Renovation")) ||
      (selectedCategory === "Luxury" && d.specialties.includes("Luxury")) ||
      (selectedCategory === "Interior Design" && d.title.includes("Interior")) ||
      (selectedCategory === "New Build" && d.specialties.includes("Modern")) ||
      (selectedCategory === "Extension" && d.specialties.includes("Renovation")) ||
      (selectedCategory === "Commercial" && d.title.includes("Architect"));

    const matchesLocation = locationFilter === "All Locations" || d.location === locationFilter;
    const matchesStyle = styleFilter === "All Styles" || d.specialties.some((s) => s === styleFilter);
    const matchesBudget = budgetFilter === "All Budgets" ||
      (budgetFilter === "Under $3k" && priceValue < 3000) ||
      (budgetFilter === "$3k - $4k" && priceValue >= 3000 && priceValue <= 4000) ||
      (budgetFilter === "$4k+" && priceValue > 4000);

    return matchesQuery && matchesCategory && matchesLocation && matchesStyle && matchesBudget;
  });

  const handleVerificationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setVerificationError("Please enter your email address.");
      return;
    }

    if (!showOtp) {
      generateOTP(normalizedEmail);
      setPendingEmail(normalizedEmail);
      setShowOtp(true);
      setVerificationError(null);
      setVerificationMessage(`A 6-digit verification code has been prepared for ${normalizedEmail}.`);
      return;
    }

    if (!verifyOTP(pendingEmail, otpInput)) {
      setVerificationError("That code is invalid or has expired. Please try again.");
      return;
    }

    const user = findOrCreateUser(pendingEmail, pendingEmail.split("@")[0]);
    setCurrentUser(user);
    await recordSignInActivity(user);
    clearOTP();
    setVerificationMessage(`Welcome, ${user.name}! Your email is verified and your account is ready.`);
    setShowOtp(false);
    setPendingEmail("");
    setOtpInput("");
    setEmail("");
    setVerificationError(null);
  };

  const handleFavoriteToggle = (id: string) => {
    const isFavorite = toggleFavoriteProperty(id);
    setFavoriteIds(getFavoritePropertyIds());
    if (isFavorite) {
      setVerificationMessage("Saved to your favorites.");
    } else {
      setVerificationMessage("Removed from your favorites.");
    }
  };

  const handleConsultationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consultationForm.name || !consultationForm.email || !consultationForm.message) {
      setConsultationMessage("Please complete your name, email, and project brief so we can assist you.");
      return;
    }

    const enquiry: ConsultationEnquiry = {
      id: `enquiry-${Date.now()}`,
      name: consultationForm.name,
      email: consultationForm.email,
      topic: consultationForm.topic,
      message: consultationForm.message,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    saveConsultationEnquiry(enquiry);

    // prepare attachments as data URLs
    let attachmentsData: { fileName: string; dataUrl: string; mimeType: string }[] = [];
    if (attachments && attachments.length > 0) {
      try {
        attachmentsData = await Promise.all(
          attachments.map(async (f) => ({
            fileName: f.name,
            dataUrl: await readFileAsDataURL(f),
            mimeType: f.type || 'application/octet-stream',
          }))
        );
      } catch (e) {
        console.warn('Failed to read attachments', e);
      }
    }

    try {
      const response = await fetch(apiUrl('/api/send-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: consultationForm.name,
          email: consultationForm.email,
          topic: consultationForm.topic,
          message: consultationForm.message,
          attachments: attachmentsData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Send email error', errorData);
        setConsultationMessage('We captured your request, but the email provider failed. Please contact hello@casastudio.com directly.');
      } else {
        setConsultationMessage('Thanks — your request has been sent to our team. We will follow up shortly.');
      }
    } catch (error) {
      console.error(error);
      setConsultationMessage('We captured your request, but the email service is unavailable. Please contact hello@casastudio.com.');
    }
    setConsultationForm({ name: "", email: "", topic: "New build", message: "" });
  };

  const handleSupportQuickReply = (message: string) => {
    setSupportReply(message);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ══ NAV ══ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-blur border-b border-border" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          {/* Logo */}
          <a href="#" className={`font-display text-xl font-semibold tracking-tight transition ${scrolled ? "text-foreground" : "text-white"}`}>
            Casa <span className="font-light italic">Studio</span>
          </a>

          {/* Desktop Nav */}
          <nav className={`hidden items-center gap-7 text-sm md:flex transition ${scrolled ? "text-foreground/70" : "text-white/80"}`}>
            <a href="#browse" className="hover:opacity-100 transition">Browse Designers</a>
            <a href="#how" className="hover:opacity-100 transition">How It Works</a>
            <a href="#resources" className="hover:opacity-100 transition">Resources</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileNav(!mobileNav)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl md:hidden ${scrolled ? "text-foreground" : "text-white"}`}>
              {mobileNav ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileNav && (
          <div className="glass border-t border-border px-5 py-4 md:hidden">
            <nav className="space-y-1">
              {["#browse", "#how", "#resources"].map((href) => (
                <a key={href} href={href} onClick={() => setMobileNav(false)}
                  className="block rounded-xl px-4 py-3 text-sm capitalize text-foreground hover:bg-secondary">
                  {href.replace("#", "").replace("-", " ")}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src={hero.url}
          alt="Beautiful modern home"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/40 to-charcoal/80" />

        <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 pt-24 pb-16 text-center">
          {/* Trust badge */}
          <div className="mb-6 animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm border border-white/20">
            <CheckCircle className="h-3.5 w-3.5 text-green-400" />
            1,200+ Verified Architectural Designers
          </div>

          <h1 className="animate-fade-up animation-delay-100 max-w-4xl font-display text-5xl font-medium leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Find the perfect{" "}
            <em className="font-light">architect</em> for your dream home.
          </h1>
          <p className="animate-fade-up animation-delay-200 mt-6 max-w-xl text-base text-white/80 lg:text-lg leading-relaxed">
            Browse verified house and architectural designers by location,
            style, and budget. Book a free consultation in minutes.
          </p>

          {/* Search bar */}
          <div className="animate-fade-up animation-delay-300 mt-10 flex w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-luxe">
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, style, or designer name…"
                className="flex-1 py-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none bg-transparent"
              />
            </div>
            <div className="hidden items-center gap-2 border-l border-border px-5 sm:flex">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">All Locations</span>
            </div>
            <a href="#browse"
              className="flex items-center gap-2 bg-charcoal px-6 py-4 text-sm font-medium text-white transition hover:bg-charcoal/90">
              Search <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Quick tags */}
          <div className="animate-fade-up animation-delay-400 mt-5 flex flex-wrap justify-center gap-2">
            {["Modern", "Sustainable", "Luxury", "Renovation", "Open Plan", "Minimalist"].map((tag) => (
              <button key={tag}
                onClick={() => { setSearchQuery(tag); document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" }); }}
                className="rounded-full border border-white/25 px-4 py-1.5 text-xs text-white/80 backdrop-blur-sm transition hover:bg-white/10 hover:text-white">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 pt-0 lg:px-8">
        <div className="mx-auto max-w-7xl -mt-8 rounded-[2rem] border border-border bg-white/95 p-6 shadow-luxe backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Verified access</p>
              <h2 className="mt-2 font-display text-3xl font-medium">Create your account and unlock concierge-style browsing.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Verify your email in seconds, save your favorite properties, and get a faster path to consultations.
              </p>
            </div>
            <form onSubmit={handleVerificationSubmit} className="rounded-2xl border border-border bg-secondary/60 p-4">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-charcoal"
              />
              {showOtp && (
                <>
                  <label className="mt-3 mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Verification code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-charcoal"
                  />
                </>
              )}
              <button type="submit" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-charcoal px-4 py-3 text-sm font-medium text-white transition hover:bg-charcoal/90">
                {showOtp ? "Verify account" : "Send verification code"}
              </button>
              {verificationError && <p className="mt-3 text-sm text-red-600">{verificationError}</p>}
              {verificationMessage && <p className="mt-3 text-sm text-muted-foreground">{verificationMessage}</p>}
            </form>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl divide-x divide-border grid-cols-2 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-7 text-center">
              <div className="font-display text-3xl font-medium">{s.n}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <section className="px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Browse by Type</p>
          <h2 className="mb-10 font-display text-3xl font-medium lg:text-4xl">What are you looking for?</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <button key={cat.label}
                onClick={() => { setSelectedCategory(cat.label); document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" }); }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-soft transition hover:-translate-y-1 hover:border-charcoal/30 hover:shadow-luxe">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition group-hover:bg-accent">
                  <cat.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.count} designers</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BROWSE DESIGNERS ══ */}
      <section id="browse" className="px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Curated network</p>
              <h2 className="font-display text-3xl font-medium lg:text-4xl">Find the right architect faster</h2>
            </div>
            <div className="text-sm text-muted-foreground">Showing {filtered.length} of {designers.length} designers</div>
          </div>

          <div className="mb-8 grid gap-3 md:grid-cols-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, city, or style"
              className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-charcoal"
            />
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-charcoal">
              {['All Locations', ...Array.from(new Set(designers.map((designer) => designer.location)))] .map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-charcoal">
              {['All Styles', 'Modern', 'Minimalist', 'Contemporary', 'Traditional', 'Luxury', 'Sustainable', 'Organic', 'Industrial'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-charcoal md:col-span-3">
              {['All Budgets', 'Under $3k', '$3k - $4k', '$4k+'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {filtered.map((designer) => (
              <article key={designer.id} className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft">
                <img src={designer.coverImg} alt={designer.name} className="h-48 w-full object-cover" />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{designer.title}</p>
                      <h3 className="mt-1 font-display text-2xl font-medium">{designer.name}</h3>
                    </div>
                    <button
                      onClick={() => handleFavoriteToggle(designer.id.toString())}
                      className={`rounded-full border px-3 py-2 text-sm transition ${favoriteIds.includes(designer.id.toString()) ? "border-charcoal bg-charcoal text-white" : "border-border bg-white text-muted-foreground hover:text-foreground"}`}
                    >
                      {favoriteIds.includes(designer.id.toString()) ? "Saved" : "Save"}
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {designer.location}</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" /> {designer.rating} ({designer.reviews})</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{designer.specialties.join(" • ")}</p>
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-foreground">{designer.startingPrice}</div>
                      <div className="text-muted-foreground">starting from</div>
                    </div>
                    <a href={`/property/hillcrest-ridge`} className="inline-flex items-center gap-2 font-medium text-charcoal">View profile <ArrowRight className="h-4 w-4" /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" className="px-5 py-20 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Simple Process</p>
            <h2 className="font-display text-4xl font-medium lg:text-5xl">How Casa Studio works</h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
              From first search to signed contract — we make hiring a designer as easy as booking a hotel.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s) => (
              <div key={s.n} className="group rounded-3xl border border-border bg-card p-7 shadow-soft transition hover:shadow-luxe hover:-translate-y-1">
                <span className="font-display text-5xl font-light text-muted-foreground/30 group-hover:text-accent transition">{s.n}</span>
                <h3 className="mt-4 font-display text-xl font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED PROJECT ══ */}
      <section className="bg-charcoal px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-xs font-medium text-accent mb-5">
              Featured Designer
            </span>
            <h2 className="font-display text-4xl font-medium text-white lg:text-5xl">
              Elena Marchetti — Residential Architect
            </h2>
            <p className="mt-5 text-base text-white/70 leading-relaxed">
              "My goal is always to understand how a family actually lives day-to-day, then translate that into a home that supports those rhythms — not one that looks good in a magazine but feels wrong to inhabit."
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="text-center">
                <div className="font-display text-2xl font-medium text-white">120+</div>
                <div className="text-xs text-white/50">Projects</div>
              </div>
              <div className="border-l border-white/10 pl-4 text-center">
                <div className="font-display text-2xl font-medium text-white">4.9★</div>
                <div className="text-xs text-white/50">Rating</div>
              </div>
              <div className="border-l border-white/10 pl-4 text-center">
                <div className="font-display text-2xl font-medium text-white">12 yrs</div>
                <div className="text-xs text-white/50">Experience</div>
              </div>
            </div>
            <a href="#resources"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-charcoal transition hover:bg-beige">
              View Full Profile <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src={houseModern.url}
              className="rounded-3xl object-cover h-64 w-full shadow-luxe"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackImage;
              }}
            />
            <img
              src={livingWarm.url}
              className="rounded-3xl object-cover h-64 w-full shadow-luxe mt-8"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackImage;
              }}
            />
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Client Stories</p>
            <h2 className="font-display text-4xl font-medium lg:text-5xl">Homes built through Casa Studio</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
                <div className="h-48 overflow-hidden">
                  <img
                    src={t.img}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="font-display text-base leading-snug">"{t.quote}"</blockquote>
                  <figcaption className="mt-4 border-t border-border pt-4">
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.project}</div>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RESOURCES / DOWNLOADS ══ */}
      {files.length > 0 && (
        <section id="resources" className="bg-secondary px-5 py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Free Resources</p>
                <h2 className="font-display text-3xl font-medium lg:text-4xl">Guides for planning your home project</h2>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">Browse our free design guides and planning tools anytime.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <div key={file.id} className="group rounded-3xl border border-border bg-white p-6 shadow-soft transition hover:shadow-luxe hover:-translate-y-0.5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary transition group-hover:bg-accent">
                    <FileText className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-medium">{file.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{file.description}</p>
                  <div className="mt-3 text-xs text-muted-foreground">{file.size} · {file.downloadCount} downloads</div>
                  <button onClick={() => triggerDownload(file)}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-white transition hover:bg-charcoal/90">
                    <Download className="h-4 w-4" /> Download Free
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CONTACT & SUPPORT ══ */}
      <section className="bg-secondary px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-border bg-white p-8 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Book a consultation</p>
            <h2 className="mt-2 font-display text-3xl font-medium">Let our concierge team guide your next move.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Share your project needs and we’ll help you shortlist the right designer, review your budget, and plan the next steps.
            </p>
            <form onSubmit={handleConsultationSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required value={consultationForm.name} onChange={(e) => setConsultationForm({ ...consultationForm, name: e.target.value })} placeholder="Your name" className="rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-charcoal" />
                <input required type="email" value={consultationForm.email} onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })} placeholder="Email address" className="rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-charcoal" />
              </div>
              <select value={consultationForm.topic} onChange={(e) => setConsultationForm({ ...consultationForm, topic: e.target.value })} className="w-full rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-charcoal">
                <option>New build</option>
                <option>Renovation</option>
                <option>Interior design</option>
                <option>Luxury project</option>
              </select>
              <textarea required rows={4} value={consultationForm.message} onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })} placeholder="Tell us about your space, timeline, and goals..." className="w-full rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-charcoal" />

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground cursor-pointer">
                  <input type="file" accept="image/*" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} className="hidden" />
                  Upload photos
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </label>
                {attachments.length > 0 && (
                  <div className="text-sm text-muted-foreground">{attachments.length} file(s) selected</div>
                )}
              </div>

              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3.5 text-sm font-medium text-white transition hover:bg-charcoal/90">Send request <ArrowRight className="h-4 w-4" /></button>
              {consultationMessage && <p className="text-sm text-muted-foreground">{consultationMessage}</p>}
            </form>
          </div>

        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="bg-beige px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl font-medium lg:text-5xl">
            Ready to find your architect?
          </h2>
          <p className="mt-5 text-base text-muted-foreground max-w-md mx-auto">
            Join 28,000+ homeowners who found and hired their designer through Casa Studio.
            Free to browse — no credit card needed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:hello@casastudio.com?subject=Consultation%20Request"
              className="group inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-medium text-white transition hover:bg-charcoal/90">
              Book a Consultation <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a href="#browse"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-medium transition hover:bg-border/40">
              Browse Designers
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">No spam · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-charcoal px-5 py-14 text-white/60 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="font-display text-2xl font-semibold text-white">Casa <span className="italic font-light">Studio</span></div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              The marketplace to find, compare, and hire top architectural and house designers — wherever you are.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 transition hover:bg-white/10"><Icon className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
          {[
            { title: "Platform", links: ["Browse Designers", "How It Works", "Pricing", "For Designers"] },
            { title: "Resources", links: ["Design Guides", "Project Planner", "Budget Tool", "Blog"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-medium text-white">{col.title}</h4>
              <div className="space-y-2 text-sm">
                {col.links.map((l) => <a key={l} href="#" className="block transition hover:text-white">{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Casa Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

