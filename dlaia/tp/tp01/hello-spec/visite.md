| Question | Commande | Réponse |
|---|---|---|
| Où sont les dix commandes, invoquées comment ? | `ls .claude/skills` ou `ls .opencode/commands` | Claude Code : dix dossiers `.claude/skills/speckit-<commande>/`, invoqués `/speckit-<commande>` ; Open Code : dix fichiers `.opencode/commands/speckit.<commande>.md`, invoqués `/speckit.<commande>` ; mêmes noms des deux côtés : `analyze`, `checklist`, `clarify`, `constitution`, `converge`, `implement`, `plan`, `specify`, `tasks`, `taskstoissues` |
| Combien de fichiers à trous, lesquels ? | `ls .specify/templates` | cinq : `checklist-template.md`, `constitution-template.md`, `plan-template.md`, `spec-template.md`, `tasks-template.md` |
| État de la constitution ? | `head -5 .specify/memory/constitution.md` | à trous : `# [PROJECT_NAME] Constitution`, puis `## Core Principles` ; rien n'est rempli |
| Quel script copie le fichier à trous du plan ? | `ls .specify/scripts/bash/` | `setup-plan.sh`, parmi six scripts (`check-prerequisites.sh`, `common.sh`, `create-new-feature.sh`, `resolve-template.sh`, `setup-plan.sh`, `setup-tasks.sh`) |
| Workflow installé, nombre de points de contrôle ? | `specify workflow list`, puis `grep -c 'type: gate' .specify/workflows/speckit/workflow.yml` | « Full SDD Cycle (speckit) v1.0.1 » ; deux points de contrôle (`review-spec`, `review-plan`) |
| Ce que `specify init` n'a pas fait ? | `git status` puis `ls AGENTS.md` | aucun dépôt git (« fatal: not a git repository ») ; aucun `AGENTS.md` (« No such file or directory ») |
