class Auth {
    constructor() {
        try {
            const storedUsers = localStorage.getItem('users');
            // S'assurer que this.users est toujours un tableau
            this.users = storedUsers ? JSON.parse(storedUsers) : [];
            if (!Array.isArray(this.users)) this.users = [];

            // Ajouter un utilisateur admin par défaut si aucun utilisateur n'existe
            if (this.users.length === 0) {
                this.users.push({
                    id: Date.now().toString(),
                    email: 'admin@123.com',
                    password: this.hashPassword('123'),
                    name: 'Admin',
                    createdAt: new Date().toISOString(),
                    isActive: true,
                    lastLogin: new Date().toISOString()
                });
                localStorage.setItem('users', JSON.stringify(this.users));
                console.log('Admin user added by default');
            }

            this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
            console.log('Auth initialized with users:', this.users);
        } catch (error) {
            console.error('Error initializing Auth:', error);
            this.users = [];
            this.currentUser = null;
            localStorage.setItem('users', JSON.stringify([]));
        }
    }

    register(email, password, name) {
        // Validation des entrées
        if (!email || !password || !name) {
            throw new Error('Tous les champs sont requis');
        }

        // Vérification de l'email avec find au lieu de some
        const existingUser = this.users.find(user => user.email === email);
        if (existingUser) {
            throw new Error('Cet email est déjà utilisé');
        }

        // Création du nouvel utilisateur avec statut actif
        const newUser = {
            id: Date.now().toString(),
            email,
            password: this.hashPassword(password),
            name,
            createdAt: new Date().toISOString(),
            isActive: true,
            lastLogin: new Date().toISOString()
        };

        try {
            // Ajout de l'utilisateur et mise à jour du localStorage
            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));
            console.log('User registered successfully:', newUser);
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error('Erreur lors de la création du compte');
        }
    }

    login(email, password) {
        console.log('Login attempt:', email);

        // Vérifier que this.users est un tableau
        if (!Array.isArray(this.users)) {
            console.error('Users array is invalid');
            throw new Error('Erreur système');
        }

        // Rechercher l'utilisateur
        const user = this.users.find(u => u && u.email === email);
        console.log('Found user:', user);

        if (!user) {
            throw new Error('Identifiants incorrects');
        }

        // Vérifier le mot de passe
        if (user.password !== this.hashPassword(password)) {
            throw new Error('Identifiants incorrects');
        }

        // Mise à jour du statut et de la dernière connexion
        const userIndex = this.users.findIndex(u => u.email === email);
        this.users[userIndex].isActive = true;
        this.users[userIndex].lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(this.users));

        // Créer la session utilisateur
        const sessionUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            isActive: true,
            lastLogin: new Date().toISOString()
        };

        this.currentUser = sessionUser;
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        console.log('Login successful:', sessionUser);

        // Redirection vers la page admin si les identifiants sont ceux de l'admin
        if (email === 'admin@123.com' && password === '123') {
            window.location.href = 'admin.html';
        }

        return sessionUser;
    }

    logout() {
        // Mettre à jour le statut lors de la déconnexion
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const userIndex = this.users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex].isActive = false;
                localStorage.setItem('users', JSON.stringify(this.users));
            }
        }
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    hashPassword(password) {
        return btoa(password + "salt_for_security");
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Méthode utilitaire pour vérifier si un email existe
    emailExists(email) {
        return Array.isArray(this.users) &&
            this.users.some(user => user && user.email === email);
    }

    // Méthode de debug améliorée
    debug() {
        console.log('=== Auth Debug ===');
        console.log('Users array type:', Object.prototype.toString.call(this.users));
        console.log('Users content:', this.users);
        console.log('localStorage content:', {
            users: localStorage.getItem('users'),
            currentUser: localStorage.getItem('currentUser')
        });
    }
}

// Initialisation avec vérification immédiate
const auth = new Auth();
auth.debug();

// Test de validité
console.log('Users array is valid:', Array.isArray(auth.users));

// Vérifier le localStorage
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('LocalStorage is working');
} catch (e) {
    console.error('LocalStorage error:', e);
}
