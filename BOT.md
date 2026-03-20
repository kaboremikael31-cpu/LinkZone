# LinkFeed - Réseau social de partage de liens

## Fonctionnalités
- Création automatique de compte à l'arrivée
- Publication de contenu avec lien obligatoire, hashtags et description
- Aperçu des liens (métadonnées)
- Système de likes, commentaires, favoris, partages
- Abonnements et fil d'actualité
- Messagerie privée
- Chat IA avec badge certifié (via Groq)
- Signalement : suppression automatique après 10 signalements
- Système de pièces basé sur les likes reçus
- Certification bleue pour les comptes avec +500 abonnés
- Thème noir/blanc, interface épurée

## Installation
1. Cloner le dépôt
2. Backend : `cd backend && npm install && node server.js`
3. Frontend : `cd frontend && npm install && npm run dev`
4. Configurer la clé Groq dans `.env`

## Technologies
- Backend : Node.js, Express, SQLite
- Frontend : React, Vite, Axios
- API IA : Groq (Mixtral)