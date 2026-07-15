# 💬 Live Chat - Plateforme de Communication Unifiée

## 📖 Description du Projet
**Live Chat** est une application web de communication en temps réel conçue pour unifier les échanges au sein des entreprises (projet initialement pensé pour l'agence RetroComm). Inspirée de plateformes comme Discord, cette application centralise la messagerie instantanée, les appels audio/vidéo et le partage d'écran dans un seul et même outil hébergé en interne.

L'enjeu technique majeur de ce projet est la maîtrise de la double architecture temps réel : le transit des messages textes et de la signalisation via **WebSocket (Socket.io)** d'une part, et la transmission des flux médias audio/vidéo en pair-à-pair via **WebRTC** d'autre part.

## ✨ Fonctionnalités Principales

* **Organisation en Serveurs et Salons :**
  * Création de serveurs d'équipes et gestion des rôles (Admin / Membre).
  * Mise en place de salons thématiques textuels et vocaux.
* **Messagerie Instantanée (Temps Réel) :**
  * Discussions textuelles dans les salons ou en messages privés (DM) via WebSocket.
  * Historique des conversations persisté, indicateur de frappe, et statut de lecture.
* **Appels Audio, Vidéo et Partage d'écran (WebRTC) :**
  * Appels privés (1-to-1) et salons vocaux de groupe (architecture "mesh" jusqu'à 3 participants).
  * Contrôles médias (activer/couper micro et caméra) et partage d'écran.
* **Gestion de la Présence :**
  * Suivi en temps réel de l'état des utilisateurs (En ligne, Absent, Occupé, Hors ligne) mis à jour de manière instantanée.

## 🛠️ Stack Technique

Le projet repose sur une architecture moderne avec séparation claire du front, du back et d'une persistance polyglotte (SQL et NoSQL) :

### Frontend
* **Framework :** React (Vite)
* **State Management :** Context API ou Zustand
* **Temps Réel Client :** Socket.io-client & API WebRTC native

### Backend
* **Serveur :** Node.js avec Express
* **Temps Réel Serveur :** Socket.io (gestion des messages, de la présence et de la signalisation WebRTC)
* **Sécurité & Auth :** JWT (JSON Web Tokens) et bcrypt pour le hashage

### Bases de Données & Persistance
* **Bases de données SQL (PostgreSQL ou MySQL) avec Prisma (ORM) :** Pour les données structurées et relationnelles (Comptes utilisateurs, serveurs, salons, rôles).
* **Base documentaire (MongoDB) :** Pour gérer le gros volume de l'historique des messages, avec un schéma flexible.
* **Cache en mémoire (Redis) :** Pour les données éphémères ultra-rapides comme l'état de présence des utilisateurs et l'état des salons vocaux.

### DevOps & CI/CD
* **Conteneurisation :** Docker et Docker Compose (mono-repo regroupant le front, back, SQL, Mongo et Redis).
* **Intégration Continue :** GitHub Actions pour le linting et les tests automatisés.

## 🚀 Architecture Temps Réel
1. **WebSocket (Texte & Signalisation) :** Utilisé pour la communication client-serveur (connexion, envois de messages, indicateurs de frappe) et pour faire transiter les offres/réponses SDP et candidats ICE nécessaires au WebRTC.
2. **WebRTC (Flux Média) :** Les navigateurs s'échangent les flux audios et vidéos directement en Peer-to-Peer une fois la signalisation établie via le backend.