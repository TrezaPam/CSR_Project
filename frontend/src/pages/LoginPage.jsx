import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css"; // Kita akan buat style terpisah

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Demo credentials
  const DEMO_CREDENTIALS = {
    email: "admin@demo.com",
    password: "password123",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Check demo credentials
      if (
        formData.email === DEMO_CREDENTIALS.email &&
        formData.password === DEMO_CREDENTIALS.password
      ) {
        // Create mock token
        const mockToken = "demo_jwt_token_" + Date.now();

        // Save to localStorage
        localStorage.setItem("admin_token", mockToken);

        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem("remember_me", "true");
        } else {
          localStorage.removeItem("remember_me");
        }

        // Force page reload to trigger App.jsx auth check
        window.location.href = "/dashboard";
        // Alternatively, you can use navigate if you want SPA behavior
        // navigate("/dashboard");
      } else {
        setError(
          "Email atau password salah. Gunakan admin@demo.com / password123"
        );
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    alert("Fitur Sign In dengan Google belum tersedia di mode demo");
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Panel - Login Form */}
        <div className="login-form-container">
          <div className="login-header">
            <h1>Login</h1>
            <p className="subtitle">
              See your growth and get consulting support!
            </p>
          </div>

          <button
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            type="button"
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign In with Google
          </button>

          <div className="divider">
            <span>or Sign In with Email</span>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="mail@website.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password*</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleInputChange}
                minLength={8}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="signup-link">
            Not registered yet? <a href="#">Create an Account</a>
          </div>

          <footer className="login-footer">
            ©2020 Fish All rights reserved.
          </footer>
        </div>

        {/* Right Panel - Rewards/Banner */}
        <div className="login-banner">
          <div className="rewards-card">
            <div className="rewards-header">
              <h3>Rewards</h3>
            </div>
            <div className="rewards-stats">
              <div className="stat-item">
                <div className="stat-label">Total Balance</div>
                <div className="stat-value">$ 162,751</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Monthly Growth</div>
                <div className="stat-value">$ 23,827</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Aggert</div>
                <div className="stat-value">APP NAME</div>
              </div>
            </div>

            <div className="points-display">
              <div className="points-label">Points</div>
              <div className="points-value">172,832</div>
            </div>

            <div className="banner-footer">
              <h2>Turn your ideas into reality.</h2>
              <p>
                Consistent quality and experience across all platforms and
                devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
