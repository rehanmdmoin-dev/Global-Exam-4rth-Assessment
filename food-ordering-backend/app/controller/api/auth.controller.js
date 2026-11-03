const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const StatusCode = require("../../utils/statusCode");
const { generateAccessToken, generateRefreshToken } = require("../../utils/token");

class AuthController {
 
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(StatusCode.CONFLICT).json({ status: false, message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, role });

      return res.status(StatusCode.CREATED).json({
        status: true,
        message: "Registered successfully",
        data: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(StatusCode.UNAUTHORIZED).json({ status: false, message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(StatusCode.UNAUTHORIZED).json({ status: false, message: "Invalid email or password" });
      }

      if (user.isBlocked) {
        return res.status(StatusCode.FORBIDDEN).json({ status: false, message: "Your account is blocked" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      return res.status(StatusCode.OK).json({
        status: true,
        message: "Login successful",
        data: {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

 
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id).select("+refreshToken");

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(StatusCode.UNAUTHORIZED).json({ status: false, message: "Invalid refresh token" });
      }
      if (user.isBlocked) {
        return res.status(StatusCode.FORBIDDEN).json({ status: false, message: "Your account is blocked" });
      }

     
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      user.refreshToken = newRefreshToken;
      await user.save();

      return res.status(StatusCode.OK).json({
        status: true,
        message: "Token refreshed successfully",
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async logout(req, res, next) {
    try {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
      return res.status(StatusCode.OK).json({ status: true, message: "Logged out successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async getProfile(req, res, next) {
    try {
      const { _id, name, email, role, createdAt } = req.user;
      return res.status(StatusCode.OK).json({
        status: true,
        message: "Profile fetched successfully",
        data: { id: _id, name, email, role, createdAt },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new AuthController();
