import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "./VideoMeetCall.css";

export default function VideoMeetCall({
  username: initialUsername = "",
  meetingId = "",
}) {
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chatEndRef = useRef(null);

  const [username, setUsername] = useState(initialUsername);
  const [askForUsername, setAskForUsername] = useState(true);
  const [joined, setJoined] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (joined && localVideoRef.current && !screenOn) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [joined, screenOn]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleConnect() {
    const cleanName = username.trim();
    if (!cleanName) {
      setMediaError("Please enter your name.");
      return;
    }

    setMediaError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setUsername(cleanName);
      setAudioOn(true);
      setVideoOn(true);
      setAskForUsername(false);
      setJoined(true);
    } catch (error) {
      console.error("Camera/microphone error:", error);
      setMediaError(
        "Camera or microphone access failed. Allow access in your browser settings and try again."
      );
    }
  }

  function toggleAudio() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextState = !audioOn;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = nextState;
    });
    setAudioOn(nextState);
  }

  function toggleVideo() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextState = !videoOn;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = nextState;
    });
    setVideoOn(nextState);
  }

  async function toggleScreenShare() {
    if (screenOn) {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenOn(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      setScreenOn(true);

      const screenTrack = stream.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.onended = () => {
          screenStreamRef.current = null;
          setScreenOn(false);
        };
      }
    } catch (error) {
      if (error.name !== "NotAllowedError") {
        console.error("Screen sharing error:", error);
        setMediaError("Screen sharing could not be started.");
      }
    }
  }

  function sendMessage(event) {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: username,
        text: cleanMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMessage("");
  }

  function handleEndCall() {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    setJoined(false);
    setAskForUsername(true);
    setAudioOn(true);
    setVideoOn(true);
    setScreenOn(false);
    setMessages([]);
    setMessage("");

    // Keep the guest on the same meeting URL so they can rejoin.
  }

  function goBackHome() {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;
    navigate("/");
  }

  return (
    <div className="connectly-app">
      {askForUsername ? (
        <div className="lobby-page">
          <div className="lobby-card">
            <div className="connectly-logo">
              <span className="logo-icon">✳</span>
              <span>Connectly</span>
            </div>

            <h1>Connect with your people.</h1>
            <p className="lobby-description">
              Join your meeting and make every conversation count.
            </p>

            {meetingId && (
              <p className="meeting-room-label">
                Meeting ID: <strong>{meetingId}</strong>
              </p>
            )}

            <TextField
              fullWidth
              label="Your name"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleConnect();
                }
              }}
              margin="normal"
            />

            <div className="lobby-preview">
              <div className="preview-placeholder">
                <span>📹</span>
                <p>Your camera will start when you connect</p>
              </div>
            </div>

            {mediaError && <p role="alert" className="media-error">{mediaError}</p>}

            <Button
              fullWidth
              variant="contained"
              onClick={handleConnect}
              sx={{
                mt: 2,
                py: 1.4,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "16px",
              }}
            >
              Connect to meeting
            </Button>

            <Button
              fullWidth
              onClick={goBackHome}
              sx={{ mt: 1, textTransform: "none" }}
            >
              Back to home
            </Button>
          </div>
        </div>
      ) : (
        <div className="meeting-page">
          <header className="meeting-header">
            <div className="connectly-logo">
              <span className="logo-icon">✳</span>
              <span>Connectly</span>
            </div>

            <div className="meeting-status">
              <span className="live-dot"></span>
              <span>
                Meeting in progress{meetingId ? ` • Room: ${meetingId}` : ""}
              </span>
            </div>

            <div className="header-user">
              <span className="avatar">
                {username.charAt(0).toUpperCase() || "G"}
              </span>
              <span>{username}</span>
            </div>
          </header>

          <main className="meeting-layout">
            <section className="video-section">
              <div className="video-heading">
                <div>
                  <h2>Your meeting</h2>
                  <p>Welcome, {username}</p>
                </div>
                <button className="ai-shortcut" onClick={() => setActiveTab("ai")}>
                  ✨ AI Assistant
                </button>
              </div>

              {mediaError && <p role="alert" className="media-error">{mediaError}</p>}

              <div className="video-stage">
                <div className="video-tile main-video">
                  {screenOn && screenStreamRef.current ? (
                    <video
                      key="screen"
                      autoPlay
                      playsInline
                      ref={(element) => {
                        if (element && screenStreamRef.current) {
                          element.srcObject = screenStreamRef.current;
                        }
                      }}
                    />
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                    />
                  )}

                  {!videoOn && !screenOn && (
                    <div className="camera-off">
                      <span className="avatar large-avatar">
                        {username.charAt(0).toUpperCase() || "G"}
                      </span>
                      <p>Camera is off</p>
                    </div>
                  )}

                  <div className="video-name">{username} (You)</div>
                  {!audioOn && <span className="muted-indicator">🔇 Muted</span>}
                </div>
                <div className="video-overlay-note">
                  {screenOn ? "You are sharing your screen" : "Your camera"}
                </div>
              </div>

              <div className="meeting-controls">
                <button
                  className={`control-btn ${!audioOn ? "control-off" : ""}`}
                  onClick={toggleAudio}
                  title="Toggle microphone"
                >
                  <span>{audioOn ? "🎙️" : "🔇"}</span>
                  <small>{audioOn ? "Mute" : "Unmute"}</small>
                </button>

                <button
                  className={`control-btn ${!videoOn ? "control-off" : ""}`}
                  onClick={toggleVideo}
                  title="Toggle camera"
                >
                  <span>{videoOn ? "📹" : "🚫"}</span>
                  <small>{videoOn ? "Camera" : "Camera off"}</small>
                </button>

                <button
                  className={`control-btn ${screenOn ? "control-active" : ""}`}
                  onClick={toggleScreenShare}
                  title="Share screen"
                >
                  <span>🖥️</span>
                  <small>{screenOn ? "Stop share" : "Share screen"}</small>
                </button>

                <button
                  className="control-btn chat-control"
                  onClick={() => setActiveTab("chat")}
                  title="Open chat"
                >
                  <span>💬</span>
                  <small>Chat</small>
                </button>

                <button
                  className="control-btn end-call"
                  onClick={handleEndCall}
                  title="Leave call"
                >
                  <span>📞</span>
                  <small>Leave</small>
                </button>
              </div>

              <div className="meeting-footer">
                <span>🔒 Connectly meeting</span>
                <span>AI-powered meetings coming soon</span>
              </div>
            </section>

            <aside className="sidebar">
              <div className="sidebar-tabs">
                <button
                  className={activeTab === "chat" ? "tab active-tab" : "tab"}
                  onClick={() => setActiveTab("chat")}
                >
                  Chat
                </button>
                <button
                  className={activeTab === "ai" ? "tab active-tab" : "tab"}
                  onClick={() => setActiveTab("ai")}
                >
                  ✨ AI Assistant
                </button>
              </div>

              {activeTab === "chat" ? (
                <>
                  <div className="sidebar-title">
                    <h3>Meeting chat</h3>
                    <p>Share messages with your team</p>
                  </div>

                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <div className="empty-chat">
                        <span>💬</span>
                        <h4>Start a conversation</h4>
                        <p>Your messages will appear here.</p>
                      </div>
                    ) : (
                      messages.map((item) => (
                        <div className="chat-message" key={item.id}>
                          <div className="chat-message-meta">
                            <strong>{item.sender}</strong>
                            <small>{item.time}</small>
                          </div>
                          <p>{item.text}</p>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form className="chat-form" onSubmit={sendMessage}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!message.trim()}
                      sx={{
                        minWidth: "48px",
                        borderRadius: "10px",
                        textTransform: "none",
                      }}
                    >
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <div className="ai-panel">
                  <div className="ai-icon">✨</div>
                  <h3>Connectly AI</h3>
                  <p>Your intelligent meeting companion.</p>

                  <div className="ai-feature">
                    <span>📝</span>
                    <div>
                      <strong>Meeting summary</strong>
                      <p>Summarize important discussions.</p>
                    </div>
                  </div>

                  <div className="ai-feature">
                    <span>✅</span>
                    <div>
                      <strong>Action items</strong>
                      <p>Identify tasks and next steps.</p>
                    </div>
                  </div>

                  <div className="ai-feature">
                    <span>🤖</span>
                    <div>
                      <strong>Ask AI</strong>
                      <p>Ask questions about your meeting.</p>
                    </div>
                  </div>

                  <div className="ai-coming-soon">
                    AI integration will be added here.
                  </div>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setActiveTab("chat")}
                    sx={{ mt: 2, borderRadius: "10px", textTransform: "none" }}
                  >
                    Back to chat
                  </Button>
                </div>
              )}
            </aside>
          </main>
        </div>
      )}
    </div>
  );
}
