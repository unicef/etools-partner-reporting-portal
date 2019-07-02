FROM node:8.11.3-jessie

RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://security.debian.org jessie/updates main\ndeb-src http://security.debian.org jessie/updates main" > /etc/apt/sources.list
RUN apt-get update

ADD package.json /tmp/

ADD . /code/

WORKDIR /tmp

RUN npm install
RUN rm -rf /code/node_modules
RUN cp -a /tmp/node_modules /code/node_modules

WORKDIR /code

EXPOSE 3000
CMD ["npm start"]