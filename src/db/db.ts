import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface FormTheme {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

export interface QuestionLogic {
  condition: "equals" | "not_equals" | "always" | "contains";
  value: string;
  goToQuestionId: string; // ID of the question to jump to, or 'thank-you'
}

export interface Question {
  id: string;
  formId: string;
  type: "short_text" | "long_text" | "multiple_choice" | "dropdown" | "email" | "number" | "yes_no" | "rating";
  title: string;
  description: string;
  required: boolean;
  options: string[]; // For choice/dropdown questions
  orderIndex: number;
  minVal?: number; // For ratings, numbers
  maxVal?: number; // For ratings, numbers
  logic?: QuestionLogic; // Logic jump
}

export interface Form {
  id: string;
  title: string;
  status: "draft" | "published";
  shareLink: string;
  views: number;
  theme: FormTheme;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  formId: string;
  submittedAt: string;
}

export interface Answer {
  id: string;
  submissionId: string;
  questionId: string;
  value: any; // string, number, boolean, etc.
}

export interface DatabaseSchema {
  users: User[];
  forms: Form[];
  questions: Question[];
  submissions: Submission[];
  answers: Answer[];
}

const DB_FILE = path.join(process.cwd(), "src", "db", "db.json");

// Default Theme matching Typeform's clean aesthetic
const DEFAULT_THEME: FormTheme = {
  backgroundColor: "#ffffff",
  textColor: "#191919",
  buttonColor: "#000000",
  buttonTextColor: "#ffffff",
};

// Ensure database directory and file exist with seed data
function initDb(): DatabaseSchema {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      let changed = false;
      if (!Array.isArray(parsed.users)) {
        parsed.users = [];
        changed = true;
      }

      parsed.users.forEach((u: any) => {
        if (u.email === "jane@example.com" && !u.password_hash) {
          u.password_hash = bcrypt.hashSync("password123", 10);
          u.created_at = u.created_at || new Date().toISOString();
          u.updated_at = u.updated_at || new Date().toISOString();
          changed = true;
        }
      });

      // Add "nix" user if not present
      const hasNix = parsed.users.some((u: any) => u.email === "nix");
      if (!hasNix) {
        parsed.users.push({
          id: "usr-nix",
          name: "Nix",
          email: "nix",
          password_hash: bcrypt.hashSync("123", 10),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        changed = true;
      }

      // Add "nix@example.com" user if not present
      const hasNixEmail = parsed.users.some((u: any) => u.email === "nix@example.com");
      if (!hasNixEmail) {
        parsed.users.push({
          id: "usr-nix-email",
          name: "Nix",
          email: "nix@example.com",
          password_hash: bcrypt.hashSync("123", 10),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
      }
      return parsed;
    } catch (e) {
      console.error("Failed to read database, resetting...", e);
    }
  }

  // Generate beautiful seed data
  const seedData: DatabaseSchema = {
    users: [
      {
        id: "creator-1",
        name: "Jane Creator",
        email: "jane@example.com",
        password_hash: bcrypt.hashSync("password123", 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "usr-nix",
        name: "Nix",
        email: "nix",
        password_hash: bcrypt.hashSync("123", 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "usr-nix-email",
        name: "Nix",
        email: "nix@example.com",
        password_hash: bcrypt.hashSync("123", 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    forms: [
      {
        id: "form-feedback",
        title: "Customer Satisfaction Survey",
        status: "published",
        shareLink: "form-feedback",
        views: 142,
        theme: {
          backgroundColor: "#f5f7fb",
          textColor: "#1d2b49",
          buttonColor: "#4f46e5",
          buttonTextColor: "#ffffff",
        },
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "form-event",
        title: "Developer Meetup Registration",
        status: "published",
        shareLink: "form-event",
        views: 89,
        theme: {
          backgroundColor: "#0d1117",
          textColor: "#c9d1d9",
          buttonColor: "#238636",
          buttonTextColor: "#ffffff",
        },
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "form-draft-1",
        title: "Product Launch Sign-up (Draft)",
        status: "draft",
        shareLink: "form-draft-1",
        views: 0,
        theme: DEFAULT_THEME,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    questions: [
      // Questions for Customer Satisfaction
      {
        id: "q-fb-1",
        formId: "form-feedback",
        type: "rating",
        title: "How would you rate your overall experience with our service?",
        description: "Your rating helps us improve daily.",
        required: true,
        options: [],
        orderIndex: 0,
        minVal: 1,
        maxVal: 5,
      },
      {
        id: "q-fb-2",
        formId: "form-feedback",
        type: "multiple_choice",
        title: "Which feature of our product do you find most valuable?",
        description: "Choose the one you spend the most time in.",
        required: true,
        options: ["Dashboard Analytics", "Form Creator", "Team Workspaces", "Third-party Integrations"],
        orderIndex: 1,
      },
      {
        id: "q-fb-3",
        formId: "form-feedback",
        type: "yes_no",
        title: "Have you encountered any major issues or bugs?",
        description: "Selecting Yes will direct you to a bug report question.",
        required: true,
        options: [],
        orderIndex: 2,
        logic: {
          condition: "equals",
          value: "Yes",
          goToQuestionId: "q-fb-4", // Jumps to bug report
        },
      },
      {
        id: "q-fb-4",
        formId: "form-feedback",
        type: "long_text",
        title: "Please describe the bugs or issues you encountered.",
        description: "Be as detailed as possible.",
        required: false,
        options: [],
        orderIndex: 3,
      },
      {
        id: "q-fb-5",
        formId: "form-feedback",
        type: "email",
        title: "What is your email address? (Optional)",
        description: "We will only contact you to follow up on your feedback.",
        required: false,
        options: [],
        orderIndex: 4,
      },

      // Questions for Event Meetup
      {
        id: "q-ev-1",
        formId: "form-event",
        type: "short_text",
        title: "What is your full name?",
        description: "This will be printed on your badge.",
        required: true,
        options: [],
        orderIndex: 0,
      },
      {
        id: "q-ev-2",
        formId: "form-event",
        type: "email",
        title: "What email should we send your ticket to?",
        description: "Double check for spelling.",
        required: true,
        options: [],
        orderIndex: 1,
      },
      {
        id: "q-ev-3",
        formId: "form-event",
        type: "number",
        title: "How many guests will you be bringing?",
        description: "Maximum of 3 guests allowed per attendee.",
        required: true,
        options: [],
        orderIndex: 2,
        minVal: 0,
        maxVal: 3,
      },
      {
        id: "q-ev-4",
        formId: "form-event",
        type: "dropdown",
        title: "Which main topic are you most excited to learn about?",
        description: "Select from the list.",
        required: true,
        options: ["Vite & React 19", "Full-stack Node.js", "Tailwind CSS v4 Engine", "Framer Motion Animations"],
        orderIndex: 3,
      },
    ],
    submissions: [
      // Submissions for Feedback Form
      { id: "sub-fb-1", formId: "form-feedback", submittedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
      { id: "sub-fb-2", formId: "form-feedback", submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
      { id: "sub-fb-3", formId: "form-feedback", submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
      { id: "sub-fb-4", formId: "form-feedback", submittedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },

      // Submissions for Event Form
      { id: "sub-ev-1", formId: "form-event", submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
      { id: "sub-ev-2", formId: "form-event", submittedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString() },
    ],
    answers: [
      // Answers for sub-fb-1
      { id: "ans-1", submissionId: "sub-fb-1", questionId: "q-fb-1", value: 5 },
      { id: "ans-2", submissionId: "sub-fb-1", questionId: "q-fb-2", value: "Dashboard Analytics" },
      { id: "ans-3", submissionId: "sub-fb-1", questionId: "q-fb-3", value: "No" },
      { id: "ans-4", submissionId: "sub-fb-1", questionId: "q-fb-5", value: "alice@example.com" },

      // Answers for sub-fb-2
      { id: "ans-5", submissionId: "sub-fb-2", questionId: "q-fb-1", value: 4 },
      { id: "ans-6", submissionId: "sub-fb-2", questionId: "q-fb-2", value: "Form Creator" },
      { id: "ans-7", submissionId: "sub-fb-2", questionId: "q-fb-3", value: "Yes" },
      { id: "ans-8", submissionId: "sub-fb-2", questionId: "q-fb-4", value: "The visual designer was slow to drag-and-drop on Safari." },
      { id: "ans-9", submissionId: "sub-fb-2", questionId: "q-fb-5", value: "bob@example.com" },

      // Answers for sub-fb-3
      { id: "ans-10", submissionId: "sub-fb-3", questionId: "q-fb-1", value: 5 },
      { id: "ans-11", submissionId: "sub-fb-3", questionId: "q-fb-2", value: "Dashboard Analytics" },
      { id: "ans-12", submissionId: "sub-fb-3", questionId: "q-fb-3", value: "No" },

      // Answers for sub-fb-4
      { id: "ans-13", submissionId: "sub-fb-4", questionId: "q-fb-1", value: 3 },
      { id: "ans-14", submissionId: "sub-fb-4", questionId: "q-fb-2", value: "Third-party Integrations" },
      { id: "ans-15", submissionId: "sub-fb-4", questionId: "q-fb-3", value: "No" },

      // Answers for sub-ev-1
      { id: "ans-16", submissionId: "sub-ev-1", questionId: "q-ev-1", value: "John Doe" },
      { id: "ans-17", submissionId: "sub-ev-1", questionId: "q-ev-2", value: "john.doe@gmail.com" },
      { id: "ans-18", submissionId: "sub-ev-1", questionId: "q-ev-3", value: 1 },
      { id: "ans-19", submissionId: "sub-ev-1", questionId: "q-ev-4", value: "Vite & React 19" },

      // Answers for sub-ev-2
      { id: "ans-20", submissionId: "sub-ev-2", questionId: "q-ev-1", value: "Sarah Connor" },
      { id: "ans-21", submissionId: "sub-ev-2", questionId: "q-ev-2", value: "sconnor@skynet.com" },
      { id: "ans-22", submissionId: "sub-ev-2", questionId: "q-ev-3", value: 0 },
      { id: "ans-23", submissionId: "sub-ev-2", questionId: "q-ev-4", value: "Tailwind CSS v4 Engine" },
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), "utf-8");
  return seedData;
}

let db = initDb();

// Save db helper
function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export const dbService = {
  // Get entire DB
  getDb(): DatabaseSchema {
    return db;
  },

  // Reset/Seed Database manually
  resetDb(): DatabaseSchema {
    db = initDb();
    return db;
  },

  // Forms
  getForms(): Form[] {
    return db.forms;
  },

  getFormById(id: string): Form | undefined {
    return db.forms.find((f) => f.id === id);
  },

  getFormByShareLink(link: string): Form | undefined {
    return db.forms.find((f) => f.shareLink === link && f.status === "published");
  },

  createForm(title: string): Form {
    const id = "form-" + Math.random().toString(36).substr(2, 9);
    const newForm: Form = {
      id,
      title,
      status: "draft",
      shareLink: id,
      views: 0,
      theme: { ...DEFAULT_THEME },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.forms.push(newForm);
    saveDb();
    return newForm;
  },

  updateForm(id: string, updates: Partial<Form>): Form {
    const idx = db.forms.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error("Form not found");
    db.forms[idx] = {
      ...db.forms[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDb();
    return db.forms[idx];
  },

  duplicateForm(id: string): Form {
    const sourceForm = this.getFormById(id);
    if (!sourceForm) throw new Error("Form not found");

    const newId = "form-" + Math.random().toString(36).substr(2, 9);
    const duplicatedForm: Form = {
      ...sourceForm,
      id: newId,
      title: `${sourceForm.title} (Copy)`,
      status: "draft",
      shareLink: newId,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.forms.push(duplicatedForm);

    // Duplicate questions
    const sourceQuestions = this.getQuestionsByFormId(id);
    const idMap: { [oldId: string]: string } = {};

    sourceQuestions.forEach((q) => {
      const newQId = "q-" + Math.random().toString(36).substr(2, 9);
      idMap[q.id] = newQId;
      db.questions.push({
        ...q,
        id: newQId,
        formId: newId,
      });
    });

    // Remap logic jumps with duplicated questions if reference matches
    db.questions.forEach((q) => {
      if (q.formId === newId && q.logic && q.logic.goToQuestionId !== "thank-you") {
        if (idMap[q.logic.goToQuestionId]) {
          q.logic.goToQuestionId = idMap[q.logic.goToQuestionId];
        }
      }
    });

    saveDb();
    return duplicatedForm;
  },

  deleteForm(id: string): void {
    db.forms = db.forms.filter((f) => f.id !== id);
    db.questions = db.questions.filter((q) => q.formId !== id);
    // Delete submissions
    const submissionIds = db.submissions.filter((s) => s.formId === id).map((s) => s.id);
    db.submissions = db.submissions.filter((s) => s.formId !== id);
    db.answers = db.answers.filter((a) => !submissionIds.includes(a.submissionId));
    saveDb();
  },

  incrementFormViews(id: string): void {
    const form = this.getFormById(id);
    if (form) {
      form.views += 1;
      saveDb();
    }
  },

  // Questions
  getQuestionsByFormId(formId: string): Question[] {
    return db.questions
      .filter((q) => q.formId === formId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },

  getQuestionById(id: string): Question | undefined {
    return db.questions.find((q) => q.id === id);
  },

  createQuestion(formId: string, type: Question["type"], orderIndex?: number): Question {
    const id = "q-" + Math.random().toString(36).substr(2, 9);
    const existing = this.getQuestionsByFormId(formId);
    const nextOrder = orderIndex !== undefined ? orderIndex : existing.length;

    // Shift orders if inserting in middle
    existing.forEach((q) => {
      if (q.orderIndex >= nextOrder) {
        q.orderIndex += 1;
      }
    });

    const newQuestion: Question = {
      id,
      formId,
      type,
      title: `Untitled ${type.replace("_", " ")} Question`,
      description: "",
      required: false,
      options: type === "multiple_choice" || type === "dropdown" ? ["Option 1", "Option 2"] : [],
      orderIndex: nextOrder,
    };

    db.questions.push(newQuestion);
    saveDb();
    return newQuestion;
  },

  updateQuestion(id: string, updates: Partial<Question>): Question {
    const idx = db.questions.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error("Question not found");
    db.questions[idx] = {
      ...db.questions[idx],
      ...updates,
    };
    saveDb();
    return db.questions[idx];
  },

  reorderQuestions(formId: string, orderedIds: string[]): Question[] {
    orderedIds.forEach((id, index) => {
      const q = db.questions.find((x) => x.id === id && x.formId === formId);
      if (q) {
        q.orderIndex = index;
      }
    });
    saveDb();
    return this.getQuestionsByFormId(formId);
  },

  deleteQuestion(id: string): void {
    const question = this.getQuestionById(id);
    if (!question) return;

    const { formId, orderIndex } = question;
    db.questions = db.questions.filter((q) => q.id !== id);

    // Delete associated answers
    db.answers = db.answers.filter((a) => a.questionId !== id);

    // Shift other questions' orderIndex
    const remaining = this.getQuestionsByFormId(formId);
    remaining.forEach((q) => {
      if (q.orderIndex > orderIndex) {
        q.orderIndex -= 1;
      }
    });

    saveDb();
  },

  // Submissions
  getSubmissionsByFormId(formId: string): Submission[] {
    return db.submissions.filter((s) => s.formId === formId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },

  getAnswersBySubmissionId(submissionId: string): Answer[] {
    return db.answers.filter((a) => a.submissionId === submissionId);
  },

  createSubmission(formId: string, responseAnswers: { [questionId: string]: any }): Submission {
    const submissionId = "sub-" + Math.random().toString(36).substr(2, 9);
    const newSubmission: Submission = {
      id: submissionId,
      formId,
      submittedAt: new Date().toISOString(),
    };

    db.submissions.push(newSubmission);

    Object.entries(responseAnswers).forEach(([questionId, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        db.answers.push({
          id: "ans-" + Math.random().toString(36).substr(2, 9),
          submissionId,
          questionId,
          value,
        });
      }
    });

    saveDb();
    return newSubmission;
  },

  // Summary statistics
  getStatsByFormId(formId: string) {
    const submissions = this.getSubmissionsByFormId(formId);
    const questions = this.getQuestionsByFormId(formId);
    const submissionCount = submissions.length;

    // Get views
    const form = this.getFormById(formId);
    const views = form ? form.views : 0;
    const completionRate = views > 0 ? Math.round((submissionCount / views) * 100) : 0;

    const stats: { [questionId: string]: any } = {};

    questions.forEach((q) => {
      const qAnswers = db.answers.filter((a) => a.questionId === q.id);

      if (q.type === "multiple_choice" || q.type === "dropdown" || q.type === "yes_no") {
        // Choice distributions
        const counts: { [val: string]: number } = {};
        // Initialize choices with 0 counts
        const possibleChoices = q.type === "yes_no" ? ["Yes", "No"] : q.options;
        possibleChoices.forEach((opt) => {
          counts[opt] = 0;
        });

        qAnswers.forEach((ans) => {
          const valStr = String(ans.value);
          if (counts[valStr] !== undefined) {
            counts[valStr]++;
          } else {
            counts[valStr] = 1;
          }
        });

        stats[q.id] = {
          type: q.type,
          title: q.title,
          totalAnswers: qAnswers.length,
          distribution: Object.entries(counts).map(([choice, count]) => ({
            choice,
            count,
            percentage: qAnswers.length > 0 ? Math.round((count / qAnswers.length) * 100) : 0,
          })),
        };
      } else if (q.type === "rating" || q.type === "number") {
        // Ratings stats
        const values = qAnswers.map((a) => Number(a.value)).filter((v) => !isNaN(v));
        const sum = values.reduce((acc, curr) => acc + curr, 0);
        const avg = values.length > 0 ? parseFloat((sum / values.length).toFixed(1)) : 0;

        // Distribution
        const counts: { [val: number]: number } = {};
        const minVal = q.minVal || 1;
        const maxVal = q.maxVal || (q.type === "rating" ? 5 : 10);

        for (let i = minVal; i <= maxVal; i++) {
          counts[i] = 0;
        }

        values.forEach((v) => {
          if (counts[v] !== undefined) {
            counts[v]++;
          }
        });

        stats[q.id] = {
          type: q.type,
          title: q.title,
          totalAnswers: qAnswers.length,
          average: avg,
          distribution: Object.entries(counts).map(([numStr, count]) => ({
            choice: numStr,
            count,
            percentage: qAnswers.length > 0 ? Math.round((count / qAnswers.length) * 100) : 0,
          })),
        };
      } else {
        // Textual
        stats[q.id] = {
          type: q.type,
          title: q.title,
          totalAnswers: qAnswers.length,
          recentAnswers: qAnswers.slice(0, 10).map((a) => a.value),
        };
      }
    });

    return {
      views,
      submissionsCount: submissionCount,
      completionRate,
      questionsStats: stats,
    };
  },

  // User management
  getUserByEmail(email: string): User | undefined {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById(id: string): User | undefined {
    return db.users.find((u) => u.id === id);
  },

  createUser(name: string, email: string, passwordHash: string): User {
    const newUser: User = {
      id: "usr-" + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb();
    return newUser;
  },
};
