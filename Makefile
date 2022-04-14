.PHONY:

up-and-build:
	docker-compose -f docker-compose-develop.yml up -d --build

up:
	docker-compose -f docker-compose-develop.yml up -d

down:
	docker-compose -f docker-compose-develop.yml down

lint:
	docker-compose -f docker-compose-develop.yml run develop yarn run lint

logs:
	docker logs -f forest-watcher-develop

tests:
	docker logs -f forest-watcher-tests