# Diagramme de Gantt pour Notion

Cette application permet d'afficher un diagramme de Gantt interactif à partir de données stockées dans Notion. Vous pouvez facilement intégrer ce diagramme dans une page Notion pour partager l'avancement du projet avec vos clients.

## Fonctionnalités

- Affichage des tâches regroupées par phase
- Code couleur par statut (Terminé, En cours, Pas commencé)
- Visualisation chronologique claire
- Affichage des responsables et des durées
- Mise à jour automatique depuis Notion (via API)

## Installation et configuration

### Prérequis

- Un compte Vercel
- Un compte Notion avec une base de données de tâches

### Étapes de déploiement

1. Clonez ce repository
2. Déployez sur Vercel en connectant votre compte GitHub
3. Configurez les variables d'environnement dans Vercel :
   - `NOTION_API_KEY` : votre clé d'API Notion
   - `NOTION_DATABASE_ID` : l'ID de votre base de données Notion

### Configuration de l'API Notion

1. Créez une intégration sur [Notion Developers](https://www.notion.so/my-integrations)
2. Récupérez votre clé d'API
3. Partagez votre base de données avec cette intégration
4. Copiez l'ID de la base de données (depuis l'URL de la page)

## Structure de la base de données Notion

Votre base de données Notion doit contenir les colonnes suivantes :

- **Nom** (Titre) : Le nom de la tâche
- **Statut** (Select) : L'état de la tâche (Terminé, En cours, Pas commencé)
- **Date** (Date) : La période de la tâche (avec date de début et de fin)
- **Temps vendus en jours** (Nombre) : Optionnel, pour le suivi du temps
- **Responsable** (Personne) : La personne responsable de la tâche

## Intégration dans Notion

Une fois l'application déployée, vous pouvez l'intégrer dans Notion en suivant ces étapes :

1. Ouvrez votre page Notion
2. Tapez `/embed` et sélectionnez "Embed"
3. Collez l'URL de votre application déployée sur Vercel
4. Ajustez la taille de l'iframe selon vos besoins

## Mode de fonctionnement

L'application fonctionne en deux modes :

1. **Mode API** (par défaut) : 
   - Récupère les données directement depuis votre base Notion via l'API
   - Garantit que les informations sont toujours à jour
   - Nécessite la configuration des variables d'environnement

2. **Mode CSV intégré** (pour tests) :
   - Utilise un CSV statique intégré dans le code
   - Utile pour les tests ou si vous ne pouvez pas configurer l'API
   - Pour utiliser ce mode, modifiez le fichier `components/GanttChart.jsx`

## Personnalisation

Vous pouvez personnaliser l'application selon vos besoins :

- Modifier les couleurs dans le fichier `components/GanttChart.jsx`
- Ajouter des filtres ou des options de tri
- Adapter les mots-clés pour la catégorisation des phases

## Support

Si vous rencontrez des problèmes ou avez des questions, n'hésitez pas à ouvrir une issue sur GitHub.

---

Développé avec ❤️ pour le projet Pasteur
