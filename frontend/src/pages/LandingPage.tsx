import { Link } from "react-router-dom";

const LandingPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}"); // get logged-in user

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h2>NexusHire</h2>

        <div>
          <Link to="/login" style={{ marginRight: 15 }}>
            Login
          </Link>
          <Link to="/signup" style={{ marginRight: 15 }}>
            Sign Up
          </Link>

          {/* Only show Admin link if user is admin */}
          {user.role === "admin" && (
            <Link to="/admin" style={{ fontWeight: "bold" }}>
              Admin Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: 20 }}>
          Track Your Job Applications Effortlessly
        </h1>

        <p style={{ fontSize: "18px", marginBottom: 30 }}>
          Organize, manage, and monitor your job search in one clean dashboard.
        </p>

        <Link to="/signup">
          <button style={{ padding: "12px 24px", fontSize: 16 }}>
            Get Started Free
          </button>
        </Link>
      </section>

      {/* FEATURES */}
      <section
        style={{
          padding: "60px 40px",
          background: "#f9f9f9",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 40 }}>Why NexusHire?</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            textAlign: "center",
          }}
        >
          <div>
            <h3>📌 Track Applications</h3>
            <p>Keep all your job applications organized in one place.</p>
          </div>

          <div>
            <h3>📊 Status Management</h3>
            <p>Monitor progress from applied to offer.</p>
          </div>

          <div>
            <h3>⚡ Simple Dashboard</h3>
            <p>Clean interface focused on productivity.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <h2>Start managing your job hunt today</h2>

        <Link to="/signup">
          <button style={{ marginTop: 20, padding: "12px 24px" }}>
            Create Free Account
          </button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: 20,
          textAlign: "center",
          borderTop: "1px solid #eee",
        }}
      >
        © {new Date().getFullYear()} NexusHire
      </footer>
    </div>
  );
};

export default LandingPage;
