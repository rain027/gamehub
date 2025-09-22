// server/src/routes/auth.js
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Only allow valid roles, default to "user"
    const userRole = role && ["user", "developer", "admin"].includes(role) ? role : "user";

    const user = await User.create({ username, email, password, role: userRole });

    const token = jwt.sign(
      { id: user._id, role: user.role }, // include role in token
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Login
// server/src/routes/auth.js
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // include role in token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
