import os
import subprocess

DOMAIN_NAME = os.getenv('DOMAIN_NAME')
ADMIN_MAIL = os.getenv('ADMIN_MAIL')
WORKDIR = '/etc/letsencrypt'

CERTIFICATES_PATH = os.path.join(
    WORKDIR,
    'live',
    DOMAIN_NAME
)

CERTIFICATE_FILE = os.path.join(
    CERTIFICATES_PATH, 'fullchain.pem'
)

NGINX_SSL_CFG_FILE = "/etc/nginx/conf.d/default.conf"

if __name__ == '__main__':
    if not DOMAIN_NAME and not ADMIN_MAIL:
        raise Exception('Cannot proceed without DOMAIN_NAME and ADMIN_MAIL')

    if not os.path.isfile(CERTIFICATE_FILE):
        default_args = [
            '--cert-path', WORKDIR,
            '--config-dir', WORKDIR,
            '--work-dir', WORKDIR,
        ]

        full_args = [
            'certbot',
            'certonly',
            '--webroot',
            '--non-interactive',
            '--agree-tos',
            '--email', ADMIN_MAIL,
            '--domain', DOMAIN_NAME,
            '--webroot-path', '/usr/share/nginx/html',
        ] + default_args

        certificate_call_status = subprocess.call(full_args)

        if certificate_call_status == 0:
            raise Exception('Could not setup certificate')

    with open(NGINX_SSL_CFG_FILE, "w") as nginx_ssl_config:
        ssl_config_render_call_status = subprocess.call([
            'j2',
            '/nginx-site.conf.j2'
        ], env=dict(
            os.environ,
            NGINX_LISTEN_PORT=str(443),
            SSL_CERTIFICATE=CERTIFICATES_PATH
        ), stdout=nginx_ssl_config)

    if not ssl_config_render_call_status == 0:
        os.remove(NGINX_SSL_CFG_FILE)
        raise Exception('Error rendering Nginx SSL config from template')
