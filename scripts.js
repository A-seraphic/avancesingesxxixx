document.addEventListener('DOMContentLoaded', function() {

    // --- Existing Variables ---
    const menu = document.querySelector('.menu');
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.querySelector('.navbar');
    const body = document.body;

    // --- Mobile Menu Toggle ---
    function closeMobileMenu() {
         if (navbar && navbar.classList.contains('active')) { // Check if navbar exists
            navbar.classList.remove('active');
            if (menuToggle) { // Check if toggle exists
               menuToggle.setAttribute('aria-expanded', 'false');
            }
             // Re-enable scrolling when menu is closed
            body.style.overflow = '';
         }
    }

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click from immediately closing menu via document listener
            navbar.classList.toggle('active');
            const isExpanded = navbar.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);

             // Prevent body scrolling when mobile menu is open
             if (isExpanded) {
                 body.style.overflow = 'hidden';
             } else {
                 body.style.overflow = '';
             }
        });

        // Add listener to close menu when a nav link is clicked
        const navLinks = navbar.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

     // --- Close Mobile Menu on Outside Click or Escape Key ---
     document.addEventListener('click', function(event) {
        const isNavbarPresent = navbar != null;
        const isClickInsideNav = isNavbarPresent && navbar.contains(event.target);
        const isClickOnToggle = menuToggle != null && menuToggle.contains(event.target);

        if (isNavbarPresent && navbar.classList.contains('active') && !isClickInsideNav && !isClickOnToggle) {
            closeMobileMenu();
        }
    });

     document.addEventListener('keydown', function(event) {
         if (event.key === 'Escape' && navbar && navbar.classList.contains('active')) {
             closeMobileMenu();
         }
     });


    // --- Add Scrolled Class to Menu ---
    let lastScrollTop = 0;
     if (menu) {
        window.addEventListener('scroll', function() {
            // Check if menu still exists
            if (!menu) return;
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 50) {
                 menu.classList.add('scrolled');
            } else {
                menu.classList.remove('scrolled');
            }
             lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, { passive: true });
     }


    // --- MODAL LOGIC ---
    const modal = document.getElementById('details-modal');
    if (modal) {
        const modalTitle = document.getElementById('modal-title');
        const modalDescriptionContainer = document.getElementById('modal-content-area');
        const modalDescriptionP = document.getElementById('modal-description');
        const clickableCards = document.querySelectorAll('.clickable-card');
        const modalCloseBtns = modal.querySelectorAll('[data-micromodal-close]');

        let currentlyFocusedElement = null;

        function openModal(title, description) {
            if (!modalTitle || !modalDescriptionP) return;

            currentlyFocusedElement = document.activeElement;
            modalTitle.textContent = title;
            modalDescriptionP.textContent = description;
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            body.classList.add('modal-open');

             const firstFocusableElement = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
             if (firstFocusableElement) {
                 firstFocusableElement.focus();
             }
        }

        function closeModal() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            body.classList.remove('modal-open');
             if (currentlyFocusedElement) {
                currentlyFocusedElement.focus();
                 currentlyFocusedElement = null;
            }
        }

        clickableCards.forEach(card => {
            card.addEventListener('click', function() {
                const title = this.dataset.title || 'Detalles';
                const description = this.dataset.description || 'No hay información adicional disponible.';
                openModal(title, description);
            });

             if (card.tagName !== 'BUTTON' && card.tagName !== 'A' && !card.hasAttribute('tabindex')) {
                 card.setAttribute('role', 'button');
                 card.setAttribute('tabindex', '0');
             }

              card.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                     event.preventDefault();
                     const title = this.dataset.title || 'Detalles';
                     const description = this.dataset.description || 'No hay información adicional disponible.';
                     openModal(title, description);
                }
            });
        });

        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });

         modal.addEventListener('keydown', function(event) {
             if (event.key !== 'Tab' || !modal.classList.contains('is-open')) {
                 return;
            }
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
             const firstElement = focusableElements[0];
             const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey) {
                 if (document.activeElement === firstElement) {
                     lastElement.focus();
                     event.preventDefault();
                }
             } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
             }
        });
    } // End if(modal)



    // --- 1. Parallax Effect ---
    // Select the element for parallax. Using 'body' is simple,
    // but might be better to use a dedicated wrapper div if needed.
    const parallaxTarget = document.body;
    const parallaxIntensity = 0.1; // Keep it subtle

    function handleParallax() {
        // Only run if the target exists and has the necessary background image style set in CSS
        if (parallaxTarget && getComputedStyle(parallaxTarget).backgroundImage !== 'none') {
            const scrollY = window.pageYOffset;
            // Use backgroundPositionY for vertical parallax
            const bgPosY = -(scrollY * parallaxIntensity); // Move background up as user scrolls down
            parallaxTarget.style.backgroundPositionY = `${bgPosY}px`;
        }
    }

    // Add scroll listener for parallax *only* if the target element exists
    if (parallaxTarget) {
        window.addEventListener('scroll', handleParallax, { passive: true }); // Use passive listener
    }


    // --- 2. Scroll Animation (Fade/Slide-in for Timeline Items) ---
    const animatedItems = document.querySelectorAll('.timeline-item-animate');

    // Only run observer logic if animated items exist on the page
    if (animatedItems.length > 0) {
        const observerOptions = {
            root: null, // Use viewport as root
            rootMargin: '0px 0px -50px 0px', // Trigger a bit before it's fully in view
            threshold: 0.1 // Trigger when 10% of the item is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                // Check if the item is intersecting (visible)
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Stop observing once it becomes visible
                    observer.unobserve(entry.target);
                }
                // Optional: Remove class if it scrolls out of view (for re-animation)
                // else {
                //     entry.target.classList.remove('is-visible');
                // }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        animatedItems.forEach(item => observer.observe(item));
    }


    // --- 3. Particle Effect ---
    const particleContainer = document.getElementById('particle-container');

    // Only run particle logic if the container exists
    if (particleContainer) {
        const particleCount = 40; // Adjust number of particles
        const particles = [];

        function createParticle() {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 2.5 + 0.5; // Size between 0.5px and 3px
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            // Randomize animation delay/duration slightly for variation
            const duration = Math.random() * 3 + 3; // Duration between 3s and 6s
            particle.style.animation = `particle-fade ${duration}s infinite linear alternate`; // Use alternate to fade in/out
            particle.style.animationDelay = `${Math.random() * duration}s`; // Delay start
            particleContainer.appendChild(particle);
            particles.push(particle);
        }

        function initParticles() {
            // Clear existing particles if any (e.g., on resize or re-init)
            particleContainer.innerHTML = '';
            particles.length = 0; // Clear array

            for (let i = 0; i < particleCount; i++) {
                createParticle();
            }
            // Simple creation, no complex movement logic here
        }

        initParticles();

        // Optional: Recreate particles on resize if layout changes drastically
        // window.addEventListener('resize', debounce(initParticles, 250)); // Need a debounce function
    }
    // --- END OF NEW ENHANCEMENTS ---


}); // End DOMContentLoaded

