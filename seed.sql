-- ============================================
-- SEED DATA - QueSale Database
-- Datos de ejemplo para desarrollo y testing
-- ============================================

USE `quesale`;

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
-- INSERT EVENTS
-- ============================================
INSERT INTO `events` (`id_event`, `title`, `description`, `id_creator`, `id_organizer`, `date`, `ubication`, `latitude`, `longitude`, `thumbnail_url`, `status`, `featured_level`, `capacity`, `price`) VALUES

-- Anime Events
('750e8400-e29b-41d4-a716-446655440001', 
 'Anicon 2025 - Festival de Anime', 
 'El mayor evento de anime en Argentina. ¡3 días de diversión, cosplay, vendedores y mucho más!', 
 '550e8400-e29b-41d4-a716-446655440001', 
 '650e8400-e29b-41d4-a716-446655440001', 
 '2025-12-25 10:00:00', 
 'La Rural, Buenos Aires', 
 -34.5895, -58.3974, 
 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400',
 'active', 2, 5000, 250),

('750e8400-e29b-41d4-a716-446655440002', 
 'Cosplay Battle Championship', 
 'Competencia de cosplay con premios increíbles. Muestra tu talento y creatividad.', 
 '550e8400-e29b-41d4-a716-446655440001', 
 '650e8400-e29b-41d4-a716-446655440001', 
 '2025-11-15 14:00:00', 
 'Centro de Convenciones, CABA', 
 -34.6037, -58.3816, 
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
 'active', 1, 2000, 50),

('750e8400-e29b-41d4-a716-446655440003', 
 'Manga Drawing Workshop', 
 'Aprende a dibujar manga con los mejores artistas del país.', 
 '550e8400-e29b-41d4-a716-446655440001', 
 '650e8400-e29b-41d4-a716-446655440001', 
 '2025-10-20 16:00:00', 
 'Studio Arte, Palermo', 
 -34.5909, -58.4240, 
 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
 'active', 0, 100, 150),

-- Gaming Events
('750e8400-e29b-41d4-a716-446655440004', 
 'Torneo de LOL Nacional', 
 'Competencia nacional de League of Legends con un pozo de premios de $500.000', 
 '550e8400-e29b-41d4-a716-446655440002', 
 '650e8400-e29b-41d4-a716-446655440002', 
 '2025-11-10 18:00:00', 
 'Hotel Fierro, La Boca', 
 -34.6326, -58.3658, 
 'https://images.unsplash.com/photo-1538481143235-bb847cf22412?w=400',
 'active', 2, 1000, 100),

('750e8400-e29b-41d4-a716-446655440005', 
 'Retro Gaming Expo', 
 'Celebración de los videojuegos clásicos. Juega en consolas originales.', 
 '550e8400-e29b-41d4-a716-446655440002', 
 '650e8400-e29b-41d4-a716-446655440002', 
 '2025-10-05 12:00:00', 
 'Centro Cultural Recoleta', 
 -34.5973, -58.3882, 
 'https://images.unsplash.com/photo-1612394642996-258e42f80dd1?w=400',
 'active', 0, 800, 0),

-- K-Pop Events
('750e8400-e29b-41d4-a716-446655440006', 
 'K-Pop Dance Battle', 
 'Compite con otros fanáticos del K-Pop en una batalla de baile épica.', 
 '550e8400-e29b-41d4-a716-446655440003', 
 '650e8400-e29b-41d4-a716-446655440003', 
 '2025-10-30 19:00:00', 
 'Teatro Ópera, Centro', 
 -34.6009, -58.3850, 
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
 'active', 1, 500, 80),

('750e8400-e29b-41d4-a716-446655440007', 
 'Meet & Greet KPOP Stars', 
 'Conocé a tus idols de K-Pop favoritos. Incluye foto y autógrafo.', 
 '550e8400-e29b-41d4-a716-446655440003', 
 '650e8400-e29b-41d4-a716-446655440003', 
 '2025-12-15 17:00:00', 
 'Estadio Malvinas Argentinas, Vicente López', 
 -34.4969, -58.4822, 
 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
 'active', 2, 3000, 350),

