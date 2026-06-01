import prisma from '../config/prisma.js';

export class InterestModel {
  static async getAll() {
    return await prisma.interest.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async findById(id) {
    return await prisma.interest.findUnique({
      where: { id_interest: id },
    });
  }

  static async findByName(name) {
    return await prisma.interest.findFirst({
      where: { name: { equals: name } },
    });
  }

  static async create(data) {
    return await prisma.interest.create({ data });
  }

  static async getEventsCount(interestId) {
    return await prisma.eventInterest.count({
      where: { id_interest: interestId },
    });
  }
}

export default InterestModel;
