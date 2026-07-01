import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  BedDouble, Bath, Maximize, MapPin, ArrowLeft, ArrowRight, Calendar,
  Home, Sparkles, Trees, ChefHat, Sun, Car, Check, Phone, Mail, Heart, Share2,
} from "lucide-react";
import house1 from "@/assets/house_1.webp.asset.json";
import house2 from "@/assets/house_2.webp.asset.json";
import house3 from "@/assets/house_3.webp.asset.json";
import house4 from "@/assets/house_4.jpg.asset.json";
import house7 from "@/assets/house_7.png.asset.json";
import interior1 from "@/assets/house_1.png.asset.json";
import interior2 from "@/assets/house_2.png.asset.json";

type Property = {
  id: string;
  title: string;
  price: string;
  location: string;
  address: string;
  beds: number;
  baths: number;
  sqft: string;
  lot: string;
  year: number;
  garage: number;
  desc: string;
  long: string;
  hero: string;
  gallery: string[];
  features: string[];
  highlights: { icon: typeof Home; title: string; text: string }[];
};

export const propertiesData: Record<string, Property> = {
  "hillcrest-ridge": {
    id: "hillcrest-ridge",
    title: "Hillcrest Ridge Residence",
    price: "$4,250,000",
    location: "Hillcrest Ridge, Aspen",
    address: "1820 Hillcrest Ridge Road, Aspen, CO 81611",
    beds: 5, baths: 6, sqft: "6,400", lot: "1.2 acres", year: 2022, garage: 3,
    desc: "Architectural modern estate with floor-to-ceiling glass, mountain views, and a heated motor court.",
    long: "Set on a private ridge with uninterrupted views of the Elk Mountains, this architectural residence pairs warm cedar cladding with crisp blackened steel. Inside, a double-height great room opens to a covered terrace and infinity-edge pool. Five en-suite bedrooms, a chef's kitchen with concealed catering galley, and a wellness wing with sauna and gym complete the home.",
    hero: house1.url,
    gallery: [house1.url, interior1.url, interior2.url, house4.url],
    features: [
      "Floor-to-ceiling Fleetwood glass", "Chef's kitchen + catering galley",
      "Primary suite with private terrace", "Wellness wing: sauna, steam, gym",
      "Heated infinity-edge pool", "Smart-home automation throughout",
      "3-car heated garage + EV charging", "Radiant heated floors",
    ],
    highlights: [
      { icon: Home, title: "Open Floor Plan", text: "Seamless great room flowing to outdoor living." },
      { icon: Sparkles, title: "Smart Home", text: "Integrated lighting, climate, audio, and security." },
      { icon: Trees, title: "Private Lot", text: "1.2 acres of mature landscaping and ridge views." },
      { icon: ChefHat, title: "Chef's Kitchen", text: "Wolf, Sub-Zero, and a hidden prep galley." },
      { icon: Sun, title: "Natural Light", text: "South-facing glass and skylights throughout." },
      { icon: Car, title: "Garage Parking", text: "Three heated bays with EV charging." },
    ],
  },
  "stonebriar-manor": {
    id: "stonebriar-manor",
    title: "Stonebriar Manor",
    price: "$3,890,000",
    location: "Stonebriar Manor, Dallas",
    address: "42 Stonebriar Court, Frisco, TX 75034",
    beds: 6, baths: 7, sqft: "8,200", lot: "0.9 acres", year: 2019, garage: 4,
    desc: "Resort-style backyard with infinity pool, spa, and stone fireplace pavilion on a private wooded lot.",
    long: "A stately brick-and-stone residence built for entertaining. The resort backyard centers on a pool and spa anchored by a covered loggia and outdoor kitchen. Inside, six suites, a wine cellar, a private theater, and a sunlit two-story great room with reclaimed beams.",
    hero: house2.url,
    gallery: [house2.url, interior2.url, interior1.url, house7.url],
    features: [
      "Resort pool with spa and waterfall", "Outdoor kitchen and loggia",
      "Wine cellar and tasting room", "Private home theater",
      "Primary suite with sitting room", "Whole-house generator",
      "4-car garage", "Walk-in pantry and butler's kitchen",
    ],
    highlights: [
      { icon: Home, title: "Open Floor Plan", text: "Two-story great room with stone fireplace." },
      { icon: Sparkles, title: "Smart Home", text: "Crestron lighting, climate, and shade control." },
      { icon: Trees, title: "Private Backyard", text: "Resort pool, spa, and outdoor pavilion." },
      { icon: ChefHat, title: "Chef's Kitchen", text: "Thermador suite and butler's prep kitchen." },
      { icon: Sun, title: "Natural Light", text: "Floor-to-ceiling rear glazing." },
      { icon: Car, title: "Garage Parking", text: "Four oversized bays." },
    ],
  },
  "belle-meade": {
    id: "belle-meade",
    title: "Belle Meade Estate",
    price: "$5,600,000",
    location: "Belle Meade, Nashville",
    address: "117 Belle Meade Boulevard, Nashville, TN 37205",
    beds: 6, baths: 8, sqft: "9,100", lot: "2.1 acres", year: 2017, garage: 4,
    desc: "Grand stone-and-brick residence with circular drive, formal gardens, and timeless craftsmanship.",
    long: "Sited behind formal gardens and a circular motor court, this architecturally significant residence blends old-world craftsmanship with modern systems. Hand-cut limestone, custom millwork, and a paneled library set the tone. The grounds include a tennis pavilion, koi pond, and guest cottage.",
    hero: house3.url,
    gallery: [house3.url, interior1.url, house4.url, interior2.url],
    features: [
      "Hand-cut limestone facade", "Paneled library with fireplace",
      "Guest cottage", "Tennis pavilion",
      "Formal gardens and koi pond", "Elevator to all levels",
      "Two laundry suites", "Geothermal climate system",
    ],
    highlights: [
      { icon: Home, title: "Open Floor Plan", text: "Formal and casual living wings." },
      { icon: Sparkles, title: "Smart Home", text: "Full Lutron and Sonos integration." },
      { icon: Trees, title: "Private Grounds", text: "2.1 acres of mature gardens." },
      { icon: ChefHat, title: "Chef's Kitchen", text: "La Cornue range and dual islands." },
      { icon: Sun, title: "Natural Light", text: "Steel-framed windows and conservatory." },
      { icon: Car, title: "Garage Parking", text: "Four bays plus circular drive." },
    ],
  },
};

