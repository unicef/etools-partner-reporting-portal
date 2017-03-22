FROM mhart/alpine-node:7

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
WORKDIR /code

RUN cp -a /tmp/node_modules /code/node_modules
RUN cp -a /tmp/bower_components /code/bower_components

RUN gulp
EXPOSE 8080
CMD ["node", "express.js"]
