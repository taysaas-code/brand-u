# Brand'U - Designer IA Personnel

Une application SaaS qui utilise l'IA pour créer des visuels professionnels alignés avec votre identité de marque.

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd brand-u
npm install
```

### 2. Configuration Supabase

#### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé anonyme dans Settings > API

#### Configuration OAuth Google
1. Dans le dashboard Supabase, allez dans Authentication > Providers
2. Activez Google OAuth
3. Créez un projet Google Cloud Console :
   - Allez sur [console.cloud.google.com](https://console.cloud.google.com)
   - Créez un nouveau projet ou sélectionnez-en un
   - Activez l'API Google+ 
   - Créez des identifiants OAuth 2.0
   - Ajoutez les URIs de redirection :
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (pour le développement)
4. Copiez le Client ID et Client Secret dans Supabase

### 3. Variables d'environnement

Copiez `.env.example` vers `.env` et remplissez les valeurs :

```bash
cp .env.example .env
```

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Brand'U
```

### 4. Démarrer l'application

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🔐 Fonctionnalités d'authentification

### ✅ Implémentées
- **Inscription/Connexion** avec email/mot de passe
- **OAuth Google** (connexion en un clic)
- **Réinitialisation de mot de passe** par email
- **Vérification d'email** automatique
- **Protection des routes** privées
- **Gestion des sessions** sécurisée
- **Messages d'erreur** UX-friendly
- **États de chargement** et validation

### 🔒 Sécurité
- **Hachage Argon2** des mots de passe (géré par Supabase)
- **JWT sécurisés** avec rotation automatique
- **Rate limiting** intégré (Supabase)
- **CORS** et **CSRF** protection
- **Validation** côté client et serveur
- **Sessions persistantes** sécurisées

## 📧 Configuration des emails

Supabase gère automatiquement l'envoi d'emails pour :
- Vérification d'email à l'inscription
- Réinitialisation de mot de passe
- Notifications de sécurité

Pour personnaliser les templates d'emails :
1. Allez dans Authentication > Email Templates dans Supabase
2. Personnalisez les templates selon vos besoins

## 🛡️ Routes protégées

Toutes les pages principales sont protégées :
- `/identitevisuelle` - Gestion des projets
- `/chat` - Chat avec l'IA
- `/ressources` - Ressources créatives
- `/mon-compte` - Profil utilisateur

Les utilisateurs non authentifiés sont automatiquement redirigés vers `/auth`.

## 🚀 Déploiement

### Variables d'environnement production
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_URL=https://your-domain.com
```

### Build de production
```bash
npm run build
npm run preview
```

## 🧪 Tests

Pour tester l'authentification :

1. **Inscription** : Créez un compte avec un email valide
2. **Vérification** : Vérifiez l'email reçu
3. **Connexion** : Connectez-vous avec vos identifiants
4. **Google OAuth** : Testez la connexion Google
5. **Reset password** : Testez la réinitialisation
6. **Protection** : Vérifiez que les pages privées sont protégées

## 📞 Support

Pour toute question sur l'authentification ou la configuration :
- Consultez la [documentation Supabase](https://supabase.com/docs/guides/auth)
- Vérifiez les logs dans le dashboard Supabase
- Consultez la console développeur pour les erreurs côté client

## 🔧 Dépannage

### Problèmes courants

**OAuth Google ne fonctionne pas :**
- Vérifiez que les URIs de redirection sont correctes
- Assurez-vous que l'API Google+ est activée
- Vérifiez les identifiants dans Supabase

**Emails non reçus :**
- Vérifiez les spams
- Configurez un domaine personnalisé dans Supabase
- Vérifiez les templates d'emails

**Erreurs de session :**
- Videz le localStorage/sessionStorage
- Vérifiez les variables d'environnement
- Redémarrez le serveur de développement