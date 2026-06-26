import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import heroVilla from "@/assets/hero-villa.jpg";
import productBifold from "@/assets/product-bifold.jpg";
import productCasement from "@/assets/product-casement.jpg";
import productLiftslide from "@/assets/product-liftslide.jpg";
import productTilt from "@/assets/product-tilt.jpg";
import productFrench from "@/assets/product-french.jpg";
import productBay from "@/assets/product-bay.jpg";
import projectVilla from "@/assets/project-villa1.jpg";
import projectPenthouse from "@/assets/project-penthouse.jpg";
import projectGarden from "@/assets/project-garden.jpg";
import projectBath from "@/assets/project-bath.jpg";
import { Particles } from "@/components/site/Particles";
import { AnimatedWindow } from "@/components/site/AnimatedWindow";
import { Reveal, SplitHeading } from "@/components/site/Reveal";

// Note: Metadata is handled in index.html
const badges = ["German Engineering", "Sound Insulation", "Weather Resistant", "Energy Efficient"];

const CONTACT_INFO = {
  phone: "9957640581",
  email: "mimenterprises123@gmail.com",
  location: "A T ROAD, south, opp. mambooz dhaba, Amolapatty, Dibrugarh, Assam 786001",
  whatsapp: "9957640581",
};

const products = [
  { name: "Lift & Slide Doors", desc: "Effortless premium glide for heavy luxury panels.", img: productLiftslide },
  { name: "Bi-Fold Doors", desc: "Accordion folding for seamless indoor-outdoor living.", img: productBifold },
  { name: "Casement Windows", desc: "Outward swing engineered for ventilation & light.", img: productCasement },
  { name: "Tilt & Turn Windows", desc: "Dual-mode European hardware for adaptive comfort.", img: productTilt },
  { name: "French Doors", desc: "Architectural elegance with multi-point security.", img: productFrench },
  { name: "Bay Windows", desc: "Sculptural curves crafted for cinematic interiors.", img: productBay },
];

const projects = [
  { img: projectVilla, title: "Lakeside Villa", tag: "Residential" },
  { img: projectPenthouse, title: "Skyline Penthouse", tag: "High-Rise" },
  { img: projectGarden, title: "Garden Conservatory", tag: "Bi-Fold System" },
  { img: projectBath, title: "Marble Bath Suite", tag: "Tilt & Turn" },
];

const features = [
  { k: "01", t: "German Engineering", d: "Multi-chamber Prominance profiles built to European DIN standards." },
  { k: "02", t: "Acoustic Insulation", d: "Up to 42dB reduction with double-sealed gasket systems." },
  { k: "03", t: "Thermal Efficiency", d: "Low U-values keep interiors silent, cool and energy-light." },
  { k: "04", t: "Weather Resistant", d: "Cyclonic-grade glazing tested against monsoon and dust ingress." },
  { k: "05", t: "Multi-Point Locking", d: "Forged stainless hardware for villa-grade security." },
  { k: "06", t: "Lead-Free Profiles", d: "Eco-conscious calcium-zinc formulations, certified safe." },
];

const stats = [
  { n: "500+", l: "Premium Installations" },
  { n: "42dB", l: "Sound Reduction" },
  { n: "10Yr", l: "Hardware Warranty" },
  { n: "100%", l: "Lead-Free Profiles" },
];

