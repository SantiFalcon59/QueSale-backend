import AllowedLocationService from '../services/AllowedLocationService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AllowedLocationController {
  static async getAll(req, res, next) {
    try {
      const locations = await AllowedLocationService.getAll();
      sendSuccess(res, locations, 'Locations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getActive(req, res, next) {
    try {
      const locations = await AllowedLocationService.getActiveOnly();
      sendSuccess(res, locations, 'Active locations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async check(req, res, next) {
    try {
      const { city, state, country } = req.query;
      const allowed = await AllowedLocationService.checkLocation({ city, state, country });
      sendSuccess(res, { allowed }, 'Location check complete');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, type, state, country, active } = req.body;
      if (!name || !type) {
        return sendError(res, 'Name and type are required', 400);
      }
      
      const newLoc = await AllowedLocationService.create({ name, type, state, country, active });
      sendSuccess(res, newLoc, 'Location created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, type, state, country, active } = req.body;
      
      const updated = await AllowedLocationService.update(id, { name, type, state, country, active });
      sendSuccess(res, updated, 'Location updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await AllowedLocationService.delete(id);
      sendSuccess(res, null, 'Location deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default AllowedLocationController;
