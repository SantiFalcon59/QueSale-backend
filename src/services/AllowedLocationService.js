import prisma from '../config/prisma.js';

export class AllowedLocationService {
  static async checkLocation({ city, state, country }) {
    if (!city && !state && !country) {
      return true; // Fallback for bypass (e.g. mobile simple text venues or script imports)
    }

    const activeLocations = await prisma.allowedLocation.findMany({
      where: { active: true }
    });

    if (activeLocations.length === 0) {
      return true; // If none are configured, don't block anything
    }

    const norm = (str) => str ? str.toLowerCase().trim() : '';
    const normCity = norm(city);
    const normState = norm(state);
    const normCountry = norm(country);

    for (const loc of activeLocations) {
      const locName = norm(loc.name);
      const locState = norm(loc.state);
      const locCountry = norm(loc.country);

      if (loc.type === 'country') {
        if (normCountry === locName) {
          return true;
        }
      } else if (loc.type === 'province') {
        if (normState === locName || normState.includes(locName) || locName.includes(normState)) {
          return true;
        }
      } else if (loc.type === 'city' || loc.type === 'partido') {
        // Match either locality (city) or administrative_area_level_2 (partido)
        if (normCity === locName || normCity.includes(locName) || locName.includes(normCity)) {
          return true;
        }
      }
    }

    return false;
  }

  static async getAll() {
    return prisma.allowedLocation.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async getActiveOnly() {
    return prisma.allowedLocation.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
  }

  static async create(data) {
    return prisma.allowedLocation.create({
      data: {
        name: data.name,
        type: data.type,
        state: data.state,
        country: data.country || 'Argentina',
        active: data.active !== undefined ? data.active : true
      }
    });
  }

  static async update(id, data) {
    return prisma.allowedLocation.update({
      where: { id: parseInt(id) },
      data
    });
  }

  static async delete(id) {
    return prisma.allowedLocation.delete({
      where: { id: parseInt(id) }
    });
  }
}

export default AllowedLocationService;
