import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ───────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://gkihfrtayaknarigdzwk.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ky_F-6EPRKSvp7ENT80ikg_xiXtEL3L";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg: "#0D0F14", surface: "#161920", panel: "#1E2230", border: "#2A2F42",
  accent: "#4F8EF7", accentDim: "#1E3A6E", green: "#34D399", yellow: "#FBBF24",
  red: "#F87171", purple: "#A78BFA", text: "#E8EAF0", muted: "#6B7280", white: "#FFFFFF",
};

const CLIENTS = [
  "Grupo Regio S.A.", "Distribuidora Norte", "Consultora TechMX",
  "Farmacia del Valle", "Construcciones Peña", "Restaurante El Parral",
  "Transportes Río Bravo", "Aceros del Norte S.A.",
];
const TAX_TYPES = ["ISR Mensual", "IVA Mensual", "ISR Anual", "DIOT", "PTU", "Declaración Informativa"];
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ── UI Atoms ───────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "33", border: `2px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0,
    }}>{initials}</div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div style={{
        width: 32, height: 32, border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.accent}`, borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000AA", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "85vh", overflowY: "auto", padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: C.text, fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 22 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>}
      <input {...props} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...props.style }} />
    </div>
  );
}

function FieldSelect({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>}
      <select {...props} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...props.style }}>{children}</select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style: sx = {}, disabled, loading }) {
  const base = { padding: "10px 20px", borderRadius: 8, border: "none", cursor: disabled || loading ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, opacity: disabled || loading ? 0.6 : 1, ...sx };
  const variants = {
    primary: { background: C.accent, color: C.white },
    ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger: { background: C.red + "22", color: C.red, border: `1px solid ${C.red}44` },
    success: { background: C.green + "22", color: C.green, border: `1px solid ${C.green}44` },
  };
  return <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant] }}>{loading ? "Guardando…" : children}</button>;
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return <div style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "10px 14px", color: C.red, fontSize: 13, marginBottom: 14 }}>⚠️ {msg}</div>;
}

