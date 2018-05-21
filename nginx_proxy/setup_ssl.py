import os
import subprocess
from crontab import CronTab

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

    default_args = [
        '--cert-path', WORKDIR,
        '--config-dir', WORKDIR,
        '--work-dir', WORKDIR,
    ]

    if not os.path.isfile(CERTIFICATE_FILE):
        get_cert_args = [
            'certbot',
            'certonly',
            '--webroot',
            '--non-interactive',
            '--agree-tos',
            '--email', ADMIN_MAIL,
            '--domain', DOMAIN_NAME,
            '--webroot-path', '/usr/share/nginx/html',
        ] + default_args

        certificate_call_status = subprocess.call(get_cert_args)

        if certificate_call_status == 0:
            raise Exception('Could not setup certificate')

    with open(NGINX_SSL_CFG_FILE, "w") as nginx_ssl_config:
        ssl_config_render_call_status = subprocess.call([
            'j2',
            '/nginx-site.conf.j2'
        ], env=dict(
            os.environ,
            SSL_CERTIFICATE=CERTIFICATES_PATH
        ), stdout=nginx_ssl_config)

    if not ssl_config_render_call_status == 0:
        with open(NGINX_SSL_CFG_FILE, "w") as nginx_ssl_config:
            ssl_config_render_call_status = subprocess.call([
                'j2',
                '/nginx-site.conf.j2'
            ], stdout=nginx_ssl_config)

    cron = CronTab(user=True)
    renew_job = cron.new(command=' '.join(
        ['certbot', 'renew'] + default_args
    ))
    renew_job.hour.on(0)
    cron.write()
