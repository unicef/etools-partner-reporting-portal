ARG BASE_TAG=installed
FROM unicef/etools-prp:$BASE_TAG

ARG env
ENV ENV ${env:-dev}
ENV DOCKER_CERT_PATH /root/code/django_api/etools_prp/keys/jwt/

ADD . /code/

WORKDIR /code/
RUN apk add bash

ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH /code

RUN python manage.py collectstatic --noinput

RUN curl -o /usr/local/bin/waitforit -sSL https://github.com/maxcnunes/waitforit/releases/download/v2.2.0/waitforit-linux_amd64
RUN chmod +x /usr/local/bin/waitforit

# CLEANUP
# Disabled for now, till move to etools-base
# See https://github.com/unicef/etools/pull/2716
# RUN apk del .build-deps

EXPOSE 8000
