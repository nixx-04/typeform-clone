import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { dbService as db } from "./src/db/db";

const JWT_SECRET = process.env.JWT_SECRET || "typeform_secret_key_123456";

// Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.query.token;

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Optional Auth Middleware (for guest mode)
function optionalAuthenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.query.token;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // --- DYNAMIC LOGO IMAGE ROUTING ---
  app.get("/logo-dark.png", (req, res) => {
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 32" width="135" height="32">
        <g fill="#ffffff">
          <!-- Left vertical rounded rect (pill) -->
          <rect x="0" y="6" width="4" height="20" rx="2" />
          <!-- Right squircle / rounded square -->
          <rect x="6.5" y="6" width="20" height="20" rx="6" />
          <!-- Text 'Typeform' -->
          <text x="31" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="16.5" letter-spacing="-0.035em">Typeform</text>
        </g>
      </svg>
    `);
  });

  app.get("/logo-light.png", (req, res) => {
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 32" width="135" height="32">
        <g fill="#141414">
          <!-- Left vertical rounded rect (pill) -->
          <rect x="0" y="6" width="4" height="20" rx="2" />
          <!-- Right squircle / rounded square -->
          <rect x="6.5" y="6" width="20" height="20" rx="6" />
          <!-- Text 'Typeform' -->
          <text x="31" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="16.5" letter-spacing="-0.035em">Typeform</text>
        </g>
      </svg>
    `);
  });

  // API ROUTES (Must be defined BEFORE Vite middleware)

  // --- AUTHENTICATION API ---
  
  // Register
  app.post("/api/auth/register", (req, res) => {
    try {
      const { name, email, password, passwordConfirm } = req.body;

      if (!name || !email || !password || !passwordConfirm) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (password !== passwordConfirm) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existingUser = db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "A user with this email already exists" });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = db.createUser(name, email, passwordHash);

      const token = jwt.sign(
        { id: newUser.id, name: newUser.name, email: newUser.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Login
  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = db.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user (me)
  app.get("/api/auth/me", authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 1. FORMS API
  // Get all forms with submissions and questions count
  app.get("/api/forms", optionalAuthenticateToken, (req, res) => {
    try {
      const forms = db.getForms();
      const formsWithCount = forms.map((form) => {
        const questions = db.getQuestionsByFormId(form.id);
        const submissions = db.getSubmissionsByFormId(form.id);
        return {
          ...form,
          questionsCount: questions.length,
          submissionsCount: submissions.length,
        };
      });
      res.json(formsWithCount);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a single form by ID (includes its questions)
  app.get("/api/forms/:id", optionalAuthenticateToken, (req, res) => {
    try {
      const form = db.getFormById(req.params.id);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      const questions = db.getQuestionsByFormId(form.id);
      res.json({ ...form, questions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new form
  app.post("/api/forms", authenticateToken, (req, res) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      const newForm = db.createForm(title);
      res.status(201).json(newForm);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update a form (rename, status, theme, shareLink)
  app.patch("/api/forms/:id", authenticateToken, (req, res) => {
    try {
      const updated = db.updateForm(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Duplicate a form
  app.post("/api/forms/:id/duplicate", authenticateToken, (req, res) => {
    try {
      const duplicated = db.duplicateForm(req.params.id);
      res.status(201).json(duplicated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a form
  app.delete("/api/forms/:id", authenticateToken, (req, res) => {
    try {
      db.deleteForm(req.params.id);
      res.json({ success: true, message: "Form deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // 2. QUESTIONS/BUILDER API
  // Get all questions for a form
  app.get("/api/forms/:id/questions", optionalAuthenticateToken, (req, res) => {
    try {
      const questions = db.getQuestionsByFormId(req.params.id);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a question
  app.post("/api/forms/:id/questions", authenticateToken, (req, res) => {
    try {
      const { type, orderIndex } = req.body;
      if (!type) {
        return res.status(400).json({ error: "Question type is required" });
      }
      const newQ = db.createQuestion(req.params.id, type, orderIndex);
      res.status(201).json(newQ);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Edit a question
  app.patch("/api/questions/:id", authenticateToken, (req, res) => {
    try {
      const updated = db.updateQuestion(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reorder questions
  app.put("/api/forms/:id/questions/reorder", authenticateToken, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: "orderedIds must be an array of question IDs" });
      }
      const reordered = db.reorderQuestions(req.params.id, orderedIds);
      res.json(reordered);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a question
  app.delete("/api/questions/:id", authenticateToken, (req, res) => {
    try {
      db.deleteQuestion(req.params.id);
      res.json({ success: true, message: "Question deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // 3. RESPONDENT API (PUBLIC)
  // Fetch a published form (and its questions) by shareLink
  app.get("/api/public/forms/:shareLink", (req, res) => {
    try {
      const form = db.getFormByShareLink(req.params.shareLink);
      if (!form) {
        return res.status(404).json({ error: "Published form not found or inactive" });
      }
      // Increment views
      db.incrementFormViews(form.id);

      const questions = db.getQuestionsByFormId(form.id);
      res.json({ ...form, questions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit response
  app.post("/api/public/forms/:shareLink/submit", (req, res) => {
    try {
      const form = db.getFormByShareLink(req.params.shareLink);
      if (!form) {
        return res.status(404).json({ error: "Published form not found or inactive" });
      }
      const { answers } = req.body;
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Answers object is required" });
      }

      // Server-side validation
      const questions = db.getQuestionsByFormId(form.id);
      const validationErrors: string[] = [];

      for (const q of questions) {
        const val = answers[q.id];

        // 1. Check required fields
        if (q.required) {
          if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
            validationErrors.push(`"${q.title}" is a required field.`);
            continue;
          }
        }

        // 2. Type format and value constraints
        if (val !== undefined && val !== null && val !== "") {
          if (q.type === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(val))) {
              validationErrors.push(`"${q.title}" must be a valid email address.`);
            }
          }

          if (q.type === "number") {
            const num = Number(val);
            if (isNaN(num)) {
              validationErrors.push(`"${q.title}" must be a valid number.`);
            } else {
              if (q.minVal !== undefined && num < q.minVal) {
                validationErrors.push(`"${q.title}" must be at least ${q.minVal}.`);
              }
              if (q.maxVal !== undefined && num > q.maxVal) {
                validationErrors.push(`"${q.title}" can be at most ${q.maxVal}.`);
              }
            }
          }

          if (q.type === "rating") {
            const num = Number(val);
            const minVal = q.minVal !== undefined ? q.minVal : 1;
            const maxVal = q.maxVal !== undefined ? q.maxVal : 5;
            if (isNaN(num) || num < minVal || num > maxVal) {
              validationErrors.push(`"${q.title}" rating must be between ${minVal} and ${maxVal}.`);
            }
          }

          if (q.type === "yes_no") {
            if (val !== "Yes" && val !== "No") {
              validationErrors.push(`"${q.title}" must be "Yes" or "No".`);
            }
          }
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: "Validation failed",
          validationErrors,
        });
      }

      const submission = db.createSubmission(form.id, answers);
      res.status(201).json({ success: true, submissionId: submission.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // 4. RESULTS & STATS API
  // Get all submissions + answers for a form
  app.get("/api/forms/:id/submissions", optionalAuthenticateToken, (req, res) => {
    try {
      const submissions = db.getSubmissionsByFormId(req.params.id);
      const questions = db.getQuestionsByFormId(req.params.id);

      // Map each submission to include its answers
      const fullSubmissions = submissions.map((sub) => {
        const ansList = db.getAnswersBySubmissionId(sub.id);
        const answersMap: { [qId: string]: any } = {};
        ansList.forEach((a) => {
          answersMap[a.questionId] = a.value;
        });

        return {
          id: sub.id,
          submittedAt: sub.submittedAt,
          answers: answersMap,
        };
      });

      res.json({ questions, submissions: fullSubmissions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get summary statistics
  app.get("/api/forms/:id/stats", optionalAuthenticateToken, (req, res) => {
    try {
      const stats = db.getStatsByFormId(req.params.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export submissions as CSV
  app.get("/api/forms/:id/export", optionalAuthenticateToken, (req, res) => {
    try {
      const submissions = db.getSubmissionsByFormId(req.params.id);
      const questions = db.getQuestionsByFormId(req.params.id);

      // Create CSV Header
      const headerRow = ["Submission ID", "Submitted At", ...questions.map((q) => `"${q.title.replace(/"/g, '""')}"`)];

      const csvRows = [headerRow.join(",")];

      submissions.forEach((sub) => {
        const ansList = db.getAnswersBySubmissionId(sub.id);
        const answersMap: { [qId: string]: any } = {};
        ansList.forEach((a) => {
          answersMap[a.questionId] = a.value;
        });

        const row = [
          sub.id,
          sub.submittedAt,
          ...questions.map((q) => {
            const val = answersMap[q.id];
            if (val === undefined || val === null) {
              return "";
            }
            const cleanVal = typeof val === "object" ? JSON.stringify(val) : String(val);
            return `"${cleanVal.replace(/"/g, '""')}"`;
          }),
        ];
        csvRows.push(row.join(","));
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="form-${req.params.id}-responses.csv"`);
      res.send(csvRows.join("\n"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reset database endpoint for convenience or developer refresh
  app.post("/api/admin/reset", authenticateToken, (req, res) => {
    try {
      db.resetDb();
      res.json({ success: true, message: "Database re-seeded successfully!" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. VITE OR PRODUCTION FRONTEND HANDLER
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode with Static Assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to 0.0.0.0 and port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical error starting Express backend:", error);
});
