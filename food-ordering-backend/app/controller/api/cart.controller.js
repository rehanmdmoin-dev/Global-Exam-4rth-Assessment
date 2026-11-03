const Cart = require("../../models/cart.model");
const Food = require("../../models/food.model");
const StatusCode = require("../../utils/statusCode");
const { roundPrice } = require("../../utils/helper");


const getCartView = async (userId) => {
  const cart = await Cart.findOne({ user: userId })
    .populate("items.food", "name price image isVeg isAvailable")
    .populate("restaurant", "name status");

  if (!cart) return { restaurant: null, items: [], totalItems: 0, totalPrice: 0 };

  const items = cart.items
    .filter((item) => item.food)
    .map((item) => ({ food: item.food, quantity: item.quantity, subTotal: roundPrice(item.food.price * item.quantity) }));

  return {
    restaurant: cart.restaurant,
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: roundPrice(items.reduce((sum, item) => sum + item.subTotal, 0)),
  };
};

class CartController {

  async getCart(req, res, next) {
    try {
      const data = await getCartView(req.user._id);
      return res.status(StatusCode.OK).json({ status: true, message: "Cart fetched successfully", data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async addToCart(req, res, next) {
    try {
      const { foodId, quantity } = req.body;

      const food = await Food.findById(foodId).populate("restaurant", "status");
      if (!food) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Food not found" });
      }
      if (!food.isAvailable) {
        return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "This food is not available right now" });
      }
      if (food.restaurant.status !== "open") {
        return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "This restaurant is closed right now" });
      }

    
      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) cart = new Cart({ user: req.user._id, items: [] });

      if (cart.items.length > 0 && cart.restaurant && !cart.restaurant.equals(food.restaurant._id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Your cart has food from another restaurant, clear the cart first",
        });
      }

      const index = cart.items.findIndex((item) => item.food.toString() === foodId);
      if (index > -1) {
        cart.items[index].quantity = Math.min(cart.items[index].quantity + quantity, 20);
      } else {
        cart.items.push({ food: food._id, quantity });
      }
      cart.restaurant = food.restaurant._id;
      await cart.save();

      const data = await getCartView(req.user._id);
      return res.status(StatusCode.OK).json({ status: true, message: "Food added to cart", data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async updateQuantity(req, res, next) {
    try {
      const { foodId } = req.params;
      const { action } = req.body;

      const cart = await Cart.findOne({ user: req.user._id });
      const index = cart ? cart.items.findIndex((item) => item.food.toString() === foodId) : -1;
      if (index === -1) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Food not found in your cart" });
      }

      if (action === "increase") {
        if (cart.items[index].quantity >= 20) {
          return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "Maximum quantity is 20" });
        }
        cart.items[index].quantity += 1;
      } else {
        cart.items[index].quantity -= 1;
        if (cart.items[index].quantity < 1) cart.items.splice(index, 1);
      }

      if (cart.items.length === 0) cart.restaurant = null;
      await cart.save();

      const data = await getCartView(req.user._id);
      return res.status(StatusCode.OK).json({ status: true, message: "Cart updated successfully", data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async removeItem(req, res, next) {
    try {
      const { foodId } = req.params;

      const cart = await Cart.findOne({ user: req.user._id });
      const index = cart ? cart.items.findIndex((item) => item.food.toString() === foodId) : -1;
      if (index === -1) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Food not found in your cart" });
      }

      cart.items.splice(index, 1);
      if (cart.items.length === 0) cart.restaurant = null;
      await cart.save();

      const data = await getCartView(req.user._id);
      return res.status(StatusCode.OK).json({ status: true, message: "Food removed from cart", data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  
  async clearCart(req, res, next) {
    try {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], restaurant: null });
      return res.status(StatusCode.OK).json({
        status: true,
        message: "Cart cleared successfully",
        data: { restaurant: null, items: [], totalItems: 0, totalPrice: 0 },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new CartController();
