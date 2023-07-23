const express = require('express');
const router = express.Router();
const PolicyInfo = require('../models/PolicyInfoModel');
const User = require('../models/UserModel');

// Search API to find policy info by username
router.get('/user/search', async (req, res) => {
  try {
    const { username } = req.query;
    console.log('Received username:', username);

    // Find the user with the given username
    const user = await User.findOne({ firstName: username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all policy info associated with the user
    const policyInfo = await PolicyInfo.find({ userId: user._id });

    if (policyInfo.length === 0) {
      return res.status(404).json({ message: 'No policy info found for the user' });
    }

    res.json({ data: policyInfo });
  } catch (error) {
    let statusCode = error.status || 500;

    if (statusCode >= 400 && statusCode < 500) {
      statusCode = error.status;
    } else {
      console.error('Internal Server Error:', error);
    }

    res.status(statusCode).json({
      error: {
        message: error.message,
        status: statusCode,
      },
    });
  }
});

// API to provide aggregated policy info by each user
router.get('/aggregated', async (req, res) => {
    try {
      // Use MongoDB's aggregation pipeline to aggregate policy info for each user
      const aggregatedPolicyInfo = await PolicyInfo.aggregate([
        {
          $lookup: {
            from: 'users', // Name of the collection where the user data is stored
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $group: {
            _id: '$user.firstName', // Group by the user's first name
            totalPolicies: { $sum: 1 }, // Count the number of policies for each user
            totalPremiumAmount: { $sum: '$premium_amount' }, // Sum the premium amounts for each user
            policies: { $push: '$$ROOT' }, // Collect all policy documents for each user
          },
        },
        {
          $project: {
            _id: 0, // Exclude the _id field from the output
            username: '$_id',
            totalPolicies: 1,
            totalPremiumAmount: 1,
            policies: 1,
          },
        },
      ]);
  
      res.status(200).json({ data: aggregatedPolicyInfo });
    } catch (error) {
      let statusCode = error.status || 500;
  
      if (statusCode >= 400 && statusCode < 500) {
        statusCode = error.status;
      } else {
        console.error('Internal Server Error:', error);
      }
  
      res.status(statusCode).json({
        error: {
          message: error.message,
          status: statusCode,
        },
      });
    }
});

router.post('/agents', async (req, res) => {
    try {
      const { name } = req.body;
      const agent = new Agent({ name });
      await agent.save();
      res.status(201).json(agent);
    } catch (error) {
      handleError(error, res);
    }
  });
  
  // Route to update an agent by ID
  router.post('/agents/:id', async (req, res) => {
    try {
      const { name } = req.body;
      const updatedAgent = await Agent.findByIdAndUpdate(req.params.id, { name }, { new: true });
      if (!updatedAgent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      res.json(updatedAgent);
    } catch (error) {
      handleError(error, res);
    }
  });
  
  // Route to delete an agent by ID
  router.post('/agents/:id/delete', async (req, res) => {
    try {
      const deletedAgent = await Agent.findByIdAndRemove(req.params.id);
      if (!deletedAgent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
      handleError(error, res);
    }
  });
  
  // Error handler function
  function handleError(error, res) {
    let statusCode = error.status || 500;
  
    if (statusCode >= 400 && statusCode < 500) {
      statusCode = error.status;
    } else {
      console.error('Internal Server Error:', error);
    }
  
    res.status(statusCode).json({
      error: {
        message: error.message,
        status: statusCode,
      },
    });
  }

module.exports = router;
