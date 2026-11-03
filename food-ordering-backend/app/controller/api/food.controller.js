const Food = require("../../models/food.model");
const Category = require("../../models/category.model");
const Restaurant = require("../../models/restaurant.model");
const StatusCode = require("../../utils/statusCode");
const { getPagination, paginationMeta, escapeRegex } = require("../../utils/helper");

const sortOptions = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  latest: { createdAt: -1 },
};

const getOwnFood = async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) {
    res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "Create your restaurant first" });
    return null;
  }

  const food = await Food.findById(req.params.id);
  if (!food) {
    res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Food not found" });
    return null;
  }

  if (!food.restaurant.equals(restaurant._id)) {
    res.status(StatusCode.FORBIDDEN).json({ status: false, message: "This food does not belong to your restaurant" });
    return null;
  }
  return food;
};

class FoodController {
 
  async createFood(req, res, next) {
    try {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "Create your restaurant first" });
      }

      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Category not found" });
      }

      const food = await Food.create({ ...req.body, restaurant: restaurant._id });
      return res.status(StatusCode.CREATED).json({ status: true, message: "Food added successfully", data: food });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateFood(req, res, next) {
    try {
      const food = await getOwnFood(req, res);
      if (!food) return;

      if (req.body.category) {
        const category = await Category.findById(req.body.category);
        if (!category) {
          return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Category not found" });
        }
      }

      Object.assign(food, req.body);
      await food.save();
      return res.status(StatusCode.OK).json({ status: true, message: "Food updated successfully", data: food });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateAvailability(req, res, next) {
    try {
      const food = await getOwnFood(req, res);
      if (!food) return;

      food.isAvailable = req.body.isAvailable;
      await food.save();
      return res.status(StatusCode.OK).json({ status: true, message: "Food availability updated", data: food });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async deleteFood(req, res, next) {
    try {
      const food = await getOwnFood(req, res);
      if (!food) return;

      await food.deleteOne();
      return res.status(StatusCode.OK).json({ status: true, message: "Food deleted successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getMyFoods(req, res, next) {
    try {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.status(StatusCode.BAD_REQUEST).json({ status: false, message: "Create your restaurant first" });
      }

      const foods = await Food.find({ restaurant: restaurant._id }).populate("category", "name").sort({ createdAt: -1 });
      return res.status(StatusCode.OK).json({ status: true, message: "Foods fetched successfully", data: foods });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getFoods(req, res, next) {
    try {
      const { search, category, isVeg, minPrice, maxPrice, restaurant, sort } = req.query;
      const { page, limit, skip } = getPagination(req.query);

      const filter = { isAvailable: true };
      if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
      if (category) filter.category = category;
      if (restaurant) filter.restaurant = restaurant;
      if (isVeg === "true" || isVeg === "false") filter.isVeg = isVeg === "true";
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const [foods, total] = await Promise.all([
        Food.find(filter)
          .populate("category", "name")
          .populate("restaurant", "name status")
          .sort(sortOptions[sort] || sortOptions.latest)
          .skip(skip)
          .limit(limit),
        Food.countDocuments(filter),
      ]);

      return res.status(StatusCode.OK).json({
        status: true,
        message: "Foods fetched successfully",
        data: foods,
        pagination: paginationMeta(total, page, limit),
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getFoodById(req, res, next) {
    try {
      const food = await Food.findById(req.params.id).populate("category", "name").populate("restaurant", "name status");
      if (!food) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Food not found" });
      }
      return res.status(StatusCode.OK).json({ status: true, message: "Food fetched successfully", data: food });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new FoodController();
