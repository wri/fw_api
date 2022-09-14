FROM node:12-alpine
MAINTAINER info@vizzuality.com

ENV NAME forest-watcher
RUN apk update && apk upgrade && \
    apk add --no-cache --update bash git openssh alpine-sdk

RUN yarn global add grunt-cli bunyan

RUN mkdir -p /opt/$NAME
COPY package.json /opt/$NAME/package.json
COPY yarn.lock /opt/$NAME/yarn.lock
RUN cd /opt/$NAME && yarn

COPY config /opt/$NAME/config

WORKDIR /opt/$NAME

COPY ./app /opt/$NAME/app
COPY ./.babelrc /opt/$NAME/.babelrc
COPY .eslintrc /opt/$NAME/.eslintrc
COPY ./tsconfig.json /opt/$NAME/tsconfig.json
RUN yarn build
# Tell Docker we are going to use this ports
EXPOSE 4400

CMD ["node", "dist/app.js"]
