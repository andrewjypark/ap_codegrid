import { Link } from "next-transition-router";

const NavBar = () => {
  return (
    <div className="ap_grid_container ap_navbar">
      <div className="ap_grid_1">
        <nav className="ap_navbar_section">
            <div className="ap_navbar_item_container">
              <div className="ap_navbar_logo_container">
                <Link href="/" className="ap_link_with_underline">Emberfall</Link>
              </div>
            </div>
            <div className="navbar-items">
              <div className="navbar-item">
                <Link href="/threshold" className="ap_link_with_underline">Threshold</Link>
              </div>
              <div className="navbar-item">
                <Link href="/sanctum" className="ap_link_with_underline">Sanctum</Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
  );
};

export default NavBar;
