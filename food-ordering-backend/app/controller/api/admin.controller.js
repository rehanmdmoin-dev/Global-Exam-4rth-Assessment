const User = require("../../models/user.model");
const Restaurant = require("../../models/restaurant.model");
const Order = require("../../models/order.model");
const StatusCode = require("../../utils/statusCode");
const { getPagination, paginationMeta, escapeRegex } = require("../../utils/helper");

class AdminController {
 
  async getUsers(req, res, next) {
    try {
      const { role, isBlocked, search } = req.query;
      const { page, limit, skip } = getPagination(req.query);

      const filter = {};
      if (role) filter.role = role;
      if (isBlocked === "true" || isBlocked === "false") filter.isBlocked = isBlocked === "true";
      if (search) {
        const regex = { $regex: escapeRegex(search), $options: "i" };
        filter.$or = [{ name: regex }, { email: regex }];
      }

      const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);

      return res.status(StatusCode.OK).json({
        status: true,
        message: "Users fetched successfully",
        data: users,
        pagination: paginationMeta(total, page, limit),
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async blockUser(req, res, next) {
    try {
      return await changeBlockStatus(req, res, true);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async unblockUser(req, res, next) {
    try {
      return await changeBlockStatus(req, res, false);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async getRestaurants(req, res, next) {
    try {
      const { search, status } = req.query;
      const { page, limit, skip } = getPagination(req.query);

      const filter = {};
      if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
      if (status === "open" || status === "closed") filter.status = status;

      const [restaurants, total] = await Promise.all([
        Restaurant.find(filter).populate("owner", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
        Restaurant.countDocuments(filter),
      ]);

      return res.status(StatusCode.OK).json({
        status: true,
        message: "Restaurants fetched successfully",
        data: restaurants,
        pagination: paginationMeta(total, page, limit),
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const [totalUsers, totalOwners, blockedUsers, totalRestaurants, totalOrders, revenue, ordersByStatus] = await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "restaurantOwner" }),
        User.countDocuments({ isBlocked: true }),
        Restaurant.countDocuments(),
        Order.countDocuments(),
        
        Order.aggregate([{ $match: { status: "delivered" } }, { $group: { _id: null, total: { $sum: "$totalAmount" }, orders: { $sum: 1 } } }]),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ]);

      return res.status(StatusCode.OK).json({
        status: true,
        message: "Stats fetched successfully",
        data: {
          totalUsers,
          totalOwners,
          blockedUsers,
          totalRestaurants,
          totalOrders,
          deliveredOrders: revenue.length ? revenue[0].orders : 0,
          totalRevenue: revenue.length ? revenue[0].total : 0,
          ordersByStatus: ordersByStatus.map((item) => ({ status: item._id, count: item.count })),
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

const changeBlockStatus = async (req, res, isBlocked) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "User not found" });
  }
  if (user.role === "admin") {
    return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "Admin account cannot be blocked" });
  }

  user.isBlocked = isBlocked;

  if (isBlocked) user.refreshToken = null;
  await user.save();

  return res.status(StatusCode.OK).json({
    status: true,
    message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
    data: { id: user._id, name: user.name, email: user.email, isBlocked: user.isBlocked },
  });
};

module.exports = new AdminController();
