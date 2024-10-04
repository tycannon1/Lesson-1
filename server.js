// // // express web server
// // const express = require('express');
// // const app = express();
 
// // app.get('/', (req, res) => {
// //   res.send("Hello12");
// // });

// // const port = 3000;
 
// // app.listen(process.env.PORT || 4000, () => {
// //   console.log('Web Server is listening at port ' + (process.env.PORT || 4000));
// // });

// // ----- second try

// const express = require('express');
// const { MongoClient } = require('mongodb');  // Import MongoDB client
// require('dotenv').config(); // Load environment variables

// const app = express();
// const port = process.env.PORT || 4000;

// // // Connect to MongoDB
// // const client = new MongoClient(process.env.MONGODB_URI);

// // async function connectDB() {
// //   try {
// //     await client.connect();
// //     console.log('Connected to MongoDB');
// //   } catch (err) {
// //     console.error('Error connecting to MongoDB:', err);
// //   }
// // }

// const {mongoClient} = require ('mongodb');

// async function main() {

//   const uri = "mongodb+srv://tycannon:mutual@cluster0.7fujz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

//   const client = new MongoClient(uri);

//   try {
//   await client.connect();

//   await deleteContactByName(client, "Sadie");

//   } catch (e) {
//     console.error(e);
//   }
//   finally {
//     await client.close();
//   }
// }

// main().catch(console.error);

// async function deleteContactByName(client, nameOfContact) {
//    const result = await client.db("contacts").collection("contacts").deleteOne({firstName: nameOfContact});

//    console.log(`${result.deletedCount} document(s) was/were deleted`);
// }

// async function updateContactByName(client, nameOfContact, updatedName) {
//   const result = await client.db("contacts").collection("contacts").updateOne({ firstName: nameOfContact }, { $set: updatedName });

//   console.log(`${result.matchedCount} document(s) matched the query criteria`)
//   console.log(`${result.modifiedCount} documents was/were updated`);
// }

// async function findOneContactByName(client, nameOfContact) {
//   const result = await client.db("contacts").collection("contacts").findOne({firstName: nameOfContact});
//   if (result) {
//     console.log(`Found a contact in the collection with the name '${nameOfContact}'`);
//     console.log(result);
//   } else {
//     console.log(`No listings found with the name '${nameOfContact}'`);
//   }
// }

// async function createMultipleContacts(client, newContacts) {
//   const results = await client.db("contacts").collection("contacts").insertMany(newContacts);

//   console.log(`${results.insertedCount} new listings created with the following id's:`);
//   console.log(results.insertedIds);
// }

// async function createContact(client, newContact) {
//   const result = await client.db("contacts").collection("contacts").insertOne(newContact);

//   console.log(`New contact created with the following id: ${result.insertedId}`);
// }

// async function listDatabases(client) {
//   const databasesList = await client.db().admin().listDatabases();

//   console.log("Databases:");
//   databasesList.databases.forEach(db => {
//     console.log(`- ${db.name}`);
//   })
// }



// // // Run the database connection
// // connectDB();

// // Set up basic route
// app.get('/', (req, res) => {
//   res.send('Hello12');
// });

// // // Import contacts route (which we'll create next)
// // const contactsRouter = require('./routes/contacts');
// // app.use('/contacts', contactsRouter);

// app.listen(port, () => {
//   console.log(`Web Server is listening at port ${port}`);
// });
const { ObjectId } = require('mongodb');
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGODB_URI || "mongodb+srv://tycannon:mutual@cluster0.7fujz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// 2. Fetch and Display Contacts on the Home Page
app.get('/', async (req, res) => {
  try {
    const contacts = await client.db("contacts").collection("contacts").find().toArray();
    res.render('index', { contacts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching contacts');
  }
});

// 3. Create a New Contact (via form submission)
app.post('/contacts', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    await client.db("contacts").collection("contacts").insertOne({ firstName, lastName, email });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating contact');
  }
});

// 4. Update a Contact
app.post('/contacts/update', async (req, res) => {
  try {
    // Log the incoming data
    console.log('Request Body:', req.body);

    const { searchFirstName, firstName, lastName, email } = req.body;

    // Check if any of the fields are missing
    if (!searchFirstName || !firstName || !lastName || !email) {
      console.error('Missing fields in the request');
      return res.status(400).send('All fields are required');
    }

    // Log the update operation
    console.log(`Updating contact with first name: ${searchFirstName}`);
    console.log(`New values: First Name: ${firstName}, Last Name: ${lastName}, Email: ${email}`);

    // Update the contact identified by the searchFirstName
    const result = await client.db("contacts").collection("contacts").updateOne(
      { firstName: searchFirstName }, // Find the contact by the first name
      { $set: { firstName, lastName, email } } // Set the updated fields
    );

    // Check if the update operation was successful
    if (result.matchedCount === 0) {
      console.error('No contact found with the given first name');
      return res.status(404).send('No contact found with that first name');
    }

    console.log('Contact updated successfully');
    res.redirect('/');
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 5. Delete a Contact
app.post('/contacts/delete', async (req, res) => {
  try {
    // Log the incoming request
    console.log('Request Body:', req.body);

    const { id } = req.body;

    // Check if the id field is present
    if (!id) {
      console.error('Contact ID is missing');
      return res.status(400).send('Contact ID is required');
    }

    // Log the delete operation
    console.log(`Deleting contact with ID: ${id}`);

    // Delete the contact by ID
    const result = await client.db("contacts").collection("contacts").deleteOne({ _id: new ObjectId(id) });

    // Check if the delete operation was successful
    if (result.deletedCount === 0) {
      console.error('No contact found with the given ID');
      return res.status(404).send('No contact found with that ID');
    }

    console.log('Contact deleted successfully');
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Listen on the specified port
app.listen(port, async () => {
  await connectDB();
  console.log(`Web Server is listening at port ${port}`);
});