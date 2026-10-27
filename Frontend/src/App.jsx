import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, CalendarDays, CheckCircle2, Clock, HeartPulse, Menu, Search, ShieldCheck, Stethoscope, Users, X } from "lucide-react";
import Admin from "./Admin";
import {
  getHealth,
  getHealthInformation,
  getServices,
  createAppointment,
} from "./api";
import AIChatbot from "./AIChatbot";

const fallbackServices = [
  { _id: "consultation", name: "General Consultation", description: "Talk with health center staff about your health concerns." },
  { _id: "maternal", name: "Maternal Health Services", description: "Care and guidance for mothers before and after childbirth." },
  { _id: "immunization", name: "Immunization", description: "Vaccination services that help protect children and families." },
  { _id: "dental", name: "Dental Services", description: "Basic oral health assessment and dental care information." },
  { _id: "child", name: "Child Health Checkup", description: "Growth monitoring and basic health checks for children." }
];

const fallbackArticles = [
  { _id: "1", title: "Keep your vaccinations up to date", category: "Prevention", content: "Vaccines help protect you and your community from preventable diseases. Ask your health center which vaccinations are recommended for your age." },
  { _id: "2", title: "Make routine health checkups a habit", category: "Wellness", content: "Routine checkups can help identify health concerns early. Prepare questions and share relevant symptoms with your health provider." },
  { _id: "3", title: "Healthy habits for every day", category: "Healthy Living", content: "Drink safe water, eat balanced meals, stay active, get enough sleep, and seek professional advice when you feel unwell." }
];

