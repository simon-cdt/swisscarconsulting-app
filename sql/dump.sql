INSERT INTO `swiss-car-consulting`.`User` (id,username,password,createdAt,updatedAt,`role`,desactivated) VALUES
	 ('alksdfugpoi23bkéyjxfwset2bv','admin','$2a$10$sCkPorp1hwTFeGMtCRx1Pe55Iac4GqleUqV9Ax1uym7RF9.YTiKbO','2025-11-20 14:28:23.722',NULL,'ADMIN',0),
	 ('cladijbfpp7afsdif9c233ffsvg4','mechanic','$2a$10$sCkPorp1hwTFeGMtCRx1Pe55Iac4GqleUqV9Ax1uym7RF9.YTiKbO','2025-11-18 08:45:36.366',NULL,'MECHANIC',0),
	 ('cmhakaspodihfpp2i32ènfsdf','seller','$2a$10$sCkPorp1hwTFeGMtCRx1Pe55Iac4GqleUqV9Ax1uym7RF9.YTiKbO','2025-11-18 08:45:36.305','2025-11-20 16:36:56.895','SELLER',0),
	 ('cmhakffki000104jp137eh7cd','simon','$2a$10$sCkPorp1hwTFeGMtCRx1Pe55Iac4GqleUqV9Ax1uym7RF9.YTiKbO','2025-10-28 13:57:38.437','2025-11-24 15:44:58.534','BOTH',0),
	 ('cmi7s025z0000xcmkaa8qndx2','test','$2a$10$sCkPorp1hwTFeGMtCRx1Pe55Iac4GqleUqV9Ax1uym7RF9.YTiKbO','2025-11-20 18:39:47.447','2025-11-20 18:40:30.411','BOTH',1);


INSERT INTO `swiss-car-consulting`.Client (id,typeClient,email,phone,address,postalCode,city,firstName,name,companyName,contactFirstName,contactName,createdAt,updatedAt) VALUES
	 ('cmhcmsxwq0000zx3schk9f0tx','individual','rafael@becs.ch','+41792339445','Chemin du Grand-Puits 49','1217','','Rafael','Caudet',NULL,NULL,NULL,'2025-10-29 23:33:25.802','2025-11-26 17:51:19.166'),
	 ('cmhcn252i0001zx3sk470lqv9','company','contact@becs.ch','+41972339445','Chemin du Prevessins 12','1218','Satigny',NULL,NULL,'Becs PreciMeca','Rafael','Caudet','2025-10-29 23:40:34.987','2025-10-31 23:47:07.028'),
	 ('cmhdqveti0000zxunv4o0fks6','individual','alexis@mail.com','+41791234567','Chemin des Avenus 12','1217','Meyrin','Alexis','Aragon',NULL,NULL,NULL,'2025-10-30 18:15:05.671','2025-11-28 15:34:33.332'),
	 ('cmhf0nx9p0000ec1qwwzpuv4g','individual','100looping@gmail.com','41763836186','chemin voie 12','1212','Lancy','Laurent','Cecere',NULL,NULL,NULL,'2025-10-31 15:36:58.669','2025-10-31 15:36:58.669'),
	 ('cmhf0qw5v0003ec1qlrwrkb6i','individual','ftheraulaz@gmail.com','0033450567128','','','','juju','lofdf',NULL,NULL,NULL,'2025-10-31 15:39:17.201','2025-10-31 15:39:17.201'),
	 ('cmhfdie120000cw1quvcqak8o','individual','lkssldks@fdsd.com','0227948172','','','','Elliot','T',NULL,NULL,NULL,'2025-10-31 21:36:35.462','2025-10-31 21:36:35.462'),
	 ('cmhfxim7i0000jm1qctwktihv','individual','shop23456@gmail.com','0763836158','Chemin des Semailles 35','1212','Grand-Lancy','Fabienne','T',NULL,NULL,NULL,'2025-11-01 06:56:38.382','2025-11-01 06:56:38.382'),
	 ('cmhfxmrnf0001jm1qriym4ah3','individual','dfdf@hjh.com','02154','','','','RRrq','fdsds',NULL,NULL,NULL,'2025-11-01 06:59:52.057','2025-11-01 06:59:52.057'),
	 ('cmhfxnmtz0002jm1qfgvyda8e','individual','dvdsv@dsd.com','ddsvdsv','','','','cxvcv','vcxvcx',NULL,NULL,NULL,'2025-11-01 07:00:32.469','2025-11-01 07:00:32.469'),
	 ('cmhgkznkm0000i61pvz1d5o6u','individual','hkfhdsjfh@gmail.com','121212221212','','','','fdsds','dfdsf',NULL,NULL,NULL,'2025-11-01 17:53:44.471','2025-11-01 17:53:44.471');
INSERT INTO `swiss-car-consulting`.Client (id,typeClient,email,phone,address,postalCode,city,firstName,name,companyName,contactFirstName,contactName,createdAt,updatedAt) VALUES
	 ('cmhgl3ox70001i61p7kqbi8p8','individual','100looping@gmail.com','15245454545454','','','','gjjjg','gjhgjghg',NULL,NULL,NULL,'2025-11-01 17:56:52.842','2025-11-01 17:56:52.842'),
	 ('cmi8sprg00000zxtrik9qveyt','individual','test@m.cm','91287369','Chemin des Avenus 12','9234','iésud','test','test',NULL,NULL,NULL,'2025-11-21 11:47:32.784','2025-11-21 11:49:06.922');


