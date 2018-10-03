************************************
*                                  *
*              NODEJS              *
*                                  *
************************************

REBUILD:
	- app.js est modifié
	- package.json est modifié

Pas besoin pour /public/*

Unit tests:
	- npm test

Ajouter un describe dans test/unitTests.js


************************************
*                                  *
*          DOCKER-COMPOSE          *
*                                  *
************************************

REBUILD:
	docker-compose build


START:
	docker-compose up -d


STOP:
	docker-compose stop


REMOVE CONTAINERS:
	docker-compose down --volumes
