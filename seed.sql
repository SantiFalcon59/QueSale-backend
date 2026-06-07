-- ============================================
-- SEED DATA - QueSale Database
-- Datos de ejemplo para desarrollo y testing
-- ============================================

USE `quesale`;

-- ============================================
-- CLEAN EXISTING DATA
-- ============================================
DELETE FROM `reviews`;
DELETE FROM `saved_events`;
DELETE FROM `organizer_followers`;
DELETE FROM `organizer_admins`;
DELETE FROM `users_interests`;
DELETE FROM `events_interests`;
DELETE FROM `events`;
DELETE FROM `organizer`;
DELETE FROM `users`;
DELETE FROM `interests`;

-- ============================================
-- INSERT INTERESTS (Categorias Geek)
-- ============================================
INSERT INTO `interests` (`id_interest`, `name`, `icon_url`, `color`) VALUES
(1, 'Anime', NULL, '#e040fb'),
(2, 'Cosplay', NULL, '#ff6f00'),
(3, 'Gaming', NULL, '#00bfa5'),
(4, 'Cultura Pop', NULL, '#7c4dff'),
(5, 'Tecnologia', NULL, '#448aff'),
(6, 'Arte y Cultura', NULL, '#ff4081');

-- ============================================
-- INSERT USERS
-- ============================================
INSERT INTO `users` (`id_user`, `username`, `email`, `verified`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'juan_perez', 'juan@example.com', 1),
('550e8400-e29b-41d4-a716-446655440002', 'maria_garcia', 'maria@example.com', 1),
('550e8400-e29b-41d4-a716-446655440003', 'carlos_lopez', 'carlos@example.com', 1),
('550e8400-e29b-41d4-a716-446655440004', 'ana_martinez', 'ana@example.com', 1),
('550e8400-e29b-41d4-a716-446655440005', 'luis_sanchez', 'luis@example.com', 1);

-- ============================================
-- INSERT ORGANIZERS
-- ============================================
INSERT INTO `organizer` (`id_organizer`, `name`, `description`, `id_creator`, `verified`, `rating`) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Anime Events Argentina', 'Organizador de eventos relacionados con anime y manga', '550e8400-e29b-41d4-a716-446655440001', 1, 4.8),
('650e8400-e29b-41d4-a716-446655440002', 'Gaming Community', 'Comunidad gamer con torneos y meetups', '550e8400-e29b-41d4-a716-446655440002', 1, 4.6),
('650e8400-e29b-41d4-a716-446655440003', 'K-Pop Lovers', 'Tu comunidad de amantes del K-Pop', '550e8400-e29b-41d4-a716-446655440003', 1, 4.7),
('650e8400-e29b-41d4-a716-446655440004', 'Tech Startups', 'Eventos para emprendedores y startups tech', '550e8400-e29b-41d4-a716-446655440004', 1, 4.5);

-- ============================================
-- INSERT EVENTS (with images gallery)
-- ============================================
INSERT INTO `events` (`id_event`, `title`, `description`, `id_creator`, `id_organizer`, `date`, `ubication`, `latitude`, `longitude`, `thumbnail_url`, `images`, `status`, `featured_level`, `capacity`, `price`) VALUES

-- 1. Anime Events
('750e8400-e29b-41d4-a716-446655440001', 
 'Anicon 2026 - Festival de Anime', 
 'El mayor evento de anime en Argentina. 3 días llenos de cosplay, shows en vivo, artistas invitados, vendedores exclusivos y actividades para toda la comunidad otaku.',
 '550e8400-e29b-41d4-a716-446655440001', 
 '650e8400-e29b-41d4-a716-446655440001', 
 '2026-08-15 10:00:00', 
 'La Rural, Buenos Aires', 
 -34.5895, -58.3974, 
 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800',
 '["https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800","https://images.unsplash.com/photo-1560972550-8f1b8c5b4a5c?w=800","https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800","https://images.unsplash.com/photo-1580477667995-05b94f044360?w=800"]',
 'active', 2, 5000, 45000),

