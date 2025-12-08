ARG BASE_TAG=installed
FROM unicef/etools-prp:$BASE_TAG

ARG env
ENV ENV ${env:-dev}

ADD . /code/

WORKDIR /code/
RUN apk add bash

# Patch drfpasswordless for Django 4.x compatibility
RUN python patch_drfpasswordless.py

ENV PYTHONUNBUFFERED 1

RUN python manage.py collectstatic --noinput

RUN curl -o /usr/local/bin/waitforit -sSL https://github.com/maxcnunes/waitforit/releases/download/v2.2.0/waitforit-linux_amd64
RUN chmod +x /usr/local/bin/waitforit

EXPOSE 8000
