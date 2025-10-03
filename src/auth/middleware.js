import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import prisma from '../Prisma.client.js';

dotenv.config();

//Middleware to protect routes
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("Unauthorized");
    return res.status(401).json({ message: "unauthorized" });
  }

  JWT.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "invalid token" });
    }

    req.user = user;
    next();
  });
};


//Check if a user is admin
export const isAdmin = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await prisma.users.findUnique({
      where: { d_id: userId },
      select: { role: true },
    });

    if (!user) {
      console.log("Failed to select user");
      return res.status(400).json({ message: "Failed to select user" });
    }

    if (user.role !== "admin") {
      console.log("Access denied, Admin Only");
      return res.status(403).json({ message: "Access denied, Admin Only" });
    }

    next();
  } catch (err) {
    console.error("Error checking admin role:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