function SetupBanner() {
  return (
    <div style={{ background: C.yellow + "11", border: `1px solid ${C.yellow}44`, borderRadius: 12, padding: 20, margin: 28, color: C.text }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: C.yellow, marginBottom: 10 }}>⚙️ Configuración pendiente — Crear tablas en Supabase</div>
      <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>Para que COFSA DESK funcione, debes ejecutar este SQL en <strong style={{ color: C.accent }}>Supabase → SQL Editor</strong>:</div>
      <div style={{ background: "#0D0F14", borderRadius: 8, padding: 16, fontFamily: "monospace", fontSize: 12, color: "#93C5FD", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`-- 1. IMPUESTOS
create table if not exists impuestos (
  id uuid default gen_random_uuid() primary key,
  client text not null,
  tax_type text not null,
  month integer not null,
  year integer not null,
  status text default 'pendiente',
  notes text,
  created_by uuid,
  created_at timestamptz default now()
);
alter table impuestos enable row level security;
create policy "allow all" on impuestos for all using (true) with check (true);

-- 2. TAREAS
create table if not exists tareas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  assigned_to uuid,
  priority text default 'media',
  due_date date,
  status text default 'todo',
  client text,
  created_by uuid,
  created_at timestamptz default now()
);
alter table tareas enable row level security;
create policy "allow all" on tareas for all using (true) with check (true);

-- 3. MENSAJES
create table if not exists mensajes (
  id uuid default gen_random_uuid() primary key,
  from_user uuid,
  from_email text,
  channel text,
  is_dm boolean default false,
  to_user uuid,
  text text not null,
  created_at timestamptz default now()
);
alter table mensajes enable row level security;
create policy "allow all" on mensajes for all using (true) with check (true);`}
      </div>
      <div style={{ marginTop: 14, color: C.muted, fontSize: 12 }}>Después de ejecutar el SQL, recarga la página. Los módulos funcionarán correctamente.</div>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onLogin(data.user);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", padding: 16, backgroundImage: "radial-gradient(ellipse at 20% 50%, #1E3A6E33 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #4F8EF711 0%, transparent 50%)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: C.accent, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px", boxShadow: `0 0 40px ${C.accent}44` }}>⚖️</div>
          <h1 style={{ margin: "0 0 4px", color: C.white, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>COFSA DESK</h1>
          <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>Sistema de gestión para despacho contable</p>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, boxShadow: "0 24px 48px #00000066" }}>
          <ErrorBanner msg={error} />
          <Input label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@despacho.mx" />
          <Input label="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} />
          <Btn onClick={handle} loading={loading} style={{ width: "100%", padding: "12px 20px", fontSize: 15 }}>Iniciar sesión</Btn>
          <div style={{ marginTop: 16, padding: "12px 14px", background: C.accentDim + "33", borderRadius: 8, border: `1px solid ${C.accentDim}` }}>
            <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>ℹ️ Primer uso</div>
            <div style={{ color: C.muted, fontSize: 12 }}>Crea usuarios desde <strong style={{ color: C.accent }}>Supabase → Authentication → Users</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "◈", label: "Dashboard" },
  { id: "impuestos", icon: "📋", label: "Impuestos" },
  { id: "tareas", icon: "✓", label: "Tareas" },
  { id: "chat", icon: "💬", label: "Chat" },
  { id: "clientes", icon: "👥", label: "Clientes" },
];

function Sidebar({ active, onNav, user, onLogout, notifCount }) {
  const initials = (user.email || "U").substring(0, 2).toUpperCase();
  return (
    <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 0 16px ${C.accent}44` }}>⚖️</div>
          <div>
            <div style={{ color: C.white, fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>COFSA DESK</div>
            <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>v1.0</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map(n => (
          <div key={n.id} onClick={() => onNav(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: active === n.id ? C.accentDim + "88" : "transparent", color: active === n.id ? C.accent : C.muted, fontWeight: active === n.id ? 700 : 500, fontSize: 14, border: active === n.id ? `1px solid ${C.accentDim}` : "1px solid transparent" }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
            {n.id === "tareas" && notifCount > 0 && (
              <span style={{ marginLeft: "auto", background: C.red, color: C.white, borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{notifCount}</span>
            )}
          </div>
        ))}
      </nav>
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Avatar initials={initials} color={C.accent} size={34} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: C.text, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
            <div style={{ color: C.green, fontSize: 11 }}>● conectado</div>
          </div>
        </div>
        <Btn variant="ghost" onClick={onLogout} style={{ width: "100%", padding: "7px", fontSize: 12 }}>Cerrar sesión</Btn>
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
function Dashboard({ taxes, tasks, user }) {
  const pending = taxes.filter(t => t.status === "pendiente");
  const presented = taxes.filter(t => t.status === "presentado");
  const myTasks = tasks.filter(t => t.status !== "done");
  const overdue = myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());
  const cards = [
    { label: "Impuestos pendientes", value: pending.length, icon: "📋", color: C.yellow },
    { label: "Impuestos presentados", value: presented.length, icon: "✅", color: C.green },
    { label: "Tareas activas", value: myTasks.length, icon: "✓", color: C.accent },
    { label: "Tareas vencidas", value: overdue.length, icon: "⚠️", color: C.red },
  ];
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", color: C.white, fontSize: 22, fontWeight: 800 }}>Buen día 👋</h1>
        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>{new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, borderLeft: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ color: c.color, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{c.value}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Impuestos pendientes</div>
          {pending.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Sin pendientes 🎉</div>}
          {pending.slice(0, 5).map((t, i) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{t.client}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{t.tax_type} · {MONTHS[(t.month||1) - 1]} {t.year}</div>
              </div>
              <Badge label="Pendiente" color={C.yellow} />
            </div>
          ))}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Tareas pendientes</div>
          {myTasks.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Sin tareas pendientes 🎉</div>}
          {myTasks.slice(0, 5).map((t, i) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{t.due_date || "Sin fecha"}</div>
              </div>
              <Badge label={t.priority} color={t.priority === "alta" ? C.red : t.priority === "media" ? C.yellow : C.green} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── IMPUESTOS ──────────────────────────────────────────────────────────────
function ImpuestosModule({ user }) {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [filterClient, setFilterClient] = useState("");
  const [form, setForm] = useState({ client: CLIENTS[0], tax_type: TAX_TYPES[0], month: 1, year: new Date().getFullYear(), status: "pendiente", notes: "" });

  const load = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("impuestos").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (err) { setSetupNeeded(true); return; }
    setTaxes(data || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const { error: err } = await supabase.from("impuestos").insert([{ ...form, created_by: user.id }]);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowAdd(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await supabase.from("impuestos").update({ status }).eq("id", id);
    load();
  };

  if (setupNeeded) return <SetupBanner />;

  const statusColor = { pendiente: C.yellow, presentado: C.green, "en revisión": C.accent };
  const filtered = taxes.filter(t => filter === "todos" || t.status === filter).filter(t => !filterClient || t.client.toLowerCase().includes(filterClient.toLowerCase()));

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: "0 0 2px", color: C.white, fontSize: 20, fontWeight: 800 }}>Control de Impuestos</h1>
          <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>{taxes.length} registros totales</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}>+ Agregar registro</Btn>
      </div>
      <ErrorBanner msg={error} />
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {["todos", "pendiente", "en revisión", "presentado"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filter === s ? C.accent : C.border}`, background: filter === s ? C.accentDim + "88" : "transparent", color: filter === s ? C.accent : C.muted, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>{s}</button>
        ))}
        <input value={filterClient} onChange={e => setFilterClient(e.target.value)} placeholder="Buscar cliente…" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 14px", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
      </div>
      {loading ? <Spinner /> : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 80px 60px 120px 160px", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            <span>Cliente</span><span>Impuesto</span><span>Mes</span><span>Año</span><span>Estatus</span><span>Acciones</span>
          </div>
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: C.muted }}>No hay registros — agrega el primero ↗</div>}
          {filtered.map((t, i) => (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 80px 60px 120px 160px", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{t.client}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{t.tax_type}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{MONTHS[(t.month||1) - 1]}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{t.year}</div>
              <Badge label={t.status} color={statusColor[t.status] || C.muted} />
              <div style={{ display: "flex", gap: 6 }}>
                {t.status !== "presentado" && <Btn variant="success" onClick={() => updateStatus(t.id, "presentado")} style={{ padding: "4px 10px", fontSize: 11 }}>✓ Presentado</Btn>}
                {t.status === "pendiente" && <Btn variant="ghost" onClick={() => updateStatus(t.id, "en revisión")} style={{ padding: "4px 10px", fontSize: 11 }}>Revisar</Btn>}
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && (
        <Modal title="Nuevo registro de impuesto" onClose={() => setShowAdd(false)}>
          <ErrorBanner msg={error} />
          <FieldSelect label="Cliente" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))}>
            {CLIENTS.map(c => <option key={c}>{c}</option>)}
          </FieldSelect>
          <FieldSelect label="Tipo de impuesto" value={form.tax_type} onChange={e => setForm(p => ({ ...p, tax_type: e.target.value }))}>
            {TAX_TYPES.map(t => <option key={t}>{t}</option>)}
          </FieldSelect>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldSelect label="Mes" value={form.month} onChange={e => setForm(p => ({ ...p, month: +e.target.value }))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </FieldSelect>
            <Input label="Año" type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: +e.target.value }))} />
          </div>
          <FieldSelect label="Estatus" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
            <option value="pendiente">Pendiente</option>
            <option value="en revisión">En revisión</option>
            <option value="presentado">Presentado</option>
          </FieldSelect>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Btn>
            <Btn onClick={save} loading={saving}>Guardar registro</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── TAREAS ─────────────────────────────────────────────────────────────────
