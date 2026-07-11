# Typeform Clone 📝

A high-fidelity full-stack Typeform clone featuring a responsive drag-and-drop conversational form builder, a signature full-screen "one-question-at-a-time" respondent experience with smooth layout transitions, detailed relational statistics, and automatic CSV download options.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 (TypeScript), Tailwind CSS v4, and Motion (`motion/react`) for conversational animations.
- **Backend**: Node.js, Express, and `tsx` for type-safe server routing.
- **Database**: Local JSON-based relational engine, structured with transactional safety (supports schema tables, references, triggers, and statistics).
- **Tooling**: Vite 6, `esbuild` for bundling the unified CJS node bundle, and custom scripts.

---

## 🏗️ Architecture & Database Schema

The database is built on top of a highly optimized, fully type-safe relational structure saved to `/src/db/db.json` with auto-seeding.

### Entity Schemas

1. **`User`**:
   - `id`: `string` (Primary Key)
   - `name`: `string`
   - `email`: `string`

2. **`Form`**:
   - `id`: `string` (Primary Key)
   - `title`: `string`
   - `status`: `"draft" | "published"`
   - `shareLink`: `string`
   - `views`: `number` (Tracks unique page entry impressions)
   - `theme`: `FormTheme` (`backgroundColor`, `textColor`, `buttonColor`, `buttonTextColor`)
   - `createdAt`: `string`
   - `updatedAt`: `string`

3. **`Question`**:
   - `id`: `string` (Primary Key)
   - `formId`: `string` (Foreign Key -> `Form.id`)
   - `type`: `"short_text" | "long_text" | "multiple_choice" | "dropdown" | "email" | "number" | "yes_no" | "rating"`
   - `title`: `string`
   - `description`: `string`
   - `required`: `boolean`
   - `options`: `string[]` (Used for choices & dropdown selections)
   - `orderIndex`: `number`
   - `minVal` / `maxVal`: `number` (Used for rating ranges and numeric bounds)
   - `logic`: `QuestionLogic` (`condition`, `value`, `goToQuestionId`) - Conditional branching properties

4. **`Submission`**:
   - `id`: `string` (Primary Key)
   - `formId`: `string` (Foreign Key -> `Form.id`)
   - `submittedAt`: `string`

5. **`Answer`**:
   - `id`: `string` (Primary Key)
   - `submissionId`: `string` (Foreign Key -> `Submission.id`)
   - `questionId`: `string` (Foreign Key -> `Question.id`)
   - `value`: `any` (Saves strings, options, selections, stars, or numbers)

---

## 🔌 API Reference Overview

All api routes are structured cleanly inside `/server.ts` preceding Vite's SPA assets middleware.

### 📋 Form Management (CRUD & Settings)
- `GET /api/forms` — Returns list of all creator forms with pre-calculated question and response counts.
- `GET /api/forms/:id` — Fetches complete structural specifications for a single form, including ordered questions.
- `POST /api/forms` — Generates a new form template with default styling themes.
- `PATCH /api/forms/:id` — Patches form title, publishing status, themes, or custom identifiers.
- `POST /api/forms/:id/duplicate` — Replicates a form including duplicate re-mapping of question indices and logic jumps.
- `DELETE /api/forms/:id` — Cascade deletes forms, associated fields, and saved submission records.

### 📐 Form Builder (Questions, Reordering, Jumps)
- `GET /api/forms/:id/questions` — Fetches ordered questions list for builder.
- `POST /api/forms/:id/questions` — Creates a new question of specified type at specified order index.
- `PATCH /api/questions/:id` — Synch patches specific properties (required toggles, descriptions, ranges, choices).
- `PUT /api/forms/:id/questions/reorder` — Updates orderIndex metrics based on ordered lists of IDs.
- `DELETE /api/questions/:id` — Cascade deletes single fields.

### 🧑‍💻 Respondent Workflow (Public)
- `GET /api/public/forms/:shareLink` — Fetches public forms structure. Automatically increments view counter.
- `POST /api/public/forms/:shareLink/submit` — Handles public responses. Inserts submission models and answers dynamically.

### 📊 Results & Analytics
- `GET /api/forms/:id/submissions` — Gathers flat array list of individual form submissions with answer maps.
- `GET /api/forms/:id/stats` — Gathers complete statistics calculations (averages for rating stars, frequency/percentage distribution for choices, and recent arrays for texts).
- `GET /api/forms/:id/export` — Returns a live compiled, RFC-compliant responses CSV file download.

---

## 🚀 Local Setup Instructions

Follow these instructions to run the application on your computer:

### 📥 Prerequisites
- **Node.js**: Version 18.x or above
- **NPM**: Version 9.x or above

### ⚙️ Installation & Bootup
1. Clone the repository or navigate to your extracted folder.
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Run the development environment:
   ```bash
   npm run dev
   ```
4. Access the workspace inside your browser at **`http://localhost:3000`**.

### 📦 Build & Launch Production
1. To compile client-side React code and bundle the backend Express script with high-performance `esbuild`, run:
   ```bash
   npm run build
   ```
2. Launch the stand-alone production node bundle:
   ```bash
   npm run start
   ```

---

## 💡 Engineering Assumptions

1. **Express + Vite Full-stack Middleware Integration**: To support instant response logging, stats aggregation, dynamic thematic layouts, and direct CSV file downloads, we configured a robust full-stack Express architecture integrated with Vite's development middleware.
2. **Deep-Linking Hash Router**: To maintain reliable previews and client-state persistences inside sandboxed browser frames, we built a highly-tuned reactive client-side hash router (`#/`, `#/builder/:id`, `#/results/:id`, `#/form/:link`). This guarantees shared URLs can be entered, reloaded, or accessed directly in any browser tab without causing server 404s.
3. **History Traversal (`visitedHistory` Stack)**: When a respondent navigates a form containing conditional logic jumps, they might skip over several questions. To make the "Go Back" button work perfectly, we implement a path history stack that tracks exactly which question index was previously active, permitting backwards/forwards navigations of high logical complexity with absolute accuracy.

---

## Live Demo Link

https://typeform-clone-ecru.vercel.app/
