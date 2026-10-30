import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronRight, FlaskConical, Layers3, Menu, Plus, ScanLine, X } from "lucide-react";
import { useHealth } from "../hooks/useHealth";

export function Layout() {
  const { error, waking } = useHealth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const developerPage = location.pathname === "/skills" || location.pathname.startsWith("/dev/");
  const section = developerPage ? "Developer tools" : location.pathname === "/new" ? "Set up your crash test" : location.pathname.startsWith("/studies/") ? "Your crash test" : "Launch lab";
  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {menuOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`}>
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><ScanLine size={23} strokeWidth={1.8} /></span>
          <span>Taste Test<small>DUMMY</small></span>
        </NavLink>
        <div className="lab-signature">Big ideas. Small crash tests.</div>
        <NavLink to="/new" className="btn primary sidebar-create" onClick={() => setMenuOpen(false)}><Plus size={16} /> New crash test</NavLink>
        <span className="nav-label">YOUR LAUNCH LAB</span>
        <nav aria-label="Main navigation">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}><Layers3 size={18} /> Overview & tests</NavLink>
          <NavLink to="/new?template=demo" onClick={() => setMenuOpen(false)}><FlaskConical size={18} /> Try the beverage brief</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="lab-principle"><span className="eyebrow">TEST THE ASSUMPTION.</span><p>Not your entire<br />launch budget.</p></div>
          <a href="https://www.qloo.com/products/api" target="_blank" rel="noreferrer" className="api-link">Cultural evidence by Qloo <ArrowUpRight size={13} /></a>
          <div className="workspace-footer"><span>Taste is a signal.<small>Not a sales forecast.</small></span></div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button className="icon-btn mobile-menu" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          <div className="breadcrumbs"><NavLink to="/">Taste Test Dummy</NavLink><ChevronRight size={13} /><strong>{section}</strong></div>
          <span className="workspace-status">{error ? "Service temporarily unavailable" : waking ? "Waking up the research service..." : developerPage ? "Development workspace" : "Evidence before expensive mistakes."}</span>
        </header>
        <main className="content" id="main-content" key={location.pathname}><Outlet /></main>
        <footer className="app-footer"><span>Taste Test Dummy</span><span>Crash-test your launch before the market does.</span></footer>
      </div>
    </div>
  );
}