const COLS = [
  { id: "todo", label: "Por hacer", color: C.muted },
  { id: "inprogress", label: "En proceso", color: C.accent },
  { id: "review", label: "En revisión", color: C.yellow },
  { id: "done", label: "Completado", color: C.green },
];

function TareasModule({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("kanban");
  const [notif, setNotif] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "media", due_date: "", client: "" });

  const load = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("tareas").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (err) { setSetupNeeded(true); return; }
    setTasks(data || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const ch = supabase.channel("tareas-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "tareas" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const { error: err } = await supabase.from("tareas").insert([{ ...form, assigned_to: user.id, status: "todo", created_by: user.id }]);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowAdd(false);
    setForm({ title: "", description: "", priority: "media", due_date: "", client: "" });
    setNotif("✅ Tarea guardada en Supabase");
    setTimeout(() => setNotif(null), 3500);
    load();
  };

  const move = async (id, status) => { await supabase.from("tareas").update({ status }).eq("id", id); load(); };
  const del = async (id) => { await supabase.from("tareas").delete().eq("id", id); load(); };

  const priorityColor = { alta: C.red, media: C.yellow, baja: C.green };

  if (setupNeeded) return <SetupBanner />;

  const TaskCard = ({ task }) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
    return (
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 8, borderLeft: `3px solid ${priorityColor[task.priority] || C.muted}` }}>
        <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{task.title}</div>
        {task.description && <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>{task.description}</div>}
        {task.client && <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>👥 {task.client}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Badge label={task.priority} color={priorityColor[task.priority] || C.muted} />
          {task.due_date && <span style={{ fontSize: 11, color: isOverdue ? C.red : C.muted }}>{isOverdue ? "⚠️ " : "📅 "}{task.due_date}</span>}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {COLS.filter(c => c.id !== task.status).map(c => (
            <button key={c.id} onClick={() => move(task.id, c.id)} style={{ padding: "3px 8px", borderRadius: 5, background: "transparent", border: `1px solid ${c.color}44`, color: c.color, fontSize: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>→ {c.label}</button>
          ))}
          <button onClick={() => del(task.id)} style={{ padding: "3px 8px", borderRadius: 5, background: "transparent", border: `1px solid ${C.red}44`, color: C.red, fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 28, height: "calc(100vh - 0px)", overflowY: "auto" }}>
      {notif && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: C.panel, border: `1px solid ${C.accent}`, borderRadius: 12, padding: "14px 20px", color: C.text, fontSize: 14, fontWeight: 600, boxShadow: `0 8px 32px ${C.accent}44` }}>
          {notif}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: "0 0 2px", color: C.white, fontSize: 20, fontWeight: 800 }}>Tareas</h1>
          <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>{tasks.length} tareas totales</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {["kanban", "lista"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "7px 14px", background: view === v ? C.accentDim + "88" : "transparent", border: "none", color: view === v ? C.accent : C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>{v}</button>
            ))}
          </div>
          <Btn onClick={() => setShowAdd(true)}>+ Nueva tarea</Btn>
        </div>
      </div>
      <ErrorBanner msg={error} />
      {loading ? <Spinner /> : view === "kanban" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, minHeight: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ color: col.color, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</div>
                  <span style={{ background: col.color + "22", color: col.color, borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "1px 8px" }}>{colTasks.length}</span>
                </div>
                {colTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {tasks.length === 0 && <div style={{ padding: 32, textAlign: "center", color: C.muted }}>Sin tareas — crea la primera ↗</div>}
          {tasks.map((t, i) => {
            const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== "done";
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: i < tasks.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: priorityColor[t.priority] || C.muted, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                  {t.client && <div style={{ color: C.muted, fontSize: 11 }}>{t.client}</div>}
                </div>
                <Badge label={COLS.find(c => c.id === t.status)?.label || t.status} color={COLS.find(c => c.id === t.status)?.color || C.muted} />
                {t.due_date && <span style={{ fontSize: 11, color: isOverdue ? C.red : C.muted, whiteSpace: "nowrap" }}>{isOverdue ? "⚠️ " : ""}{t.due_date}</span>}
              </div>
            );
          })}
        </div>
      )}
      {showAdd && (
        <Modal title="Nueva tarea" onClose={() => setShowAdd(false)}>
          <ErrorBanner msg={error} />
          <Input label="Título *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Declarar ISR mensual de Grupo Regio" />
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Descripción</div>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldSelect label="Prioridad" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="alta">Alta 🔴</option>
              <option value="media">Media 🟡</option>
              <option value="baja">Baja 🟢</option>
            </FieldSelect>
            <Input label="Fecha límite" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
          </div>
          <FieldSelect label="Cliente relacionado" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))}>
            <option value="">— Sin cliente —</option>
            {CLIENTS.map(c => <option key={c}>{c}</option>)}
          </FieldSelect>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Btn>
            <Btn onClick={save} loading={saving} disabled={!form.title.trim()}>Crear tarea</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── CHAT ───────────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: "general", label: "# general" },
  { id: "impuestos", label: "# impuestos" },
  { id: "imss-pagos", label: "# imss-pagos" },
  { id: "urgente", label: "# urgente" },
];

