const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config(); // Load environment variables from .env file

const uri = process.env.MONGODB_URI;
console.log("MongoDB URI:", uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Define a function to validate input data
function validateInputData(req) {
  const { familyType, numMembers, numChildren, annualIncome, numWorkingMembers, sourceIncome } = req.body;

  // Check if all required fields are present
  if (!familyType || !numMembers || !numChildren || !annualIncome || !numWorkingMembers || !sourceIncome) {
    throw new Error('Invalid input data');
  }

  // Check if numeric fields are valid numbers
  if (isNaN(numMembers) || isNaN(numChildren) || isNaN(annualIncome) || isNaN(numWorkingMembers)) {
    throw new Error('Invalid numeric value');
  }

  // Convert numeric fields to their appropriate data types
  return {
    familyType,
    numMembers: parseInt(numMembers),
    numChildren: parseInt(numChildren),
    annualIncome: parseFloat(annualIncome),
    numWorkingMembers: parseInt(numWorkingMembers),
    sourceIncome,
  };
}

// Define a function to insert census data into MongoDB
async function insertCensusData(censusData) {
  try {
    const collection = client.db("censusDB").collection("census");
    const result = await collection.insertOne(censusData);
    console.log(`Document inserted with _id: ${result.insertedId}`);
    return result;
  } catch (err) {
    console.error('Error inserting document:', err);
    throw err;
  }
}

// Define a function to fetch census entries from MongoDB
async function fetchCensusEntries() {
  try {
    const collection = client.db("censusDB").collection("census");
    const censusEntries = await collection.find({}).toArray();
    return censusEntries;
  } catch (err) {
    console.error('Error fetching census entries:', err);
    throw err;
  }
}

// Define routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/submit-census', async (req, res) => {
  try {
    await client.connect();
    const censusData = validateInputData(req);
    await insertCensusData(censusData);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error submitting census data' });
  }
});

app.get('/generate-report-data', async (req, res) => {
  try {
    await client.connect();
    const censusEntries = await fetchCensusEntries();
    res.setHeader('Content-Type', 'application/json');
    res.json(censusEntries);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error generating report' });
  }
});
app.get('/generate-report', (req, res) => {
  res.redirect('/report.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});