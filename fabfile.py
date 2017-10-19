from __future__ import unicode_literals
from fabric.api import local, env, settings
from fabric.operations import run


def ssh(service):
    """
    ssh into running service container
    :param service: ['django_api', 'polymer', 'proxy', 'db']
    """
    assert service in ['django_api', 'polymer', 'proxy', 'db'], "%s is unrecognized service"
    if service == 'polymer':
        local('docker-compose exec polymer ash')
    else:
        local('docker-compose exec %s bash' % service)


def up_recreate():
    """
    Recreate containers even if their configuration and image haven't changed.
    """
    local('docker-compose down && docker-compose up')


def up():
    """
    Create and start containers.
    """
    local('docker-compose up')


def down():
    """
    Stop all containers.
    """
    local('docker-compose down')


def rebuild():
    """
    Re-build docker images for containers.
    """
    local('docker-compose build')


def ps():
    """
    Display all containers.
    """
    local('docker-compose ps')


def stop():
    """
    Stop services.
    """
    local('docker-compose stop')


def fixtures(quantity=40):
    """
    Load example data from generate_fake_data management command.
    """
    local('docker-compose exec django_api python manage.py generate_fake_data --quantity %d --clean_before' % (int(quantity)))

    print("Fake data generated!")

def real_fixtures():
    """
    Uses real sync with PMP API to get all data.
    """
    local('docker-compose exec django_api python manage.py generate_real_data --clean_before --fast')

def remove_untagged_images():
    """
    Delete all untagged (<none>) images
    """
    local('docker rmi $(docker images | grep "^<none>" | awk "{print $3}")')