function ChatModule({ user }) {
  const [channel, setChannel] = useState("general");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const bottomRef = useRef();

  const load = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("mensajes").select("*").eq("channel", channel).eq("is_dm", false).order("created_at", { ascending: true }).limit(100);
    setLoading(false);
    if (err) { setSetupNeeded(true); return; }
    setMessages(data || []);
  };

  useEffect(() => { load(); }, [channel]);

  useEffect(() => {
    const ch = supabase.channel(`chat-${channel}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensajes", filter: `channel=eq.${channel}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [channel]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    const t = text.trim();
    setText("");
    await supabase.from("mensajes").insert([{ from_user: user.id, from_email: user.email, channel, is_dm: false, text: t }]);
  };

  const colors = [C.accent, C.green, C.purple, C.yellow, C.red];
  const colorFor = (id) => colors[(id?.charCodeAt(0) || 0) % colors.length];

  if (setupNeeded) return <SetupBanner />;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 200, background: C.surface, borderRight: `1px solid ${C.border}`, padding: "16px 10px", flexShrink: 0 }}>
        <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 6px", marginBottom: 8 }}>Canales</div>
        {CHANNELS.map(c => (
          <div key={c.id} onClick={() => setChannel(c.id)} style={{ padding: "7px 10px", borderRadius: 7, cursor: "pointer", fontSize: 13, color: channel === c.id ? C.white : C.muted, background: channel === c.id ? C.accentDim + "88" : "transparent", fontWeight: channel === c.id ? 700 : 400, marginBottom: 2 }}>{c.label}</div>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>{CHANNELS.find(c => c.id === channel)?.label}</div>
          <div style={{ color: C.green, fontSize: 11 }}>● chat en tiempo real · Supabase Realtime</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {loading ? <Spinner /> : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
              <div>Inicio de {CHANNELS.find(c => c.id === channel)?.label}</div>
            </div>
          ) : messages.map(m => {
            const isMe = m.from_user === user.id;
            const email = m.from_email || "usuario";
            const initials = email.substring(0, 2).toUpperCase();
            return (
              <div key={m.id} style={{ display: "flex", gap: 10, padding: "6px 0", flexDirection: isMe ? "row-reverse" : "row" }}>
                {!isMe && <Avatar initials={initials} color={colorFor(m.from_user)} size={32} />}
                <div style={{ maxWidth: "70%" }}>
                  {!isMe && <div style={{ color: colorFor(m.from_user), fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{email}</div>}
                  <div style={{ background: isMe ? C.accentDim : C.panel, border: `1px solid ${isMe ? C.accent + "44" : C.border}`, borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "9px 14px", color: C.text, fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
                  <div style={{ color: C.muted, fontSize: 10, marginTop: 3, textAlign: isMe ? "right" : "left" }}>{new Date(m.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={`Mensaje en ${CHANNELS.find(c => c.id === channel)?.label}…`}
              style={{ flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            <Btn onClick={send} disabled={!text.trim()} style={{ padding: "11px 18px", flexShrink: 0 }}>Enviar ↑</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CLIENTES ───────────────────────────────────────────────────────────────
function ClientesModule() {
  const [taxes, setTaxes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supabase.from("impuestos").select("*").then(({ data }) => setTaxes(data || []));
    supabase.from("tareas").select("*").then(({ data }) => setTasks(data || []));
  }, []);

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ margin: "0 0 20px", color: C.white, fontSize: 20, fontWeight: 800 }}>Clientes</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {CLIENTS.map(client => {
          const ctaxes = taxes.filter(t => t.client === client);
          const ctasks = tasks.filter(t => t.client === client);
          const pending = ctaxes.filter(t => t.status === "pendiente").length;
          const presented = ctaxes.filter(t => t.status === "presentado").length;
          return (
            <div key={client} onClick={() => setSelected(selected === client ? null : client)} style={{ background: C.surface, border: `1px solid ${selected === client ? C.accent : C.border}`, borderRadius: 14, padding: 20, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accentDim + "88", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏢</div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{client}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["Pendientes", pending, C.yellow], ["Presentados", presented, C.green], ["Tareas", ctasks.length, C.accent]].map(([lbl, val, color]) => (
                  <div key={lbl} style={{ flex: 1, background: C.panel, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ color, fontSize: 18, fontWeight: 800 }}>{val}</div>
                    <div style={{ color: C.muted, fontSize: 10 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              {selected === client && ctaxes.length > 0 && (
                <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  {ctaxes.slice(0, 4).map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", color: C.muted }}>
                      <span>{t.tax_type} · {MONTHS[(t.month||1) - 1]} {t.year}</span>
                      <Badge label={t.status} color={t.status === "presentado" ? C.green : C.yellow} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── APP ROOT ───────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [taxes, setTaxes] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("impuestos").select("*").then(({ data }) => setTaxes(data || []));
    supabase.from("tareas").select("*").then(({ data }) => setTasks(data || []));
  }, [user]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, background: C.accent, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>⚖️</div>
        <Spinner />
      </div>
    </div>
  );

  if (!user) return <LoginScreen onLogin={setUser} />;

  const pendingTaskCount = tasks.filter(t => t.status !== "done").length;

  const modules = {
    dashboard: <Dashboard taxes={taxes} tasks={tasks} user={user} />,
    impuestos: <ImpuestosModule user={user} />,
    tareas: <TareasModule user={user} />,
    chat: <ChatModule user={user} />,
    clientes: <ClientesModule />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden", fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2A2F42; border-radius: 3px; } select option { background: #1E2230; }`}</style>
      <Sidebar active={activeModule} onNav={setActiveModule} user={user} onLogout={() => supabase.auth.signOut()} notifCount={pendingTaskCount} />
      <main style={{ flex: 1, overflowY: activeModule === "chat" ? "hidden" : "auto" }}>
        {modules[activeModule]}
      </main>
    </div>
  );
}