('750e8400-e29b-41d4-a716-446655440002', 
 'Cosplay Battle Championship', 
 'Competencia de cosplay con premios increíbles. Demostrá tu talento en el escenario y competí por el título al mejor cosplay del año.',
 '550e8400-e29b-41d4-a716-446655440001', 
 '650e8400-e29b-41d4-a716-446655440001', 
 '2026-07-19 14:00:00', 
 'Centro de Convenciones, CABA', 
 -34.6037, -58.3816, 
 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800',
 '["https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800","https://images.unsplash.com/photo-1560972550-8f1b8c5b4a5c?w=800","https://images.unsplash.com/photo-1580477667995-05b94f044360?w=800"]',
 'active', 1, 2000, 28000),

('750e8400-e29b-41d4-a716-446655440003', 
 'Manga Drawing Workshop', 
 'Aprendé a dibujar manga con los mejores ilustradores del país. Técnicas de entintado, sombreado y narrativa visual. Materiales incluidos.',
 '550e8400-e29b-41d4-a716-446655440001', 
 '650e8400-e29b-41d4-a716-446655440001', 
 '2026-06-28 16:00:00', 
 'Studio Arte, Palermo', 
 -34.5909, -58.4240, 
 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
 '["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800","https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800","https://images.unsplash.com/photo-1580477667995-05b94f044360?w=800"]',
 'active', 0, 100, 22000),

-- 2. Gaming Events
('750e8400-e29b-41d4-a716-446655440004', 
 'Torneo Nacional de LOL', 
 'Competencia nacional de League of Legends con un pozo de $1.200.000. Inscripción por equipos de 5. Transmisión en vivo con casters profesionales.',
 '550e8400-e29b-41d4-a716-446655440002', 
 '650e8400-e29b-41d4-a716-446655440002', 
 '2026-07-05 18:00:00', 
 'Hotel Fierro, La Boca', 
 -34.6326, -58.3658, 
 'https://images.unsplash.com/photo-1538481143235-bb847cf22412?w=800',
 '["https://images.unsplash.com/photo-1538481143235-bb847cf22412?w=800","https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800","https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800"]',
 'active', 2, 1000, 38000),

('750e8400-e29b-41d4-a716-446655440005', 
 'Retro Gaming Expo', 
 'Celebración de los videojuegos clásicos. Más de 50 consolas originales para jugar, torneos retro, feria de coleccionistas y música chiptune en vivo.',
 '550e8400-e29b-41d4-a716-446655440002', 
 '650e8400-e29b-41d4-a716-446655440002', 
 '2026-06-21 12:00:00', 
 'Centro Cultural Recoleta', 
 -34.5973, -58.3882, 
 'https://images.unsplash.com/photo-1612394642996-258e42f80dd1?w=800',
 '["https://images.unsplash.com/photo-1612394642996-258e42f80dd1?w=800","https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800","https://images.unsplash.com/photo-1538481143235-bb847cf22412?w=800"]',
 'active', 0, 800, 0),

-- 3. K-Pop Events
('750e8400-e29b-41d4-a716-446655440006', 
 'K-Pop Dance Battle', 
 'Compite con otros dancers en una batalla de baile épica. Coreografías de Blackpink, BTS, Stray Kids y más. Premios en efectivo y merchandise.',
 '550e8400-e29b-41d4-a716-446655440003', 
 '650e8400-e29b-41d4-a716-446655440003', 
 '2026-07-12 19:00:00', 
 'Teatro Opera, Centro', 
 -34.6009, -58.3850, 
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
 '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800","https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800","https://images.unsplash.com/photo-1540039155733-5bb30b53e14c?w=800"]',
 'active', 1, 500, 25000),

