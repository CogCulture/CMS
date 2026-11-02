-- =====================================================================
-- Emaar India CMS - MySQL Database Schema
-- Production DDL for Node.js API Layer
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `emaar_cms` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `emaar_cms`;

-- 1. Site Settings & Brand Identity (Hero, Logo, Video, Global Meta)
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(64) NOT NULL UNIQUE,
  `setting_value` TEXT NULL,
  `setting_group` VARCHAR(32) NOT NULL DEFAULT 'general',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Pages Table (Dynamic Page Creation)
CREATE TABLE IF NOT EXISTS `pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `template` VARCHAR(64) NOT NULL DEFAULT 'standard',
  `hero_banner` VARCHAR(512) NULL,
  `hero_title` VARCHAR(255) NULL,
  `hero_subtitle` VARCHAR(512) NULL,
  `content` LONGTEXT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Page Content Sections (Editable text & components)
CREATE TABLE IF NOT EXISTS `page_sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `page_slug` VARCHAR(255) NOT NULL DEFAULT 'home',
  `section_key` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NULL,
  `subtitle` TEXT NULL,
  `content` LONGTEXT NULL,
  `badge` VARCHAR(64) NULL,
  `cta_text` VARCHAR(128) NULL,
  `cta_link` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_page_section` (`page_slug`, `section_key`)
) ENGINE=InnoDB;

-- 4. Landmarks & Featured Developments
CREATE TABLE IF NOT EXISTS `landmarks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `location` VARCHAR(128) NOT NULL DEFAULT 'Gurugram',
  `category` VARCHAR(64) NOT NULL DEFAULT 'Residential',
  `image` VARCHAR(512) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Properties (Detailed Listings consumed by propertyService.js)
CREATE TABLE IF NOT EXISTS `properties` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `location` VARCHAR(128) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'Residential',
  `overview` TEXT NULL,
  `hero_images` JSON NULL,
  `amenities` JSON NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Blog Highlights (Discover Section)
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `caption` VARCHAR(255) NOT NULL,
  `image` VARCHAR(512) NOT NULL,
  `link` VARCHAR(255) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Media Library (Uploaded Images & Videos)
CREATE TABLE IF NOT EXISTS `media_library` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `original_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(512) NOT NULL,
  `file_type` VARCHAR(64) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `alt_text` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- Initial Seed Data (Matches current emaar-india website state)
-- =====================================================================

INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`) VALUES
('site_logo', '/media/images/emaar-india-logo-en.svg', 'hero'),
('site_logo_alt', 'Emaar India Official Logo', 'hero'),
('hero_video', '/media/videos/emaar.mp4', 'hero'),
('hero_video_type', 'local', 'hero'),
('hero_search_placeholder', 'Search by project, location or property type...', 'hero'),
('contact_phone', '+91 124 4421155', 'contact'),
('contact_email', 'enquiries@emaar-india.com', 'contact')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `page_sections` (`page_slug`, `section_key`, `title`, `subtitle`, `content`, `badge`, `cta_text`, `cta_link`) VALUES
('home', 'legacy_intro', 'BUILT ON LEGACY, DESIGNED FOR LIFE', NULL, 'For decades, Emaar has shaped some of the world’s most recognisable landmarks through visionary architecture, thoughtful design and a commitment to excellence. Building on this global legacy, Emaar India continues to create distinctive spaces across residential and commercial destinations. Each development reflects a shared belief in creating places that are designed to endure and inspire generations to come.', NULL, NULL, NULL),
('home', 'walkthrough', 'PROJECT WALKTHROUGHS', 'EXPLORE EMAAR INDIA FROM WHEREVER YOU ARE IN DETAIL.', 'STEP INSIDE EMAAR INDIA\'S PROPERTIES THROUGH IMMERSIVE WALKTHROUGHS AND EXPERIENCE THE SPACES BEFORE YOU ARRIVE.', 'NEW', 'EXPLORE', '/walkthroughs'),
('home', 'blogs_heading', 'DISCOVER OUR BLOGS', 'READ INSIGHTS ON REAL ESTATE, LIFESTYLE, INVESTMENT AND THE PLACES SHAPING INDIA.', NULL, NULL, 'VIEW ALL', '/blogs')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `content` = VALUES(`content`);

INSERT INTO `landmarks` (`name`, `slug`, `location`, `category`, `image`, `sort_order`) VALUES
('SERENITY HILLS, GURUGRAM', 'emaar-serenity-hills', 'Gurugram', 'Residential', '/media/images/landmarks/Serenity-hills-big.webp', 1),
('EMAAR INDIA BUSINESS CENTRE, GURUGRAM', 'emaar-india-business-centre', 'Gurugram', 'Commercial', '/media/images/landmarks/business-centre.jpg', 2),
('ELITE OASIS, LUCKNOW', 'elite-oasis', 'Lucknow', 'Residential', '/media/images/landmarks/elite-oasis.jpg', 3),
('URBAN ASCENT, GURUGRAM', 'urban-ascent', 'Gurugram', 'Residential', '/media/images/landmarks/urban-ascent.jpg', 4),
('MOHALI HILLS RESIDENTIAL PLOTS, MOHALI', 'mohali-hills', 'Mohali', 'Plots', '/media/images/landmarks/mohali-hills.jpg', 5),
('URBAN OASIS PHASE-4, GURUGRAM', 'urban-oasis-phase-4', 'Gurugram', 'Residential', '/media/images/landmarks/property-main-image-706x385.jpg', 6)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `pages` (`title`, `slug`, `template`, `hero_banner`, `hero_title`, `hero_subtitle`, `content`, `status`) VALUES
('Home Page', '/', 'home', '/media/videos/emaar.mp4', 'Welcome to Emaar India', 'Crafting iconic residential and commercial environments', 'Main homepage landing view', 'published'),
('About Us', '/about', 'standard', '/media/images/landmarks/business-centre.jpg', 'About Emaar India', 'A pioneer in shaping world-class skylines', 'Emaar India embodies visionary craftsmanship and architectural eminence.', 'published'),
('Latest Launches', '/latest-launches', 'showcase', '/media/images/landmarks/Serenity-hills-big.webp', 'Latest Launches', 'Explore contemporary master developments', 'Discover newly launched premier residences.', 'published'),
('Emaar Serenity Hills', '/properties/emaar-serenity-hills', 'property', '/media/images/serenity-hills/serenity-banner-01.jpg', 'Emaar Serenity Hills', 'Luxury Residences in Gurugram', 'Nestled at the foothills of the Aravallis, offering tranquil luxury.', 'published')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