INSERT INTO `swiss-car-consulting`.Insurance (id,name,email,phone) VALUES
	 ('cmigb3ycd0000xchcpznclorl','Allianz','contact@allianz.com','0800 123 456'),
	 ('cmigb3ycd0001xchcnhaytsaj','AXA','contact@axa.com','0800 654 321'),
	 ('cmigb3ycd0002xchcwo8lx6pv','Zurich','contact@zurich.com','0800 789 012'),
	 ('cmigb3ycd0003xchcs7aqp686','Generali','contact@generali.com','0800 222 333'),
	 ('cmigb3ycd0004xchc7uuo58fn','Helvetia','contact@helvetia.com','0800 444 555'),
	 ('cmigb3ycd0005xchcs57zb1qz','Baloise','contact@baloise.com','0800 666 777'),
	 ('cmigb3ycd0006xchcdxigebjq','SwissLife','contact@swisslife.com','0800 888 999'),
	 ('cmigb3ycd0007xchclxnynmkt','Mobiliar','contact@mobiliar.ch','0800 111 222'),
	 ('cmigb3ycd0008xchceb8c99y6','La Mobilière','contact@lamobiliere.ch','0800 333 444'),
	 ('cmigb3ycd0009xchcvjckiofv','ERGO','contact@ergo.com','0800 555 666');
INSERT INTO `swiss-car-consulting`.Insurance (id,name,email,phone) VALUES
	 ('cmigb3ycd000axchc4811ozwm','Concordia','contact@concordia.ch','0800 777 888'),
	 ('cmigb3ycd000bxchcx2o6w4od','Vaudoise','contact@vaudoise.ch','0800 999 000'),
	 ('cmigb3ycd000cxchcw9t0eufh','Allsecur','contact@allsecur.com','0800 121 212'),
	 ('cmigb3ycd000dxchc8e1b1ko0','Admiral','contact@admiral.com','0800 343 434'),
	 ('cmigb3ycd000exchc0xyhimub','Groupama','contact@groupama.com','0800 565 656');


INSERT INTO `swiss-car-consulting`.Vehicule (id,clientId,brand,model,`year`,licensePlate,createdAt,updatedAt,certificateImage,insuranceId,chassisNumber,lastExpertise,registrationNumber) VALUES
	 ('2025-1','cmhcmsxwq0000zx3schk9f0tx','Porsche','911 GT3',2019,'GE-120001','2025-10-30 12:43:46.074','2025-10-30 12:43:46.074',NULL,NULL,NULL,NULL,NULL),
	 ('2025-2','cmhcn252i0001zx3sk470lqv9','Ferrari','F8 Tributo',2020,'VD-122750','2025-10-30 12:43:46.074','2025-10-31 23:52:58.670',NULL,NULL,NULL,NULL,NULL),
	 ('2025-3','cmhcmsxwq0000zx3schk9f0tx','Aston Martin','Vantage',2016,'GE-120005','2025-10-30 12:43:46.074','2025-10-30 12:43:46.074',NULL,NULL,NULL,NULL,NULL),
	 ('2025-4','cmhcmsxwq0000zx3schk9f0tx','Nissan','GT-R',2014,'GE-120009','2025-10-30 12:43:46.074','2025-10-30 12:43:46.074',NULL,NULL,NULL,NULL,NULL),
	 ('2025-5','cmhcn252i0001zx3sk470lqv9','Acura','NSX',2016,'VD-120016','2025-10-30 12:43:46.074','2025-10-30 12:43:46.074',NULL,NULL,NULL,NULL,NULL),
	 ('2025-6','cmhcmsxwq0000zx3schk9f0tx','Pagani','Huayra',2011,'GE-120019','2025-10-30 12:43:46.074','2025-10-30 12:43:46.074',NULL,NULL,NULL,NULL,NULL),
	 ('2025-7','cmhdqveti0000zxunv4o0fks6','BMW','M3 Competition CLS',2024,'GE-828372','2025-10-30 18:20:27.103','2025-11-28 16:46:04.224',NULL,'cmigb3ycd0000xchcpznclorl',NULL,NULL,NULL),
	 ('2025-8','cmhdqveti0000zxunv4o0fks6','Audi','RS3',2024,'GE-13242','2025-11-28 15:07:40.338','2025-11-28 16:36:51.336','1764347811821-166830349.png','cmigb3ycd0001xchcnhaytsaj','S9D87562EUHGF8','2006-06-11 22:00:00','6789.54632.34');


INSERT INTO `swiss-car-consulting`.Intervention (id,userId,vehiculeId,`date`,description,images,createdAt,updatedAt) VALUES
	 ('cmit042kz0003xcysjnb95ret','cmhakffki000104jp137eh7cd','2025-8','2025-12-05 15:10:01.235','changer plaques arrières',NULL,'2025-12-05 15:10:01.235','2025-12-05 15:10:01.235'),
	 ('cmit3580u0005xcysnxho2mzb','cladijbfpp7afsdif9c233ffsvg4','2025-2','2025-12-05 16:34:53.614','côté droit arraché
changement des portes
changement des vitres','1764952493737-15782398.mp4,1764952497921-932017299.jpg','2025-12-05 16:34:53.614','2025-12-05 16:34:53.614');
