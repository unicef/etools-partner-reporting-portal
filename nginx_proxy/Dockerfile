FROM nginx

RUN apt-get update
# fix certificates for easy_install "certificate verify failed"
RUN apt-get install --assume-yes --reinstall ca-certificates
RUN apt-get install --assume-yes python-dev python-setuptools
RUN easy_install j2cli

ADD nginx.conf.j2 /
ADD nginx-site.conf.j2 /
ADD uwsgi_params /etc/nginx/conf.d/uwsgi_params
ADD docker-entrypoint.sh /

RUN chmod a+rx /docker-entrypoint.sh
ENTRYPOINT ["/bin/bash", "/docker-entrypoint.sh"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