('750e8400-e29b-41d4-a716-446655440007', 
 'Meet & Greet KPOP Stars', 
 'Conocé a tus idols del K-Pop en persona. Firma de autografos, sesion de fotos y showcase acustico exclusivo para fans.',
 '550e8400-e29b-41d4-a716-446655440003', 
 '650e8400-e29b-41d4-a716-446655440003', 
 '2026-09-06 17:00:00', 
 'Estadio Malvinas Argentinas, Vicente Lopez', 
 -34.4969, -58.4822, 
 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
 '["https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800","https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800","https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"]',
 'active', 2, 3000, 95000),

-- 4. Tech Events
('750e8400-e29b-41d4-a716-446655440008', 
 'Startup Weekend Buenos Aires', 
 '54 horas de innovación: idea, code, pitch. Unite a un equipo, creá un producto y presenta tu startup a inversores.',
 '550e8400-e29b-41d4-a716-446655440004', 
 '650e8400-e29b-41d4-a716-446655440004', 
 '2026-08-01 18:00:00', 
 'Google Campus, San Telmo', 
 -34.6252, -58.3611, 
 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
 '["https://images.unsplash.com/photo-1552664730-d307ca884978?w=800","https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800","https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"]',
 'active', 1, 200, 0),

('750e8400-e29b-41d4-a716-446655440009', 
 'Web3 & NFT Conference', 
 'Lo ultimo en blockchain, crypto y NFTs. Oradores internacionales, workshops y networking con builders del ecosistema web3.',
 '550e8400-e29b-41d4-a716-446655440004', 
 '650e8400-e29b-41d4-a716-446655440004', 
 '2026-08-27 09:00:00', 
 'Hotel Fierro, La Boca', 
 -34.6326, -58.3658, 
 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800',
 '["https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800","https://images.unsplash.com/photo-1552664730-d307ca884978?w=800","https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"]',
 'active', 2, 400, 65000),

-- 5. Repurposed Geek Events

('750e8400-e29b-41d4-a716-446655440010',
 'Feria Geek & Coleccionables',
 'El paraíso del coleccionista: figuras de accion, comics, manga, funkos, cartas TCG y stands de artistas locales. Sorteos y torneos de cartas.',
 '550e8400-e29b-41d4-a716-446655440004',
 '650e8400-e29b-41d4-a716-446655440001',
 '2026-06-20 17:00:00',
 'Distrito Arcos, Palermo',
 -34.5787, -58.4304,
 'https://images.unsplash.com/photo-1608889825205-e3a2a40a5b18?w=800',
 '["https://images.unsplash.com/photo-1608889825205-e3a2a40a5b18?w=800","https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800","https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800"]',
 'active', 1, 1200, 25000),

('750e8400-e29b-41d4-a716-446655440011',
 'Noche de Streamers & Gamers',
 'Encontra a tus streamers favoritos en vivo, juega con ellos en el escenario y disfruta de shows de musica electronica con visuales gaming.',
 '550e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440002',
 '2026-06-26 21:00:00',
 'Niceto Club, Palermo',
 -34.5880, -58.4342,
 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
 '["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800","https://images.unsplash.com/photo-1538481143235-bb847cf22412?w=800","https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800"]',
 'active', 1, 900, 35000),

('750e8400-e29b-41d4-a716-446655440012',
 'Gaming & Food Fest',
 'La fusión perfecta: torneos de fighting games, zona free-to-play, food trucks tematicos de videojuegos y musica en vivo.',
 '550e8400-e29b-41d4-a716-446655440005',
 '650e8400-e29b-41d4-a716-446655440002',
 '2026-07-04 12:00:00',
 'Costanera Norte, CABA',
 -34.5583, -58.3982,
 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
 '["https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800","https://images.unsplash.com/photo-1538481143235-bb847cf22412?w=800","https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"]',
 'active', 0, 4000, 15000),

('750e8400-e29b-41d4-a716-446655440013',
 'Taller de Ilustracion Digital',
 'Aprendé a dibujar como un profesional con tabletas graficas. Técnicas de coloring, character design y composición digital para principiantes.',
 '550e8400-e29b-41d4-a716-446655440005',
 '650e8400-e29b-41d4-a716-446655440001',
 '2026-07-11 15:30:00',
 'Espacio Guevara, Chacarita',
 -34.5894, -58.4497,
 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
 '["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800","https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800","https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=800"]',
 'active', 0, 40, 25000),

