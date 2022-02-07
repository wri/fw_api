# Forest Watcher microservice

## Dependencies

The Forest Watcher API microservice is built using [Node.js](https://nodejs.org/en/), and can be executed using Docker.

Execution using Docker requires:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

Dependencies on other Microservices:
- [GFW Areas](https://github.com/gfw-api/gfw-area)
- [Geostore](https://github.com/gfw-api/gfw-geostore-api)
- [GFW Forms](https://github.com/gfw-api/gfw-forms-api)

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
```

The endpoints provided by this microservice should now be available: [localhost:3035](http://localhost:3035)

2 - Run the following command to lint the project:

```shell
make lint
```

3 - To close Docker:

```shell
make down
```

## Testing

### Using Docker

Follow the instruction above for setting up the runtime environment for Docker execution, then run:
```shell
make test-and-build
```

## Configuration

### Environment variables

- PORT => TCP port in which the service will run
- NODE_PATH => relative path to the source code. Should be `app/src`
- API_VERSION => API version identifier that prefixes the URL. Should be `v1`

You can optionally set other variables, see [this file](config/custom-environment-variables.json) for an extended list.
