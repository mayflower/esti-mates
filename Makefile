.PHONY: install dev build test lint format k8s-dev clean

install:
	npm install

dev:
	docker-compose up

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

k8s-dev:
	tilt up

clean:
	rm -rf node_modules frontend/node_modules backend/node_modules
	rm -rf frontend/dist backend/dist
	docker-compose down -v
