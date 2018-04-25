FROM nginx:1.13.12

ENV DEBIAN_FRONTEND noninteractive
ENV NGINX_LISTEN_PORT 80
ENV SSL_CERTIFICATE ''
RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install --assume-yes python-pip python-dev python-setuptools build-essential
RUN pip install j2cli
RUN pip install cryptography==2.1.4
RUN pip install requests --upgrade
RUN pip install certbot==0.23.0

ADD nginx.conf.j2 /
ADD nginx-site.conf.j2 /
ADD uwsgi_params /etc/nginx/conf.d/uwsgi_params
ADD docker-entrypoint.sh /
ADD setup_ssl.py /

RUN mkdir -p /etc/letsencrypt
VOLUME /etc/letsencrypt

RUN chmod a+rx /docker-entrypoint.sh
ENTRYPOINT ["/bin/bash", "/docker-entrypoint.sh"]

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
