
import { useEffect, useRef } from 'react';
import './HeroPage.css'
import { Gamepad2, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router';
import { useLanguage } from './context/LanguageContext';
import useScrollAnimation from './hooks/useScrollAnimation';


/* ── Particle Canvas ───────────────────────────────────────── */
function ParticleCanvas() {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: -9999, y: -9999 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animId;
        const SYMBOLS = ['⚖️', '📜', '🏛️', '🇮🇳', '⚡'];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const onMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);

        // Create particles
        const count = 100;
        const particles = Array.from({ length: count }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2.5 + 1,
            alpha: Math.random() * 0.5 + 0.2,
            symbol: i < 10 ? SYMBOLS[i % SYMBOLS.length] : null,
            symbolSize: Math.random() * 8 + 10,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mx = mouse.current.x;
            const my = mouse.current.y;
            const REPEL = 100;
            const isDark = document.documentElement.classList.contains('dark');
            const dotColor = isDark ? '180,210,255' : '30,58,138';
            const lineColor = isDark ? '180,210,255' : '30,58,138';

            particles.forEach(p => {
                // Mouse repulsion
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < REPEL) {
                    const force = (REPEL - dist) / REPEL;
                    p.vx += (dx / dist) * force * 0.3;
                    p.vy += (dy / dist) * force * 0.3;
                }

                // Damping
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Speed cap
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 2) { p.vx = (p.vx / speed) * 2; p.vy = (p.vy / speed) * 2; }

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw
                if (p.symbol) {
                    ctx.globalAlpha = p.alpha;
                    ctx.font = `${p.symbolSize}px serif`;
                    ctx.fillText(p.symbol, p.x, p.y);
                    ctx.globalAlpha = 1;
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${dotColor},${p.alpha})`;
                    ctx.fill();
                }
            });

            // Draw connection lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${lineColor},${0.15 * (1 - d / 120)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    return <canvas ref={canvasRef} className="hero-particles" />;
}




/* ── Main Component ────────────────────────────────────────── */
function HeroPage() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    function handleExplore() {
        navigate('/learn');
    }

    function handleStartPlaying() {
        navigate('/games');
    }

    useScrollAnimation();

    return (
        <section className="hero">
            {/* Particle background */}
            <ParticleCanvas />

            <div className="hero-content">
                {/* Badge */}
                <div className="hero-badge reveal stagger-1">
                    <p>🇮🇳</p>
                    <span>{t.home.heroBadge}</span>
                </div>

                {/* Heading */}
                <h1 className="hero-title reveal stagger-2">
                    <span className="title-primary">{t.home.heroTitle1}</span>
                    <br />
                    <span className="title-secondary">{t.home.heroTitle2}</span>
                </h1>

                {/* Hindi subtitle */}
                <p className="hero-hindi reveal stagger-3">{t.home.heroSubtitle}</p>

                {/* Description */}
                <p className="hero-desc reveal stagger-4">{t.home.heroDesc}</p>

                {/* Buttons */}
                <div className="hero-buttons reveal stagger-5">
                    <button className="btn-primary" onClick={handleStartPlaying}>
                        <Gamepad2 size={20} />
                        {t.home.startPlaying}
                        <ArrowRight size={20} />
                    </button>

                    <button className="btn-outline" onClick={handleExplore}>
                        <BookOpen size={20} />
                        {t.home.exploreArticles}
                    </button>
                </div>

                {/* Stats */}
                <div className="hero-stats reveal stagger-6">
                    <Stat number="3" label={t.home.stats.organs} c="color1" />
                    <Stat number="20+" label={t.home.stats.articles} c="color2" />
                    <Stat number="4" label={t.home.stats.modes} c="color3" />
                </div>
            </div>

            {/* Floating icons — different parallax speeds for depth */}
            <Floating icon="📜" className="float-left parallax-float-slow" />
            <Floating icon="⚖️" className="float-right parallax-float-fast" />
            <Floating icon="🏛️" className="float-bottom parallax-float-mid" />

        </section>
    )

};


/* Small components */
const Stat = ({ number, label, c }) => (
    <div className={`stat ${c}`}>
        <h3>{number}</h3>
        <p>{label}</p>
    </div>
);

const Floating = ({ icon, className }) => (
    <div className={`floating ${className}`}>{icon}</div>
);



export default HeroPage

