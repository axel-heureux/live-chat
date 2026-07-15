# 🤝 Guide de Contribution - Live Chat

Merci de prendre le temps de contribuer à **Live Chat** ! Pour garantir la qualité du code et assurer une bonne coordination d'équipe (notamment avec les périodes d'alternance), nous appliquons des règles méthodologiques strictes que chaque collaborateur doit respecter.

---

## 👥 Rôles et Organisation de l'Équipe

Le projet est conçu pour être développé en équipe, avec des rôles transverses à s'attribuer :
* **Lead / Architecte :** Responsable du découpage des tâches, de l'architecture globale, de l'animation du board et garant des jalons de livraison.
* **Back temps réel :** Responsable du serveur Express, de l'implémentation de Socket.io (gestion du chat, de la présence) et du serveur de signalisation WebRTC.
* **Data & API :** Responsable de la mise en place et de la sécurité des modèles SQL, MongoDB, Redis, des endpoints REST et de l'authentification.
* **Front React & WebRTC :** Responsable de l'intégration UI/UX sur React, de la mise en place du client Socket.io, et de l'intégration de l'API native RTCPeerConnection (flux audio/vidéo).

---

## 🛠️ Méthode de Travail Obligatoire

### 1. Board Agile
* Toutes les tâches doivent être répertoriées sur notre **Board Kanban (GitHub Projects)**.
* Chaque tâche doit être reliée à une fonctionnalité claire du cahier des charges.
* Le board doit être tenu à jour quotidiennement (colonnes : *Backlog, To Do, In Progress, Review, Done*).

### 2. Daily Asynchrone Écrit
Pour rester synchronisés, en particulier pendant les périodes d'alternance des membres de l'équipe, un **Daily écrit** est requis chaque jour de travail dans le salon Discord ou l'Issue GitHub dédiée :
* **Fait :** Ce qui a été réalisé la veille.
* **À faire :** Ce qui est prévu aujourd'hui.
* **Bloquages :** Les points durs ou dépendances techniques.

---