FROM python:2.7.11-wheezy

ARG env
ENV ENV ${env:-dev}
ARG requirements_file
ENV REQUIREMENTS_FILE ${requirements_file:-dev.txt}

LABEL maintainer Sumit Chachra <sumit@tivix.com>

# Install dependencies
RUN apt-get update
RUN apt-get install -y --no-install-recommends \
    build-essential \
    libcurl4-openssl-dev \
    libjpeg-dev \
    vim \
    ntp \
    libpq-dev
RUN apt-get install -y --no-install-recommends \
    git-core \
    subversion \
    mercurial
RUN apt-get install -y --no-install-recommends \
    python-dev \
    python-software-properties \
    python-setuptools \
    uwsgi \
    uwsgi-plugin-python
RUN apt-get install -y --no-install-recommends \
    postgresql-client \
    libpq-dev \
    python-psycopg2

RUN pip install \
    distribute \
    virtualenv \
    virtualenvwrapper \
    fabric

ENV WAITFORIT_VERSION="v1.3.1"

RUN curl -o /usr/local/bin/waitforit -sSL https://github.com/maxcnunes/waitforit/releases/download/$WAITFORIT_VERSION/waitforit-linux_amd64 && \
    chmod +x /usr/local/bin/waitforit

RUN pip install --upgrade pip
RUN pip install --upgrade wheel

ADD ./requirements/* /tmp/
ADD . /code/
WORKDIR /tmp
RUN pip install -r $REQUIREMENTS_FILE

RUN mkdir -p /data/tivixdotcom/logs
RUN touch /data/tivixdotcom/logs/django.log
VOLUME /data
RUN chmod -R a+rw /data
