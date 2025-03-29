document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = navLinksContainer.querySelectorAll('a');
    const body = document.body;
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    // --- Theme Toggler ---
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    body.dataset.theme = currentTheme;
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
        body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'; // Sun for dark, Moon for light
    }

     // Listen for OS theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        const osTheme = e.matches ? 'dark' : 'light';
        // Optional: uncomment below to automatically switch theme based on OS setting
        // if (!localStorage.getItem('theme')) { // Only if user hasn't manually set a theme
        //    body.dataset.theme = osTheme;
        //    updateThemeIcon(osTheme);
        // }
    });

    // --- Mobile Menu ---
    mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        navLinksContainer.classList.toggle('show');
        // Toggle icon between bars and times
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = navLinksContainer.classList.contains('show') ? 'fas fa-times' : 'fas fa-bars';
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('show')) {
                 mobileMenuBtn.setAttribute('aria-expanded', 'false');
                navLinksContainer.classList.remove('show');
                 mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
            }
        });
    });

     // --- Smooth Scrolling & Active Nav Link Highlighting ---
    const sections = document.querySelectorAll('main section[id]');

    // Function to update active link
    function updateActiveLink() {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Adjust threshold (e.g., 150px) as needed
            if (pageYOffset >= sectionTop - 150 && pageYOffset < sectionTop + sectionHeight - 150) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

     // Initial call and on scroll
    updateActiveLink();
    window.addEventListener('scroll', updateActiveLink);


    // --- Testimonials Slider (if section exists) ---
    const testimonialsSection = document.getElementById('testimonials');
    if (testimonialsSection) {
        const slider = testimonialsSection.querySelector('.testimonial-wrapper');
        const testimonials = testimonialsSection.querySelectorAll('.testimonial');
        const dotsContainer = testimonialsSection.querySelector('.slider-dots');
        let testimonialIndex = 0;
        let testimonialInterval;

        // Create dots
        testimonials.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
             dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                showTestimonial(index);
                resetInterval();
            });
            dotsContainer.appendChild(dot);
        });
        const dots = dotsContainer.querySelectorAll('.dot');

        function showTestimonial(index) {
            testimonialIndex = index;
            slider.style.transform = `translateX(-${testimonialIndex * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === testimonialIndex);
                 dot.setAttribute('aria-current', i === testimonialIndex ? 'true' : 'false');
            });
        }

        function nextTestimonial() {
            testimonialIndex = (testimonialIndex + 1) % testimonials.length;
            showTestimonial(testimonialIndex);
        }

        function startInterval() {
             clearInterval(testimonialInterval); // Clear existing interval before starting new one
             testimonialInterval = setInterval(nextTestimonial, 6000); // Rotate every 6 seconds
        }
        function resetInterval() {
            startInterval(); // Reset timer on manual navigation
        }

        // Initialize
        showTestimonial(0);
        startInterval(); // Start auto-rotation
    }


    // --- Project Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            projectCards.forEach(card => {
                 const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
                const shouldShow = filter === 'all' || categories.includes(filter);

                // Use classes for show/hide for potential animation
                if (shouldShow) {
                    card.style.display = 'flex'; // Or 'block' or 'grid' depending on card type
                    card.hidden = false;
                } else {
                    card.style.display = 'none';
                     card.hidden = true;
                }
            });
        });
    });

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = 'Sending...';
            formStatus.className = ''; // Reset classes

            const formData = new FormData(contactForm);
             // Use fetch to send data to your endpoint (e.g., Formspree)
             // Replace contactForm.action with your actual endpoint URL
             try {
                 const response = await fetch(contactForm.action, {
                     method: 'POST',
                     body: formData,
                     headers: {
                         'Accept': 'application/json'
                     }
                 });

                 if (response.ok) {
                     formStatus.textContent = 'Thank you for your message! I will get back to you soon.';
                     formStatus.classList.add('success');
                     contactForm.reset();
                 } else {
                     // Try to get error message from response if possible
                     const data = await response.json();
                     if (data.errors) {
                          formStatus.textContent = data.errors.map(error => error.message).join(", ");
                     } else {
                          formStatus.textContent = 'Oops! There was a problem submitting your form.';
                     }
                      formStatus.classList.add('error');
                 }
             } catch (error) {
                 formStatus.textContent = 'Oops! There was a network error. Please try again later.';
                 formStatus.classList.add('error');
             }

            // Simple alert fallback (remove if using fetch):
            // alert('Thank you for your message! I will get back to you soon.');
            // contactForm.reset();
            // formStatus.textContent = ''; // Clear status after alert
        });
    }


    // --- Animation on scroll (using Intersection Observer) ---
    const animatedElements = document.querySelectorAll('.animate');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Optional: stop observing once animated
                }
            });
        }, {
            rootMargin: '0px', // Adjust as needed
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers (less performant)
        function checkVisibility() {
            const windowHeight = window.innerHeight;
            animatedElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                 if (elementTop < windowHeight - 50) { // Adjust offset
                    element.classList.add('is-visible');
                }
            });
        }
        checkVisibility();
        window.addEventListener('scroll', checkVisibility);
        window.addEventListener('resize', checkVisibility);
    }

}); // End DOMContentLoaded