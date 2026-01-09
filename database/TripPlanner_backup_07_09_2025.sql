--
-- PostgreSQL database dump
--

\restrict qfmvyP6MKjNntLa64UfgWcq1dWnhHOmKKbzwPJP8gRpWp6kqoJqR6zGkerU4VQG

-- Dumped from database version 17.6 (Debian 17.6-1.pgdg13+1)
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-07 15:03:49 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3480 (class 0 OID 16438)
-- Dependencies: 220
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.trips (id, user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image, created_at, updated_at) FROM stdin;
c623d90b-c566-4546-ab53-9af29bede4ab	1	My Taiwan	2025-07-20	2025-08-11	Taiwan	["exotic", "cultural"]	["Holidays", "Trip of the month"]	$3,000	Explore the beautiful island of Taiwan with its stunning mountains, vibrant culture, and delicious cuisine.	/public/assets/mountains.jpg	2025-08-31 07:27:15.921888	2025-08-31 07:27:15.921888
cc08401f-454b-4558-8c05-3ee8bf0a454b	4	My Title 1	2025-08-01	2025-08-08	Hawaii	["cultural"]	["TagOne"]	200 EUR	Desc1	/public/assets/oriental.jpg	2025-08-31 15:31:49.131373	2025-08-31 15:31:49.131373
b1df1174-246c-41d6-bf49-566a6a33151c	5	My Title 1	2025-08-17	2025-08-21	Hawaii	["city-break"]	["TagOne"]	2000 PLN	desc1	/public/assets/oriental.jpg	2025-08-31 15:49:31.945609	2025-08-31 15:49:31.945609
63d21e46-b84d-4ead-a77b-e05c470bc25c	1	Last Minute Trip	2025-08-02	2025-08-30	Italy	["last-minute"]	["TagOne1"]	200 EUR	Opis1	/public/assets/colosseum.jpg	2025-08-31 07:30:07.931057	2025-08-31 07:30:07.931057
4d6136af-59a4-4dee-8faf-78b7282cbd1c	6	CityBreak	2025-09-01	2025-09-08	Italy	["city-break"]	["My Holiday"]	2000 PLN	Opis1	/public/assets/colosseum.jpg	2025-09-04 16:31:03.126215	2025-09-04 16:31:03.126215
6b55be54-5ec4-448b-b731-c6d99706c6a9	6	Mountaint Trip	2025-09-01	2025-09-09	Poland	["mountain"]	["MountainHoliday"]	2000 PLN	Opis2	/public/assets/mountains-3.jpg	2025-09-07 08:12:03.834535	2025-09-07 08:12:03.834535
53dfc085-11f6-48d5-accb-ad8594793bb3	6	Oriental	2025-09-12	2025-09-14	Taiwan	["city-break"]	["OrientalTrip"]	2000 PLN	Opis2	/public/assets/oriental.jpg	2025-09-07 08:13:09.095723	2025-09-07 08:13:09.095723
c78cd4fc-d365-4e52-aa07-26af418231dc	2	My Title 1	2025-08-01	2025-08-28	Poland	["city-break"]	["My tag 1"]	2000 PLN	DescriptionOne	/public/assets/mountains-3.jpg	2025-08-31 07:31:36.997595	2025-08-31 07:31:36.997595
ff968138-b891-43c2-80fd-9f588dceb825	6	Alpine Adventure - Last Minute Deal	2025-07-28	2025-08-03	Germany	["last-minute"]	["Deal", "Adventure", "Mountains"]	$1,800	Last minute deal for mountain lovers! Explore Bavarian Alps with special discounted price.	/public/assets/mountains-3.jpg	2025-09-07 14:44:53.609432	2025-09-07 14:44:53.609432
a2a3ccad-1397-4fa0-ac91-3b95e70e447c	6	Explore Italy - Rome & Florence	2025-09-15	2025-09-25	Italy	["cultural"]	["History", "Art", "Architecture"]	$2,800	Discover the ancient history and Renaissance art in Rome and Florence. Visit the Colosseum, Vatican Museums, Uffizi Gallery.	/public/assets/colosseum.jpg	2025-09-07 14:45:57.167232	2025-09-07 14:45:57.167232
bbdf72ff-d4f8-432b-9fa6-af73d38bf306	6	Paris Weekend Getaway	2025-10-12	2025-10-15	France	["city-break"]	["Romance", "Shopping", "Culture"]	$1,200	A romantic weekend in Paris. Visit the Eiffel Tower, Louvre Museum, and enjoy French cuisine.	/public/assets/eiffel-tower.jpg	2025-09-07 14:45:57.167232	2025-09-07 14:45:57.167232
717ecc23-7c5c-4da2-be2d-27555097bf71	6	Mountain Adventure in Alps	2025-11-20	2025-11-30	Switzerland	["mountain"]	["Adventure", "Nature", "Hiking"]	$3,500	Experience the breathtaking Swiss Alps with guided mountain tours, hiking trails, and cozy mountain huts.	/public/assets/mountains.jpg	2025-09-07 14:45:57.167232	2025-09-07 14:45:57.167232
49088969-040b-485f-992d-3cc5bb0a9379	6	Exotic Thailand Experience	2025-12-10	2025-12-22	Thailand	["exotic"]	["Beaches", "Culture", "Food"]	$2,200	Tropical paradise adventure in Thailand. Beautiful beaches, temples, street food, and friendly locals.	/public/assets/oriental.jpg	2025-09-07 14:45:57.167232	2025-09-07 14:45:57.167232
405b2753-47f0-4176-b16c-63d0e93e1eaf	6	Family Trip to Austrian Mountains	2025-08-05	2025-08-15	Austria	["family"]	["Family Fun", "Nature", "Relaxation"]	$2,000	Perfect family vacation in Austrian mountains with activities for all ages. Beautiful landscapes and fresh air.	/public/assets/mountains-2.jpg	2025-09-07 14:45:57.167232	2025-09-07 14:45:57.167232
f50881eb-e81d-4e8b-be0c-b3dba458e8ed	6	Alpine Adventure - Last Minute Deal	2025-07-28	2025-08-03	Germany	["last-minute"]	["Deal", "Adventure", "Mountains"]	$1,800	Last minute deal for mountain lovers! Explore Bavarian Alps with special discounted price.	/public/assets/mountains-3.jpg	2025-09-07 14:45:57.167232	2025-09-07 14:45:57.167232
\.


