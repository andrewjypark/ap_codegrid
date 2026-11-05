import { Link } from "next-transition-router";

const NavBar = () => {
  return (
    <div className="ap_grid_container ap_navbar">
      <div className="ap_grid_1">
        <nav className="ap_navbar_section">
            <div className="ap_navbar_item_container">
              <div className="ap_navbar_logo_container">
                <Link href="/">Emberfall</Link>
              </div>
            </div>
            <div className="navbar-items">
              <div className="navbar-item">
                <Link href="/">Genesis</Link>
              </div>
              <div className="navbar-item">
                <Link href="/threshold">Threshold</Link>
              </div>
              <div className="navbar-item">
                <Link href="/sanctum">Sanctum</Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
  );
};

export default NavBar;