('750e8400-e29b-41d4-a716-446655440014',
 'Torneo de Smash Bros Ultimate',
 'Torneo oficial de Super Smash Bros Ultimate con y sin items. Categoría singles y doubles. Consolas preparadas, trae tu controller si querés.',
 '550e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440002',
 '2026-07-18 20:00:00',
 'Plaza Dorrego, San Telmo',
 -34.6213, -58.3712,
 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
 '["https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800","https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800"]',
 'active', 0, 300, 15000),

-- 6. NEW Geek Events

('750e8400-e29b-41d4-a716-446655440015',
 'ComicCon BA Edicion Invierno',
 'La convencion de comics mas grande de Buenos Aires. Artistas invitados de USA y Japon, lanzamientos exclusivos, cosplay masivo y zona indie.',
 '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440001',
 '2026-08-08 10:00:00',
 'La Rural, Buenos Aires',
 -34.5895, -58.3974,
 'https://images.unsplash.com/photo-1580477667995-05b94f044360?w=800',
 '["https://images.unsplash.com/photo-1580477667995-05b94f044360?w=800","https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800","https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800","https://images.unsplash.com/photo-1560972550-8f1b8c5b4a5c?w=800"]',
 'active', 2, 6000, 55000),

('750e8400-e29b-41d4-a716-446655440016',
 'Torneo de Valorant',
 'Competencia de Valorant 5v5 con $800.000 en premios. Clasificatoria abierta, fase de grupos y playoffs en el escenario principal.',
 '550e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440002',
 '2026-07-26 14:00:00',
 'Hotel Fierro, La Boca',
 -34.6326, -58.3658,
 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
 '["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800","https://images.unsplash.com/photo-1538481143235-bb847cf22412?w=800","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800"]',
 'active', 1, 600, 35000),

('750e8400-e29b-41d4-a716-446655440017',
 'Hackathon QueSale 2026',
 '48 horas para crear la próxima gran idea. Equipos de hasta 4 personas. Mentores, premios y posible incubación.',
 '550e8400-e29b-41d4-a716-446655440004',
 '650e8400-e29b-41d4-a716-446655440004',
 '2026-09-12 09:00:00',
 'Google Campus, San Telmo',
 -34.6252, -58.3611,
 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
 '["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800","https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800","https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"]',
 'active', 1, 150, 0),

('750e8400-e29b-41d4-a716-446655440018',
 'Expo Manga & Comics BA',
 'Feria de editoriales de manga y comics nacionales e importados. Firmas de autores argentinos, charlas y taller de creación de historietas.',
 '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440001',
 '2026-08-22 11:00:00',
 'Centro Cultural Recoleta',
 -34.5973, -58.3882,
 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800',
 '["https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800","https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800","https://images.unsplash.com/photo-1580477667995-05b94f044360?w=800"]',
 'active', 0, 1500, 42000),

('750e8400-e29b-41d4-a716-446655440019',
 'Mario Kart Tournament',
 'Torneo de Mario Kart 8 Deluxe con 64 jugadores. Eliminatorias en pantalla dividida, gran final en proyector gigante. Todos contra todos.',
 '550e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440002',
 '2026-07-31 16:00:00',
 'Niceto Club, Palermo',
 -34.5880, -58.4342,
 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
 '["https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800","https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800"]',
 'active', 0, 200, 18000),

('750e8400-e29b-41d4-a716-446655440020',
 'Anime Open Air Cinema',
 'Ciclo de cine anime al aire libre. Proyección de películas clásicas y estrenos en pantalla gigante con sonido surround. Food trucks y zona relax.',
 '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440001',
 '2026-07-25 19:00:00',
 'Parque Centenario, CABA',
 -34.6158, -58.4358,
 'https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=800',
 '["https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=800","https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800","https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800"]',
 'active', 0, 2000, 15000),

