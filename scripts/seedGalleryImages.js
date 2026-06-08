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

const allPhotos = Object.values(PHOTOS_BY_CATEGORY).flat();

const categoryToPhotoPool = (name) => {
  const uc = name?.toLowerCase() || '';
  if (uc === 'anime') return PHOTOS_BY_CATEGORY.Anime;
  if (uc === 'k-pop') return PHOTOS_BY_CATEGORY.KPop;
  if (uc === 'gaming') return PHOTOS_BY_CATEGORY.Gaming;
  if (uc === 'cosplay') return PHOTOS_BY_CATEGORY.Cosplay;
  return allPhotos;
};

const main = async () => {
  console.log('Fetching all events with interests...');
  const events = await prisma.event.findMany({
    select: {
      id_event: true,
      title: true,
      images: true,
      interests: { select: { interest: { select: { name: true } } } },
    },
  });
  console.log(`Found ${events.length} events`);

  let updated = 0;
  for (const event of events) {
    const catName = event.interests?.[0]?.interest?.name || 'Anime';
    const pool = categoryToPhotoPool(catName);
    const images = pickRandom(pool, 5 + Math.floor(Math.random() * 2));
    await prisma.event.update({
      where: { id_event: event.id_event },
      data: { images },
    });
    updated++;
    if (updated % 5 === 0) {
      console.log(`  ${updated}/${events.length} events updated...`);
    }
  }

  console.log(`Done! ${updated} events updated.`);
  await prisma.$disconnect();
};

main().catch((err) => {
  console.error('Error:', err);
  prisma.$disconnect();
  process.exit(1);
});
