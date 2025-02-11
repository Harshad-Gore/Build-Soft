const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors"); // Allow frontend to call backend

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("uploads"));

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Harsh@2004", // Change if necessary
  database: "journal_submission_db",
});

db.connect((err) => {
  if (err) console.error("MySQL connection failed:", err);
  else console.log("Connected to MySQL!");
});

// File Upload Setup
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// API to Submit Journal
app.post("/submit", upload.single("file"), async (req, res) => {
  try {
    const { title, abstract, keywords, email } = req.body;
    const filePath = req.file ? req.file.filename : null;

    if (!title || !abstract || !keywords || !email || !req.body.authors) {
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

    // Insert journal entry first
    const sql = "INSERT INTO journals (title, abstract, keywords, file_path, email) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [title, abstract, keywords, filePath, email], (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).send("Database error: " + err);
      }

      const journalId = result.insertId;
      console.log("Journal Inserted with ID:", journalId);

      // Insert authors into the `authors` table
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
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Internal Server Error!");
  }
});

// API to Fetch Submissions
app.get("/submissions", (req, res) => {
  const sql = "SELECT * FROM journals";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("Database error: " + err);
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