function HomePage() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 1.18]);
  const heroBlur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", isMobile ? "blur(0px)" : "blur(8px)"]);
  const heroOpacity = useTransform(scrollYProgress, [0, isMobile ? 1 : 0.8], [1, isMobile ? 1 : 0.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : -120]);

  const [showMyWorks, setShowMyWorks] = useState(false);
  const [myWorksPhone, setMyWorksPhone] = useState("");
  const [myWorksData, setMyWorksData] = useState<any>(null);
  const [myWorksLoading, setMyWorksLoading] = useState(false);

  const searchMyWorks = async () => {
    if (!myWorksPhone.trim()) {
      toast.error("Mobile number required", {
        description: "Please enter your 10-digit mobile number",
      });
      return;
    }

    if (myWorksPhone.length < 10) {
      toast.error("Invalid mobile number", {
        description: "Please enter a valid 10-digit number",
      });
      return;
    }

    setMyWorksLoading(true);
    try {
      console.log("[MY_WORKS] Step 1: Searching for leads with phone:", myWorksPhone);
      
      // Step 1: Search for leads with this phone number
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("phone", myWorksPhone);

      if (leadsError) {
        console.error("[MY_WORKS] Step 1 Error - Leads query failed:", leadsError);
        toast.error("Database Error", {
          description: `Failed to search leads: ${leadsError.message}`,
        });
        setMyWorksLoading(false);
        return;
      }

      console.log("[MY_WORKS] Step 1 Result - Leads found:", leads?.length || 0);

      if (!leads || leads.length === 0) {
        console.warn("[MY_WORKS] No leads found for phone:", myWorksPhone);
        toast.error("No Records Found", {
          description: `Sorry, we couldn't find any projects for phone number ${myWorksPhone}. Please verify your number and try again.`,
        });
        setMyWorksData(null);
        setMyWorksLoading(false);
        return;
      }

      const lead = leads[0];
      console.log("[MY_WORKS] Step 1 Success - Found lead:", { id: lead.id, name: lead.name, phone: lead.phone, status: lead.status });

      // Step 2: Get all projects for this lead
      console.log("[MY_WORKS] Step 2: Fetching projects for lead ID:", lead.id);
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("lead_id", lead.id);

      if (projectsError) {
        console.error("[MY_WORKS] Step 2 Error - Projects query failed:", projectsError);
        toast.error("Database Error", {
          description: `Failed to fetch projects: ${projectsError.message}`,
        });
        setMyWorksLoading(false);
        return;
      }

      console.log("[MY_WORKS] Step 2 Result - Projects found:", projects?.length || 0, projects);

      if (!projects || projects.length === 0) {
        console.warn("[MY_WORKS] No projects found for lead:", lead.id);
        toast.warning("No Projects Yet", {
          description: `${lead.name}, we found your account but no projects are associated yet. Please contact us to start your project.`,
        });
        setMyWorksData({
          lead: lead,
          projects: [],
          payments: [],
          totalQuoted: 0,
          totalPaid: 0,
          balance: 0,
        });
        setMyWorksLoading(false);
        return;
      }

      // Step 3: Get all payments for this lead using payment_history table
      console.log("[MY_WORKS] Step 3: Fetching payment history for lead");
      console.log("[MY_WORKS] Lead ID:", lead.id);

      let filteredPayments: any[] = [];

      try {
        const { data: paymentHistoryData, error: paymentHistoryError } = await supabase
          .from("payment_history")
          .select("*")
          .eq("lead_id", lead.id);

        if (paymentHistoryError) {
          console.error("[MY_WORKS] Step 3 Error - Payment history query failed:", paymentHistoryError);
          console.log("[MY_WORKS] Continuing with empty payments list");
        } else {
          filteredPayments = paymentHistoryData || [];
          console.log("[MY_WORKS] Step 3 Result - Payment history found:", filteredPayments.length);
          console.log("[MY_WORKS] Step 3 - Payment details:", JSON.stringify(filteredPayments, null, 2));
        }
      } catch (error) {
        console.error("[MY_WORKS] Step 3 Exception:", error);
      }

      console.log("[MY_WORKS] Step 3 Result - Payments to display:", filteredPayments);

      // Step 4: Calculate totals
      console.log("[MY_WORKS] Step 4: Calculating totals");
      const totalQuoted = projects.reduce((sum: number, p: any) => {
        const amount = p.total_with_gst || p.final_amount || 0;
        return sum + (typeof amount === 'number' ? amount : 0);
      }, 0);

      // Calculate total paid from payment_history (uses amount_paid field)
      const totalPaid = filteredPayments.reduce((sum: number, p: any) => {
        const amount = p.amount_paid || 0;
        return sum + (typeof amount === 'number' ? amount : 0);
      }, 0);

      const balance = totalQuoted - totalPaid;

      console.log("[MY_WORKS] Step 4 Result - Total Quoted:", totalQuoted);
      console.log("[MY_WORKS] Step 4 Result - Total Paid:", totalPaid);
      console.log("[MY_WORKS] Step 4 Result - Balance:", balance);
      console.log("[MY_WORKS] Step 4 Result - Totals calculated:", { totalQuoted, totalPaid, balance });

      // Step 5: Set data and show success toast
      console.log("[MY_WORKS] Step 5: Setting data and showing success");
      setMyWorksData({
        lead: lead,
        projects: projects,
        payments: filteredPayments,
        totalQuoted,
        totalPaid,
        balance,
      });

      toast.success("Projects Found! 🎉", {
        description: `Welcome ${lead.name}! We found ${projects.length} project(s) and ${filteredPayments.length} payment(s). Your project status and payment history are ready below.`,
      });

      console.log("[MY_WORKS] SUCCESS - All data loaded successfully");

    } catch (error: any) {
      console.error("[MY_WORKS] Unexpected error:", error);
      toast.error("Something Went Wrong", {
        description: error?.message || "An unexpected error occurred while searching. Please try again.",
      });
    } finally {
      setMyWorksLoading(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen w-full overflow-hidden">
        {/* Cinematic background image with parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: heroScale, filter: heroBlur, opacity: heroOpacity }}
        >
          <img
            src={heroVilla}
            alt="Luxury villa with floor-to-ceiling uPVC sliding doors at golden hour"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
            loading="lazy"
          />
          {/* Ambient cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/30 to-ink" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,transparent_0%,oklch(0.13_0_0/0.55)_70%)]" />
          {/* Animated light sweep - disabled on mobile */}
          {!isMobile && (
            <motion.div
              className="absolute -inset-x-1/4 top-1/4 h-1/2 opacity-40"
              initial={{ x: "-30%" }}
              animate={{ x: "30%" }}
              transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(ellipse at center, oklch(0.85 0.10 80 / 0.45), transparent 60%)",
                filter: "blur(40px)",
              }}
            />
          )}
        </motion.div>

        <Particles count={isMobile ? 0 : 32} />

        {/* Hero content */}
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-32 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="inline-flex items-center gap-3 rounded-full glass px-5 py-2 text-[11px] uppercase tracking-[0.3em] text-gold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Authorised Partner of Prominance
          </motion.div>

          <SplitHeading
            text="Crafted For Modern Living"
            delay={0.4}
            className="mt-8 font-display text-5xl sm:text-7xl md:text-[112px] leading-[0.95] tracking-tight max-w-5xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-8 max-w-xl text-base md:text-lg text-foreground/70 leading-relaxed"
          >
            Premium uPVC doors & windows engineered for elegance, insulation,
            security and the architecture of modern living.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/products"
              className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-gold to-[#a89572] text-ink px-7 py-4 text-sm font-medium btn-luxe glow-sweep shadow-gold-glow"
            >
              Explore Products
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full glass-strong px-7 py-4 text-sm font-medium btn-luxe"
            >
              Get Free Quote
            </Link>
            <button
              onClick={() => setShowMyWorks(true)}
              className="inline-flex items-center gap-3 rounded-full glass-strong px-7 py-4 text-sm font-medium btn-luxe hover:bg-white/10 transition"
            >
              My Works
            </button>
          </motion.div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.8 }}
            className="mt-16 flex flex-wrap justify-center gap-3"
          >
            {badges.map((b, i) => (
              <motion.div
                key={b}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-full glass px-4 py-2 text-[11px] uppercase tracking-wider text-foreground/80"
              >
                {b}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-foreground/50"
        >
          Scroll
          <span className="block h-12 w-px bg-gradient-to-b from-gold/60 to-transparent" />
        </motion.div>
      </section>

      {/* MARQUEE */}
      <section className="relative overflow-hidden border-y border-white/5 py-6 bg-onyx/40">
        <div className="flex marquee-track whitespace-nowrap">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-12 pr-12">
              {[
                "Sliding Systems",
                "Casement",
                "Tilt & Turn",
                "Bi-Fold",
                "Lift & Slide",
                "French Doors",
                "Villa Doors",
                "Bay Windows",
                "Mesh Systems",
                "Toughened Glass",
              ].map((t) => (
                <span key={t} className="flex items-center gap-12">
                  <span className="font-display text-2xl tracking-tight text-foreground/40">{t}</span>
                  <span className="text-gold">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* INTRO / ANIMATED WINDOW SHOWCASE */}
      <section className="relative py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold">The Experience</div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-6xl leading-tight">
                Architecture<br />in <span className="text-gradient-gold italic">motion.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-md text-foreground/70 leading-relaxed">
                Every Prominance system is a piece of engineering choreography —
                rails glide, gaskets seal, hardware locks with the satisfying
                weight of European precision. Watch the systems come alive.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10 grid grid-cols-2 gap-6 max-w-md">
                {stats.map((s) => (
                  <div key={s.l} className="border-l border-gold/30 pl-4">
                    <div className="font-display text-3xl text-gradient-gold">{s.n}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <AnimatedWindow />
          </Reveal>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <Reveal>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Collection</div>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-3 font-display text-4xl md:text-6xl leading-tight max-w-xl">
                  A system for every<br />architectural intent.
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <Link to="/products" className="text-sm text-foreground/70 hover:text-gold inline-flex items-center gap-2">
                View all products <span>→</span>
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * (isMobile ? 0.02 : 0.06)}>
                <motion.article
                  whileHover={isMobile ? {} : { y: -8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="group relative overflow-hidden rounded-2xl glass shadow-luxe"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <motion.img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      whileHover={isMobile ? {} : { scale: 1.08 }}
                      transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/5 group-hover:ring-gold/30 transition-all duration-500" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">Prominance</div>
                    <h3 className="font-display text-2xl">{p.name}</h3>
                    <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{p.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs text-foreground/60 group-hover:text-gold transition-colors">
                      Discover system <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <Reveal>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Projects</div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-3 font-display text-4xl md:text-6xl leading-tight max-w-2xl">
                Where Prominance meets <span className="text-gradient-gold italic">place.</span>
              </h2>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[260px]">
            <Reveal className="md:col-span-7 md:row-span-2"><ProjectCard p={projects[0]} large /></Reveal>
            <Reveal delay={0.1} className="md:col-span-5"><ProjectCard p={projects[1]} /></Reveal>
            <Reveal delay={0.2} className="md:col-span-5"><ProjectCard p={projects[3]} /></Reveal>
            <Reveal delay={0.3} className="md:col-span-12"><ProjectCard p={projects[2]} /></Reveal>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.82_0.10_80/0.10),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Reveal>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Why MIM × Prominance</div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-3 font-display text-4xl md:text-6xl leading-tight">
                Engineered for the rare.
              </h2>
            </Reveal>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.t} delay={i * (isMobile ? 0.02 : 0.05)}>
                <motion.div
                  whileHover={isMobile ? {} : { y: -6 }}
                  className="group relative h-full glass rounded-2xl p-8 overflow-hidden"
                >
                  {!isMobile && (
                    <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                  <div className="font-display text-sm text-gold/70 tracking-widest">{f.k}</div>
                  <h3 className="mt-4 font-display text-2xl">{f.t}</h3>
                  <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{f.d}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl glass-strong shadow-luxe p-12 md:p-20 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.82_0.10_80/0.18),transparent_60%)]" />
              <div className="absolute -inset-px rounded-3xl pointer-events-none" style={{ background: "linear-gradient(135deg, oklch(0.82 0.08 80 / 0.4), transparent 40%, oklch(0.82 0.08 80 / 0.2))", WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)", WebkitMaskComposite: "xor", padding: "1px" }} />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Begin</div>
                <h2 className="mt-4 font-display text-4xl md:text-6xl leading-tight">
                  Bring your architecture<br /> to <span className="text-gradient-gold italic">life.</span>
                </h2>
                <p className="mt-6 max-w-xl mx-auto text-foreground/70">
                  Schedule a private consultation with our specialists.
                  Site-survey, design proposal and quote — complimentary.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Link to="/contact" className="rounded-full bg-gradient-to-br from-gold to-[#a89572] text-ink px-7 py-4 text-sm font-medium btn-luxe glow-sweep shadow-gold-glow">
                    Request a Consultation
                  </Link>
                  <Link to="/products" className="rounded-full glass px-7 py-4 text-sm font-medium btn-luxe">
                    Browse the Collection
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER: MIM Enterprises */}
      <footer className="relative border-t border-white/5 py-12 md:py-16 bg-ink-dark/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-display text-gold">MIM Enterprises</h2>
              <p className="text-sm text-gold/60 mt-1">Authorised Partner of Prominance</p>
              <p className="mt-4 text-foreground/70 max-w-lg">
                Premium German-engineered uPVC door & window systems crafted for modern luxury architecture. Designed for elegance, insulation, security and timeless living.
              </p>
            </div>

            <div>
              <h3 className="text-gold font-display text-xl mb-4">Explore</h3>
              <div className="flex flex-col gap-2">
                <Link to="/products" className="text-white hover:text-gold">Products</Link>
                
                <Link to="/projects-crm" className="text-white hover:text-gold">Projects</Link>
                <Link to="/contact" className="text-white hover:text-gold">Contact</Link>
              </div>

              <div className="mt-6">
                <p className="text-sm text-foreground/70">{CONTACT_INFO.email}</p>
                <p className="text-sm text-foreground/70">+91 {CONTACT_INFO.phone}</p>

                <div className="mt-4">
                  <Link to="/login" className="text-white hover:text-gold">Login</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-foreground/50">
              © 2026 MIM Enterprises. Crafted for modern living.
            </p>
          </div>
        </div>
      </footer>

      {/* MY WORKS MODAL */}
      <Dialog open={showMyWorks} onOpenChange={setShowMyWorks}>
        <DialogContent className="bg-black border-gold/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gold">My Works - Track Your Project</DialogTitle>
          </DialogHeader>

          {!myWorksData ? (
            <div className="space-y-4">
              <div className="bg-ink-dark/50 border border-gold/20 rounded p-4">
                <p className="text-foreground/70 text-sm mb-4">
                  📱 Enter your mobile number to view your project details, payment status, and project history
                </p>
                <p className="text-xs text-foreground/50">
                  This is the same phone number you used when contacting us. If you don't remember, please call +91 9957640581
                </p>
              </div>
              <div className="space-y-3">
                <Input
                  type="tel"
                  placeholder="Enter your 10-digit mobile number"
                  value={myWorksPhone}
                  onChange={(e) => setMyWorksPhone(e.target.value.replace(/\D/g, ""))}
                  className="bg-ink border-gold/20 text-white placeholder:text-white/30"
                  maxLength={10}
                />
                <Button
                  onClick={searchMyWorks}
                  disabled={myWorksLoading || myWorksPhone.length < 10}
                  className="w-full bg-gold text-ink hover:bg-gold/90 disabled:opacity-50"
                >
                  {myWorksLoading ? "🔍 Searching..." : "Search My Works"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Name Header */}
              <div className="text-center p-4 bg-gradient-to-r from-ink-dark to-ink-dark/50 rounded-lg border border-gold/20">
                <p className="text-foreground/60 text-sm">Welcome</p>
                <h2 className="text-3xl font-bold text-gold mt-1">{myWorksData.lead.name || 'Customer'}</h2>
                <p className="text-foreground/50 text-sm mt-2">📞 {myWorksData.lead.phone}</p>
              </div>

              {/* Project Status */}
              <Card className="bg-black border-gold/20 p-4">
                <h3 className="text-gold font-semibold mb-3">Project Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Status:</span>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      myWorksData.lead.status === "converted" ? "bg-green-500/20 text-green-400" :
                      myWorksData.lead.status === "in-progress" ? "bg-blue-500/20 text-blue-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {myWorksData.lead.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Created:</span>
                    <span>{new Date(myWorksData.lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>

              {/* Payment Summary - Always Show */}
              <Card className="bg-gradient-to-br from-gold/10 to-yellow-500/5 border-gold/30 p-5 shadow-lg shadow-gold/20">
                <h3 className="text-gold font-semibold mb-4 text-lg flex items-center gap-2">💰 Payment Summary</h3>
                <div className="space-y-3">
                  {/* Total Quoted Card */}
                  <div className="flex justify-between items-center p-4 bg-ink-dark/60 rounded-lg border border-gold/20 hover:border-gold/40 transition">
                    <div>
                      <p className="text-foreground/60 text-sm">Total Quoted Amount</p>
                      <p className="text-xs text-foreground/50">All projects combined</p>
                    </div>
                    <span className="text-gold font-bold text-2xl">₹{(myWorksData.totalQuoted || 0).toLocaleString()}</span>
                  </div>

                  {/* Total Paid Card */}
                  <div className="flex justify-between items-center p-4 bg-green-500/5 rounded-lg border border-green-500/20 hover:border-green-500/40 transition">
                    <div>
                      <p className="text-foreground/60 text-sm">Total Paid</p>
                      <p className="text-xs text-foreground/50">Payment received</p>
                    </div>
                    <span className="text-green-400 font-bold text-2xl">₹{(myWorksData.totalPaid || 0).toLocaleString()}</span>
                  </div>

                  {/* Balance Card */}
                  <div className={`flex justify-between items-center p-4 rounded-lg border transition ${
                    myWorksData.balance > 0 
                      ? "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40" 
                      : myWorksData.balance < 0 
                      ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
                      : "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40"
                  }`}>
                    <div>
                      <p className="text-foreground/60 text-sm">Balance Remaining</p>
                      <p className="text-xs text-foreground/50">
                        {myWorksData.balance > 0 && "Amount yet to be paid"}
                        {myWorksData.balance < 0 && "Overpaid amount"}
                        {myWorksData.balance === 0 && "Fully paid"}
                      </p>
                    </div>
                    <span className={`font-bold text-2xl ${
                      myWorksData.balance > 0 ? "text-orange-400" : 
                      myWorksData.balance < 0 ? "text-green-400" : 
                      "text-yellow-400"
                    }`}>
                      ₹{Math.abs(myWorksData.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  {myWorksData.totalQuoted > 0 && (
                    <div className="mt-4 pt-4 border-t border-gold/10">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-foreground/60 font-medium">Payment Progress</span>
                        <span className="text-gold font-semibold">{Math.round((myWorksData.totalPaid / myWorksData.totalQuoted) * 100)}% Complete</span>
                      </div>
                      <div className="w-full bg-ink rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-gold via-yellow-400 to-gold h-full transition-all duration-500 shadow-lg shadow-gold/50"
                          style={{ width: `${Math.min((myWorksData.totalPaid / myWorksData.totalQuoted) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Projects Section */}
              <Card className="bg-black border-gold/20 p-5">
                <h3 className="text-gold font-semibold mb-4 text-lg flex items-center gap-2">🏗️ Projects ({myWorksData.projects.length})</h3>
                {myWorksData.projects.length > 0 ? (
                  <div className="space-y-3">
                    {myWorksData.projects.map((project: any, idx: number) => (
                      <div key={project.id} className="bg-gradient-to-r from-ink-dark to-ink-dark/50 rounded-lg p-4 border border-gold/10 hover:border-gold/30 transition-all">
                        {/* Project Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">Project {idx + 1}</span>
                              <p className="font-semibold text-white text-sm">{project.name || `Project ${project.id.slice(0, 8)}`}</p>
                            </div>
                            <p className="text-xs text-foreground/60">
                              {(project.total_sqft || 0).toLocaleString()} Sq.Ft @ ₹{(project.rate_per_sqft || 0).toLocaleString()}/Sq.Ft
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                            project.status === 'COMPLETED' ? "bg-green-500/20 text-green-400" :
                            project.status === 'ACTIVE' || project.status === 'active' ? "bg-blue-500/20 text-blue-400" :
                            project.status === 'DELAYED' || project.status === 'delayed' ? "bg-red-500/20 text-red-400" :
                            project.status === 'ON_HOLD' ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-gray-500/20 text-gray-400"
                          }`}>
                            {project.status?.toUpperCase() || 'ACTIVE'}
                          </span>
                        </div>
                        
                        {/* Project Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border-t border-gold/10 pt-3">
                          <div className="bg-ink/50 rounded p-2">
                            <p className="text-foreground/60 text-xs">Amount</p>
                            <p className="text-gold font-semibold">₹{(project.total_with_gst || project.final_amount || 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-ink/50 rounded p-2">
                            <p className="text-foreground/60 text-xs">GST (18%)</p>
                            <p className="text-gold">₹{(project.gst_amount || 0).toLocaleString()}</p>
                          </div>
                          {project.rate_per_sqft && (
                            <div className="bg-ink/50 rounded p-2">
                              <p className="text-foreground/60 text-xs">Rate/Sq.Ft</p>
                              <p className="text-yellow-400 font-semibold">₹{(project.rate_per_sqft || 0).toLocaleString()}</p>
                            </div>
                          )}
                          {project.profit_percentage && (
                            <div className="bg-ink/50 rounded p-2">
                              <p className="text-foreground/60 text-xs">Profit %</p>
                              <p className="text-green-400 font-semibold">{project.profit_percentage}%</p>
                            </div>
                          )}
                          {project.expected_completion_date && (
                            <div className="bg-ink/50 rounded p-2">
                              <p className="text-foreground/60 text-xs">Expected Completion</p>
                              <p className="text-white font-medium">{new Date(project.expected_completion_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {project.new_completion_date && (
                            <div className="bg-ink/50 rounded p-2 border border-orange-500/30">
                              <p className="text-foreground/60 text-xs">Revised Completion</p>
                              <p className="text-orange-400 font-medium">{new Date(project.new_completion_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {project.delay_reason && (
                            <div className="col-span-2 bg-red-500/5 rounded p-2 border border-red-500/20">
                              <p className="text-foreground/60 text-xs">Delay Reason</p>
                              <p className="text-red-400 text-xs">{project.delay_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-ink-dark/50 rounded-lg border border-dashed border-gold/20">
                    <p className="text-foreground/60 text-sm">📭 No projects found</p>
                    <p className="text-foreground/40 text-xs mt-2">Projects will appear here once you start one with us</p>
                  </div>
                )}
              </Card>

              {/* Payment History - Always Show */}
              <Card className="bg-black border-gold/20 p-5">
                <h3 className="text-gold font-semibold mb-4 text-lg flex items-center gap-2">💳 Payment History ({myWorksData.payments.length})</h3>
                {myWorksData.payments.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-5">
                      {myWorksData.payments.map((payment: any, idx: number) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-ink-dark/50 rounded-lg border border-gold/10 hover:border-gold/30 transition-all">
                          {/* Payment Date & Method */}
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs bg-gold/20 text-gold px-2.5 py-1 rounded font-medium">
                                {payment.payment_method || 'TRANSFER'}
                              </span>
                              {payment.payment_date && (
                                <span className="text-xs text-foreground/50">
                                  {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                                </span>
                              )}
                            </div>
                            <div className="border-l border-gold/20 pl-3">
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-semibold">
                                ✓ PAID
                              </span>
                              {payment.reference_number && (
                                <p className="text-xs text-foreground/50 mt-1">Ref: {payment.reference_number}</p>
                              )}
                              {payment.notes && (
                                <p className="text-xs text-foreground/50 mt-1">{payment.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Amount */}
                          <span className="text-gold font-bold text-lg ml-4 whitespace-nowrap">
                            ₹{(payment.amount_paid || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Payment Statistics */}
                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-gold/10 pt-4">
                      <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                        <p className="text-foreground/60 mb-1">✓ Total Payments</p>
                        <p className="text-green-400 font-bold text-lg">{myWorksData.payments.length}</p>
                        <p className="text-green-400/60 text-xs mt-1">₹{myWorksData.payments.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-gold/10 rounded-lg p-3 border border-gold/20">
                        <p className="text-foreground/60 mb-1">📊 Average Payment</p>
                        <p className="text-gold font-bold text-lg">₹{Math.round(myWorksData.payments.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0) / (myWorksData.payments.length || 1)).toLocaleString()}</p>
                        <p className="text-gold/60 text-xs mt-1">Per transaction</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-ink-dark/50 rounded-lg border border-dashed border-gold/20">
                    <p className="text-foreground/60 text-sm">💸 No payment records yet</p>
                    <p className="text-foreground/40 text-xs mt-2">Payment history will appear here once payments are recorded</p>
                  </div>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-5 border-t border-gold/20">
                <Button
                  onClick={() => {
                    setMyWorksData(null);
                    setMyWorksPhone("");
                    console.log("[MY_WORKS] Form reset");
                  }}
                  variant="outline"
                  className="flex-1 border-gold/40 text-gold hover:border-gold/60 hover:bg-gold/10 font-semibold py-5 rounded-lg transition-all active:scale-95"
                >
                  🔄 Search Another
                </Button>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=Hi%20MIM%20Enterprises%2C%20I%20have%20a%20question%20about%20my%20project`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-600/90 hover:to-emerald-500/90 font-semibold py-5 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95">
                    💬 WhatsApp Support
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProjectCard({ p, large = false }: { p: { img: string; title: string; tag: string }; large?: boolean }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  
  return (
    <motion.div
      whileHover={isMobile ? {} : { scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="group relative h-full overflow-hidden rounded-2xl shadow-luxe"
    >
      <motion.img
        src={p.img}
        alt={p.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        whileHover={isMobile ? {} : { scale: 1.08 }}
        transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/5 group-hover:ring-gold/40 transition-all duration-500" />
      <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">{p.tag}</div>
        <h3 className={`mt-2 font-display ${large ? "text-3xl md:text-5xl" : "text-2xl"}`}>{p.title}</h3>
      </div>
    </motion.div>
  );
}

export default HomePage;
