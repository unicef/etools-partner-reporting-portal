import os
import subprocess

DOMAIN_NAME = os.getenv('DOMAIN_NAME')
ADMIN_MAIL = os.getenv('ADMIN_MAIL')
WORKDIR = '/etc/letsencrypt'


if __name__ == '__main__':
    if not DOMAIN_NAME and not ADMIN_MAIL:
        raise Exception('Cannot proceed without DOMAIN_NAME and ADMIN_MAIL')

    default_args = [
        '--cert-path', WORKDIR,
        '--config-dir', WORKDIR,
        '--work-dir', WORKDIR,
        '--dry-run'
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
        print('SUCCESS')
