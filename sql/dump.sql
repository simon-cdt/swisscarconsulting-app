/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.20-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: 4v0izc_application
-- ------------------------------------------------------
-- Server version	10.6.20-MariaDB-deb11-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Appointment`
--

DROP TABLE IF EXISTS `Appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Appointment` (
  `id` varchar(191) NOT NULL,
  `type` enum('DROPOFF','PICKUP') NOT NULL,
  `date` datetime(3) NOT NULL,
  `time` varchar(191) NOT NULL,
  `clientId` int(11) NOT NULL,
  `vehiculeId` varchar(191) NOT NULL,
  `estimateId` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Appointment_clientId_fkey` (`clientId`),
  KEY `Appointment_vehiculeId_fkey` (`vehiculeId`),
  KEY `Appointment_estimateId_fkey` (`estimateId`),
  CONSTRAINT `Appointment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Appointment_estimateId_fkey` FOREIGN KEY (`estimateId`) REFERENCES `Estimate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Appointment_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `Vehicule` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Appointment`
--

LOCK TABLES `Appointment` WRITE;
/*!40000 ALTER TABLE `Appointment` DISABLE KEYS */;
INSERT INTO `Appointment` VALUES ('cmoy5skyb0014qezx8ahcwpu9','DROPOFF','2026-05-12 22:00:00.000','10:00',1,'2026-2','2026-05-2',NULL,'2026-05-09 09:46:07.720','2026-05-09 09:46:07.720');
INSERT INTO `Appointment` VALUES ('cmoy6a8pr0018qezxg64f2fz5','DROPOFF','2026-05-28 22:00:00.000','10:00',1,'2026-2','2026-05-2',NULL,'2026-05-09 09:59:51.649','2026-05-09 09:59:51.649');
INSERT INTO `Appointment` VALUES ('cmpid71bb000i8n2d4yqbgy03','DROPOFF','2026-05-25 22:00:00.000','08:11',1,'2026-2','2026-05-7',NULL,'2026-05-23 13:08:42.980','2026-05-23 13:08:42.980');
INSERT INTO `Appointment` VALUES ('cmpsp89v8000ban2dpc88hn7t','DROPOFF','2026-05-30 22:00:00.000','14:00',17,'2026-16','2026-05-9','clef dans la boîte','2026-05-30 18:43:17.873','2026-05-30 18:43:17.873');
/*!40000 ALTER TABLE `Appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Client`
--

DROP TABLE IF EXISTS `Client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `typeClient` enum('company','individual') NOT NULL,
  `email` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `postalCode` int(11) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `firstName` varchar(191) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `companyName` varchar(191) DEFAULT NULL,
  `contactFirstName` varchar(191) DEFAULT NULL,
  `contactName` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `phone2Number` varchar(191) DEFAULT NULL,
  `phone2Prefix` varchar(191) DEFAULT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `phonePrefix` varchar(191) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Client`
--

LOCK TABLES `Client` WRITE;
/*!40000 ALTER TABLE `Client` DISABLE KEYS */;
INSERT INTO `Client` VALUES (1,'individual','simon@mail.com','Chemin du Grand-Puits 49',1217,'Meyrin','Simon','Caudet','test','Simon','Caudet','2026-05-07 21:14:40.652','2026-05-09 08:33:40.786','234523423','+41','765046747','+41');
INSERT INTO `Client` VALUES (2,'company','uber@mail.com','',NULL,'',NULL,NULL,'Uber','John','Doe','2026-05-09 10:20:31.713','2026-05-09 10:20:31.713','','','791234567','+41');
INSERT INTO `Client` VALUES (4,'company','migros@ge.ch','Ch. des vuaches 34',1212,'Lancy',NULL,NULL,'Migros','Laurent','Migros','2026-05-10 22:13:20.032','2026-05-10 22:13:20.032','22145687','+41','743698','+41');
INSERT INTO `Client` VALUES (5,'individual','laurent.cecere@gmail.com','Ch des semailles 35',1212,'Lancy','Laurent','Cecere',NULL,NULL,NULL,'2026-05-10 22:14:39.231','2026-05-10 22:14:39.231','227948172','+41','763836186','+41');
INSERT INTO `Client` VALUES (16,'company','aligros@ch.ch','Chemin des Vaches 12',1212,'Lancy',NULL,NULL,'Aligro','Suzanne','Peter','2026-05-30 18:28:36.176','2026-05-30 18:28:36.176','767894563','+41','224789451','+41');
INSERT INTO `Client` VALUES (17,'individual','gfgfg@swisscom.ch','Rue des Dé 2',1227,'Carouge','Simone','Chaplin',NULL,NULL,NULL,'2026-05-30 18:34:39.451','2026-05-30 18:34:39.451','789635241','+41','784561236','+41');
INSERT INTO `Client` VALUES (18,'individual','fgfgfg@yahoo.fr','Avenue des Morgines 12',1206,'Genève','Lily','Lolo',NULL,NULL,NULL,'2026-05-31 09:08:17.473','2026-05-31 09:08:17.473','0223476961','','763836185','+41');
/*!40000 ALTER TABLE `Client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Estimate`
--

DROP TABLE IF EXISTS `Estimate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Estimate` (
  `id` varchar(191) NOT NULL,
  `interventionId` varchar(191) NOT NULL,
  `status` enum('TOFINISH','PENDING','ACCEPTED','SENT_TO_GARAGE','WAITING_PARTS','FINISHED') NOT NULL DEFAULT 'TOFINISH',
  `type` enum('INDIVIDUAL','INSURANCE') NOT NULL,
  `claimNumber` varchar(191) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `discount` double DEFAULT NULL,
  `sentToGarageAt` datetime(3) DEFAULT NULL,
  `acceptedAt` datetime(3) DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `partsOrderedAt` datetime(3) DEFAULT NULL,
  `partsArrivedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Estimate_interventionId_fkey` (`interventionId`),
  CONSTRAINT `Estimate_interventionId_fkey` FOREIGN KEY (`interventionId`) REFERENCES `Intervention` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Estimate`
--

LOCK TABLES `Estimate` WRITE;
/*!40000 ALTER TABLE `Estimate` DISABLE KEYS */;
INSERT INTO `Estimate` VALUES ('2026-05-1','cmow0m66c000080xcfg24q2vm','FINISHED','INDIVIDUAL',NULL,0,NULL,'2026-05-09 09:37:07.974','2026-05-09 09:36:55.028',NULL,NULL,NULL,'2026-05-09 09:30:16.974','2026-05-09 09:39:01.219');
INSERT INTO `Estimate` VALUES ('2026-05-2','cmoy5ki7x0012qezx64g35s7a','FINISHED','INDIVIDUAL',NULL,0,NULL,'2026-05-09 10:00:01.203','2026-05-09 09:59:39.373',NULL,NULL,NULL,'2026-05-09 09:45:07.023','2026-05-09 10:21:35.806');
INSERT INTO `Estimate` VALUES ('2026-05-3','cmoy71l1r0019qezxnnuopm5l','FINISHED','INDIVIDUAL',NULL,0,NULL,'2026-05-09 10:22:42.432','2026-05-09 10:22:36.924',NULL,NULL,NULL,'2026-05-09 10:22:03.406','2026-05-09 10:23:55.451');
INSERT INTO `Estimate` VALUES ('2026-05-4','cmoy72ka7001bqezx5qs9uqtm','FINISHED','INSURANCE','2026-05-1',0,NULL,'2026-05-09 10:23:48.352','2026-05-09 10:23:44.004',NULL,NULL,NULL,'2026-05-09 10:22:07.571','2026-05-09 10:23:58.958');
INSERT INTO `Estimate` VALUES ('2026-05-5','cmoy97wjk001kqezxmd4sta07','TOFINISH','INSURANCE','2024_05_23',0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-09 11:30:50.581','2026-05-24 23:27:31.270');
INSERT INTO `Estimate` VALUES ('2026-05-7','cmphb4t7m00008n2dizdbkju3','ACCEPTED','INSURANCE','2026_05_23',0,NULL,NULL,'2026-05-23 13:08:27.846',NULL,NULL,NULL,'2026-05-23 12:59:57.987','2026-05-23 13:08:27.847');
INSERT INTO `Estimate` VALUES ('2026-05-8','cmpfhoju30000k0xced2fo04b','PENDING','INDIVIDUAL',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-30 18:37:30.121','2026-05-30 18:42:47.591');
INSERT INTO `Estimate` VALUES ('2026-05-9','cmpsp03qb0001an2d5ohitrac','SENT_TO_GARAGE','INDIVIDUAL',NULL,0,NULL,'2026-05-30 18:43:53.107','2026-05-30 18:42:55.557',NULL,NULL,NULL,'2026-05-30 18:37:42.987','2026-05-30 18:43:53.109');
/*!40000 ALTER TABLE `Estimate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EstimateItem`
--

DROP TABLE IF EXISTS `EstimateItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EstimateItem` (
  `id` varchar(191) NOT NULL,
  `estimateId` varchar(191) NOT NULL,
  `type` enum('PART','LABOR','UPCOMING') NOT NULL,
  `designation` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `unitPrice` double NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `calculateByTime` tinyint(1) DEFAULT NULL,
  `position` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `EstimateItem_estimateId_fkey` (`estimateId`),
  CONSTRAINT `EstimateItem_estimateId_fkey` FOREIGN KEY (`estimateId`) REFERENCES `Estimate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EstimateItem`
--

LOCK TABLES `EstimateItem` WRITE;
/*!40000 ALTER TABLE `EstimateItem` DISABLE KEYS */;
INSERT INTO `EstimateItem` VALUES ('cmoy5g82y000yqezxbo0brmo0','2026-05-1','PART','Forfait disque plaquette AV et AR','<p>Remplacement Disque et plaquettes de frein AV et AR</p>',100,1,NULL,1,'2026-05-09 09:36:31.150','2026-05-09 09:36:31.150');
INSERT INTO `EstimateItem` VALUES ('cmoy5g86d000zqezxqgieuni8','2026-05-1','LABOR','Main d\'œuvre',NULL,100,120,1,1,'2026-05-09 09:36:31.285','2026-05-09 09:36:31.285');
INSERT INTO `EstimateItem` VALUES ('cmoy5g89o0010qezxifa5b80q','2026-05-1','UPCOMING','<p>Pneu</p>',NULL,0,NULL,NULL,1,'2026-05-09 09:36:31.408','2026-05-09 09:36:31.408');
INSERT INTO `EstimateItem` VALUES ('cmoy69t5m0016qezxu92ribwa','2026-05-2','PART','Forfait pneus','<p>Remplacement, montage, équilibrage AV et AR</p>',500,1,NULL,1,'2026-05-09 09:59:31.526','2026-05-09 09:59:31.526');
INSERT INTO `EstimateItem` VALUES ('cmoy69t8d0017qezxsu9bokii','2026-05-2','UPCOMING','<p>Filtre à huile</p>',NULL,0,NULL,NULL,1,'2026-05-09 09:59:31.620','2026-05-09 09:59:31.620');
INSERT INTO `EstimateItem` VALUES ('cmoy73am3001dqezx8rrbochb','2026-05-3','PART','Forfait service','<p>Vidange, filtre à huile, contrôle des niveaux</p>',500,1,NULL,1,'2026-05-09 10:22:27.153','2026-05-09 10:22:27.153');
INSERT INTO `EstimateItem` VALUES ('cmoy73apg001eqezxaoupkwkg','2026-05-3','LABOR','Main d\'œuvre',NULL,130,300,1,1,'2026-05-09 10:22:27.275','2026-05-09 10:22:27.275');
INSERT INTO `EstimateItem` VALUES ('cmoy74t0u001gqezxtlhjkp01','2026-05-4','PART','Tout refaire la voiture','<p>on a tout retapé</p>',1000,1,NULL,1,'2026-05-09 10:23:37.653','2026-05-09 10:23:37.653');
INSERT INTO `EstimateItem` VALUES ('cmoy74t48001hqezxqf1248zn','2026-05-4','LABOR','Main d\'œuvre',NULL,150,600,1,1,'2026-05-09 10:23:37.791','2026-05-09 10:23:37.791');
INSERT INTO `EstimateItem` VALUES ('cmpicxo3p000f8n2d32sfm2q6','2026-05-7','PART','Parebrise','<p>changement</p>',2500,1,NULL,1,'2026-05-23 13:01:25.955','2026-05-23 13:01:25.955');
INSERT INTO `EstimateItem` VALUES ('cmpicxo4q000g8n2d2zbbqm6v','2026-05-7','LABOR','Main d\'œuvre','<p>changement</p>',100,180,1,1,'2026-05-23 13:01:25.993','2026-05-23 13:01:25.993');
INSERT INTO `EstimateItem` VALUES ('cmpkeqo350007rbzxut5dpfs2','2026-05-5','PART','Forfait pneus','<p>Remplacement, montage, équilibrage AV et AR</p>',200,1,NULL,1,'2026-05-24 23:27:30.881','2026-05-24 23:27:30.881');
INSERT INTO `EstimateItem` VALUES ('cmpkeqo6q0008rbzx8bf5zexg','2026-05-5','LABOR','Main d\'œuvre',NULL,100,300,NULL,1,'2026-05-24 23:27:31.011','2026-05-24 23:27:31.011');
INSERT INTO `EstimateItem` VALUES ('cmpkeqoa80009rbzxo5pts09d','2026-05-5','UPCOMING','<p>Filtre à huile</p>',NULL,0,NULL,NULL,1,'2026-05-24 23:27:31.137','2026-05-24 23:27:31.137');
INSERT INTO `EstimateItem` VALUES ('cmpsp5jyt0003an2d0xz0pmsw','2026-05-9','PART','Forfait disque plaquette AV et AR','<p>Remplacement Disque et plaquettes de frein AV et AR</p>',500,4,NULL,1,'2026-05-30 18:41:10.995','2026-05-30 18:41:10.995');
INSERT INTO `EstimateItem` VALUES ('cmpsp5k330004an2dluqevvih','2026-05-9','LABOR','Main d\'œuvre','<p>reglages de la géometrie</p>',100,120,1,1,'2026-05-30 18:41:11.148','2026-05-30 18:41:11.148');
INSERT INTO `EstimateItem` VALUES ('cmpsp7gt30008an2dh5rzz4ta','2026-05-8','PART','Forfait pneus','<p>Remplacement, montage, équilibrage AV et AR</p>',250,4,NULL,1,'2026-05-30 18:42:40.212','2026-05-30 18:42:40.212');
INSERT INTO `EstimateItem` VALUES ('cmpsp7gtc0009an2djuot0hs7','2026-05-8','LABOR','Main d\'œuvre','<p>réglages soupapes</p>',100,180,1,1,'2026-05-30 18:42:40.222','2026-05-30 18:42:40.222');
INSERT INTO `EstimateItem` VALUES ('cmpsp7gtj000aan2d1z3r368o','2026-05-8','UPCOMING','<p>Freins</p>',NULL,0,NULL,NULL,1,'2026-05-30 18:42:40.229','2026-05-30 18:42:40.229');
/*!40000 ALTER TABLE `EstimateItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EstimateRefusal`
--

DROP TABLE IF EXISTS `EstimateRefusal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EstimateRefusal` (
  `id` varchar(191) NOT NULL,
  `estimateId` varchar(191) NOT NULL,
  `reason` varchar(191) NOT NULL,
  `refusedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  PRIMARY KEY (`id`),
  KEY `EstimateRefusal_estimateId_fkey` (`estimateId`),
  CONSTRAINT `EstimateRefusal_estimateId_fkey` FOREIGN KEY (`estimateId`) REFERENCES `Estimate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EstimateRefusal`
--

LOCK TABLES `EstimateRefusal` WRITE;
/*!40000 ALTER TABLE `EstimateRefusal` DISABLE KEYS */;
INSERT INTO `EstimateRefusal` VALUES ('cmoy59lbp000mqezx6mb30vzp','2026-05-1','probleme avec le prix','2026-05-09 09:31:21.712','2026-05-09 09:31:21.713',NULL);
INSERT INTO `EstimateRefusal` VALUES ('cmoy5ddez000qqezxznx49fid','2026-05-1','encore le meme bug','2026-05-09 09:34:18.111','2026-05-09 09:34:18.112',NULL);
INSERT INTO `EstimateRefusal` VALUES ('cmoy697n20015qezx1s8fhslh','2026-05-2','test','2026-05-09 09:59:03.612','2026-05-09 09:59:03.613',NULL);
INSERT INTO `EstimateRefusal` VALUES ('cmoy9styv0003qfzxoih04fj1','2026-05-5','manque le forfait des pneus','2026-05-09 11:38:17.861','2026-05-09 11:38:17.867','{\"items\":[{\"id\":\"cmoy9sj4k0001qfzxp53yjo49\",\"estimateId\":\"2026-05-5\",\"type\":\"PART\",\"designation\":\"Forfait service\",\"description\":\"<p>Vidange, filtre à huile, contrôle des niveaux</p>\",\"unitPrice\":100,\"quantity\":1,\"calculateByTime\":null,\"position\":1,\"createdAt\":\"2026-05-09T11:38:03.816Z\",\"updatedAt\":\"2026-05-09T11:38:03.816Z\"},{\"id\":\"cmoy9sj7k0002qfzxp1m9s3bj\",\"estimateId\":\"2026-05-5\",\"type\":\"LABOR\",\"designation\":\"Main d\'œuvre\",\"description\":null,\"unitPrice\":100,\"quantity\":null,\"calculateByTime\":null,\"position\":1,\"createdAt\":\"2026-05-09T11:38:03.929Z\",\"updatedAt\":\"2026-05-09T11:38:03.929Z\"}],\"discount\":null,\"type\":\"INSURANCE\",\"claimNumber\":null}');
INSERT INTO `EstimateRefusal` VALUES ('cmoy9u1nr0007qfzx5ltkc7rk','2026-05-5','manque le prevoir','2026-05-09 11:39:14.484','2026-05-09 11:39:14.487','{\"items\":[{\"id\":\"cmoy9trar0004qfzxu56wowr8\",\"estimateId\":\"2026-05-5\",\"type\":\"PART\",\"designation\":\"Forfait service\",\"description\":\"<p>Vidange, filtre à huile, contrôle des niveaux</p>\",\"unitPrice\":100,\"quantity\":1,\"calculateByTime\":null,\"position\":1,\"createdAt\":\"2026-05-09T11:39:01.055Z\",\"updatedAt\":\"2026-05-09T11:39:01.055Z\"},{\"id\":\"cmoy9tre40005qfzx45kgtxkf\",\"estimateId\":\"2026-05-5\",\"type\":\"PART\",\"designation\":\"Forfait pneus\",\"description\":\"<p>Remplacement, montage, équilibrage AV et AR</p>\",\"unitPrice\":100,\"quantity\":1,\"calculateByTime\":null,\"position\":2,\"createdAt\":\"2026-05-09T11:39:01.185Z\",\"updatedAt\":\"2026-05-09T11:39:01.185Z\"},{\"id\":\"cmoy9trh80006qfzxxodyzjoo\",\"estimateId\":\"2026-05-5\",\"type\":\"LABOR\",\"designation\":\"Main d\'œuvre\",\"description\":null,\"unitPrice\":100,\"quantity\":null,\"calculateByTime\":null,\"position\":1,\"createdAt\":\"2026-05-09T11:39:01.301Z\",\"updatedAt\":\"2026-05-09T11:39:01.301Z\"}],\"discount\":null,\"type\":\"INSURANCE\",\"claimNumber\":null}');
INSERT INTO `EstimateRefusal` VALUES ('cmpkepseg0000rbzx29npmhrf','2026-05-5','test','2026-05-24 23:26:49.805','2026-05-24 23:26:49.811','{\"items\":[{\"id\":\"cmoy9ucgd0008qfzxtngc5xmi\",\"estimateId\":\"2026-05-5\",\"type\":\"PART\",\"designation\":\"Forfait service\",\"description\":\"<p>Vidange, filtre à huile, contrôle des niveaux</p>\",\"unitPrice\":100,\"quantity\":1,\"calculateByTime\":null,\"position\":1,\"createdAt\":\"2026-05-09T11:39:28.475Z\",\"updatedAt\":\"2026-05-09T11:39:28.475Z\"},{\"id\":\"cmoy9ucjq0009qfzxo6qyvca8\",\"estimateId\":\"2026-05-5\",\"type\":\"LABOR\",\"designation\":\"Main d\'œuvre\",\"description\":null,\"unitPrice\":100,\"quantity\":null,\"calculateByTime\":null,\"position\":1,\"createdAt\":\"2026-05-09T11:39:28.603Z\",\"updatedAt\":\"2026-05-09T11:39:28.603Z\"},{\"id\":\"cmoy9ucmu000aqfzx2q9yslry\",\"estimateId\":\"2026-05-5\",\"type\":\"UPCOMING\",\"designation\":\"<p>Filtre à huile</p>\",\"description\":null,\"unitPrice\":0,\"quantity\":null,\"calculateByTime\":null,\"position\":1,\"createdAt\":\"2026-05-09T11:39:28.714Z\",\"updatedAt\":\"2026-05-09T11:39:28.714Z\"}],\"discount\":null,\"type\":\"INSURANCE\",\"claimNumber\":\"2024_05_23\"}');
/*!40000 ALTER TABLE `EstimateRefusal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Insurance`
--

DROP TABLE IF EXISTS `Insurance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Insurance` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Insurance`
--

LOCK TABLES `Insurance` WRITE;
/*!40000 ALTER TABLE `Insurance` DISABLE KEYS */;
INSERT INTO `Insurance` VALUES ('cmovyse6k0000dgxchmslujdj','AXA Assurances','contact@axa.ch','+41 58 215 21 21');
INSERT INTO `Insurance` VALUES ('cmovyse870001dgxcpvwg8zra','Allianz Suisse','info@allianz.ch','+41 58 358 58 58');
INSERT INTO `Insurance` VALUES ('cmovyse9w0002dgxcw7ka7t2j','Helvetia Assurances','contact@helvetia.ch','+41 58 280 10 00');
INSERT INTO `Insurance` VALUES ('cmovysebc0003dgxcopdagz1c','Baloise Assurance','info@baloise.ch','+41 58 285 85 85');
INSERT INTO `Insurance` VALUES ('cmovysecs0004dgxc8sunpzgo','Generali Assurances','service@generali.ch','+41 58 472 47 47');
INSERT INTO `Insurance` VALUES ('cmovyseeb0005dgxcqrhvfbjl','Mobilière Suisse','contact@mobiliere.ch','+41 31 389 61 11');
INSERT INTO `Insurance` VALUES ('cmovysefu0006dgxcn6f3yrae','Zurich Assurances','info@zurich.ch','+41 44 628 28 28');
INSERT INTO `Insurance` VALUES ('cmovysehb0007dgxc89fehn5g','Vaudoise Assurances','info@vaudoise.ch','+41 21 618 80 80');
INSERT INTO `Insurance` VALUES ('cmovyseiu0008dgxcfxcawm9i','CSS Assurance','contact@css.ch','+41 58 277 11 11');
INSERT INTO `Insurance` VALUES ('cmovyseka0009dgxccdljogzb','ELVIA Assurances','service@elvia.ch','+41 44 283 33 33');
/*!40000 ALTER TABLE `Insurance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Intervention`
--

DROP TABLE IF EXISTS `Intervention`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Intervention` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `vehiculeId` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `description` varchar(191) DEFAULT NULL,
  `medias` varchar(191) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Intervention_userId_fkey` (`userId`),
  KEY `Intervention_vehiculeId_fkey` (`vehiculeId`),
  CONSTRAINT `Intervention_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Intervention_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `Vehicule` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Intervention`
--

LOCK TABLES `Intervention` WRITE;
/*!40000 ALTER TABLE `Intervention` DISABLE KEYS */;
INSERT INTO `Intervention` VALUES ('cmow0m66c000080xcfg24q2vm','cmovyu96z000404l49rlnb8po','2026-2','2026-05-07 21:45:38.219','Service\n- Changement de la ligne\n- Bridage',NULL,0,'2026-05-07 21:45:38.219','2026-05-07 21:45:38.219');
INSERT INTO `Intervention` VALUES ('cmoy5ki7x0012qezx64g35s7a','cmovyu96z000404l49rlnb8po','2026-2','2026-05-09 09:39:50.950','Pneu',NULL,0,'2026-05-09 09:39:50.950','2026-05-09 09:39:50.950');
INSERT INTO `Intervention` VALUES ('cmoy71l1r0019qezxnnuopm5l','cmovyu96z000404l49rlnb8po','2026-3','2026-05-09 10:21:07.387','Service',NULL,0,'2026-05-09 10:21:07.387','2026-05-09 10:21:07.387');
INSERT INTO `Intervention` VALUES ('cmoy72ka7001bqezx5qs9uqtm','cmovyu96z000404l49rlnb8po','2026-2','2026-05-09 10:21:53.001','Accident',NULL,0,'2026-05-09 10:21:53.001','2026-05-09 10:21:53.001');
INSERT INTO `Intervention` VALUES ('cmoy97wjk001kqezxmd4sta07','cmovyu96z000404l49rlnb8po','2026-3','2026-05-09 11:22:01.445','Pneu',NULL,0,'2026-05-09 11:22:01.445','2026-05-09 11:22:01.445');
INSERT INTO `Intervention` VALUES ('cmpfhoju30000k0xced2fo04b','cmovyu96z000404l49rlnb8po','2026-6','2026-05-21 12:51:00.064','Service',NULL,0,'2026-05-21 12:51:00.064','2026-05-21 12:51:00.064');
INSERT INTO `Intervention` VALUES ('cmphb4t7m00008n2dizdbkju3','cmovyu96z000404l49rlnb8po','2026-2','2026-05-22 19:23:13.759','Test','temp-1779541226724-160391967.jpeg',0,'2026-05-22 19:23:13.759','2026-05-23 13:00:30.432');
INSERT INTO `Intervention` VALUES ('cmpsp03qb0001an2d5ohitrac','cmovyu96z000404l49rlnb8po','2026-16','2026-05-30 18:36:56.673','Test3\n- ','temp-1780166216628-333319727.jpeg',0,'2026-05-30 18:36:56.673','2026-05-30 18:36:56.673');
/*!40000 ALTER TABLE `Intervention` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Invoice`
--

DROP TABLE IF EXISTS `Invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Invoice` (
  `id` varchar(191) NOT NULL,
  `estimateId` varchar(191) NOT NULL,
  `typeEstimate` enum('INDIVIDUAL','INSURANCE') NOT NULL,
  `claimNumber` varchar(191) DEFAULT NULL,
  `interventionId` varchar(191) NOT NULL,
  `interventionDate` datetime(3) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `medias` varchar(191) DEFAULT NULL,
  `vehiculeId` varchar(191) NOT NULL,
  `brand` varchar(191) NOT NULL,
  `model` varchar(191) NOT NULL,
  `year` int(11) NOT NULL,
  `licensePlate` varchar(191) NOT NULL,
  `clientId` int(11) NOT NULL,
  `typeClient` enum('company','individual') NOT NULL,
  `name` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `companyName` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `postalCode` int(11) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `estimateItems` varchar(191) NOT NULL,
  `pdfUrl` varchar(191) DEFAULT NULL,
  `status` enum('PENDING_PAYMENT','PAID') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `phonePrefix` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Invoice_estimateId_key` (`estimateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Invoice`
--

LOCK TABLES `Invoice` WRITE;
/*!40000 ALTER TABLE `Invoice` DISABLE KEYS */;
INSERT INTO `Invoice` VALUES ('cmoy5jfr30011qezxba6d4l2l','2026-05-1','INDIVIDUAL',NULL,'cmow0m66c000080xcfg24q2vm','2026-05-07 21:45:38.219','Service\n- Changement de la ligne\n- Bridage',NULL,'2026-2','YAMAHA','TRACER 7',2022,'GE 128376',1,'individual','Caudet','Simon','simon@mail.com','test','Chemin du Grand-Puits 49',1217,'Meyrin','[{\"id\":\"cmoy5g82y000yqezxbo0brmo0\",\"type\":\"PART\",\"designation\":\"Forfait disque plaquette AV et AR\",\"description\":\"<p>Remplacement Disque et plaquettes de frein AV et AR</p>\",\"unitPrice\":100,\"','facture-2026-05-1-Caudet.pdf','PENDING_PAYMENT','2026-05-09 09:39:01.070','2026-05-09 09:39:01.070','765046747','+41');
INSERT INTO `Invoice` VALUES ('cmoy726w9001aqezxpl1uc8dv','2026-05-2','INDIVIDUAL',NULL,'cmoy5ki7x0012qezx64g35s7a','2026-05-09 09:39:50.950','Pneu',NULL,'2026-2','YAMAHA','TRACER 7',2022,'GE 128376',1,'individual','Caudet','Simon','simon@mail.com','test','Chemin du Grand-Puits 49',1217,'Meyrin','[{\"id\":\"cmoy69t5m0016qezxu92ribwa\",\"type\":\"PART\",\"designation\":\"Forfait pneus\",\"description\":\"<p>Remplacement, montage, équilibrage AV et AR</p>\",\"unitPrice\":500,\"quantity\":1,\"position\":1,\"ca','facture-2026-05-2-Caudet.pdf','PENDING_PAYMENT','2026-05-09 10:21:35.702','2026-05-09 10:21:35.702','765046747','+41');
INSERT INTO `Invoice` VALUES ('cmoy756na001iqezxbstz1py7','2026-05-3','INDIVIDUAL',NULL,'cmoy71l1r0019qezxnnuopm5l','2026-05-09 10:21:07.387','Service',NULL,'2026-3','BMW','M5',2025,'GE 969835',2,'company','Doe','John','uber@mail.com','Uber','',NULL,'','[{\"id\":\"cmoy73am3001dqezx8rrbochb\",\"type\":\"PART\",\"designation\":\"Forfait service\",\"description\":\"<p>Vidange, filtre à huile, contrôle des niveaux</p>\",\"unitPrice\":500,\"quantity\":1,\"position\":1','facture-2026-05-3-Uber.pdf','PENDING_PAYMENT','2026-05-09 10:23:55.345','2026-05-09 10:23:55.345','791234567','+41');
INSERT INTO `Invoice` VALUES ('cmoy759ca001jqezxfkjoa7pa','2026-05-4','INSURANCE','2026-05-1','cmoy72ka7001bqezx5qs9uqtm','2026-05-09 10:21:53.001','Accident',NULL,'2026-2','YAMAHA','TRACER 7',2022,'GE 128376',1,'individual','Caudet','Simon','simon@mail.com','test','Chemin du Grand-Puits 49',1217,'Meyrin','[{\"id\":\"cmoy74t0u001gqezxtlhjkp01\",\"type\":\"PART\",\"designation\":\"Tout refaire la voiture\",\"description\":\"<p>on a tout retapé</p>\",\"unitPrice\":1000,\"quantity\":1,\"position\":1,\"calculateByTime\":n','facture-2026-05-4-Caudet.pdf','PENDING_PAYMENT','2026-05-09 10:23:58.838','2026-05-09 10:23:58.838','765046747','+41');
/*!40000 ALTER TABLE `Invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('MECHANIC','SELLER','BOTH','ADMIN') NOT NULL DEFAULT 'MECHANIC',
  `desactivated` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('cmovyu3ux000204l42f22h5vq','Adel','$2a$10$RZ3dAhHppFmJ8rAdgnL7Du/sNzM9l4UxtS41oGPegsNSQfAI3TXDm','BOTH',0,'2026-05-07 22:56:00.864','2026-05-30 18:46:25.573');
INSERT INTO `User` VALUES ('cmovyu6px000304l4bfre8i3v','Laurent','$2a$10$RZ3dAhHppFmJ8rAdgnL7Du/sNzM9l4UxtS41oGPegsNSQfAI3TXDm','BOTH',0,'2026-05-07 22:56:00.879','2026-05-30 18:46:32.278');
INSERT INTO `User` VALUES ('cmovyu96z000404l49rlnb8po','simon','$2a$10$RZ3dAhHppFmJ8rAdgnL7Du/sNzM9l4UxtS41oGPegsNSQfAI3TXDm','ADMIN',0,'2026-05-07 22:56:00.894',NULL);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Vehicule`
--

DROP TABLE IF EXISTS `Vehicule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Vehicule` (
  `id` varchar(191) NOT NULL,
  `clientId` int(11) NOT NULL,
  `brand` varchar(191) NOT NULL,
  `model` varchar(191) NOT NULL,
  `year` int(11) NOT NULL,
  `licensePlate` varchar(191) NOT NULL,
  `insuranceId` varchar(191) DEFAULT NULL,
  `chassisNumber` varchar(191) DEFAULT NULL,
  `registrationNumber` varchar(191) DEFAULT NULL,
  `lastExpertise` datetime(3) DEFAULT NULL,
  `certificateImage` varchar(191) DEFAULT NULL,
  `receptionType` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Vehicule_chassisNumber_key` (`chassisNumber`),
  UNIQUE KEY `Vehicule_registrationNumber_key` (`registrationNumber`),
  UNIQUE KEY `Vehicule_receptionType_key` (`receptionType`),
  KEY `Vehicule_clientId_fkey` (`clientId`),
  KEY `Vehicule_insuranceId_fkey` (`insuranceId`),
  CONSTRAINT `Vehicule_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Vehicule_insuranceId_fkey` FOREIGN KEY (`insuranceId`) REFERENCES `Insurance` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Vehicule`
--

LOCK TABLES `Vehicule` WRITE;
/*!40000 ALTER TABLE `Vehicule` DISABLE KEYS */;
INSERT INTO `Vehicule` VALUES ('2026-10',5,'SMART','TWO',2021,'VD 456789','cmovyse870001dgxcpvwg8zra','1212DF12121',NULL,'2023-02-08 00:00:00.000',NULL,'454GH121','2026-05-23 12:49:09.791','2026-05-23 12:49:09.791');
INSERT INTO `Vehicule` VALUES ('2026-11',1,'MAZDA','CX-3',2020,'GE 127633','cmovyse6k0000dgxchmslujdj',NULL,NULL,'2026-05-12 00:00:00.000',NULL,'ASIJDLAKSHDASHJSDFSDJH','2026-05-24 21:48:21.552','2026-05-24 21:48:21.552');
INSERT INTO `Vehicule` VALUES ('2026-12',16,'FORD','F150',2021,'VS 123456','cmovyse9w0002dgxcw7ka7t2j','121FDDF21212','456.789.123',NULL,'temp-1780165788230-458322940.JPG','454GFG545454','2026-05-30 18:29:48.308','2026-05-30 18:29:48.308');
INSERT INTO `Vehicule` VALUES ('2026-13',16,'FORD','F150',2020,'GE 12345','cmovyse9w0002dgxcw7ka7t2j','3333DF3333','456.123.789',NULL,'temp-1780165830893-146823104.JPG','121FDFDFDF','2026-05-30 18:30:30.938','2026-05-30 18:30:30.938');
INSERT INTO `Vehicule` VALUES ('2026-16',17,'AUDI','Q3',2023,'SH 123456','cmovysehb0007dgxc89fehn5g','454GFHG5454','789.456.123','2023-04-12 00:00:00.000','temp-1780166179909-280258420.JPG','12GGH000','2026-05-30 18:36:19.953','2026-05-30 18:36:19.953');
INSERT INTO `Vehicule` VALUES ('2026-17',18,'VW','BUGGY',1995,'GE 100000','cmovyse6k0000dgxchmslujdj','121GFHGF2121','123.456.789','2022-10-11 00:00:00.000','temp-1780218673611-264959943.jpg','12HGH12121','2026-05-31 09:11:13.679','2026-05-31 09:11:13.679');
INSERT INTO `Vehicule` VALUES ('2026-18',4,'TESLA','X',2025,'GE 45688','cmovyse870001dgxcpvwg8zra',NULL,'456.789.221',NULL,NULL,NULL,'2026-06-07 21:59:34.621','2026-06-07 21:59:34.621');
INSERT INTO `Vehicule` VALUES ('2026-19',4,'FORD','TT',2010,'GE 45688',NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-07 22:02:14.655','2026-06-07 22:02:14.655');
INSERT INTO `Vehicule` VALUES ('2026-2',1,'YAMAHA','TRACER 7',2022,'GE 128376','cmovyseeb0005dgxcqrhvfbjl','121GFHGF2122','111.222.333',NULL,NULL,'121GFHGF2122','2026-05-07 21:44:04.301','2026-05-07 21:44:04.301');
INSERT INTO `Vehicule` VALUES ('2026-3',2,'BMW','M5',2025,'GE 969835','cmovyse6k0000dgxchmslujdj','121jkjk121','000.000.000',NULL,NULL,NULL,'2026-05-09 10:21:01.421','2026-05-23 13:11:32.163');
INSERT INTO `Vehicule` VALUES ('2026-6',4,'AUDI','Q5',2022,'GE 962983',NULL,NULL,NULL,NULL,'temp-1780869417853-745132003.JPG',NULL,'2026-05-21 12:50:51.692','2026-06-07 21:56:57.906');
/*!40000 ALTER TABLE `Vehicule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-04  7:48:28
