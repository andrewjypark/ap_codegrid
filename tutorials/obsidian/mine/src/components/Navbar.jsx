import { Link } from "next-transition-router";

const NavBar = () => {
  return (
    <div className="ap_grid_container ap_navbar">
      <div className="ap_grid_1">
        <nav className="cg_navbar_section">
            <div className="cg_navbar_item_container">
              <div className="cg_navbar_logo_container">
                <Link href="/" className="ap_link_without_underline">Genesis</Link>
              </div>
            </div>
            <div className="navbar-items">
              <div className="navbar-item">
                <Link href="/threshold" className="ap_link_without_underline">Threshold</Link>
              </div>
              <div className="navbar-item">
                <Link href="/sanctum" className="ap_link_without_underline">Sanctum</Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
  );
};

export default NavBar;
