const express = require('express');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const router = express.Router();

router.post('/add_plan', async (req, res) => {
  try {
    const plan = new SubscriptionPlan(req.body);
    await plan.save();
    res.status(201).send(plan);
  } catch (error) {
    res.status(400).send(error);
  }
});

// router.post('/edit_plan', async (req, res) => {
//   try {
//     const planId = req.body.planId;
//     const existingPlan = await SubscriptionPlan.findById(planId);

//     if (!existingPlan) {
//       return res.status(404).send('Plan not found');
//     }

//     const updatePayload = {
//       name: req.body.name,
//       amount: req.body.amount,
//       category: req.body.category,
//       nextPaymentDate: req.body.nextPaymentDate,
//       description: req.body.description,
//     };

//     await SubscriptionPlan.findOneAndUpdate({ _id: planId }, updatePayload);
//     res.send('Plan updated successfully');
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get('/:userId', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ userId: req.params.userId });
    res.send(plans);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/:planId', async (req, res) => {
  try {
    const planId = req.params.planId;
    await SubscriptionPlan.findByIdAndDelete(planId);
    res.status(200).send('Plan deleted successfully');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