export const Route = createFileRoute("/property/$id")({
  loader: ({ params }) => {
    const property = propertiesData[params.id];
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.property.title} — Maison Aurelia` },
      { name: "description", content: loaderData.property.desc },
      { property: "og:title", content: `${loaderData.property.title} — Maison Aurelia` },
      { property: "og:description", content: loaderData.property.desc },
      { property: "og:type", content: "website" },
      { property: "og:image", content: loaderData.property.hero },
    ] : [],
  }),
  component: PropertyPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-4xl">Property not found</h1>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
      </div>
    </div>
  ),
});

function PropertyPage() {
  const { property } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link to="/" className="font-display text-xl font-semibold tracking-tight">
            Maison <span className="italic font-light">Aurelia</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All listings
          </Link>
        </div>
      </header>

      {/* Gallery */}
      <section className="px-6 pt-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
            <div className="overflow-hidden rounded-3xl md:col-span-3 md:row-span-2">
              <img src={property.gallery[active]} alt={property.title} className="aspect-[4/3] h-full w-full object-cover md:aspect-auto" />
            </div>
            {property.gallery.slice(0, 2).map((src: string, i: number) => (
              <button key={i} onClick={() => setActive(i)}
                className={`overflow-hidden rounded-2xl transition ${active === i ? "ring-2 ring-charcoal ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100"}`}>
                <img src={src} alt="" className="aspect-[4/3] h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Header info */}
      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Featured Listing</p>
            <h1 className="mt-3 font-display text-4xl font-medium lg:text-6xl">{property.title}</h1>
            <p className="mt-4 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {property.address}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-6 border-y border-border py-8 sm:grid-cols-4">
              <Stat icon={BedDouble} label="Bedrooms" value={property.beds} />
              <Stat icon={Bath} label="Bathrooms" value={property.baths} />
              <Stat icon={Maximize} label="Sq. Footage" value={property.sqft} />
              <Stat icon={Car} label="Garage" value={property.garage} />
            </div>

            <div className="mt-10">
              <h2 className="font-display text-3xl">About this residence</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{property.long}</p>
            </div>

            <div className="mt-14">
              <h2 className="font-display text-3xl">Features</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {property.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-3 rounded-xl bg-secondary px-4 py-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-charcoal" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-14">
              <h2 className="font-display text-3xl">Property highlights</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {property.highlights.map((h: Property["highlights"][number]) => (
                  <div key={h.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-luxe">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-charcoal">
                      <h.icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-4 text-lg">{h.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{h.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl bg-card p-8 shadow-luxe">
              <div className="flex items-baseline justify-between">
                <div className="font-display text-4xl">{property.price}</div>
                <div className="flex gap-2">
                  <button aria-label="Save" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:bg-secondary"><Heart className="h-4 w-4" /></button>
                  <button aria-label="Share" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:bg-secondary"><Share2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{property.location}</p>

              <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-secondary p-3 text-center text-xs">
                <div><div className="font-medium text-foreground">{property.lot}</div><div className="mt-0.5 text-muted-foreground">Lot</div></div>
                <div><div className="font-medium text-foreground">{property.year}</div><div className="mt-0.5 text-muted-foreground">Built</div></div>
                <div><div className="font-medium text-foreground">{property.sqft}</div><div className="mt-0.5 text-muted-foreground">Sq ft</div></div>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); alert("Thanks — a specialist will reach out shortly."); }}
                className="mt-6 space-y-4"
              >
                <Field label="Name">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border-0 border-b border-border bg-transparent py-2.5 text-sm outline-none focus:border-charcoal" />
                </Field>
                <Field label="Email">
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border-0 border-b border-border bg-transparent py-2.5 text-sm outline-none focus:border-charcoal" />
                </Field>
                <Field label="Phone">
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border-0 border-b border-border bg-transparent py-2.5 text-sm outline-none focus:border-charcoal" />
                </Field>
                <Field label="Preferred date">
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border-0 border-b border-border bg-transparent py-2.5 text-sm outline-none focus:border-charcoal" />
                </Field>
                <button type="submit" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3.5 text-sm font-medium text-white transition hover:bg-charcoal/90">
                  <Calendar className="h-4 w-4" /> Schedule a Tour
                </button>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a href="tel:+15555550101" className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-medium transition hover:bg-secondary">
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                  <a href="mailto:hello@maisonaurelia.com" className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-medium transition hover:bg-secondary">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                </div>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {/* Other listings */}
      <section className="bg-secondary px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-3xl lg:text-4xl">More from our portfolio</h2>
            <Link to="/" className="text-sm font-medium underline-offset-4 hover:underline">View all</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Object.values(propertiesData).filter((p) => p.id !== property.id).map((p) => (
              <Link key={p.id} to="/property/$id" params={{ id: p.id }}
                className="group overflow-hidden rounded-3xl bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-luxe">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.hero} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="font-display text-2xl">{p.price}</div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {p.location}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                    View Details <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string | number }) {
  return (
    <div>
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="mt-3 font-display text-2xl">{value}</div>
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
