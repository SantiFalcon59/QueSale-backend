import InterestService from '../services/InterestService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class InterestController {
  static async getCategories(req, res, next) {
    try {
      const categories = await InterestService.getCategories();
      sendSuccess(res, categories, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const { name, icon_url, color } = req.body;
      if (!name) return sendError(res, 'Name is required', 400);
      const category = await InterestService.createCategory(name, icon_url, color);
      sendSuccess(res, category, 'Category created', 201);
    } catch (error) {
      next(error);
    }
  }
}

export default InterestController;
