// // express web server
// const express = require('express');
// const app = express();
 
// app.get('/', (req, res) => {
//   res.send("Hello12");
// });

// const port = 3000;
 
// app.listen(process.env.PORT || 4000, () => {
//   console.log('Web Server is listening at port ' + (process.env.PORT || 4000));
// });

const express = require('express');
const { MongoClient } = require('mongodb');  // Import MongoDB client
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// Run the database connection
connectDB();

// Set up basic route
app.get('/', (req, res) => {
  res.send('Hello12');
});

// Import contacts route (which we'll create next)
const contactsRouter = require('./routes/contacts');
app.use('/contacts', contactsRouter);

app.listen(port, () => {
  console.log(`Web Server is listening at port ${port}`);
});