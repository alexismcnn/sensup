document.addEventListener('DOMContentLoaded', () => {
    // Gestion de la navbar
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
            navbar.style.background = currentScroll > 50 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)';
        }
        lastScroll = currentScroll;
    });

    // Animation des éléments au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe tous les éléments qui doivent être animés
    document.querySelectorAll('.service-card, .team-card').forEach(el => {
        el.classList.remove('visible'); // Reset initial state
        observer.observe(el);
    });

    // Animation des cartes service au hover
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            card.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', (e) => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Gestion du formulaire de contact
    const form = document.querySelector('#contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;

            try {
                submitBtn.innerHTML = 'Envoi en cours... <i class="fas fa-spinner fa-spin"></i>';

                // Simuler l'envoi
                await new Promise(resolve => setTimeout(resolve, 1500));

                showNotification('Message envoyé avec succès!', 'success');
                form.reset();
            } catch (error) {
                showNotification('Erreur lors de l\'envoi', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Système de notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Smooth scroll pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
