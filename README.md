# Companion IA Local (prototype)

Prototype d'application **Duolingo x Tamagotchi** : un compagnon qui évolue avec les apprentissages (chat, révisions, défis, ligues, cosmétiques).

## Ce qui a été nettoyé

- Structure front séparée en fichiers dédiés :
  - `index.html` (markup)
  - `styles.css` (styles)
  - `app.js` (logique)
- Paramètres consolidés pour l'IA locale et l'intégration Anki.

## Vision produit

- **Apprendre chaque jour** avec une boucle courte (question → correction → XP).
- **Créer de l'attachement** via un compagnon vivant (humeur, énergie, journal, personnalité).
- **Tourner en local** avec un petit modèle open source (<1B paramètres) pour préserver la confidentialité.

## Lancer le prototype

```bash
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Auth locale

Le prototype inclut maintenant un écran **connexion / création de compte** 100% local.
Les comptes sont stockés dans le navigateur (aucun backend distant).
Chaque compte possède sa propre sauvegarde de progression.


## Multi-appareil (local aujourd'hui)

## Ligue locale (sans Internet)


Le classement hebdomadaire fonctionne maintenant **entièrement en local**:
- génération déterministe d'adversaires bots selon la semaine et le compte
- pas d'API distante nécessaire
- reset hebdomadaire conservé

Des badges de ligue SVG locaux sont inclus dans `assets/leagues/`.


Tu peux maintenant utiliser le **même compte sur plusieurs appareils** sans backend:
- depuis Paramètres > Synchronisation multi-appareil
- **Exporter** sur appareil A (copie un code)
- **Importer** sur appareil B (colle le code)

Le code contient le compte local et la progression, pour un transfert peer-to-peer manuel.

## Ligue Internet sans serveur (P2P)

Mode expérimental: synchronisation de ligue entre appareils connectés via **WebRTC + échange manuel de codes** (pas de backend central).
Dans Paramètres > Synchronisation multi-appareil > "Ligue Internet P2P (WebRTC)".

## Rôle central du modèle IA

Le modèle IA pilote maintenant plusieurs dimensions du compagnon:
- **Conversation** (réponses contextualisées par une mémoire utilisateur locale)
- **Journal** (entrée quotidienne générée par l'IA, avec humeur/contexte)
- **Mémoire** (extraction légère d'éléments personnels depuis les messages)
- **Anki** (reformulation d'une question pour varier l'entraînement)
- **Émotions** (état émotionnel affiché et utilisé dans les prompts)

## IA locale (<1B)

Dans **Paramètres > Mode IA** :
- Provider: `Local endpoint`
- Endpoint: `http://localhost:11434/api/generate`
- Model: nom du modèle local

Le chat retombe automatiquement en mode mock si l'endpoint n'est pas disponible.

## Connexion Anki (AnkiConnect)

Dans **Paramètres > Connexion Anki** :
- Activer Anki
- Endpoint (par défaut): `http://localhost:8765`
- Charger la liste des decks disponibles (bouton **Charger decks**)
- Importer un package `.apkg` local (bouton **Importer .apkg** + chemin local)

Ensuite, depuis l'écran **Étudier**, après avoir révélé une carte, tu peux cliquer sur **Envoyer vers Anki**.

## Roadmap technique

1. Ajouter des tests unitaires sur la progression (XP/streak/ligues).
2. Découper `app.js` en modules (`state`, `ui`, `llm`, `anki`).
3. Ajouter un mode “révision Anki” synchronisé avec l'activité journalière.
4. Passer d'un code de transfert manuel à une vraie synchro SaaS (API + auth + conflits).