export default function App() {
  const [active, setActive] = useState("Home");
  const [services, setServices] = useState([]);
  const [articles, setArticles] = useState([]);
  const [apiState, setApiState] = useState("checking");
  const [search, setSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", contact: "", service: "", date: "", notes: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getHealth().then(() => setApiState("online")).catch(() => setApiState("offline"));
    getServices().then(setServices).catch(() => setServices([]));
    getHealthInformation().then(setArticles).catch(() => setArticles([]));
  }, []);

  const visibleServices = useMemo(() => {
    const list = services.length ? services : fallbackServices;
    return list.filter(s => `${s.name || ""} ${s.description || ""}`.toLowerCase().includes(search.toLowerCase()));
  }, [services, search]);
  const visibleArticles = useMemo(() => {
    const list = articles.length ? articles : fallbackArticles;
    return list.filter(a => `${a.title || ""} ${a.category || ""} ${a.content || ""}`.toLowerCase().includes(articleSearch.toLowerCase()));
  }, [articles, articleSearch]);

  const go = (page) => { setActive(page); setMobileOpen(false); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  

const submitAppointment = async (e) => {
  e.preventDefault();
  setNotice("Submitting appointment...");

  try {
    const result = await createAppointment({
      patientName: form.fullName,
      contactNumber: form.contact,
      service: form.service,
      appointmentDate: form.date,
      notes: form.notes,
    });

    setNotice(
      result.message || "Appointment submitted successfully!"
    );

    setForm({
      fullName: "",
      contact: "",
      service: "",
      date: "",
      notes: "",
    });
  } catch (error) {
    setNotice(`Unable to submit appointment: ${error.message}`);
  }
};

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home" onClick={e => {e.preventDefault();go("Home");}}>
        <span className="brand-mark"><HeartPulse size={25}/></span>
        <span><strong>Maasin <b>HealthLine</b></strong><small>Health Center Services</small></span>
      </a>
      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X/> : <Menu/>}</button>
      <nav className={mobileOpen ? "nav open" : "nav"}>
        {["Home", "Services", "Appointments", "Health Information", "Admin"].map(item =>
          <button key={item} className={active === item ? "nav-link active" : "nav-link"} onClick={() => go(item)}>{item}</button>
        )}
        <button className="nav-cta" onClick={() => setActive("AI Assistant")} >AI Assistant </button>
      </nav>
    </header>

    <main>
      {active === "Home" && <>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot"/> YOUR COMMUNITY HEALTH PARTNER</div>
            <h1>Health care starts with <span>being connected.</span></h1>
            <p>Find health center services, explore reliable wellness information, and prepare for your next visit with Maasin HealthLine.</p>
            <div className="hero-actions"><button className="primary-btn" onClick={() => go("Appointments")}>Explore appointments <ArrowRight size={17}/></button><button className="secondary-btn" onClick={() => go("Services")}>View services</button></div>
            <div className="trust-row"><span><ShieldCheck size={17}/> Community-focused care</span><span><CheckCircle2 size={17}/> Easy access to information</span></div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
            <div className="health-illustration"><div className="cross"><span/><i/></div><HeartPulse size={86} strokeWidth={1.25}/></div>
            <div className="floating-card card-top"><span className="mini-icon"><CalendarDays size={19}/></span><span><strong>Plan your visit</strong><small>Know before you go</small></span></div>
            <div className="floating-card card-bottom"><span className="mini-icon mint"><Activity size={19}/></span><span><strong>Health information</strong><small>Helpful tips for your family</small></span></div>
          </div>
        </section>
        <section className="stats-strip">
          <div><span className="stat-icon"><Stethoscope/></span><span><strong>Health services</strong><small>Explore available care</small></span></div>
          <div><span className="stat-icon"><CalendarDays/></span><span><strong>Appointment planning</strong><small>Prepare for your visit</small></span></div>
          <div><span className="stat-icon"><HeartPulse/></span><span><strong>Health education</strong><small>Learn healthy habits</small></span></div>
        </section>
        <section className="section">
          <div className="section-heading"><div><span className="eyebrow">CARE FOR EVERY STAGE</span><h2>What we offer</h2><p>Explore the services available through your local health center.</p></div><button className="text-link" onClick={() => go("Services")}>All services <ArrowRight size={16}/></button></div>
          <ServiceGrid services={visibleServices.slice(0,3)} />
        </section>
        <section className="banner"><div className="banner-icon"><CalendarDays size={28}/></div><div><h2>Getting ready for a health center visit?</h2><p>Review the services and prepare your questions before you visit.</p></div><button className="light-btn" onClick={() => go("Appointments")}>Plan a visit <ArrowRight size={16}/></button></section>
      </>}

      {active === "Services" && <section className="section page-section"><PageIntro eyebrow="HEALTH CENTER DIRECTORY" title="Our services" description="Browse health services and find the care information you need."/><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search services..." aria-label="Search services"/></div><ServiceGrid services={visibleServices}/>{apiState === "offline" && <p className="inline-note">Showing sample service information because the backend could not be reached. Start your backend at localhost:5000 to load live services.</p>}</section>}

      {active === "Appointments" && <section className="section page-section"><PageIntro eyebrow="PLAN YOUR VISIT" title="Appointment information" description="Fill in your details to prepare an appointment request."/><div className="appointment-layout"><aside className="appointment-aside"><div className="aside-icon"><CalendarDays size={30}/></div><h3>Before you submit</h3><p>Choose the service you need and provide a contact detail so the health center can identify your request.</p><ul><li><CheckCircle2 size={17}/> Use your complete name</li><li><CheckCircle2 size={17}/> Choose your preferred date</li><li><CheckCircle2 size={17}/> Include important notes</li></ul><div className="notice-box"><Clock size={18}/><span>Appointment requests are submitted online. Please wait for confirmation.</span></div></aside><form className="appointment-form" onSubmit={submitAppointment}><h3>Appointment request</h3><div className="form-grid"><label>Full name<input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Enter your full name"/></label><label>Contact number or email<input required value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="How can we contact you?"/></label><label>Health service<select required value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option value="">Select a service</option>{(services.length ? services : fallbackServices).map(s=><option key={s._id || s.id || s.name} value={s.name}>{s.name}</option>)}</select></label><label>Preferred date<input required type="date" min={new Date().toISOString().slice(0,10)} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label className="full-width">Additional notes<textarea rows="4" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional notes about your visit"/></label></div><button className="primary-btn submit-btn" type="submit">Review request <ArrowRight size={17}/></button>{notice && <div className="form-notice">{notice}</div>}</form></div></section>}

      {active === "Health Information" && <section className="section page-section"><PageIntro eyebrow="LEARN AND STAY WELL" title="Health information" description="Read simple, general wellness information for you and your family."/><div className="search-box"><Search size={18}/><input value={articleSearch} onChange={e=>setArticleSearch(e.target.value)} placeholder="Search health topics..." aria-label="Search health topics"/></div><div className="article-grid">{visibleArticles.map((a,i)=><article className="article-card" key={a._id || a.id || a.title}><div className={`article-symbol tone-${i%3}`}><HeartPulse size={24}/></div><span className="article-category">{a.category || "Health tips"}</span><h3>{a.title}</h3><p>{a.content || a.description || "Ask a qualified health professional for advice about your personal health needs."}</p><small>General education only</small></article>)}</div></section>}

      {active === "AI Assistant" && <AIChatbot />}

      {active === "Admin" && <Admin />}
    </main>
    <footer className="footer"><div className="footer-brand"><span className="brand-mark"><HeartPulse size={22}/></span><span><strong>Maasin HealthLine</strong><small>Health information, closer to home.</small></span></div><p>© {new Date().getFullYear()} Maasin HealthLine. For educational project use.</p><span className={`api-status ${apiState}`}><i/>{apiState === "online" ? "Backend connected" : apiState === "offline" ? "Backend offline" : "Checking backend"}</span></footer>
  </div>;
}

function PageIntro({eyebrow,title,description}) { return <div className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>; }
function ServiceGrid({services}) {
  const icons = [Stethoscope, HeartPulse, ShieldCheck, Activity, Users];
  if (!services.length) return <p className="empty-state">No services match your search.</p>;
  return <div className="service-grid">{services.map((s,i)=>{const Icon=icons[i%icons.length];return <article className="service-card" key={s._id || s.id || s.name}><div className={`service-icon service-${i%5}`}><Icon size={23}/></div><h3>{s.name}</h3><p>{s.description || "Contact the health center for details about availability and requirements."}</p><span className="service-arrow"><ArrowRight size={17}/></span></article>})}</div>;
}