# Internal Mail Management

## 📚 Documentation

Detailed documentation about the project architecture can be found in the [docs](./docs) directory:

*   [**Architecture Overview**](./docs/ARCHITECTURE.md)
*   [**Data Model & Schema**](./docs/DATA_MODEL.md)
*   [**API Reference**](./docs/API_REFERENCE.md)
*   [**UML Diagrams**](./UML-Diagrams.md)

## 🚀 Installation & Démarrage

Ce projet est structuré en deux parties : un backend NestJS et un frontend Next.js.
Assurez-vous d'avoir Node.js, `pnpm` (recommandé) ou `npm`, et PostgreSQL installés sur votre machine.

### 1. Configuration et Démarrage du Backend (API)
Le backend utilise NestJS, Prisma et PostgreSQL.

```bash
# Se placer dans le dossier backend
cd backend

# Installer les dépendances
pnpm install

# Configurer la base de données
# Vérifiez que votre PostgreSQL est lancé et que l'URL dans `.env` correspond.
# Exemple dans .env : DATABASE_URL="postgresql://user:password@localhost:5432/estsb_mail?schema=public"

# Pousser le schéma dans la base
npx prisma db push

# (Optionnel) Peupler la base avec des données de test
npx prisma db seed

# Lancer le serveur backend
pnpm run start:dev
```
Le backend sera disponible sur `http://localhost:3001/api`.

### 2. Configuration et Démarrage du Frontend (Interface)
Le frontend utilise Next.js et Tailwind CSS (avec un thème premium EST SB).

Dans un terminal séparé :
```bash
# Revenir à la racine du projet
cd ..

# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm run dev
```
Le frontend sera disponible sur `http://localhost:3000`.

### Comptes de test
Si vous avez lancé le script de seed (`npx prisma db seed`), vous pouvez vous connecter avec :
- **Admin**: `admin@estsb.edu` / `Password123!`
- **Chef**: `chef.info@estsb.edu` / `Password123!`
- **Agent**: `agent.mail@estsb.edu` / `Password123!`
