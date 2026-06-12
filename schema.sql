-- Mejorado QueSale Database Schema
-- Con índices, constraints y tipos de datos optimizados

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Database
CREATE SCHEMA IF NOT EXISTS `quesale` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quesale`;

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `users` (
  `id_user` VARCHAR(36) NOT NULL COMMENT 'UUID',
  `firebase_uid` VARCHAR(128) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `username_last_changed_at` DATETIME DEFAULT NULL,
  `email` VARCHAR(100) NOT NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `global_role` ENUM('admin', 'moderator', 'user') DEFAULT 'user',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `uk_firebase_uid` (`firebase_uid`),
  UNIQUE INDEX `uk_username` (`username`),
  UNIQUE INDEX `uk_email` (`email`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_verified` (`verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- USER PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id_user` VARCHAR(36) NOT NULL,
  `photo_url` LONGTEXT,
  `description` TEXT,
  `instagram` VARCHAR(100),
  `instagram_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `instagram_verification_code` VARCHAR(16),
  `instagram_verified_at` DATETIME,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id_user`),
  CONSTRAINT `fk_user_profiles_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- USER WALL POSTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_wall_posts` (
  `id_post` BIGINT NOT NULL AUTO_INCREMENT,
  `id_profile_user` VARCHAR(36) NOT NULL,
  `id_author_user` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id_post`),
  INDEX `idx_profile_user` (`id_profile_user`),
  INDEX `idx_author_user` (`id_author_user`),

  CONSTRAINT `fk_user_wall_posts_profile`
    FOREIGN KEY (`id_profile_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_user_wall_posts_author`
    FOREIGN KEY (`id_author_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- USER WALL COMMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_wall_comments` (
  `id_comment` BIGINT NOT NULL AUTO_INCREMENT,
  `id_post` BIGINT NOT NULL,
  `id_author_user` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id_comment`),
  INDEX `idx_post` (`id_post`),
  INDEX `idx_comment_author` (`id_author_user`),

  CONSTRAINT `fk_user_wall_comments_post`
    FOREIGN KEY (`id_post`)
    REFERENCES `user_wall_posts` (`id_post`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_user_wall_comments_author`
    FOREIGN KEY (`id_author_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- ORGANIZER TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `organizer` (
  `id_organizer` VARCHAR(36) NOT NULL COMMENT 'UUID',
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `id_creator` VARCHAR(36) NOT NULL,
  `logo_url` VARCHAR(255),
  `mp_public_key` VARCHAR(255),
  `mp_access_token` VARCHAR(255),
  `mp_refresh_token` VARCHAR(255),
  `rating` DECIMAL(3,2) DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_organizer`),
  UNIQUE INDEX `uk_name` (`name`),
  INDEX `idx_creator` (`id_creator`),
  INDEX `idx_verified` (`verified`),
  
  CONSTRAINT `fk_organizer_creator`
    FOREIGN KEY (`id_creator`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- EVENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `events` (
  `id_event` VARCHAR(36) NOT NULL COMMENT 'UUID',
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `id_creator` VARCHAR(36) DEFAULT NULL,
  `id_organizer` VARCHAR(36) DEFAULT NULL,
  `is_external` TINYINT(1) DEFAULT 0,
  `external_organizer_name` VARCHAR(100) DEFAULT NULL,
  `external_organizer_url` VARCHAR(500) DEFAULT NULL,
  `date` DATETIME NOT NULL,
  `ubication` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `thumbnail_url` VARCHAR(255),
  `status` ENUM('draft', 'active', 'cancelled', 'past') DEFAULT 'active',
  `featured_level` INT DEFAULT 0 COMMENT '0=normal, 1=nivel1, 2=nivel2',
  `featured_until` DATETIME,
  `capacity` INT,
  `price` DECIMAL(10, 2),
  `ticket_type` VARCHAR(20) DEFAULT 'free',
  `ticket_url` VARCHAR(500) DEFAULT NULL,
  `qr_enabled` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_event`),
  INDEX `idx_organizer` (`id_organizer`),
  INDEX `idx_creator` (`id_creator`),
  INDEX `idx_date` (`date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_featured_level` (`featured_level`),
  INDEX `idx_location` (`ubication`(50)),
  INDEX `idx_coordinates` (`latitude`, `longitude`),
  
  CONSTRAINT `fk_events_organizer`
    FOREIGN KEY (`id_organizer`)
    REFERENCES `organizer` (`id_organizer`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INTERESTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `interests` (
  `id_interest` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `icon_url` VARCHAR(255),
  `color` VARCHAR(7),
  
  PRIMARY KEY (`id_interest`),
  UNIQUE INDEX `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- EVENTS_INTERESTS TABLE (Junction)
-- ==========================================
CREATE TABLE IF NOT EXISTS `events_interests` (
  `id_event_interest` BIGINT NOT NULL AUTO_INCREMENT,
  `id_event` VARCHAR(36) NOT NULL,
  `id_interest` INT NOT NULL,
  
  PRIMARY KEY (`id_event_interest`),
  UNIQUE INDEX `uk_event_interest` (`id_event`, `id_interest`),
  INDEX `idx_interest` (`id_interest`),
  
  CONSTRAINT `fk_events_interests_event`
    FOREIGN KEY (`id_event`)
    REFERENCES `events` (`id_event`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_events_interests_interest`
    FOREIGN KEY (`id_interest`)
    REFERENCES `interests` (`id_interest`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- USERS_INTERESTS TABLE (Junction)
-- ==========================================
CREATE TABLE IF NOT EXISTS `users_interests` (
  `id_user_interest` BIGINT NOT NULL AUTO_INCREMENT,
  `id_user` VARCHAR(36) NOT NULL,
  `id_interest` INT NOT NULL,
  
  PRIMARY KEY (`id_user_interest`),
  UNIQUE INDEX `uk_user_interest` (`id_user`, `id_interest`),
  INDEX `idx_interest` (`id_interest`),
  
  CONSTRAINT `fk_users_interests_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_users_interests_interest`
    FOREIGN KEY (`id_interest`)
    REFERENCES `interests` (`id_interest`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- ORGANIZER_ADMINS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `organizer_admins` (
  `id_organizer_admin` BIGINT NOT NULL AUTO_INCREMENT,
  `id_user` VARCHAR(36) NOT NULL,
  `id_organizer` VARCHAR(36) NOT NULL,
  `role` ENUM('admin', 'editor', 'viewer') DEFAULT 'admin',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_organizer_admin`),
  UNIQUE INDEX `uk_user_organizer` (`id_user`, `id_organizer`),
  INDEX `idx_organizer` (`id_organizer`),
  
  CONSTRAINT `fk_organizer_admins_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_organizer_admins_organizer`
    FOREIGN KEY (`id_organizer`)
    REFERENCES `organizer` (`id_organizer`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- ORGANIZER_FOLLOWERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `organizer_followers` (
  `id_organizer_follower` BIGINT NOT NULL AUTO_INCREMENT,
  `id_user` VARCHAR(36) NOT NULL,
  `id_organizer` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_organizer_follower`),
  UNIQUE INDEX `uk_user_organizer_follow` (`id_user`, `id_organizer`),
  INDEX `idx_organizer` (`id_organizer`),
  
  CONSTRAINT `fk_organizer_followers_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_organizer_followers_organizer`
    FOREIGN KEY (`id_organizer`)
    REFERENCES `organizer` (`id_organizer`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TICKETS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `tickets` (
  `id_ticket` VARCHAR(36) NOT NULL COMMENT 'UUID',
  `uuid` VARCHAR(50) NOT NULL COMMENT 'Unique ticket code',
  `id_event` VARCHAR(36) NOT NULL,
  `id_user` VARCHAR(36) NOT NULL,
  `state` TINYINT NOT NULL DEFAULT 1 COMMENT '1=active, 2=used, 3=cancelled',
  `qr_code` LONGBLOB,
  `validated_at` DATETIME,
  `buy_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_ticket`),
  UNIQUE INDEX `uk_uuid` (`uuid`),
  INDEX `idx_event` (`id_event`),
  INDEX `idx_user` (`id_user`),
  INDEX `idx_state` (`state`),
  
  CONSTRAINT `fk_tickets_event`
    FOREIGN KEY (`id_event`)
    REFERENCES `events` (`id_event`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SAVED_EVENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `saved_events` (
  `id_saved_event` BIGINT NOT NULL AUTO_INCREMENT,
  `id_event` VARCHAR(36) NOT NULL,
  `id_user` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_saved_event`),
  UNIQUE INDEX `uk_user_event_saved` (`id_user`, `id_event`),
  INDEX `idx_event` (`id_event`),
  
  CONSTRAINT `fk_saved_events_event`
    FOREIGN KEY (`id_event`)
    REFERENCES `events` (`id_event`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_saved_events_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- POST_TYPE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `post_type` (
  `id_post_type` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  
  PRIMARY KEY (`id_post_type`),
  UNIQUE INDEX `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- POSTS TABLE (Event Wall/Muro)
-- ==========================================
CREATE TABLE IF NOT EXISTS `posts` (
  `id_post` BIGINT NOT NULL AUTO_INCREMENT,
  `id_post_type` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_event` VARCHAR(36) NOT NULL,
  `id_user` VARCHAR(36) NOT NULL,
  `likes_count` INT DEFAULT 0,
  `is_pinned` TINYINT(1) DEFAULT 0,
  
  PRIMARY KEY (`id_post`),
  INDEX `idx_event` (`id_event`),
  INDEX `idx_user` (`id_user`),
  INDEX `idx_type` (`id_post_type`),
  INDEX `idx_created` (`created_at`),
  
  CONSTRAINT `fk_posts_type`
    FOREIGN KEY (`id_post_type`)
    REFERENCES `post_type` (`id_post_type`)
    ON DELETE RESTRICT,
  CONSTRAINT `fk_posts_event`
    FOREIGN KEY (`id_event`)
    REFERENCES `events` (`id_event`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_posts_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- COMMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `comments` (
  `id_comment` BIGINT NOT NULL AUTO_INCREMENT,
  `content` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_post` BIGINT NOT NULL,
  `id_user` VARCHAR(36) NOT NULL,
  `likes_count` INT DEFAULT 0,
  
  PRIMARY KEY (`id_comment`),
  INDEX `idx_post` (`id_post`),
  INDEX `idx_user` (`id_user`),
  
  CONSTRAINT `fk_comments_post`
    FOREIGN KEY (`id_post`)
    REFERENCES `posts` (`id_post`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- REVIEWS TABLE (Reseñas de eventos)
-- ==========================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id_review` BIGINT NOT NULL AUTO_INCREMENT,
  `id_event` VARCHAR(36) NOT NULL,
  `id_user` VARCHAR(36) NOT NULL,
  `rating` TINYINT NOT NULL COMMENT '1-5 stars',
  `comment` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_review`),
  UNIQUE INDEX `uk_user_event_review` (`id_user`, `id_event`),
  INDEX `idx_event` (`id_event`),
  INDEX `idx_rating` (`rating`),
  
  CONSTRAINT `fk_reviews_event`
    FOREIGN KEY (`id_event`)
    REFERENCES `events` (`id_event`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- Insert Default Data
-- ==========================================

-- Insert Post Types
INSERT INTO `post_type` (`name`) VALUES 
('chat'),
('announcement'),
('question');

-- Insert Some Default Interests
INSERT INTO `interests` (`name`, `color`) VALUES 
('Anime', '#FF6B9D'),
('Cosplay', '#C44569'),
('Gaming', '#00D4FF'),
('Conciertos', '#FFD700'),
('Cultura Pop', '#9D4EDD'),
('Tecnología', '#3A86FF'),
('Deporte', '#06FFA5'),
('Gastronomía', '#FB5607'),
('Arte', '#FFB703'),
('Música', '#8ECAE6');

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