-- Tech/Entrepreneurship Events
('750e8400-e29b-41d4-a716-446655440008', 
 'Startup Weekend Buenos Aires', 
 '54 horas de innovación: idea, code, pitch y sueña grande.', 
 '550e8400-e29b-41d4-a716-446655440004', 
 '650e8400-e29b-41d4-a716-446655440004', 
 '2025-10-24 18:00:00', 
 'Google Campus, San Telmo', 
 -34.6252, -58.3611, 
 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
 'active', 1, 200, 0),

('750e8400-e29b-41d4-a716-446655440009', 
 'Web3 & NFT Conference', 
 'Lo último en blockchain, crypto y NFTs. Oradores internacionales.', 
 '550e8400-e29b-41d4-a716-446655440004', 
 '650e8400-e29b-41d4-a716-446655440004', 
 '2025-11-20 09:00:00', 
 'Hotel Fierro, La Boca', 
 -34.6326, -58.3658, 
 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
 'active', 2, 400, 200);

-- ============================================
-- LINK EVENTS WITH INTERESTS
-- ============================================
INSERT INTO `events_interests` (`id_event`, `id_interest`) VALUES
-- Anicon Event (Anime, Cosplay, Cultura Pop)
('750e8400-e29b-41d4-a716-446655440001', 1),
('750e8400-e29b-41d4-a716-446655440001', 2),
('750e8400-e29b-41d4-a716-446655440001', 5),

-- Cosplay Battle (Cosplay, Cultura Pop)
('750e8400-e29b-41d4-a716-446655440002', 2),
('750e8400-e29b-41d4-a716-446655440002', 5),

-- Manga Workshop (Anime)
('750e8400-e29b-41d4-a716-446655440003', 1),

-- LOL Tournament (Gaming, Deporte)
('750e8400-e29b-41d4-a716-446655440004', 3),
('750e8400-e29b-41d4-a716-446655440004', 7),

-- Retro Gaming (Gaming, Tecnología)
('750e8400-e29b-41d4-a716-446655440005', 3),
('750e8400-e29b-41d4-a716-446655440005', 6),

-- K-Pop Dance Battle (Cultura Pop)
('750e8400-e29b-41d4-a716-446655440006', 5),

-- K-Pop Meet & Greet (Cultura Pop)
('750e8400-e29b-41d4-a716-446655440007', 5),

-- Startup Weekend (Tecnología)
('750e8400-e29b-41d4-a716-446655440008', 6),

-- Web3 Conference (Tecnología)
('750e8400-e29b-41d4-a716-446655440009', 6);

-- ============================================
-- LINK USERS WITH INTERESTS
-- ============================================
INSERT INTO `users_interests` (`id_user`, `id_interest`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1),
('550e8400-e29b-41d4-a716-446655440001', 2),
('550e8400-e29b-41d4-a716-446655440002', 3),
('550e8400-e29b-41d4-a716-446655440002', 7),
('550e8400-e29b-41d4-a716-446655440003', 5),
('550e8400-e29b-41d4-a716-446655440003', 6),
('550e8400-e29b-41d4-a716-446655440004', 1),
('550e8400-e29b-41d4-a716-446655440004', 5),
('550e8400-e29b-41d4-a716-446655440005', 6),
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
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005');

-- ============================================
-- INSERT SAMPLE REVIEWS
-- ============================================
INSERT INTO `reviews` (`id_event`, `id_user`, `rating`, `comment`) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 5, '¡Increíble evento! Mejor Anicon del año.'),
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 5, 'Excelente organización y mucha variedad de actividades.'),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 4, 'Buen torneo, aunque los servidores laguearon un poco.'),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 5, 'Nostalgia pura. Una joya para los gamers retro.'),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 4, 'Muy buen evento, excelente energía del público.');

-- ============================================
-- Mostrar resumen de lo insertado
-- ============================================
SELECT '✅ USUARIOS' as 'DATOS INSERTADOS', COUNT(*) as cantidad FROM users
UNION ALL
SELECT '✅ ORGANIZADORES', COUNT(*) FROM organizer
UNION ALL
SELECT '✅ EVENTOS', COUNT(*) FROM events
UNION ALL
SELECT '✅ INTERESES DEL USUARIO', COUNT(*) FROM users_interests
UNION ALL
SELECT '✅ EVENTOS GUARDADOS', COUNT(*) FROM saved_events
UNION ALL
SELECT '✅ RESEÑAS', COUNT(*) FROM reviews;
