import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import {
  getServices, createService, updateService, deleteService,
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  getHealthInformation, createHealthInformation, updateHealthInformation, deleteHealthInformation, loginAdmin, logoutAdmin,
} from "./api";
import "./admin.css";

const emptyService = { name: "", description: "", isActive: true };
const emptyArticle = { title: "", category: "General Health", content: "", isPublished: true };
const emptyAppointment = { patientName: "", contactNumber: "", service: "", appointmentDate: "", notes: "", status: "Pending" };
const tabs = ["Appointments", "Services", "Health Information"];

export default function Admin() {
  const [tab, setTab] = useState("Appointments");
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAppointment);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mh_user") || "null"); } catch { return null; }
  });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loadAll = useCallback(async () => {
    setError("");
    try {
      const [a, s, h] = await Promise.all([getAppointments(), getServices(), getHealthInformation()]);
      setAppointments(a); setServices(s); setArticles(h);
    } catch (e) { setError(`${e.message}. Check that the backend is running and MongoDB is connected.`); }
  }, []);
  useEffect(() => { if (currentUser?.role === "admin" && localStorage.getItem("mh_token")) loadAll(); }, [loadAll, currentUser]);

  const submitLogin = async (e) => {
    e.preventDefault(); setLoginBusy(true); setLoginError("");
    try {
      const user = await loginAdmin(loginForm.username, loginForm.password);
      if (user.role !== "admin") { logoutAdmin(); setLoginError("This account does not have administrator access."); return; }
      setCurrentUser(user); setLoginForm({ username: "", password: "" });
    } catch (e) { setLoginError(e.message); }
    finally { setLoginBusy(false); }
  };
  const signOut = () => { logoutAdmin(); setCurrentUser(null); setAppointments([]); setServices([]); setArticles([]); setError(""); setMessage(""); };

  if (!currentUser || currentUser.role !== "admin" || !localStorage.getItem("mh_token")) {
    return <section className="admin-page"><div className="admin-heading"><div><span className="admin-kicker">MAASIN HEALTHLINE</span><h1>Administrator login</h1><p>Sign in with the administrator account configured for this project.</p></div></div>
      {loginError && <div className="admin-message error">{loginError}</div>}
      <form className="admin-form auth-form" onSubmit={submitLogin}>
        <h3>Sign in</h3>
        <label>Username<input type="username" autoComplete="username" required value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="admin" /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Enter administrator password" /></label>
        <button className="admin-button primary" disabled={loginBusy}>{loginBusy ? "Signing in…" : "Sign in"}</button>
        <p className="auth-help">The initial admin username and password are set in the backend .env file. Do not share those credentials.</p>
      </form>
    </section>;
  }

  const startCreate = () => {
    setEditing("new");
    setForm(tab === "Services" ? { ...emptyService } : tab === "Health Information" ? { ...emptyArticle } : { ...emptyAppointment });
    setMessage("");
  };
  const startEdit = (item) => {
    setEditing(item._id);
    if (tab === "Appointments") setForm({ patientName: item.patientName || "", contactNumber: item.contactNumber || "", service: item.service || "", appointmentDate: item.appointmentDate ? new Date(item.appointmentDate).toISOString().slice(0, 10) : "", notes: item.notes || "", status: item.status || "Pending" });
    else if (tab === "Services") setForm({ name: item.name || "", description: item.description || "", isActive: item.isActive ?? true });
    else setForm({ title: item.title || "", category: item.category || "General Health", content: item.content || "", isPublished: item.isPublished ?? true });
    setMessage("");
  };
  const cancelEdit = () => { setEditing(null); setMessage(""); };
  const updateField = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (tab === "Services") {
        if (editing === "new") await createService(form); else await updateService(editing, form);
      } else if (tab === "Appointments") {
        if (editing === "new") await createAppointment(form); else await updateAppointment(editing, form);
      } else {
        if (editing === "new") await createHealthInformation(form); else await updateHealthInformation(editing, form);
      }
      setEditing(null); setMessage("Changes saved successfully."); await loadAll();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const remove = async (item) => {
    const label = tab === "Appointments" ? item.patientName : tab === "Services" ? item.name : item.title;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setError(""); setMessage("");
    try {
      if (tab === "Appointments") await deleteAppointment(item._id);
      else if (tab === "Services") await deleteService(item._id);
      else await deleteHealthInformation(item._id);
      setMessage("Record deleted."); await loadAll();
    } catch (e) { setError(e.message); }
  };

  const items = tab === "Appointments" ? appointments : tab === "Services" ? services : articles;
  return <section className="admin-page">
    <div className="admin-heading"><div><span className="admin-kicker">MAASIN HEALTHLINE</span><h1>Admin dashboard</h1><p>Manage appointment requests, services, and health information.</p></div><div className="admin-head-actions"><span className="admin-user-label">{currentUser.username}</span><button className="admin-button secondary" onClick={loadAll}><RefreshCw size={16}/> Refresh</button><button className="admin-button secondary" onClick={signOut}>Sign out</button></div></div>
    <div className="admin-tabs">{tabs.map((t) => <button key={t} className={tab === t ? "selected" : ""} onClick={() => { setTab(t); setEditing(null); setError(""); setMessage(""); }}>{t}<span>{t === "Appointments" ? appointments.length : t === "Services" ? services.length : articles.length}</span></button>)}</div>
    {message && <div className="admin-message success">{message}</div>}{error && <div className="admin-message error">{error}</div>}
    <div className="admin-list-heading"><h2>{tab}</h2><button className="admin-button primary" onClick={startCreate}><Plus size={16}/> Add {tab === "Appointments" ? "appointment" : tab === "Services" ? "service" : "article"}</button></div>
    {editing && <form className="admin-form" onSubmit={save}>
      <div className="admin-form-heading"><h3>{editing === "new" ? "Create" : "Edit"} {tab === "Health Information" ? "article" : tab.slice(0, -1).toLowerCase()}</h3><button type="button" className="admin-icon-button" onClick={cancelEdit} aria-label="Cancel"><X size={18}/></button></div>
      {tab === "Services" && <><label>Service name<input required value={form.name} onChange={e => updateField("name", e.target.value)}/></label><label>Description<textarea rows="3" value={form.description} onChange={e => updateField("description", e.target.value)}/></label><label className="admin-check"><input type="checkbox" checked={form.isActive} onChange={e => updateField("isActive", e.target.checked)}/> Active service</label></>}
      {tab === "Appointments" && <><div className="admin-form-grid"><label>Patient name<input required value={form.patientName} onChange={e => updateField("patientName", e.target.value)}/></label><label>Contact number or email<input required value={form.contactNumber} onChange={e => updateField("contactNumber", e.target.value)}/></label><label>Service<input required value={form.service} onChange={e => updateField("service", e.target.value)}/></label><label>Appointment date<input required type="date" value={form.appointmentDate} onChange={e => updateField("appointmentDate", e.target.value)}/></label><label>Status<select value={form.status} onChange={e => updateField("status", e.target.value)}>{["Pending", "Approved", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}</select></label></div><label>Notes<textarea rows="3" value={form.notes} onChange={e => updateField("notes", e.target.value)}/></label></>}
      {tab === "Health Information" && <><label>Article title<input required value={form.title} onChange={e => updateField("title", e.target.value)}/></label><label>Category<input required value={form.category} onChange={e => updateField("category", e.target.value)}/></label><label>Content<textarea required rows="5" value={form.content} onChange={e => updateField("content", e.target.value)}/></label><label className="admin-check"><input type="checkbox" checked={form.isPublished} onChange={e => updateField("isPublished", e.target.checked)}/> Published</label></>}
      <div className="admin-form-actions"><button type="button" className="admin-button secondary" onClick={cancelEdit}>Cancel</button><button className="admin-button primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></div>
    </form>}
    {items.length === 0 ? <div className="admin-empty">No {tab.toLowerCase()} found yet.</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{(tab === "Appointments" ? ["Patient", "Service", "Date", "Status", "Actions"] : tab === "Services" ? ["Service", "Description", "Status", "Actions"] : ["Title", "Category", "Publication", "Actions"]).map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{items.map(item => <tr key={item._id}>
      {tab === "Appointments" && <><td><strong>{item.patientName}</strong><small>{item.contactNumber}</small></td><td>{item.service}</td><td>{item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString() : "—"}</td><td><span className="admin-status">{item.status || "Pending"}</span></td></>}
      {tab === "Services" && <><td><strong>{item.name}</strong></td><td>{item.description || "—"}</td><td><span className="admin-status">{item.isActive === false ? "Inactive" : "Active"}</span></td></>}
      {tab === "Health Information" && <><td><strong>{item.title}</strong><small>{(item.content || "").slice(0, 100)}{item.content?.length > 100 ? "…" : ""}</small></td><td>{item.category}</td><td><span className="admin-status">{item.isPublished === false ? "Draft" : "Published"}</span></td></>}
      <td><div className="admin-row-actions"><button className="admin-icon-button" title="Edit" onClick={() => startEdit(item)}><Pencil size={16}/></button><button className="admin-icon-button danger" title="Delete" onClick={() => remove(item)}><Trash2 size={16}/></button></div></td>
    </tr>)}</tbody></table></div>}
  </section>;
}
