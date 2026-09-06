"use client";

import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  Gauge,
  Menu,
  Monitor,
  Radio,
  ShieldCheck,
  Smartphone,
  Usb,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const releases = {
  android: {
    filename: "EasyStream-Android-0.1.0.apk",
    mime: "application/vnd.android.package-archive",
    parts: Array.from({ length: 5 }, (_, index) => `/downloads/android-0.1.0/part-${String(index).padStart(3, "0")}.bin`),
  },
  windows: {
    filename: "EasyStream-Windows-0.1.0.zip",
    mime: "application/zip",
    parts: Array.from({ length: 8 }, (_, index) => `/downloads/windows-0.1.0/part-${String(index).padStart(3, "0")}.bin`),
  },
} as const;

function ReleaseDownload({
  release,
  className,
  children,
}: {
  release: keyof typeof releases;
  className: string;
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  const download = async () => {
    if (progress !== null) return;
    setFailed(false);
    setProgress(0);
    const config = releases[release];
    try {
      const chunks: Blob[] = [];
      for (let index = 0; index < config.parts.length; index += 1) {
        const response = await fetch(config.parts[index]);
        if (!response.ok) throw new Error(`Part ${index + 1} could not be downloaded.`);
        chunks.push(await response.blob());
        setProgress(Math.round(((index + 1) / config.parts.length) * 100));
      }
      const url = URL.createObjectURL(new Blob(chunks, { type: config.mime }));
      const link = document.createElement("a");
      link.href = url;
      link.download = config.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setProgress(null);
    } catch {
      setProgress(null);
      setFailed(true);
    }
  };

  return (
    <button className={className} type="button" onClick={download} disabled={progress !== null}>
      {progress === null ? children : <>Preparing download · {progress}%</>}
      {failed && <span className="download-error" role="alert">Please try again</span>}
    </button>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorHalo = useRef<HTMLDivElement>(null);
  const heroVisual = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14 },
    );
    elements.forEach((element) => observer.observe(element));

    const moveCursor = (event: PointerEvent) => {
      if (cursorDot.current) {
        cursorDot.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
      if (cursorHalo.current) {
        cursorHalo.current.animate(
          { transform: `translate3d(${event.clientX}px, ${event.clientY}px, 0)` },
          { duration: 420, fill: "forwards" },
        );
      }
    };
    window.addEventListener("pointermove", moveCursor);

    const magnetic = Array.from(document.querySelectorAll<HTMLElement>(".magnetic"));
    const cleanups = magnetic.map((element) => {
      const onMove = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        element.style.transform = `translate(${x * 0.1}px, ${y * 0.12}px)`;
      };
      const onLeave = () => {
        element.style.transform = "translate(0, 0)";
      };
      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", onLeave);
      return () => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", moveCursor);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  const tiltHero = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = heroVisual.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty("--tilt-x", `${y * -5}deg`);
    element.style.setProperty("--tilt-y", `${x * 7}deg`);
  };

  return (
    <main>
      <div className="cursor-dot" ref={cursorDot} />
      <div className="cursor-halo" ref={cursorHalo} />

      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="EasyStream home">
          <span className="brand-mark"><Radio size={18} /></span>
          <span>EasyStream</span>
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
          <a href="#apps" onClick={() => setMenuOpen(false)}>Apps</a>
          <a href="#stores" onClick={() => setMenuOpen(false)}>Stores</a>
          <a className="nav-download magnetic" href="#download" onClick={() => setMenuOpen(false)}>
            Download alpha <ArrowRight size={15} />
          </a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy" data-reveal>
          <div className="eyebrow"><span className="status-dot" /> Alpha 0.1 · ready to test</div>
          <h1>Your phone.<br /><span>On the big screen.</span></h1>
          <p className="hero-lede">
            A focused Android-to-Windows mirroring experience, built for a sharp picture,
            direct local connections, and less time between tap and screen.
          </p>
          <div className="hero-actions">
            <ReleaseDownload className="button button-primary magnetic" release="android">
              <Smartphone size={18} /> Download Android <ArrowDownToLine size={16} />
            </ReleaseDownload>
            <ReleaseDownload className="button button-secondary magnetic" release="windows">
              <Monitor size={18} /> Download Windows <ArrowDownToLine size={16} />
            </ReleaseDownload>
          </div>
          <p className="compatibility"><Check size={14} /> Android 10+ · Windows 10/11 · Wi-Fi alpha</p>
        </div>

        <div
          className="hero-visual"
          ref={heroVisual}
          onPointerMove={tiltHero}
          onPointerLeave={() => {
            heroVisual.current?.style.setProperty("--tilt-x", "0deg");
            heroVisual.current?.style.setProperty("--tilt-y", "0deg");
          }}
          data-reveal
        >
          <div className="signal-orbit orbit-one" />
          <div className="signal-orbit orbit-two" />
          <Image src="/images/hero-ecosystem.png" alt="Phone, laptop, and desktop display connected by a mint stream" width={1536} height={1024} priority />
          <div className="floating-stat stat-top"><span>LOCAL</span><strong>Direct link</strong></div>
          <div className="floating-stat stat-bottom"><span>PREVIEW</span><strong>Live stream</strong></div>
        </div>
      </section>

      <section className="signal-strip" aria-label="EasyStream priorities">
        <div className="signal-track">
          <span>Local connection</span><i />
          <span>Native portrait</span><i />
          <span>Adaptive quality</span><i />
          <span>Live diagnostics</span><i />
          <span>Local connection</span><i />
          <span>Native portrait</span>
        </div>
      </section>

      <section className="section shell" id="experience">
        <div className="section-heading" data-reveal>
          <div>
            <p className="kicker">Built around the signal</p>
            <h2>Less friction.<br />More presence.</h2>
          </div>
          <p>Connect both devices to the same network, choose your receiver, and start the live view. The interface stays out of the way.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card feature-wide" data-reveal>
            <div className="feature-icon"><Wifi size={22} /></div>
            <span className="card-number">01</span>
            <h3>Direct on your network</h3>
            <p>Automatic receiver discovery keeps setup short. Your stream travels over the local connection—not through a distant cloud.</p>
            <div className="connection-demo" aria-hidden="true">
              <span className="demo-device"><Smartphone size={22} /></span>
              <span className="demo-line"><i /></span>
              <span className="demo-device active"><Monitor size={24} /></span>
            </div>
          </article>
          <article className="feature-card" data-reveal>
            <div className="feature-icon"><Gauge size={22} /></div>
            <span className="card-number">02</span>
            <h3>Quality you can see</h3>
            <p>Native phone proportions and selectable quality modes make the most of the current Wi-Fi alpha.</p>
            <div className="meter"><span style={{ width: "86%" }} /></div>
          </article>
          <article className="feature-card" data-reveal>
            <div className="feature-icon"><Volume2 size={22} /></div>
            <span className="card-number">03</span>
            <h3>Audio is next</h3>
            <p>Low-delay app audio is on the roadmap. The downloadable alpha currently focuses on live video.</p>
            <span className="micro-label">In development</span>
          </article>
        </div>
      </section>

      <section className="section app-showcase" id="apps">
        <div className="shell">
          <div className="section-heading compact" data-reveal>
            <div>
              <p className="kicker">The actual alpha interface</p>
              <h2>Two apps. One calm workflow.</h2>
            </div>
            <p>These interface frames reflect the current Android controller and Windows receiver, so you know what to expect before installing.</p>
          </div>

          <div className="frames-grid">
            <article className="app-frame mobile-frame" data-reveal>
              <div className="frame-bar">
                <span><Smartphone size={15} /> Android controller</span>
                <span className="frame-tag">ALPHA</span>
              </div>
              <div className="mobile-ui">
                <div className="mobile-brand"><span className="brand-mark small"><Radio size={14} /></span> EasyStream</div>
                <p className="ui-kicker">READY WHEN YOU ARE</p>
                <h3>Your phone.<br /><span>On the big screen.</span></h3>
                <div className="ui-tabs"><span className="selected"><Wifi size={14} /> Wi-Fi</span><span><Usb size={14} /> USB</span></div>
                <div className="receiver-card">
                  <span className="receiver-icon"><Monitor size={19} /></span>
                  <span><small>AVAILABLE RECEIVER</small><strong>Studio PC</strong><em>192.168.1.24</em></span>
                  <i />
                </div>
                <button type="button" tabIndex={-1}>Start mirroring <ArrowRight size={15} /></button>
              </div>
            </article>

            <article className="app-frame desktop-frame" data-reveal>
              <div className="frame-bar">
                <span><Monitor size={15} /> Windows receiver</span>
                <span className="window-controls">—　□　×</span>
              </div>
              <div className="desktop-ui">
                <aside>
                  <div className="desktop-logo"><span className="brand-mark small"><Radio size={14} /></span> EasyStream</div>
                  <span className="active"><Radio size={15} /> Receiver</span>
                  <span><Gauge size={15} /> Performance</span>
                  <span><ShieldCheck size={15} /> Privacy</span>
                  <small>ALPHA 0.1.0</small>
                </aside>
                <div className="receiver-view">
                  <div className="live-chip"><i /> READY</div>
                  <div className="phone-canvas">
                    <span className="canvas-pulse"><Radio size={27} /></span>
                    <strong>Waiting for your phone</strong>
                    <small>Open EasyStream on Android<br />and select this PC</small>
                  </div>
                  <div className="metric-row">
                    <span><small>STATUS</small><strong>Listening</strong></span>
                    <span><small>CONNECTION</small><strong>Local Wi-Fi</strong></span>
                    <span><small>PORT</small><strong>27183</strong></span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell visual-section">
        <div className="visual-image" data-reveal>
          <Image src="/images/mirroring-pair.png" alt="Matching content shown on a phone and desktop monitor" width={1536} height={1024} />
          <div className="corner-label"><span>SYNCED VIEW</span><strong>One image, two screens</strong></div>
        </div>
        <div className="visual-copy" data-reveal>
          <p className="kicker">Designed for fidelity</p>
          <h2>Your screen should still feel like your screen.</h2>
          <p>EasyStream preserves your phone’s shape and prioritizes a responsive local video path. This alpha is the foundation for the higher-refresh, low-delay experience ahead.</p>
          <ul>
            <li><span><Check size={15} /></span> Original portrait or landscape proportions</li>
            <li><span><Check size={15} /></span> Hardware video decoding on the receiver</li>
            <li><span><Check size={15} /></span> Live bitrate and connection feedback</li>
          </ul>
          <a className="text-link" href="#download">Get the test build <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="section download-section" id="download">
        <div className="shell">
          <div className="download-heading" data-reveal>
            <p className="kicker">Download alpha 0.1</p>
            <h2>Start on both screens.</h2>
            <p>Install the Android companion first, then extract and open the Windows receiver. Keep both devices on the same Wi-Fi network.</p>
          </div>
          <div className="download-grid">
            <article className="download-card" data-reveal>
              <span className="platform-icon"><Smartphone size={28} /></span>
              <div><span className="platform">ANDROID</span><h3>EasyStream Mobile</h3></div>
              <p>APK · Android 10 or newer<br />97.4 MB · Version 0.1.0</p>
              <ReleaseDownload className="button button-primary magnetic" release="android">
                Download APK <ArrowDownToLine size={17} />
              </ReleaseDownload>
            </article>
            <article className="download-card" data-reveal>
              <span className="platform-icon"><Monitor size={28} /></span>
              <div><span className="platform">WINDOWS</span><h3>EasyStream Receiver</h3></div>
              <p>ZIP · Windows 10 or 11<br />151.3 MB · Version 0.1.0</p>
              <ReleaseDownload className="button button-primary magnetic" release="windows">
                Download for Windows <ArrowDownToLine size={17} />
              </ReleaseDownload>
            </article>
          </div>
          <div className="alpha-note" data-reveal>
            <ShieldCheck size={18} />
            <p><strong>Testing note.</strong> Windows may show an unrecognized-app warning because this early build is not code-signed. USB streaming and app-audio capture are not enabled in alpha 0.1.</p>
          </div>
        </div>
      </section>

      <section className="section shell stores" id="stores">
        <div className="section-heading compact" data-reveal>
          <div><p className="kicker">A wider release is on its way</p><h2>Coming to the stores.</h2></div>
          <p>Use the direct test downloads today. Polished store releases will follow after connection and playback testing.</p>
        </div>
        <div className="store-grid">
          <article className="store-card" data-reveal>
            <div className="store-logo-wrap"><Image src="/images/google-play.png" alt="Google Play logo" width={2682} height={3000} /></div>
            <div><span>COMING SOON</span><h3>Google Play</h3><p>Android release</p></div>
            <span className="soon-pill">Soon</span>
          </article>
          <article className="store-card" data-reveal>
            <div className="store-logo-wrap"><Image src="/images/app-store.png" alt="Apple App Store logo" width={700} height={394} /></div>
            <div><span>COMING SOON</span><h3>App Store</h3><p>iPhone &amp; iPad release</p></div>
            <span className="soon-pill">Soon</span>
          </article>
        </div>
      </section>

      <footer>
        <div className="shell footer-inner">
          <a className="brand" href="#top"><span className="brand-mark"><Radio size={18} /></span><span>EasyStream</span></a>
          <p>Phone-to-PC mirroring, made quiet and direct.</p>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
