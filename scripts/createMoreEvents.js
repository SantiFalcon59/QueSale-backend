import prisma from './src/config/prisma.js';
import { v4 as uuidv4 } from 'uuid';

const PHOTOS_BY_CATEGORY = {
  Anime: [
    'https://images.unsplash.com/photo-1690645724988-e8641be3ec9c?w=800',
    'https://images.unsplash.com/photo-1721642353290-440b0ae63b9f?w=800',
    'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800',
    'https://images.unsplash.com/photo-1690645725094-6c112f8c3483?w=800',
    'https://images.unsplash.com/photo-1735720518739-3f519a8b5a73?w=800',
    'https://images.unsplash.com/photo-1725270851179-812242c19470?w=800',
    'https://images.unsplash.com/photo-1717185891319-6bf096fba62f?w=800',
    'https://images.unsplash.com/photo-1772536115144-841941588614?w=800',
    'https://images.unsplash.com/photo-1735070516022-14d176a59466?w=800',
    'https://images.unsplash.com/photo-1611433268520-1b6378eb0367?w=800',
    'https://images.unsplash.com/photo-1648445183627-a91bd8657858?w=800',
    'https://images.unsplash.com/photo-1741512612510-2e676d65e1b7?w=800',
    'https://images.unsplash.com/photo-1635706834826-253a5853652e?w=800',
  ],
  Comic: [
    'https://images.unsplash.com/photo-1605663864774-748f5f858a08?w=800',
    'https://images.unsplash.com/photo-1768765719122-a77ac1446cfa?w=800',
    'https://images.unsplash.com/photo-1746309149409-8ced6e40c9ba?w=800',
    'https://images.unsplash.com/photo-1746309027938-c23ac5c237f9?w=800',
    'https://images.unsplash.com/photo-1746309039288-3fd0fb9dda8c?w=800',
    'https://images.unsplash.com/photo-1659823304631-2fae31c5e298?w=800',
    'https://images.unsplash.com/photo-1611433210474-3876d842b0ac?w=800',
    'https://images.unsplash.com/photo-1694709234096-1902e00955bc?w=800',
    'https://images.unsplash.com/photo-1772587001610-7b1ccb1dc4b9?w=800',
    'https://images.unsplash.com/photo-1706092949204-2f5bacbf2b6c?w=800',
  ],
  Gaming: [
    'https://images.unsplash.com/photo-1697480157582-43d68447f959?w=800',
    'https://images.unsplash.com/photo-1766766465229-e85e956d1ff1?w=800',
    'https://images.unsplash.com/photo-1692897686273-5d5793b050aa?w=800',
    'https://images.unsplash.com/photo-1743358163462-7d9ff4a8878e?w=800',
    'https://images.unsplash.com/photo-1756172012277-fa631d0c50d2?w=800',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    'https://images.unsplash.com/photo-1558008258-7ff8888b42b0?w=800',
    'https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800',
    'https://images.unsplash.com/photo-1548003693-b55d51032288?w=800',
    'https://images.unsplash.com/photo-1558742619-fd82741daa99?w=800',
    'https://images.unsplash.com/photo-1633545491399-54a16aa6a871?w=800',
    'https://images.unsplash.com/photo-1759701546851-1d903ac1a2e2?w=800',
    'https://images.unsplash.com/photo-1558008258-ec20a83db196?w=800',
    'https://images.unsplash.com/photo-1558008412-40e4bac94bed?w=800',
    'https://images.unsplash.com/photo-1772587023179-d70e47f1acc0?w=800',
    'https://images.unsplash.com/photo-1772587003187-65b32c91df91?w=800',
    'https://images.unsplash.com/photo-1774167096827-059dfda7eab9?w=800',
    'https://images.unsplash.com/photo-1558008258-be2e19614dda?w=800',
  ],
  KPop: [
    'https://images.unsplash.com/photo-1746396887626-6bd54c6b2181?w=800',
    'https://images.unsplash.com/photo-1546415837-fa24d2ff108d?w=800',
    'https://images.unsplash.com/photo-1577991712260-4ee45603dab8?w=800',
    'https://images.unsplash.com/photo-1772587002770-721496741429?w=800',
  ],
  Cosplay: [
    'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800',
    'https://images.unsplash.com/photo-1611433268520-1b6378eb0367?w=800',
    'https://images.unsplash.com/photo-1772536115144-841941588614?w=800',
    'https://images.unsplash.com/photo-1605663864774-748f5f858a08?w=800',
    'https://images.unsplash.com/photo-1611433210474-3876d842b0ac?w=800',
    'https://images.unsplash.com/photo-1694709234096-1902e00955bc?w=800',
    'https://images.unsplash.com/photo-1659823304631-2fae31c5e298?w=800',
    'https://images.unsplash.com/photo-1635706834826-253a5853652e?w=800',
  ],
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRandom = (arr, count) => shuffle(arr).slice(0, count);

const NEW_EVENTS = [
  { title: 'Japan Expo BA 2026', description: 'La convención de cultura japonesa más grande de Buenos Aires. Cosplay, manga, anime, conciertos de J-Pop y food trucks de comida japonesa.', ubication: 'Centro Costa Salguero, Buenos Aires', lat: -34.5800, lng: -58.4000, price: 12500, capacity: 15000, cat: 'Anime', daysFromNow: 15 },
  { title: 'K-Pop World Fest Argentina', description: 'El festival internacional de K-Pop llega a Argentina. Concursos de baile, covers, meet & greet con influencers y tienda de merch oficial.', ubication: 'Estadio Obras, Buenos Aires', lat: -34.5800, lng: -58.4000, price: 18500, capacity: 5000, cat: 'KPop', daysFromNow: 22 },
  { title: 'Gaming Arena 2026', description: 'Torneo presencial de Valorant, League of Legends y Street Fighter. Zona free-to-play, realidad virtual y sorteos de hardware.', ubication: 'La Rural, Palermo', lat: -34.5770, lng: -58.4200, price: 8500, capacity: 8000, cat: 'Gaming', daysFromNow: 30 },
  { title: 'Comic Con Córdoba', description: 'La convención de historietas y cultura pop llega a Córdoba. Artistas invitados, lanzamientos exclusivos y cosplay contest con premios.', ubication: 'Centro de Convenciones Córdoba', lat: -31.4200, lng: -64.1800, price: 10000, capacity: 6000, cat: 'Comic', daysFromNow: 45 },
  { title: 'Anime Music Festival', description: 'Concierto de bandas tributo a openings de anime. Nostalgia pura con covers de Dragon Ball, Sailor Moon, Naruto y más.', ubication: 'Teatro Gran Rex, Buenos Aires', lat: -34.6030, lng: -58.3800, price: 15000, capacity: 3000, cat: 'Anime', daysFromNow: 20 },
  { title: 'K-Pop Dance Cover Contest', description: 'Competencia nacional de dance covers de K-Pop. Grupos de todo el país compiten por premios y la chance de abrir un show internacional.', ubication: 'Niceto Club, Buenos Aires', lat: -34.5900, lng: -58.4200, price: 5500, capacity: 1200, cat: 'KPop', daysFromNow: 10 },
  { title: 'Cosplay City Tour', description: 'Evento al aire libre con desfile de cosplay por la city. Puntos de encuentro temáticos, photobooths y concurso de mejor cosplay.', ubication: 'Galerías Pacífico, Buenos Aires', lat: -34.6020, lng: -58.3800, price: 0, capacity: 5000, cat: 'Cosplay', daysFromNow: 18 },
  { title: 'E-Sports Finals 2026', description: 'La gran final nacional de League of Legends y Valorant. Transmisión en vivo, casting profesional y zona de gaming libre.', ubication: 'Movistar Arena, Buenos Aires', lat: -34.6300, lng: -58.4000, price: 22000, capacity: 15000, cat: 'Gaming', daysFromNow: 60 },
];

const main = async () => {
  console.log('Fetching organizer and user...');
  const organizer = await prisma.organizer.findFirst({ select: { id_organizer: true, id_creator: true } });
  if (!organizer) {
    console.error('No organizer found. Run the app first to create one.');
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Using organizer: ${organizer.id_organizer}, creator: ${organizer.id_creator}`);

  const existingEvents = await prisma.event.findMany({ select: { title: true } });
  const existingTitles = new Set(existingEvents.map(e => e.title.toLowerCase()));

  let created = 0;
  for (const evt of NEW_EVENTS) {
    if (existingTitles.has(evt.title.toLowerCase())) {
      console.log(`  SKIP (already exists): ${evt.title}`);
      continue;
    }

    const date = new Date();
    date.setDate(date.getDate() + evt.daysFromNow);
    date.setHours(14, 0, 0, 0);

    const images = pickRandom(PHOTOS_BY_CATEGORY[evt.cat] || [], 5 + Math.floor(Math.random() * 2));
    const id_event = uuidv4();

    await prisma.event.create({
      data: {
        id_event,
        title: evt.title,
        description: evt.description,
        id_creator: organizer.id_creator,
        id_organizer: organizer.id_organizer,
        date,
        ubication: evt.ubication,
        latitude: evt.lat,
        longitude: evt.lng,
        price: evt.price,
        capacity: evt.capacity,
        status: 'active',
        images,
      },
    });

    const interest = await prisma.interest.findFirst({
      where: {
        name: evt.cat === 'KPop' ? 'K-Pop' : evt.cat === 'Comic' ? 'Cosplay' : evt.cat,
      },
    });
    if (interest) {
      await prisma.eventInterest.create({
        data: { id_event, id_interest: interest.id_interest },
      });
    } else {
      // fallback: assign Cosplay
      const fallback = await prisma.interest.findFirst({ where: { name: 'Cosplay' } });
      if (fallback) {
        await prisma.eventInterest.create({
          data: { id_event, id_interest: fallback.id_interest },
        });
      }
    }

    created++;
    console.log(`  CREATED: ${evt.title} (${evt.cat})`);
  }

  console.log(`Done! ${created} new events created.`);
  await prisma.$disconnect();
};

main().catch((err) => {
  console.error('Error:', err);
  prisma.$disconnect();
  process.exit(1);
});
