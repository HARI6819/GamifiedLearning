import { useEffect } from 'react';

/**
 * Custom hook to:
 * 1. Add 'visible' class to elements with 'reveal' class when they enter viewport.
 * 2. Track scroll position as --scroll-y CSS variable on :root for parallax effects.
 */
const useScrollAnimation = () => {
    useEffect(() => {
        // ---- IntersectionObserver for reveal animations ----
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const revealSelector = '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-zoom';
        const revealElements = document.querySelectorAll(revealSelector);
        revealElements.forEach((el) => observer.observe(el));

        // ---- MutationObserver to catch elements rendered after data loading ----
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if (node.matches && node.matches(revealSelector)) {
                            observer.observe(node);
                        }
                        if (node.querySelectorAll) {
                            const children = node.querySelectorAll(revealSelector);
                            children.forEach((el) => observer.observe(el));
                        }
                    }
                });
            });
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        // ---- Parallax scroll tracker via requestAnimationFrame ----
        let rafId = null;
        let lastScrollY = window.scrollY;

        const updateScrollY = () => {
            const scrollY = window.scrollY;
            if (scrollY !== lastScrollY) {
                document.documentElement.style.setProperty('--scroll-y', scrollY);
                lastScrollY = scrollY;
            }
            rafId = requestAnimationFrame(updateScrollY);
        };

        rafId = requestAnimationFrame(updateScrollY);
        // Set initial value immediately
        document.documentElement.style.setProperty('--scroll-y', window.scrollY);

        return () => {
            revealElements.forEach((el) => observer.unobserve(el));
            mutationObserver.disconnect();
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);
};

export default useScrollAnimation;
