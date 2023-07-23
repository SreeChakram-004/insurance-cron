const express = require('express');
const router = express.Router();
const csvtojson = require("csvtojson");
const multer = require('multer');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const asyncHandler = require('express-async-handler');
const { connectDB } = require('../config/db');
const Agent = require('../models/AgentModel');
const PolicyCarrier = require('../models/PolicyCarrierModel');
const PolicyCategory = require('../models/PolicyCategoryModel');
const PolicyInfo = require('../models/PolicyInfoModel');
const UserAccount = require('../models/UserAccountModel');
const User = require('../models/UserModel');

// Connect to MongoDB
connectDB();

// Multer configuration for file upload
const upload = multer({ dest: 'uploads/' });

// Middleware to handle file upload and insert data into MongoDB using worker threads
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;

  try {
    if (isMainThread) {
      await processData(filePath); // Directly handle file processing in the main thread
      return res.status(201).json({ message: 'Data successfully updated' });
    } else {
      throw new Error('createWorkerThread must be called from the main thread');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Function to process data and insert into the database
async function processData(filePath) {
  const csvData = await csvtojson().fromFile(filePath);

  // Extracting data from csvData and creating entries for each model
  const agents = csvData.map(data => ({ name: data.agent }));
  const policyCarriers = csvData.map(data => ({ companyName: data.company_name }));
  const policyCategories = csvData.map(data => ({ categoryName: data.category_name }));
  const userAccounts = csvData.map(data => ({ accountName: data.account_name }));
  const users = csvData.map(data => ({
    firstName: data.firstname,
    dob: data.dob,
    address: data.address,
    phone: data.phone,
    state: data.state,
    zipCode: data.zip,
    email: data.email,
    gender: data.gender,
    userType: data.userType,
  }));
  const policyInfos = csvData.map(data => ({
    policyNumber: data.policy_number,
    policyStartDate: data.policy_start_date,
    policyEndDate: data.policy_end_date,
    policyCategory: policyCategories.find(cat => cat.categoryName === data.category_name)._id,
    collectionId: data.collectionId,
    companyCollectionId: data.companyCollectionId,
    userId: users.find(user => user.email === data.email)._id,
  }));

  // Inserting data into the database using createWorkerThread
  await createWorkerThread(agents, policyCarriers, policyCategories, userAccounts, users, policyInfos);
}

// Create a worker thread to handle the file processing task
function createWorkerThread(...dataArrays) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: dataArrays });

    worker.on('message', (message) => {
      if (message.type === 'success') {
        resolve(message.data);
      } else if (message.type === 'error') {
        reject(new Error(message.data));
      }
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// If the current script is running as a worker thread, execute the data processing
if (!isMainThread) {
    const dataArrays = workerData;
    const [agents, policyCarriers, policyCategories, userAccounts, users, policyInfos] = dataArrays;
    processDataInWorker(agents, policyCarriers, policyCategories, userAccounts, users, policyInfos)
      .then((result) => parentPort.postMessage({ type: 'success', data: result }))
      .catch((error) => parentPort.postMessage({ type: 'error', data: error.message }));
}

// Function to insert data into the database using worker threads
async function processDataInWorker(agents, policyCarriers, policyCategories, userAccounts, users, policyInfos) {
  // Inserting data into the database
  await Agent.insertMany(agents);
  await PolicyCarrier.insertMany(policyCarriers);
  await PolicyCategory.insertMany(policyCategories);
  await UserAccount.insertMany(userAccounts);
  await User.insertMany(users);
  await PolicyInfo.insertMany(policyInfos);
}

// Route for file upload
router.post('/file', upload.single('file'), uploadFile);

module.exports = router;
