import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import TextType from '../components/TextType';
import SplitText from '../components/SplitText';

const features = [
  { icon: '🧠', color: 'var(--primary-light)', title: 'AI Triage Engine', desc: 'Random Forest model classifies patient priority from vitals in real time with 97% accuracy.' },
  { icon: '🩸', color: 'var(--accent-red-light)', title: 'Blood Bank Finder', desc: 'Instantly locate nearby blood banks with compatible blood type availability.' },
  { icon: '📍', color: 'var(--accent-green-light)', title: 'Emergency Maps', desc: 'Interactive maps showing hospitals, blood banks, and emergency services near you.' },
  { icon: '📊', color: 'var(--accent-orange-light)', title: 'Live Dashboard', desc: 'Real-time ER overview with patient queue, alerts, and status monitoring.' },
  { icon: '🚨', color: 'var(--accent-red-light)', title: 'Critical Alerts', desc: 'Push notifications when critical patients arrive or urgent actions are needed.' },
  { icon: '📋', color: 'var(--primary-light)', title: 'Queue Management', desc: 'Auto-sorted queue by urgency score and arrival time for faster response.' },
];

export default function Welcome() {
  const descriptionText = "Analyze patient symptoms, vital signs, blood data, and medical history in seconds. Our AI classifies priority levels and locates the nearest blood banks — helping your emergency team act faster and smarter.";

  return (
    <div className="welcome-page">
      {/* ── Hero ── */}
      <section className="welcome-hero welcome-hero-centered" id="hero">
        {/* Background Video */}
        <div className="hero-video-container">
          <video
            className="hero-background-video"
            autoPlay
            loop
            muted
            playsInline
          >
            {/* Medical/Hospital themed stock video from Pexels */}
            <source
              src="videoplayback (1).mp4"
              type="video/mp4"
            />
          </video>
          <div className="hero-video-overlay"></div>
        </div>
        <div className="welcome-hero-text">
          <div className="welcome-eyebrow">
            🚨 Hospital-Grade Emergency AI
          </div>
          <h1 className="hero-animated-title">
            <div className="hero-line">
              <SplitText
                text="Save Lives with"
                className="hero-split-text"
                delay={100}
                duration={0.8}
                ease="back.out(1.7)"
                splitType="words"
                from={{ opacity: 0, y: 50, rotationX: -90 }}
                to={{ opacity: 1, y: 0, rotationX: 0 }}
                threshold={0.1}
                rootMargin="0px"
                textAlign="center"
                tag="span"
              />
            </div>
            <div className="hero-line">
              <SplitText
                text="AI-Powered"
                className="hero-split-text highlight"
                delay={120}
                duration={0.7}
                ease="elastic.out(1, 0.5)"
                splitType="chars"
                from={{ opacity: 0, y: 60, scale: 0.5 }}
                to={{ opacity: 1, y: 0, scale: 1 }}
                threshold={0.1}
                rootMargin="0px"
                textAlign="center"
                tag="span"
              />{' '}
              <SplitText
                text="Emergency Triage"
                className="hero-split-text highlight-blue"
                delay={80}
                duration={0.7}
                ease="elastic.out(1, 0.5)"
                splitType="chars"
                from={{ opacity: 0, y: 60, scale: 0.5 }}
                to={{ opacity: 1, y: 0, scale: 1 }}
                threshold={0.1}
                rootMargin="0px"
                textAlign="center"
                tag="span"
              />
            </div>
          </h1>
          <TextType
            text={[descriptionText]}
            as="p"
            className="hero-description"
            typingSpeed={25}
            initialDelay={1200}
            showCursor={true}
            cursorCharacter="|"
            cursorBlinkDuration={0.5}
            loop={false}
          />
          <div className="welcome-ctas">
            <Link to="/intake" className="btn-cta-primary">
              🚑 Start Patient Triage <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn-cta-secondary">
              <LayoutDashboard size={18} /> Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="welcome-stats-bar">
        <div className="wsb-item">
          <div className="wsb-val red">128+</div>
          <div className="wsb-label">Patients Triaged Today</div>
        </div>
        <div className="wsb-item">
          <div className="wsb-val blue">97%</div>
          <div className="wsb-label">AI Classification Accuracy</div>
        </div>
        <div className="wsb-item">
          <div className="wsb-val green">4.2m</div>
          <div className="wsb-label">Avg. AI Response Time</div>
        </div>
        <div className="wsb-item">
          <div className="wsb-val">500+</div>
          <div className="wsb-label">Training Cases</div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="welcome-features-section" id="features">
        <h2>Everything Your ER Needs</h2>
        <p>One integrated platform for patient intake, AI triage, blood management, and emergency coordination.</p>
        <div className="features-grid">
          {features.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="welcome-cta-section" id="about">
        <h2>Ready to Transform Emergency Care?</h2>
        <p>Enter patient data and get an AI-powered triage classification in under 5 seconds.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/intake" className="btn-cta-primary">
            🚑 Begin Patient Intake <ArrowRight size={18} />
          </Link>
          <Link to="/dashboard" className="btn-cta-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            View Dashboard
          </Link>
        </div>
      </section>

    </div>
  );
}
