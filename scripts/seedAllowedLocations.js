import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ambaLocations = [
  // CABA
  { name: 'Ciudad Autónoma de Buenos Aires', type: 'city', state: 'Ciudad Autónoma de Buenos Aires', country: 'Argentina' },
  { name: 'CABA', type: 'city', state: 'Ciudad Autónoma de Buenos Aires', country: 'Argentina' },
  // Zona Norte
  { name: 'Vicente López', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'San Isidro', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'San Fernando', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Tigre', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'General San Martín', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'San Martín', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Malvinas Argentinas', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'José C. Paz', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'San Miguel', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Pilar', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Escobar', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Campana', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Zárate', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  // Zona Oeste
  { name: 'Tres de Febrero', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Morón', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Ituzaingó', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Hurlingham', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'La Matanza', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Merlo', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Moreno', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'General Rodríguez', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Luján', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Marcos Paz', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'General Las Heras', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  // Zona Sur
  { name: 'Avellaneda', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Lanús', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Lomas de Zamora', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Almirante Brown', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Quilmes', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Berazategui', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Florencio Varela', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Esteban Echeverría', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Ezeiza', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Presidente Perón', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'San Vicente', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Cañuelas', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Brandsen', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  // Gran La Plata
  { name: 'La Plata', type: 'city', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Ensenada', type: 'partido', state: 'Buenos Aires', country: 'Argentina' },
  { name: 'Berisso', type: 'partido', state: 'Buenos Aires', country: 'Argentina' }
];

async function main() {
  console.log('Seeding default AMBA locations...');
  for (const loc of ambaLocations) {
    await prisma.allowedLocation.upsert({
      where: { name: loc.name },
      update: { type: loc.type, state: loc.state, country: loc.country, active: true },
      create: { name: loc.name, type: loc.type, state: loc.state, country: loc.country, active: true }
    });
  }
  console.log('Successfully seeded allowed locations.');
}

main()
  .catch((e) => {
    console.error('Error seeding allowed locations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
