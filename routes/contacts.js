const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB client setup
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'contacts'; // replace with your actual database name

// Middleware to connect to the database
async function connectToDB() {
  await client.connect();
  return client.db(dbName);
}

// GET all contacts
router.get('/', async (req, res) => {
  try {
    const db = await connectToDB();
    const contacts = await db.collection('contacts').find().toArray();
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ message: 'Failed to retrieve contacts' });
  }
});

// GET a single contact by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await connectToDB();
    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(req.params.id) });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (err) {
    console.error('Error fetching contact:', err);
    res.status(500).json({ message: 'Failed to retrieve contact' });
  }
});

module.exports = router;