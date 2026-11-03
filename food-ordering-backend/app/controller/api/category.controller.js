const Category = require("../../models/category.model");
const Food = require("../../models/food.model");
const StatusCode = require("../../utils/statusCode");

class CategoryController {

  async getCategories(req, res, next) {
    try {
      const categories = await Category.find().sort({ name: 1 });
      return res.status(StatusCode.OK).json({ status: true, message: "Categories fetched successfully", data: categories });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async createCategory(req, res, next) {
    try {
      const category = await Category.create(req.body);
      return res.status(StatusCode.CREATED).json({ status: true, message: "Category created successfully", data: category });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async updateCategory(req, res, next) {
    try {
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!category) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Category not found" });
      }
      return res.status(StatusCode.OK).json({ status: true, message: "Category updated successfully", data: category });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

 
  async deleteCategory(req, res, next) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(StatusCode.NOT_FOUND).json({ status: false, message: "Category not found" });
      }

      const foodCount = await Food.countDocuments({ category: category._id });
      if (foodCount > 0) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: `Cannot delete, ${foodCount} food item(s) are using this category`,
        });
      }

      await category.deleteOne();
      return res.status(StatusCode.OK).json({ status: true, message: "Category deleted successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new CategoryController();
