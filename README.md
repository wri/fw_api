# Forest Watcher microservice

## Dependencies

The Forest Watcher API microservice is built using [Node.js](https://nodejs.org/en/), and can be executed using Docker.

Execution using Docker requires:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

Dependencies on other Microservices:
- [GFW Areas](https://github.com/gfw-api/gfw-area)
- [Geostore](https://github.com/gfw-api/gfw-geostore-api)
- [GFW Forms](https://github.com/wri/fw_forms)

## Getting started

Start by cloning the repository from github to your execution environment

```
git clone https://github.com/wri/fw_api.git && cd forest-watcher
```

After that, follow one of the instructions below:

### Using Docker

1 - Execute the following command to run Docker:

```shell
make up-and-build   # First time building Docker or you've made changes to the Dockerfile
make up             # When Docker has already been built and you're starting from where you left off
make logs           # To view the logs for the app
```

The endpoints provided by this microservice should now be available: 
[localhost:4400](http://localhost:4400)\
OpenAPI docs will also be available at [localhost:44000](http://localhost:44000)

2 - Run the following command to lint the project:

```shell
make lint
```

3 - To close Docker:

```shell
make down
```

### Testing

Follow the instruction above for setting up the runtime environment for Docker execution, then run the following to view the test logs:
```shell
make up
make tests
```

## Docs

The endpoints are documented using the OpenAPI spec and saved under `./docs`.\
A visualisation of these docs will be available to view in a web browser 
when developing, please see above.

## Configuration

### Environment variables

- PORT => TCP port in which the service will run
- API_VERSION => API version identifier that prefixes the URL. Should be `v1`

You can optionally set other variables, see [this file](config/custom-environment-variables.json) for an extended list.
