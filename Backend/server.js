const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors"); // Allow frontend to call backend
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(cors());

// File Upload Setup
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// API to Submit Journal
app.post("/submit", upload.array("files", 6), async (req, res) => {
  try {
    const { title, abstract, keywords, email, coverLetter, conflictOfInterest, termsConditions } = req.body;

    if (!title || !abstract || !keywords || !email || !coverLetter || !termsConditions || !req.body.authors) {
      return res.status(400).send("Missing required fields!");
    }

    let authorList;
    try {
      authorList = JSON.parse(req.body.authors);
      if (!Array.isArray(authorList) || authorList.length === 0) {
        return res.status(400).send("Invalid authors format!");
      }
    } catch (error) {
      return res.status(400).send("Error parsing authors JSON!");
    }

    // Generate a UUID for journal_id
    const journalId = uuidv4();
    console.log("Generated Journal ID:", journalId);

    // Extract file paths
    let filePaths = {};
    req.files.forEach((file) => {
      if (file.mimetype.includes("pdf") && file.originalname.includes("manuscript")) {
        filePaths["manuscript_pdf"] = file.filename;
      } else if (file.mimetype.includes("msword") || file.originalname.includes("edtitableManuscript")) {
        filePaths["editable_manuscript_doc"] = file.filename;
      } else if (file.originalname.includes("supplementary")) {
        filePaths["supplementary_file"] = file.filename;
      } else if (file.originalname.includes("copyright")) {
        filePaths["copyright_form"] = file.filename;
      }else if (file.originalname.includes("journal")) {
        filePaths["journal_file"] = file.filename;
      }
    });

    // Insert journal entry
    const sql = `
      INSERT INTO journals 
      (journal_id, title, keywords, email, manucript_pdf, editable_manuscript_doc, supplementary_file, copyright_form, cover_letter, conflict_of_interest, terms_conditions) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        journalId,
        title,
        keywords,
        email,
        filePaths.manuscript_pdf || null,
        filePaths.editable_manuscript_doc || null,
        filePaths.supplementary_file || null,
        filePaths.copyright_form || null,
        coverLetter,
        conflictOfInterest,
        termsConditions,
      ],
      (err, result) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).send("Database error: " + err);
        }

        console.log("Journal Inserted with ID:", journalId);

        // Insert authors
        const authorSQL = "INSERT INTO authors (journal_id, name, affiliation, email) VALUES (?, ?, ?, ?)";

        let completedQueries = 0;
        authorList.forEach((author) => {
          db.query(authorSQL, [journalId, author.name, author.affiliation, author.email], (err, result) => {
            if (err) console.error("Author Insert Error:", err);

            completedQueries++;
            if (completedQueries === authorList.length) {
              res.send("Journal and Authors submitted successfully!");
            }
          });
        });
      }
    );
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Internal Server Error!");
  }
});

// API to Fetch Submissions
app.get("/submissions", (req, res) => {
  const sql = "SELECT j.journal_id, j.title, j.abstract, j.keywords, j.submission_date, j.file_path, j.email, j.status, GROUP_CONCAT(a.name ORDER BY a.author_id SEPARATOR ', ') AS authors, GROUP_CONCAT(a.affiliation SEPARATOR ', ') AS affiliations, GROUP_CONCAT(a.email SEPARATOR ', ') AS author_emails FROM journals j LEFT JOIN authors a ON j.journal_id = a.journal_id GROUP BY j.journal_id";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).send("Database error: " + err);
    }
    res.json(results);
  });
});

app.post("/update-status/:id", (req, res) => {
  const journalId = req.params.id;
  const { status } = req.body;

  console.log("Received request to update status:", { journalId, status }); // Debugging

  if (!journalId || !status) {
    console.error("Invalid Journal ID or status:", { journalId, status }); // Debugging
    return res.status(400).json({ message: "Invalid Journal ID or status" });
  }

  const allowedStatuses = ["Submitted", "Pending Review", "Review", "Approval", "Approved"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const sql = "UPDATE journals SET status = ? WHERE journal_id = ?";
  db.query(sql, [status, journalId], (err, result) => {
    if (err) {
      console.error("Database Error:", err); // Debugging
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      console.error("Journal not found with ID:", journalId); // Debugging
      return res.status(404).json({ message: "Journal not found" });
    }

    console.log("Status updated successfully for journal ID:", journalId); // Debugging
    res.json({ message: "Status updated successfully!" });
  });
});

// API to Fetch Submission Status and Title by ID
app.get("/submission-status/:id", (req, res) => {
  const journalId = req.params.id;

  if (!journalId) {
    return res.status(400).json({ message: "Invalid Journal ID" });
  }

  const sql = "SELECT status, title FROM journals WHERE journal_id = ?";
  db.query(sql, [journalId], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Journal not found" });
    }

    const { status, title } = result[0];
    res.json({ status, title }); // Return both status and title
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});