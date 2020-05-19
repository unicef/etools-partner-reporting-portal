ARG BASE_TAG=installed
FROM unicef/etools-prp:$BASE_TAG

ARG env
ENV ENV ${env:-dev}

ARG requirement_file
ENV REQUIREMENT_FILE ${requirement_file:-dev.txt}

ADD ./requirements/* /tmp/

WORKDIR /tmp
RUN pip install -r $REQUIREMENT_FILE --trusted-host pypi.python.org

ADD . /code/

ENV PYTHONUNBUFFERED 1
WORKDIR /code/

RUN curl -o /usr/local/bin/waitforit -sSL https://github.com/maxcnunes/waitforit/releases/download/v2.2.0/waitforit-linux_amd64
RUN chmod +x /usr/local/bin/waitforit

# CLEANUP
RUN apk del .build-deps

EXPOSE 8000