--
-- TOC entry 3479 (class 0 OID 16423)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.users (id, name, surname, email, password, role, created_at, updated_at) FROM stdin;
1	Admin	Admin	admin@admin.com	$2y$10$E8TE2gd.MmaAe6756xeQBesg2ijmq9HP6I3UVcwmzg6FnK6owqche	ADMIN	2025-08-31 07:27:15.904475	2025-08-31 07:27:15.904475
2	name	Surname	user@user.com	$2y$10$IpDvcSj87ZCBYaOHFRydVuAVnzDMCYGHFJuKUOlQIhDdst7tGTifO	ADMIN	2025-08-31 07:30:55.443416	2025-08-31 07:30:55.443416
4	gfshs	fgnfg	email@email.com	$2y$10$wSlLOpTcnz6gdRavMbMUVeUHRplzvXJxhMR4wmScDaOAXa1XLeCwu	USER	2025-08-31 15:31:12.538815	2025-08-31 15:31:12.538815
5	Nameee	Surnameee	email2@email2.com	$2y$10$QSGlKLhsgqlVsNFWYQeJE.DeK.vJBfcxSUKf0TIChAc/qlEGnBjki	USER	2025-08-31 15:48:44.558331	2025-08-31 15:48:44.558331
6	Tom	Tee	tomtee557@gmail.com	$2y$10$PHNLhXWV9zM6nPWjQSkFo.cJ40vA1SR6AtF2rcUYDoRafo0gn6cYK	ADMIN	2025-09-04 16:29:08.46192	2025-09-04 16:29:08.46192
\.


--
-- TOC entry 3488 (class 0 OID 0)
-- Dependencies: 218
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: docker
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


-- Completed on 2025-09-07 15:03:49 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict qfmvyP6MKjNntLa64UfgWcq1dWnhHOmKKbzwPJP8gRpWp6kqoJqR6zGkerU4VQG