('750e8400-e29b-41d4-a716-446655440021',
 'Esports Finals BA',
 'La gran final de la temporada de esports en Buenos Aires. League of Legends, Valorant y CS2 en vivo con casting profesional, pantalla led 4K y show de cierre.',
 '550e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440002',
 '2026-09-20 15:00:00',
 'Estadio Obras, San Nicolas',
 -34.5912, -58.4108,
 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
 '["https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800","https://images.unsplash.com/photo-1538481143235-bb847cf22412?w=800","https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800","https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800"]',
 'active', 2, 4000, 50000),

('750e8400-e29b-41d4-a716-446655440022',
 'Indie Game Dev Meetup',
 'Encuentro de desarrolladores de videojuegos independientes. Networking, showcase de proyectos, charlas técnicas y pizza gratis para los asistentes.',
 '550e8400-e29b-41d4-a716-446655440004',
 '650e8400-e29b-41d4-a716-446655440004',
 '2026-08-30 14:00:00',
 'Espacio Guevara, Chacarita',
 -34.5894, -58.4497,
 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
 '["https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800","https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800","https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"]',
 'active', 0, 80, 12000);

-- ============================================
-- LINK EVENTS WITH INTERESTS
-- ============================================
INSERT INTO `events_interests` (`id_event`, `id_interest`) VALUES
-- Anicon (Anime, Cosplay, Cultura Pop)
('750e8400-e29b-41d4-a716-446655440001', 1),
('750e8400-e29b-41d4-a716-446655440001', 2),
('750e8400-e29b-41d4-a716-446655440001', 4),

-- Cosplay Battle (Cosplay, Cultura Pop)
('750e8400-e29b-41d4-a716-446655440002', 2),
('750e8400-e29b-41d4-a716-446655440002', 4),

-- Manga Workshop (Anime, Arte y Cultura)
('750e8400-e29b-41d4-a716-446655440003', 1),
('750e8400-e29b-41d4-a716-446655440003', 6),

-- LOL Tournament (Gaming)
('750e8400-e29b-41d4-a716-446655440004', 3),

-- Retro Gaming (Gaming, Tecnologia)
('750e8400-e29b-41d4-a716-446655440005', 3),
('750e8400-e29b-41d4-a716-446655440005', 5),

-- K-Pop Dance Battle (Cultura Pop)
('750e8400-e29b-41d4-a716-446655440006', 4),

-- K-Pop Meet & Greet (Cultura Pop)
('750e8400-e29b-41d4-a716-446655440007', 4),

-- Startup Weekend (Tecnologia)
('750e8400-e29b-41d4-a716-446655440008', 5),

-- Web3 Conference (Tecnologia)
('750e8400-e29b-41d4-a716-446655440009', 5),

-- Feria Geek (Anime, Cosplay, Cultura Pop)
('750e8400-e29b-41d4-a716-446655440010', 1),
('750e8400-e29b-41d4-a716-446655440010', 2),
('750e8400-e29b-41d4-a716-446655440010', 4),

-- Noche Streamers (Gaming, Cultura Pop)
('750e8400-e29b-41d4-a716-446655440011', 3),
('750e8400-e29b-41d4-a716-446655440011', 4),

-- Gaming & Food Fest (Gaming, Arte y Cultura)
('750e8400-e29b-41d4-a716-446655440012', 3),
('750e8400-e29b-41d4-a716-446655440012', 6),

-- Ilustracion Digital (Anime, Arte y Cultura)
('750e8400-e29b-41d4-a716-446655440013', 1),
('750e8400-e29b-41d4-a716-446655440013', 6),

-- Smash Bros (Gaming, Cultura Pop)
('750e8400-e29b-41d4-a716-446655440014', 3),
('750e8400-e29b-41d4-a716-446655440014', 4),

