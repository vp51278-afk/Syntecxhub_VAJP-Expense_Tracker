const Goal = require("../models/Goal");

const createGoal = async (req, res) => {
  try {
    const {
      title,
      saved,
      target,
      deadline,
      icon,
    } = req.body;

    if (!title || !target || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required goal fields.",
      });
    }

    if (Number(target) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be greater than zero.",
      });
    }

    if (Number(saved || 0) < 0) {
      return res.status(400).json({
        success: false,
        message: "Saved amount cannot be negative.",
      });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      saved: Number(saved || 0),
      target: Number(target),
      deadline,
      icon: icon || "target",
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully.",
      goal,
    });
  } catch (error) {
    console.error("Create Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create goal.",
    });
  }
};


const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.user.id,
    }).sort({
      deadline: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      goals,
    });
  } catch (error) {
    console.error("Get Goals Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch goals.",
    });
  }
};


const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    const {
      title,
      saved,
      target,
      deadline,
      icon,
    } = req.body;

    if (title !== undefined) {
      goal.title = title;
    }

    if (saved !== undefined) {
      if (Number(saved) < 0) {
        return res.status(400).json({
          success: false,
          message: "Saved amount cannot be negative.",
        });
      }

      goal.saved = Number(saved);
    }

    if (target !== undefined) {
      if (Number(target) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Target amount must be greater than zero.",
        });
      }

      goal.target = Number(target);
    }

    if (deadline !== undefined) {
      goal.deadline = deadline;
    }

    if (icon !== undefined) {
      goal.icon = icon;
    }

    await goal.save();

    res.json({
      success: true,
      message: "Goal updated successfully.",
      goal,
    });
  } catch (error) {
    console.error("Update Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update goal.",
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: "Goal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete goal.",
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};