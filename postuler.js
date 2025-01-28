document.addEventListener('DOMContentLoaded', () => {
    // Gestion du formulaire de candidature
    const form = document.getElementById('jobApplicationForm');
    const fileInput = document.getElementById('cv');
    const fileName = document.getElementById('fileName');

    // Afficher le nom du fichier sélectionné
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileName.textContent = e.target.files[0].name;
        }
    });

    // Scroll vers le formulaire avec le poste présélectionné
    window.scrollToForm = (position) => {
        const select = document.getElementById('jobPosition');
        select.value = position;
        document.getElementById('application-form').scrollIntoView({ behavior: 'smooth' });
    };

    // Soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            
            // Simulation d'envoi (à remplacer par votre logique d'envoi réelle)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Notification de succès
            alert('Votre candidature a été envoyée avec succès !');
            form.reset();
            fileName.textContent = '';
            
        } catch (error) {
            alert('Une erreur est survenue lors de l\'envoi de votre candidature.');
        } finally {
            submitBtn.innerHTML = originalText;
        }
    });
});
