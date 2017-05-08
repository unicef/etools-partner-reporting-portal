FROM mhart/alpine-node:7.8.0

RUN apk update
RUN apk add git

RUN npm install -g bower polymer-cli gulp-cli

ADD bower.json /tmp/
ADD package.json /tmp/

ADD . /code/

WORKDIR /tmp

RUN npm install
RUN bower --allow-root install

RUN rm -rf /code/node_modules
RUN rm -rf /code/bower_components
RUN cp -a /tmp/node_modules /code/node_modules
RUN cp -a /tmp/bower_components /code/bower_components

WORKDIR /code
VOLUME /code

EXPOSE 8080
CMD ["gulp", "node", "express.js"]
