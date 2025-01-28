document.addEventListener('DOMContentLoaded', () => {
    console.log('Page admin chargée');
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const accountsList = document.getElementById('accountsList');
    const totalAccountsEl = document.getElementById('totalAccounts');
    const lastCreatedEl = document.getElementById('lastCreated');

    // Fonction pour mettre à jour l'affichage des comptes
    function updateAccountsDisplay(accounts = []) {
        accountsList.innerHTML = accounts.map(user => `
            <tr>
                <td>${user.id.slice(0, 8)}...</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn" onclick="viewDetails('${user.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteAccount('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Mise à jour des statistiques
        totalAccountsEl.textContent = accounts.length;
        if (accounts.length > 0) {
            const lastUser = accounts.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt))[0];
            lastCreatedEl.textContent = new Date(lastUser.createdAt)
                .toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        }
    }

    // Fonction pour rafraîchir la liste
    function refreshList() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('Utilisateurs chargés:', users);
        updateAccountsDisplay(users);
        updateUserCount(); // Mettre à jour le nombre d'utilisateurs
    }

    // Fonction de recherche
    function searchAccounts(query) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
        updateAccountsDisplay(filtered);
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => searchAccounts(e.target.value));
    refreshBtn.addEventListener('click', refreshList);

    // Chargement initial
    refreshList();
    updateUserCount(); // Mettre à jour le nombre d'utilisateurs
});

/* Optional: Toggle Sidebar for Mobile */
const toggleSidebar = () => {
    const sidebar = document.querySelector('.admin-sidebar');
    const content = document.querySelector('.admin-content');
    sidebar.classList.toggle('active');
    content.classList.toggle('active');
};

/* Example: Add a toggle button in the future */
/*
document.querySelector('.toggle-btn').addEventListener('click', toggleSidebar);
*/

// Fonction pour voir les détails d'un compte
function viewDetails(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`
            Détails du compte:
            ID: ${user.id}
            Nom: ${user.name}
            Email: ${user.email}
            Créé le: ${new Date(user.createdAt).toLocaleString()}
        `);
    }
}

// Fonction pour supprimer un compte
function deleteAccount(userId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        location.reload(); // Rafraîchir la page
    }
}

// Fonction pour mettre à jour le nombre d'utilisateurs dans la sidebar
function updateUserCount() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userCountEl = document.getElementById('userCount');
    if (userCountEl) {
        userCountEl.textContent = users.length;
    }
}
