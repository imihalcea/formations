# Check-list de relecture

Critères de relecture d'un plan de module, d'un fichier de `support/` ou d'un énoncé de TP. Chaque critère se vérifie sur le texte Markdown ou sur une capture de slide. Un constat cite la slide (titre), le critère (son code) et le passage fautif. Un constat sans citation ne vaut pas.

Les critères reprennent `CLAUDE.md` (« Rédaction du support », « Qualité pédagogique des slides ») et les défauts relevés pendant la rédaction de la formation claude-code : formulations obscures, termes nouveaux à la place des termes introduits, ruptures de progression, slides pauvres.

## V. Vocabulaire

Référence : `formateur/lexique.md`.

- V1. Chaque notion employée figure au lexique, sous la forme exacte de la colonne « Terme ». Un mot de la colonne « À ne pas employer » est un constat.
- V2. Un terme introduit par ce module est défini sur une slide avant toute slide qui l'emploie, et cette slide figure dans « Notions introduites » du plan. Une étiquette de schéma, un en-tête de tableau ou une phrase vaut définition ; le glossaire la reprend.
- V3. Aucun terme d'un module ultérieur (colonne « Introduit » supérieure au module relu).
- V4. Un sigle est développé une fois, sur la slide qui le définit, puis employé seul. Aucun sigle non défini à l'écran.
- V5. Une même notion garde le même nom d'une slide à l'autre : deux mots pour une notion est un constat, même si les deux sont au lexique.

## C. Clarté

