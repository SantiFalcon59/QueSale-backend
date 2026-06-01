import InterestModel from '../models/Interest.js';

export class InterestService {
  static async getCategories() {
    const interests = await InterestModel.getAll();
    const categories = await Promise.all(
      interests.map(async (interest) => ({
        id: interest.id_interest,
        name: interest.name,
        icon_url: interest.icon_url,
        color: interest.color,
        events_count: await InterestModel.getEventsCount(interest.id_interest),
      }))
    );
    return categories;
  }

  static async createCategory(name, icon_url, color) {
    const existing = await InterestModel.findByName(name);
    if (existing) {
      throw { statusCode: 400, message: 'Category already exists' };
    }
    return await InterestModel.create({ name, icon_url, color });
  }
}

export default InterestService;