-- ComicCon (Anime, Cosplay, Cultura Pop, Arte y Cultura)
('750e8400-e29b-41d4-a716-446655440015', 1),
('750e8400-e29b-41d4-a716-446655440015', 2),
('750e8400-e29b-41d4-a716-446655440015', 4),
('750e8400-e29b-41d4-a716-446655440015', 6),

-- Valorant (Gaming)
('750e8400-e29b-41d4-a716-446655440016', 3),

-- Hackathon (Tecnologia)
('750e8400-e29b-41d4-a716-446655440017', 5),

-- Expo Manga (Anime, Arte y Cultura)
('750e8400-e29b-41d4-a716-446655440018', 1),
('750e8400-e29b-41d4-a716-446655440018', 6),

-- Mario Kart (Gaming)
('750e8400-e29b-41d4-a716-446655440019', 3),

-- Anime Cinema (Anime, Cultura Pop)
('750e8400-e29b-41d4-a716-446655440020', 1),
('750e8400-e29b-41d4-a716-446655440020', 4),

-- Esports Finals (Gaming, Tecnologia)
('750e8400-e29b-41d4-a716-446655440021', 3),
('750e8400-e29b-41d4-a716-446655440021', 5),

-- Indie Dev Meetup (Gaming, Tecnologia)
('750e8400-e29b-41d4-a716-446655440022', 3),
('750e8400-e29b-41d4-a716-446655440022', 5);

-- ============================================
-- LINK USERS WITH INTERESTS
-- ============================================
INSERT INTO `users_interests` (`id_user`, `id_interest`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1),
('550e8400-e29b-41d4-a716-446655440001', 2),
('550e8400-e29b-41d4-a716-446655440002', 3),
('550e8400-e29b-41d4-a716-446655440002', 4),
('550e8400-e29b-41d4-a716-446655440003', 4),
('550e8400-e29b-41d4-a716-446655440003', 5),
('550e8400-e29b-41d4-a716-446655440004', 1),
('550e8400-e29b-41d4-a716-446655440004', 4),
('550e8400-e29b-41d4-a716-446655440005', 5),
('550e8400-e29b-41d4-a716-446655440005', 3);

-- ============================================
-- INSERT ORGANIZER ADMINS
-- ============================================
INSERT INTO `organizer_admins` (`id_user`, `id_organizer`, `role`) VALUES
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'admin'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'admin'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'admin');

-- ============================================
-- INSERT ORGANIZER FOLLOWERS
-- ============================================
INSERT INTO `organizer_followers` (`id_user`, `id_organizer`) VALUES
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004');

-- ============================================
-- INSERT SAVED EVENTS
-- ============================================
INSERT INTO `saved_events` (`id_event`, `id_user`) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004'),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005'),
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002');

-- ============================================
-- INSERT SAMPLE REVIEWS
-- ============================================
INSERT INTO `reviews` (`id_event`, `id_user`, `rating`, `comment`) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 5, 'Increible evento! Mejor Anicon del ano.'),
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 5, 'Excelente organizacion y mucha variedad de actividades.'),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 4, 'Buen torneo, la final estuvo re emocionante.'),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 5, 'Nostalgia pura. Una joya para los gamers retro.'),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 4, 'Muy buen evento, excelente energia del publico.'),
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', 5, 'La mejor comic-con que vi en Buenos Aires!'),
('750e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440003', 5, 'Produccion de primer nivel, el show de cierre fue epico.');

-- ============================================
-- Mostrar resumen de lo insertado
-- ============================================
SELECT 'USUARIOS' as 'DATOS INSERTADOS', COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'ORGANIZADORES', COUNT(*) FROM organizer
UNION ALL
SELECT 'EVENTOS', COUNT(*) FROM events
UNION ALL
SELECT 'INTERESES', COUNT(*) FROM interests
UNION ALL
SELECT 'INTERESES DEL USUARIO', COUNT(*) FROM users_interests
UNION ALL
SELECT 'EVENTOS GUARDADOS', COUNT(*) FROM saved_events
UNION ALL
SELECT 'RESENAS', COUNT(*) FROM reviews;