- C1. Le titre d'une slide se comprend sans lire la slide : un développeur qui découvre la notion devine le contenu à partir du titre. Une formule elliptique, une métaphore, une question rhétorique ou un jeu de mots est un constat. Le titre tient en cinq mots au plus (hors `statement`, voir C2) : un sixième mot est un constat.
- C2. Une idée clé (`statement`) est une phrase affirmative complète d'une dizaine de mots, deux lignes au plus, sans métaphore ni ellipse.
- C3. Un kicker nomme la section par son sujet, en un à trois mots, identique sur toutes les slides de la section.
- C4. Chaque phrase d'une slide se lit seule, sans le discours du formateur. Ce qui a besoin du discours va dans les notes.
- C5. Un exemple inventé porte la mention « illustration » ; une liste partielle est présentée comme telle.
- C6. Une phrase sous un support visuel porte une seule information, en vingt mots au plus. Une phrase qui cumule définition, règle d'outil et limite chiffrée est un constat.
- C7. Un exemple est l'archétype de la notion qu'il illustre (un ADR : une décision d'architecture ; une exigence EARS : une règle métier). Un exemple à la marge de la notion est un constat.

## P. Progression

- P1. Chaque slide répond à une question que la précédente a fait naître, ou ouvre une section annoncée par son kicker. Un saut (nouvelle notion sans amorce, retour en arrière, slide isolée) est un constat qui cite les deux slides.
- P2. Aucune notion n'est employée avant sa slide de définition, dans ce module ou dans un module antérieur.
- P3. Une idée clé dit de quoi elle découle : elle conclut les slides qui la précèdent dans la section avec ses propres mots. Elle ne reprend ni le mot central d'une idée clé antérieure (y compris des modules précédents) ni une phrase d'une slide de la section ; elle peut nommer l'acteur, le rôle ou les artefacts que la suite développe.
- P4. La première section du module reprend ce que le module précédent a laissé en suspens (sa dernière idée clé, son TP, une question ouverte).
- P5. Une slide `compare` suit la slide qui présente la notion comparée, jamais l'inverse.
- P6. La slide de lancement du TP arrive après toutes les notions que le TP mobilise.

## S. Substance

- S1. Une slide `content` porte au moins un support concret : commande réelle, extrait de code, sortie de terminal, schéma SVG, tableau ou chiffre sourcé. Une slide qui ne porte qu'une ou deux phrases générales est à enrichir, à fusionner ou à transformer en idée clé.
- S2. Une slide `facts` a deux à quatre éléments, chacun avec un terme et une explication d'une phrase.
- S3. Une slide `figure` ou `figures` a une légende de trois à cinq mots par chiffre ; effectifs, intervalles et méthode vont dans les notes.
- S4. Les notes apportent au formateur une information absente de la slide : cas particulier, chiffre, réponse à une question probable, commande de démonstration. Une note qui paraphrase la slide est un constat.
- S5. Une slide tient en une idée : deux phrases courtes ou quatre éléments brefs au plus. Au-delà, scinder.
- S6. Une slide qui ne contient que du détail technique (variables d'environnement, chemins secondaires, cas rares) est à supprimer ou à déplacer dans les notes.
- S7. Sur la capture, le contenu occupe la hauteur du canevas sans déborder : ni encadré rouge ni grand vide sous deux lignes de texte.
- S8. Le texte sous un schéma, un tableau ou un bloc de code apporte ce que le support ne montre pas. Une phrase qui le paraphrase est un constat ; un schéma seul, centré, est conforme.
- S9. Une case ou une ligne de tableau qui marque un manque le dit elle-même ; une phrase qui explique un vide est un constat.
- S10. Une énumération de trois éléments ou plus est en liste ou en tableau ; une phrase qui les aligne est un constat.

## R. Règles de rédaction

Rappel des interdits de `CLAUDE.md`, vérifiables par recherche de motif.

- R1. Aucun tiret cadratin (—) ni demi-cadratin (–).
- R2. Aucune tournure « ce n'est pas X, c'est Y », « il ne s'agit pas de… mais de… », « plus qu'un X, un Y ».
- R3. Aucun superlatif, aucune formule d'enthousiasme ou de motivation.
- R4. Aucune mention des stagiaires, du formateur ou de la situation de formation sur une slide (notes et énoncés exceptés).
- R5. Aucune liste à puces ni gras là où une phrase suffit ; aucune triade décorative.
- R9. Une phrase se lit d'une traite : la répétition d'un même connecteur (« ni… ni… ni »), une négation en série ou une subordonnée imbriquée est un constat ; la phrase se coupe ou devient une liste.
- R10. Les mots-clés d'un format sont en français (localisation officielle, sinon traduction constante signalée) ; un mot-clé anglais dans une phrase française est un constat, hors citation d'une source.
- R6. Chaque slide qui avance un fait cite sa source dans `::: sources` ; chaque commande, option et nom de fichier d'outil cité est vérifié dans la documentation officielle (vérification par l'agent `verificateur-sources`).
- R7. Le modèle est désigné par `claude-sonnet-4-6` ou « Claude Sonnet 4.6 », jamais par l'alias `sonnet`.
- R8. Orthographe et accentuation complètes, y compris sur les majuscules ; identifiants et commandes dans leur forme d'origine.

## T. Énoncé de TP

Référence : `formateur/fil-rouge.md` pour les états de départ et d'arrivée.

- T1. Chaque étape a un bloc `::: attendu` qui donne une commande et sa sortie connue, ou un état de fichier vérifiable.
- T2. Les variantes `::: claude-code` et `::: opencode` vont par paire et ne diffèrent que là où les outils diffèrent ; le texte commun porte tout le reste.
- T3. Aucun numéro de slide, aucun renvoi « voir la slide » : l'énoncé est autoportant.
- T4. Les fichiers fournis sont désignés par leur chemin dans `~/fichiers/` et existent dans `tp/fichiers/`.
- T5. Le point de départ est l'état d'arrivée du TP précédent ; l'état d'arrivée est le point de départ du TP suivant ; le nombre de commits annoncé correspond aux étapes qui commitent.
- T6. Le corrigé est cité par `file=` depuis `tp/tpNN/`, jamais recopié ; il passe `uv run pytest -q` sous Python 3.14.
- T7. La durée annoncée est tenable : une étape à prompt, dix minutes au plus ; une étape de relecture, cinq.
- T8. L'énoncé ne révèle aucune réponse du débrief ; un repli `::: indice` existe pour chaque étape où l'agent peut dériver.
- T9. Les prompts fournis sont copiables tels quels (bloc `prompt`) et nomment la commande Spec Kit propre à chaque outil.
- T10. Chaque valeur d'un `attendu` (nombre de tests, de questions, de tâches, de mutants, code HTTP, nom de fichier) provient d'un rejeu consigné dans `tmp/rejeu/rapport-tpNN-<outil>.md`, conforme dans les deux outils. Une valeur estimée ou marquée « à relever » est un constat.
