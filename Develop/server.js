const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const uuid = require('uuid');
const app = express();
const PORT = 3000;
const dbPath = './db/db.json';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('short'));

// Load initial data from db.json
let db = [];
fs.readFile(dbPath, 'utf-8', (err, data) => {
    if (!err) {
        db = JSON.parse(data);
    }
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    res.json(db);
});

app.post('/api/notes', (req, res) => {
    const newNote = {
        title: req.body.title,
        text: req.body.text,
        id: uuid.v4(),
    };

    db.push(newNote);

    // Write the updated data back to db.json
    fs.writeFile(dbPath, JSON.stringify(db), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Data has been saved to db.json');
        }
    });

    res.json(newNote);
});

app.get('/api/notes/:id', (req, res) => {
    const noteID = req.params.id;
    const note = db.find(item => item.id === noteID);
    if (note) {
        res.json(note);
    } else {
        res.status(404).json({ error: 'Note not found' });
    }
});

app.delete('/api/notes/:id', (req, res) => {
    const noteID = req.params.id; 
    const noteIndex = db.findIndex(item => item.id === noteID);

    if (noteIndex !== -1) {
        db.splice(noteIndex, 1);
        fs.writeFile(dbPath, JSON.stringify(db), (err) => {
            if (err) {
                res.status(500).json({ error: 'Failed to update the database' });
            } else {
                res.json({ message: 'Note deleted' });
            }
        });
    } else {
        // If the note is not found, send a 404 error
        res.status(404).json({ error: 'Note not found' });
    }
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
