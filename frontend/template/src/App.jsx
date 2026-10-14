import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { apiRequest } from "./api";
import VideoMeetCall from "./VideoMeetCall";
import "./App.css";

function Home() {
  return (
    <div className="landing">
      <nav className="navbar">
        <Link to="/" className="logo">
          <span className="logo-icon">✳</span> Connectly
        </Link>
        <div className="nav-links">
          <Link to="/guest" className="guest-link">Join as Guest</Link>
          <Link to="/register" className="register-btn">Register</Link>
          <Link to="/login" className="login-btn">Login</Link>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <span className="eyebrow">✦ BRING PEOPLE CLOSER</span>
          <h1>Connect with your<br /><span>loved ones.</span></h1>
          <p className="description">
            Every moment matters. Meet face-to-face, share your stories,
            and feel closer to the people who make life special.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="get-started">Get Started <span>→</span></Link>
            <Link to="/guest" className="secondary-btn">Join a meeting</Link>
          </div>
          <div className="trust-note">
            <span className="status-dot"></span>
            Simple, secure, and made for everyone
          </div>
        </div>

        <div className="visual">
          <div className="circle circle-one"></div>
          <div className="circle circle-two"></div>
          <div className="video-card">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85"
              alt="Friends connecting together"
            />
            <div className="video-overlay">
              <div>
                <strong>Moments together</strong>
                <p>Even when you're miles apart</p>
              </div>
              <span className="live-dot"></span>
            </div>
          </div>
          <div className="floating-card">
            <span className="avatar">♡</span>
            <div>
              <strong>Closer, every day</strong>
              <p>Make time for your people</p>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <span>Connectly © 2026</span>
        <span>Made for meaningful connections.</span>
      </footer>
    </div>
  );
}

function AuthPage({ title, subtitle, button, footerText, footerLink, to }) {
  const navigate = useNavigate();
  const isRegister = button === "Register";
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = isRegister ? { name, username, password } : { username, password };
      const result = await apiRequest(
        isRegister ? "/api/v1/users/register" : "/api/v1/users/login",
        data
      );

      if (isRegister) {
        navigate("/login");
      } else {
        if (result?.token) sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("username", username);
        sessionStorage.removeItem("guestName");
        navigate("/");
      }
    } catch (error) {
      setMessage(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="logo"><span className="logo-icon">✳</span> Connectly</Link>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{title}</h1>
        <p>{subtitle}</p>

        {isRegister && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />

        {message && <p role="alert">{message}</p>}
        <button type="submit" className="get-started full-btn" disabled={loading}>
          {loading ? "Please wait..." : button}
        </button>
        <div className="auth-footer">
          {footerText} <Link to={to}>{footerLink}</Link>
        </div>
      </form>
    </div>
  );
}

function Login() {
  return (
    <AuthPage
      title="Welcome back"
      subtitle="Sign in to reconnect with your people."
      button="Login"
      footerText="Don't have an account?"
      footerLink="Register"
      to="/register"
    />
  );
}

function Register() {
  return (
    <AuthPage
      title="Create your account"
      subtitle="Start connecting with the people you love."
      button="Register"
      footerText="Already have an account?"
      footerLink="Login"
      to="/login"
    />
  );
}

function Guest() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [meetingId, setMeetingId] = useState("");

  function handleJoin(event) {
    event.preventDefault();
    const guestName = name.trim();
    const roomId = meetingId.trim();
    if (!guestName || !roomId) return;

    sessionStorage.setItem("guestName", guestName);
    navigate(`/meeting/${encodeURIComponent(roomId)}`);
  }

  return (
    <div className="auth-page">
      <Link to="/" className="logo"><span className="logo-icon">✳</span> Connectly</Link>
      <div className="auth-card">
        <h1>Join as a guest</h1>
        <p>Enter your name and meeting ID to join.</p>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Meeting ID"
            value={meetingId}
            onChange={(event) => setMeetingId(event.target.value)}
            required
          />
          <button className="get-started full-btn" type="submit">Join Meeting →</button>
        </form>
      </div>
    </div>
  );
}

function MeetingPage() {
  const { meetingId } = useParams();
  const username =
    sessionStorage.getItem("guestName") ||
    sessionStorage.getItem("username") ||
    "";

  return <VideoMeetCall username={username} meetingId={meetingId || ""} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/meeting/:meetingId" element={<MeetingPage />} />
        <Route path="/Video" element={<VideoMeetCall />} />
      </Routes>
    </BrowserRouter>
  );
}
