import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/nav-menu.css";

export default function NavMenu({ onCloseMobileMenu }) {
  const [collapsed, setCollapsed] = useState(true);
  const [expandAdminMenu, setExpandAdminMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640.98);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640.98);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.nav-overlay');

    if (sidebar) {
      if (collapsed) {
        sidebar.classList.add('collapsed');
        if (overlay && isMobile) overlay.classList.remove('show');
      } else {
        sidebar.classList.remove('collapsed');
        if (overlay && isMobile) overlay.classList.add('show');
      }
    }
  }, [collapsed, isMobile]);

  const toggleMenu = () => {
    setCollapsed((current) => !current);
  };

  const handleNavLinkClick = () => {
    if (isMobile && onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const navMenuCssClass = collapsed && !isMobile ? "nav-collapsed" : "";

  return (
    <>
      <div className={`${navMenuCssClass} nav-scrollable`}>
        <div className="brand-section">
          <Link className="navbar-brand" to="/">
            FetchDesk
          </Link>
          <button
            title="Navigation menu"
            className="navbar-toggler"
            onClick={toggleMenu}
          >
            <span className="navbar-toggler-icon" />
          </button>
        </div>

        <nav className="flex-column">
          <div className="nav-item px-3">
            <NavLink className="nav-link" to="/" onClick={handleNavLinkClick}>
              <span className="bi bi-house-door-fill-nav-menu" aria-hidden="true" />
              Home
            </NavLink>
          </div>
          <div className="nav-item px-3">
            <NavLink className="nav-link" to="/caixa" onClick={handleNavLinkClick}>
              <span className="bi bi-cart-plus-fill-nav-menu" aria-hidden="true" />
              Caixa
            </NavLink>
          </div>
          <div className="nav-item px-3">
            <NavLink className="nav-link" to="/balcao" onClick={handleNavLinkClick}>
              <span className="bi bi-list-check-nav-menu" aria-hidden="true" />
              Balcão
            </NavLink>
          </div>
          <div className="nav-item px-3">
            <NavLink className="nav-link" to="/fechamento" onClick={handleNavLinkClick}>
              <span className="bi bi-list-checkout-nav-menu" aria-hidden="true" />
              Fechamento
            </NavLink>
          </div>

          <hr className="text-white-50 mx-3 my-2" />

          <div className="nav-item px-3">
            <div
              className="nav-link text-light admin-link"
              onClick={(event) => {
                event.stopPropagation();
                setExpandAdminMenu((current) => !current);
              }}
              role="button"
              tabIndex={0}
            >
              <span className="bi bi-gear-fill" aria-hidden="true" style={{ marginRight: "0.75rem" }} />
              Administrativo
              <span
                className={`bi ${expandAdminMenu ? "bi-chevron-up" : "bi-chevron-down"} ms-auto`}
                aria-hidden="true"
              />
            </div>
          </div>

          {expandAdminMenu ? (
            <div className="nav-item px-3 ps-4">
              <NavLink className="nav-link" to="/produtos" onClick={handleNavLinkClick}>
                <span className="bi bi-box-seam" aria-hidden="true" style={{ marginRight: "0.75rem" }} />
                Produtos
              </NavLink>
            </div>
          ) : null}
        </nav>
      </div>
    </>
  );
}
