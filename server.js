const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '&Vishwa05&',
  database: 'visar_examination_project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API endpoint to store timetables
app.post('/api/store-timetables', (req, res) => {
  const { tableName, data } = req.body;

  if (!tableName || !data) {
    return res.status(400).json({ error: 'Missing tableName or data' });
  }

  let timetables;
  try {
    timetables = JSON.parse(data);
  } catch (error) {
    console.error('Invalid JSON data:', error);
    return res.status(400).json({ error: 'Invalid JSON data', details: error.message });
  }

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_start_date DATE,
      subject_name VARCHAR(255),
      staff_name VARCHAR(255),
      staff_email VARCHAR(255),
      subject_completion FLOAT
    )
  `;

  db.query(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return res.status(500).json({ error: 'Error creating table', details: err.message });
    }

    const insertSQL = `
      INSERT INTO ${tableName} 
      (exam_start_date, subject_name, staff_name, staff_email, subject_completion) 
      VALUES ?
    `;

    const values = timetables.flatMap(timetable => 
      timetable.subjects.map(subject => [
        new Date(timetable.examStartDate),
        subject.subjectName,
        subject.staffName,
        subject.staffEmail,
        subject.subjectCompletion
      ])
    );

    db.query(insertSQL, [values], (err, result) => {
      if (err) {
        console.error('Error storing data:', err);
        return res.status(500).json({ error: 'Error storing data', details: err.message });
      }
      res.json({ message: 'Data stored successfully', affectedRows: result.affectedRows });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});