document.addEventListener('DOMContentLoaded', () => {

    const splashScreen = document.getElementById('splash-screen');
    let landingShown = false;

    function showLanding() {
        if (landingShown) {
            return;
        }
        landingShown = true;

        document.body.classList.add('main-visible');
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
        revealSections();
    }

    // ── Splash screen: mostrar landing al terminar su animación CSS ──
    if (splashScreen) {
        splashScreen.addEventListener('animationend', showLanding, { once: true });
    }

    // Fallback por si el evento no dispara en algún navegador
    setTimeout(showLanding, 2500);

    // ── Fade-in por scroll con IntersectionObserver ──
    function revealSections() {
        const sections = document.querySelectorAll('.landing-section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        sections.forEach(section => observer.observe(section));
    }

    // ── Navegación suave ──
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const selector = link.getAttribute('href');
            if (!selector || selector === '#') {
                return;
            }
            const target = document.querySelector(selector);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── Modal: Ver Video Demo ──
    const btnVerDemo = document.getElementById('btn-ver-demo');
    const btnCerrarDemo = document.getElementById('btn-cerrar-demo');
    const videoModal = document.getElementById('video-demo-modal');
    const videoPlayer = document.getElementById('video-demo-player');

    function abrirVideoDemo() {
        if (!videoModal) {
            return;
        }
        videoModal.hidden = false;
        document.body.classList.add('modal-open');
        if (videoPlayer) {
            videoPlayer.currentTime = 0;
            videoPlayer.play().catch(() => {});
        }
    }

    function cerrarVideoDemo() {
        if (!videoModal) {
            return;
        }
        videoModal.hidden = true;
        document.body.classList.remove('modal-open');
        if (videoPlayer) {
            videoPlayer.pause();
        }
    }

    if (btnVerDemo) {
        btnVerDemo.addEventListener('click', abrirVideoDemo);
    }
    if (btnCerrarDemo) {
        btnCerrarDemo.addEventListener('click', cerrarVideoDemo);
    }
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                cerrarVideoDemo();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && !videoModal.hidden) {
            cerrarVideoDemo();
        }
    });
});
