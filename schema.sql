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
  `is_premium` TINYINT(1) NOT NULL DEFAULT 0,
  `premium_until` DATETIME DEFAULT NULL,
  `embedding` JSON DEFAULT NULL,
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
-- USER INTERACTIONS TABLE (AI SIGNS)
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_interactions` (
  `id_interaction` BIGINT NOT NULL AUTO_INCREMENT,
  `id_user` VARCHAR(36) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `id_event` VARCHAR(36),
  `id_organizer` VARCHAR(36),
  `category` VARCHAR(50),
  `metadata` JSON,
  `weight` FLOAT DEFAULT 1.0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id_interaction`),
  INDEX `idx_user_type` (`id_user`, `type`),
  INDEX `idx_event` (`id_event`),
  CONSTRAINT `fk_interactions_user`
    FOREIGN KEY (`id_user`)
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
  `instagram` VARCHAR(100),
  `tiktok` VARCHAR(100),
  `twitter` VARCHAR(100),
  `website` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_organizer`),
  UNIQUE INDEX `uk_name` (`name`),
  INDEX `idx_creator` (`id_creator`),
  
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
  `external_instagram` VARCHAR(100) DEFAULT NULL,
  `external_tiktok` VARCHAR(100) DEFAULT NULL,
  `external_twitter` VARCHAR(100) DEFAULT NULL,
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
  `embedding` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_event`),
  INDEX `idx_organizer` (`id_organizer`),
  INDEX `idx_creator` (`id_creator`),
  INDEX `idx_date` (`date`),
  INDEX `idx_status` (`status`),
  
  CONSTRAINT `fk_events_organizer`
    FOREIGN KEY (`id_organizer`)
    REFERENCES `organizer` (`id_organizer`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TICKETS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `tickets` (
  `id_ticket` VARCHAR(36) NOT NULL,
  `uuid` VARCHAR(50) NOT NULL,
  `id_event` VARCHAR(36) NOT NULL,
  `id_user` VARCHAR(36) NOT NULL,
  `state` TINYINT NOT NULL DEFAULT 1,
  `buy_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_ticket`),
  UNIQUE INDEX `uk_uuid` (`uuid`),
  CONSTRAINT `fk_tickets_event` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Post Types
CREATE TABLE IF NOT EXISTS `post_type` (
  `id_post_type` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_post_type`)
);

INSERT INTO `post_type` (`name`) VALUES ('chat'), ('announcement'), ('question');

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
