const Plan = require('../models/Plan');

// Get all plans
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({
      displayOrder: 1,
    });

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
// Get active plans for mobile users
const getActivePlans = async (req, res) => {
  try {
    const plans = await Plan.find({
      status: true,
    }).sort({
      displayOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('Get active plans error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to load plans',
    });
  }
};
// Add plan
const addPlan = async (req, res) => {
  try {
    const {
      title,
      description = '',
      image = '',
      category = 'General',
      price,
      duration,
      returnAmount = 0,
      displayOrder = 1,
      status = true,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Plan title is required',
      });
    }

    if (
      price === undefined ||
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid plan price',
      });
    }

    if (
      duration === undefined ||
      Number.isNaN(Number(duration)) ||
      Number(duration) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be at least 1 day',
      });
    }

    if (
      Number.isNaN(Number(returnAmount)) ||
      Number(returnAmount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid return amount',
      });
    }

    const plan = await Plan.create({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      category: category.trim() || 'General',
      price: Number(price),
      duration: Number(duration),
      returnAmount: Number(returnAmount),
      displayOrder: Number(displayOrder),
      status: Boolean(status),
    });

    return res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      plan,
    });
  } catch (error) {
    console.error('Add plan error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create plan',
    });
  }
};

// Update plan
const updatePlan = async (req, res) => {
  try {
    const existingPlan = await Plan.findById(req.params.id);

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    const {
      title,
      description,
      image,
      category,
      price,
      duration,
      returnAmount,
      displayOrder,
      status,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Plan title is required',
        });
      }

      existingPlan.title = title.trim();
    }

    if (description !== undefined) {
      existingPlan.description = description.trim();
    }

    if (image !== undefined) {
      existingPlan.image = image.trim();
    }

    if (category !== undefined) {
      existingPlan.category =
        category.trim() || 'General';
    }

    if (price !== undefined) {
      if (
        Number.isNaN(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Enter a valid plan price',
        });
      }

      existingPlan.price = Number(price);
    }

    if (duration !== undefined) {
      if (
        Number.isNaN(Number(duration)) ||
        Number(duration) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'Duration must be at least 1 day',
        });
      }

      existingPlan.duration = Number(duration);
    }

    if (returnAmount !== undefined) {
      if (
        Number.isNaN(Number(returnAmount)) ||
        Number(returnAmount) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Enter a valid return amount',
        });
      }

      existingPlan.returnAmount =
        Number(returnAmount);
    }

    if (displayOrder !== undefined) {
      existingPlan.displayOrder =
        Number(displayOrder);
    }

    if (status !== undefined) {
      existingPlan.status =
        status === true || status === 'true';
    }

    const plan = await existingPlan.save();

    return res.json({
      success: true,
      message: 'Plan updated successfully',
      plan,
    });
  } catch (error) {
    console.error('Update plan error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to update plan',
    });
  }
};
// Delete plan
const deletePlan = async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Plan Deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getPlans,
  getActivePlans,
  getPlan,
  addPlan,
  updatePlan,
  deletePlan,
};