const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
const Restaurant = require("../../models/restaurant.model");
const StatusCode = require("../../utils/statusCode");
const { getPagination, paginationMeta, roundPrice } = require("../../utils/helper");


const ownerFlow = {
  pending: ["accepted", "rejected"],
  accepted: ["preparing"],
  preparing: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
};

class OrderController {
  async createOrder(req, res, next) {
    try {
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.food");
      if (!cart || cart.items.length === 0) {
        return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "Your cart is empty" });
      }

      const restaurant = await Restaurant.findById(cart.restaurant);
      if (!restaurant || restaurant.status !== "open") {
        return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "This restaurant is closed right now" });
      }

      const items = [];
      let totalAmount = 0;
      for (const item of cart.items) {
        if (!item.food || !item.food.isAvailable) {
          const name = item.food ? item.food.name : "An item";
          return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: `${name} is no longer available, please update your cart` });
        }
        items.push({ food: item.food._id, name: item.food.name, price: item.food.price, quantity: item.quantity });
        totalAmount += item.food.price * item.quantity;
      }

      const order = await Order.create({
        user: req.user._id,
        restaurant: restaurant._id,
        items,
        totalAmount: roundPrice(totalAmount),
        deliveryAddress: req.body.deliveryAddress,
        note: req.body.note,
        statusHistory: [{ status: "pending", changedBy: req.user._id }],
      });

    
      cart.items = [];
      cart.restaurant = null;
      await cart.save();

      return res.status(StatusCode.CREATED).json({ status: true, message: "Order placed successfully", data: order });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const filter = {};

      if (req.user.role === "user") {
        filter.user = req.user._id;
      } else if (req.user.role === "restaurantOwner") {
        const restaurant = await Restaurant.findOne({ owner: req.user._id });
        if (!restaurant) {
          return res.status(StatusCode.OK).json({
            status: true,
            message: "Orders fetched successfully",
            data: [],
            pagination: paginationMeta(0, page, limit),
          });
        }
        filter.restaurant = restaurant._id;
      }

      if (req.query.status) filter.status = req.query.status;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate("user", "name email")
          .populate("restaurant", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Order.countDocuments(filter),
      ]);

      return res.status(StatusCode.OK).json({
        status: true,
        message: "Orders fetched successfully",
        data: orders,
        pagination: paginationMeta(total, page, limit),
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await Order.findById(req.params.id).populate("user", "name email").populate("restaurant", "name owner");
      if (!order) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Order not found" });
      }

      const isOrderUser = order.user._id.equals(req.user._id);
      const isRestaurantOwner = order.restaurant.owner.equals(req.user._id);
      if (req.user.role !== "admin" && !isOrderUser && !isRestaurantOwner) {
        return res.status(StatusCode.FORBIDDEN).json({ status: false, message: "You cannot access this order" });
      }

      return res.status(StatusCode.OK).json({ status: true, message: "Order fetched successfully", data: order });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;

      const order = await Order.findById(req.params.id).populate("restaurant", "owner");
      if (!order) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Order not found" });
      }

      let allowed = [];

      if (req.user.role === "user") {
        if (!order.user.equals(req.user._id)) {
          return res.status(StatusCode.FORBIDDEN).json({ status: false, message: "You can only cancel your own orders" });
        }
        if (order.status === "pending") allowed = ["cancelled"];
      } else if (req.user.role === "restaurantOwner") {
        if (!order.restaurant.owner.equals(req.user._id)) {
          return res.status(StatusCode.FORBIDDEN).json({ status: false, message: "This order does not belong to your restaurant" });
        }
        allowed = ownerFlow[order.status] || [];
      } else {
        allowed = [...(ownerFlow[order.status] || [])];
        if (["pending", "accepted", "preparing"].includes(order.status)) allowed.push("cancelled");
      }

      if (!allowed.includes(status)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: `You cannot change this order from "${order.status}" to "${status}"`,
        });
      }

      order.status = status;
      order.statusHistory.push({ status, changedBy: req.user._id });
      await order.save();

      return res.status(StatusCode.OK).json({ status: true, message: `Order ${status.replace(/_/g, " ")}`, data: order });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new OrderController();
