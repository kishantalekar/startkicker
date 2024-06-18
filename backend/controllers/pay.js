const db = require("../models");
require("dotenv").config();
const Razorpay = require("razorpay");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_WHDwkn3KLG9Dqe",
  key_secret: "IYsU7N4vkH794kRdGFuKZxWE",
});

// Function to create a customer (for Stripe, retained for completeness)
const createCustomer = async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;

  try {
    const customer = await stripe.customers.create({ email });
    res.status(200).json(customer);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

// Function to create a payment intent (now for Razorpay)
const createPaymentIntent = async (req, res) => {
  console.log(req.body.metadata);
  const userId = req.body.metadata.userId;
  const metadata = req.body.metadata || {};
  // const supportPj = metadata.project;
  // const selectPlan = metadata._id;

  // Remove unnecessary metadata fields
  delete req.body.metadata.backers;
  delete req.body.metadata.content;

  try {
    // Update the plan with the new backer
    // const UpdatedPlan = await db.Plan.findOne({ _id: selectPlan });
    // UpdatedPlan.backers.push(userId);
    // await UpdatedPlan.save();

    // Update the project with the new backer and increment balance
    // const foundProject = await db.Project.findById(supportPj);
    // foundProject.backers.push(userId);
    // foundProject.backersNum += 1;
    // foundProject.balance += req.body.amount / 100; // Convert amount from paisa to INR
    // await foundProject.save();

    // Update the user with the new project and plan they are supporting
    // const UpdatedUser = await db.User.findById(userId);
    // UpdatedUser.supportPj.push(supportPj);
    // UpdatedUser.selectPlan.push(selectPlan);
    // await UpdatedUser.save();

    // Create an order with Razorpay
    const options = {
      amount: req.body.amount, // Amount in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`, // Unique receipt ID
      notes: {
        userId,
        // supportPj,
        // selectPlan,
      },
    };

    const order = await razorpay.orders.create(options);
    console.log(order);
    res.status(200).json(order);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "An error occurred while creating the order" });
  }
};

module.exports = {
  createCustomer,
  createPaymentIntent,
};
