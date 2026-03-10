import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {

  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* NAVBAR */}

      <nav className="landing-navbar">

        <div className="logo">
          HarvestLink
        </div>

        <div className="nav-buttons">

          <button
            onClick={() => navigate("/farmer")}
            className="nav-btn"
          >
            Farmer Login
          </button>

          <button
            onClick={() => navigate("/buyer")}
            className="nav-btn"
          >
            Buyer Login
          </button>

        </div>

      </nav>


      {/* HERO SECTION */}

      <section className="hero">

        <h1 className="app-title">
          HarvestLink
        </h1>

        <h2 className="tagline">
          smarter way to sell and sustain
        </h2>

        <p className="quote">
          “Connecting farmers directly with markets,
          transforming crop waste into value,
          and building a more sustainable agricultural future.”
        </p>

        <button
          className="get-started-btn"
          onClick={() => navigate("/farmer")}
        >
          Get Started
        </button>

      </section>


      {/* FEATURES */}

      <section className="features-section">

        <h2 className="features-title">
          Platform Features
        </h2>

        <div className="features-grid">

          <div className="feature-card">
            <h3>🌾 Sell Fresh Crops</h3>
            <p>
              Farmers can list fresh produce and connect directly
              with buyers without intermediaries.
            </p>
          </div>

          <div className="feature-card">
            <h3>♻ Sell Crop Waste</h3>
            <p>
              Agricultural waste can be sold for biofuel production
              instead of being burned.
            </p>
          </div>

          <div className="feature-card">
            <h3>🌱 Carbon Credits</h3>
            <p>
              Farmers earn sustainability credits for contributing
              crop waste to renewable energy production.
            </p>
          </div>

          {/* <div className="feature-card">
            <h3>🤖 AI Waste Estimation</h3>
            <p>
              Estimate biofuel yield and market value of crop
              residue using intelligent prediction models.
            </p>
          </div>

          <div className="feature-card">
            <h3>📍 Location Based Marketplace</h3>
            <p>
              Buyers can discover nearby farmers using smart
              distance-based filtering.
            </p>
          </div> */}

        </div>

      </section>

    </div>
  );
}