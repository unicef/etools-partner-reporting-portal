from __future__ import unicode_literals
from fabric.api import local, env, settings


def ssh(service):
    """
    ssh into running service container
    :param service: ['django_api', 'polymer', 'proxy', 'db']
    """
    assert service in ['django_api', 'polymer', 'proxy', 'db'], "%s is unrecognized service"
    try:
        local('docker exec -it etoolspartnerreportingportal_%s_1 bash' % service)
    except:
        print "Try to ssh service as /bin/sh instead of bash"
        local('docker exec -it etoolspartnerreportingportal_%s_1 /bin/sh' % service)


def up_recreate():
    """
    Recreate containers even if their configuration and image haven't changed.
    """
    local('docker-compose -f docker-compose.yml up --force-recreate')


def up():
    """
    Create and start containers.
    """
    local('docker-compose -f docker-compose.yml up')


def down():
    """
    Stop all containers.
    """
    local('docker-compose -f docker-compose.yml down')


def rebuild():
    """
    Re-build docker images for containers.
    """
    local('docker-compose -f docker-compose.yml build')


def ps():
    """
    Display all containers.
    """
    local('docker-compose -f docker-compose.yml ps')
