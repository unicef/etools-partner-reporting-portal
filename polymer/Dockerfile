FROM mhart/alpine-node:7.7.4

RUN apk update
RUN apk add git

RUN npm install -g bower polymer-cli gulp-cli

ADD bower.json /tmp/
ADD package.json /tmp/

WORKDIR /tmp

RUN npm install
RUN bower --allow-root install

RUN mkdir /code/
ADD . /code/
VOLUME /code
WORKDIR /code

RUN cp -a /tmp/node_modules /code/node_modules
RUN cp -a /tmp/bower_components /code/bower_components

EXPOSE 8080
CMD ["gulp", "node", "express.js"]
