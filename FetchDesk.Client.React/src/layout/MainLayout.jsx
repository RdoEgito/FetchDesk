import { useState } from "react";
import NavMenu from "./NavMenu";
import "../styles/main-layout.css";

export default function MainLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="page">
      <div className={`nav-overlay ${menuOpen ? 'show' : ''}`} onClick={closeMobileMenu} />
      <div className={`sidebar ${menuOpen ? '' : 'collapsed'}`}>
        <NavMenu onCloseMobileMenu={closeMobileMenu} />
      </div>
      <main>
        <div className="mobile-menu-button">
          <button
            className="btn btn-outline-primary mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        <article className="content px-4">{children}</article>
      </main>
    </div>
  );
}
