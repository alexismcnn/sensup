document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des éléments
    const usersList = document.getElementById('usersList');
    const totalUsersEl = document.getElementById('totalUsers');
    const newUsersEl = document.getElementById('newUsers');
    const activeUsersEl = document.getElementById('activeUsers');
    const lastRegistrationEl = document.getElementById('lastRegistration');
    const userSearch = document.getElementById('userSearch');
    const filterStatus = document.getElementById('filterStatus');
    const exportBtn = document.getElementById('exportUsers');
    const exportReportBtn = document.getElementById('exportMonthlyReport');

    // Fonction pour mettre à jour les statistiques
    function updateStats() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Total des utilisateurs
        totalUsersEl.textContent = users.length;

        // Nouveaux utilisateurs sur 7 jours
        const newUsers = users.filter(user =>
            new Date(user.createdAt) > sevenDaysAgo
        ).length;
        newUsersEl.textContent = newUsers;

        // Utilisateurs actifs aujourd'hui (connexion aujourd'hui)
        const todayActiveUsers = users.filter(user => {
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).getTime() : 0;
            return lastLogin >= startOfToday;
        }).length;
        activeUsersEl.textContent = todayActiveUsers;

        // Dernier utilisateur inscrit
        if (users.length > 0) {
            const lastUser = users.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            lastRegistrationEl.textContent = new Date(lastUser.createdAt)
                .toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        }

        // Ajouter le calcul de la progression mensuelle
        calculateMonthlyGrowth(users);

        // Mise à jour du graphique
        updateChart(users);
    }

    // Fonction pour mettre à jour le graphique
    function updateChart(users) {
        const ctx = document.getElementById('usersChart').getContext('2d');
        const dates = getLast7Days();
        const userData = dates.map(date => ({
            date: date,
            count: users.filter(user =>
                new Date(user.createdAt).toDateString() === date.toDateString()
            ).length
        }));

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => date.toLocaleDateString('fr-FR')),
                datasets: [{
                    label: 'Nouveaux utilisateurs',
                    data: userData.map(data => data.count),
                    borderColor: '#00B894',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // Fonction pour obtenir les 7 derniers jours
    function getLast7Days() {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date;
        }).reverse();
    }

    // Fonction pour exporter les données
    exportBtn.addEventListener('click', () => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Nom,Email,Date d'inscription\n"
            + users.map(user =>
                `${user.id},${user.name},${user.email},${user.createdAt}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Fonction pour afficher les utilisateurs dans le tableau
    function displayUsers(users) {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = users.map(user => `
            <tr>
                <td>${user.id.slice(0, 8)}...</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                <td>
                    <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                        ${user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <button onclick="viewUserDetails('${user.id}')" class="action-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteUser('${user.id}')" class="action-btn delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Fonction de recherche utilisateur
    function searchUsers(query) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
        displayUsers(filtered);
    }

    // Fonction de filtrage par statut
    function filterByStatus(status) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (status === 'all') {
            displayUsers(users);
            return;
        }
        const filtered = users.filter(user =>
            status === 'active' ? user.isActive : !user.isActive
        );
        displayUsers(filtered);
    }

    // Event listeners
    userSearch.addEventListener('input', (e) => searchUsers(e.target.value));
    filterStatus.addEventListener('change', (e) => filterByStatus(e.target.value));

    // Mise à jour initiale des données
    function updateAllData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        displayUsers(users);
        updateStats();
    }

    // Rafraîchir les données toutes les 30 secondes
    setInterval(updateAllData, 30000);

    // Chargement initial
    updateAllData();

    // Ajouter l'event listener pour le bouton de rapport
    exportReportBtn.addEventListener('click', () => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        generateMonthlyReport(users);
    });
});

// Fonction pour voir les détails d'un utilisateur
function viewUserDetails(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`
            Détails de l'utilisateur:
            ID: ${user.id}
            Nom: ${user.name}
            Email: ${user.email}
            Créé le: ${new Date(user.createdAt).toLocaleString('fr-FR')}
            Dernière connexion: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
            Statut: ${user.isActive ? 'Actif' : 'Inactif'}
        `);
    }
}

// Fonction pour supprimer un utilisateur
function deleteUser(userId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        location.reload(); // Rafraîchir la page
    }
}

// Fonction pour calculer la progression mensuelle (1 utilisateur = 1%)
function calculateMonthlyGrowth(users) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    const currentMonthUsers = users.filter(user => new Date(user.createdAt) >= oneMonthAgo).length;
    const previousMonthUsers = users.filter(user => {
        const date = new Date(user.createdAt);
        return date >= twoMonthsAgo && date < oneMonthAgo;
    }).length;

    // Nouveau calcul : 1 utilisateur = 1%
    const growthPercent = currentMonthUsers;

    const usersTrendEl = document.getElementById('usersTrend');
    if (usersTrendEl) {
        usersTrendEl.innerHTML = `
            <i class="fas fa-arrow-${growthPercent > 0 ? 'up' : 'down'}"></i>
            ${growthPercent > 0 ? '+' : ''}${growthPercent}%
        `;
        usersTrendEl.className = `stat-trend ${growthPercent > 0 ? 'up' : 'down'}`;
    }
}

// Fonction pour générer le rapport mensuel
function generateMonthlyReport(users) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const monthlyUsers = users.filter(user => new Date(user.createdAt) >= oneMonthAgo);
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;

    const report = `RAPPORT MENSUEL - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
    
=== STATISTIQUES GÉNÉRALES ===
Nombre total d'utilisateurs: ${totalUsers}
Nouveaux utilisateurs ce mois: ${monthlyUsers.length}
Utilisateurs actifs: ${activeUsers}
Taux de croissance: ${monthlyUsers.length}%

=== DÉTAILS DES NOUVEAUX UTILISATEURS ===
${monthlyUsers.map(user => `
- ${user.name} (${user.email})
  Inscrit le: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}
  Statut: ${user.isActive ? 'Actif' : 'Inactif'}
`).join('\n')}
    `;

    // Créer et télécharger le fichier
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_mensuel_${new Date().toISOString().slice(0, 7)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
