const Restaurant = require("../../models/restaurant.model");
const StatusCode = require("../../utils/statusCode");
const { getPagination, paginationMeta, escapeRegex } = require("../../utils/helper");

class RestaurantController {

  async createRestaurant(req, res, next) {
    try {
      const existing = await Restaurant.findOne({ owner: req.user._id });
      if (existing) {
        return res.status(StatusCode.CONFLICT).json({ status: false, message: "You already have a restaurant" });
      }

      const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
      return res.status(StatusCode.CREATED).json({ status: true, message: "Restaurant created successfully", data: restaurant });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async getMyRestaurant(req, res, next) {
    try {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "You have not created a restaurant yet" });
      }
      return res.status(StatusCode.OK).json({ status: true, message: "Restaurant fetched successfully", data: restaurant });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async updateMyRestaurant(req, res, next) {
    try {
     
      const restaurant = await Restaurant.findOneAndUpdate({ owner: req.user._id }, req.body, { new: true, runValidators: true });
      if (!restaurant) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "You have not created a restaurant yet" });
      }
      return res.status(StatusCode.OK).json({ status: true, message: "Restaurant updated successfully", data: restaurant });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async updateMyRestaurantStatus(req, res, next) {
    try {
      const restaurant = await Restaurant.findOneAndUpdate({ owner: req.user._id }, { status: req.body.status }, { new: true });
      if (!restaurant) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "You have not created a restaurant yet" });
      }
      return res.status(StatusCode.OK).json({ status: true, message: `Restaurant is now ${restaurant.status}`, data: restaurant });
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
        Restaurant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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

  
  async getRestaurantById(req, res, next) {
    try {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Restaurant not found" });
      }
      return res.status(StatusCode.OK).json({ status: true, message: "Restaurant fetched successfully", data: restaurant });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new RestaurantController();
