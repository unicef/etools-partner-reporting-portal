FROM nginx

RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    # fix certificates for easy_install "certificate verify failed"
    apt-get install --assume-yes --reinstall ca-certificates && \
    apt-get install --assume-yes python-pip python-dev python-setuptools build-essential
RUN pip install j2cli --trusted-host pypi.python.org

ADD nginx.conf.j2 /
ADD nginx-site.conf.j2 /
ADD uwsgi_params /etc/nginx/conf.d/uwsgi_params
ADD docker-entrypoint.sh /

RUN chmod a+rx /docker-entrypoint.sh
ENTRYPOINT ["/bin/bash", "/docker-entrypoint.sh"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
