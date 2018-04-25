FROM nginx:1.13.12

ENV DEBIAN_FRONTEND noninteractive
ENV SSL_CERTIFICATE ''
RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install --assume-yes python-pip python-dev python-setuptools build-essential cron
RUN pip install j2cli
RUN pip install cryptography==2.1.4
RUN pip install requests --upgrade
RUN pip install certbot==0.23.0
RUN pip install python-crontab==2.2.8

ADD nginx.conf.j2 /
ADD nginx-site.conf.j2 /
ADD uwsgi_params /etc/nginx/conf.d/uwsgi_params
ADD docker-entrypoint.sh /
ADD setup_ssl.py /
ADD command.sh /

RUN mkdir -p /etc/letsencrypt
VOLUME /etc/letsencrypt

RUN chmod a+rx /docker-entrypoint.sh
RUN chmod a+rx /command.sh
ENTRYPOINT ["/bin/bash", "/docker-entrypoint.sh"]

EXPOSE 80
EXPOSE 443

CMD ["/command.sh"]
