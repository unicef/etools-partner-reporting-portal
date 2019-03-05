from __future__ import unicode_literals
from fabric.api import local


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
    local('docker-compose stop && docker-compose up')


def up(rebuild=False):
    """
    Create and start containers.
    """
    if rebuild:
        command = 'docker-compose up --force-recreate --build'
    else:
        command = 'docker-compose up'

    local(command)


def up_with_bundle(rebuild=True):
    """
    Create and start containers with polymer bundle served.
    """
    local('docker-compose -f docker-compose.polymer-bundle.yml up %s' % '' if rebuild else '--build')


def restart(service):
    """
    restart a service container
    :param service: ['django_api', 'polymer', 'proxy', 'db']
    """
    assert service in ['django_api', 'polymer', 'proxy', 'db', 'beater-prp', 'worker-prp'], "%s is unrecognized service"
    local('docker-compose restart %s' % service)


def down():
    """
    Destroy all containers with volumes.
    """
    local('docker-compose down')


def rebuild(service):
    """
    Re-build docker images for containers.
    """
    if service:
        assert service in ['django_api', 'polymer', 'proxy', 'db'], "%s is unrecognized service"

    local('docker-compose build %s' % service if service else '')


def ps():
    """
    Display all containers.
    """
    local('docker-compose ps')


def kill():
    """
    Kill all containers.
    """
    local('docker-compose kill')


def stop(service):
    """
    Stop service(s).
    """
    if service == 'all':
        local('docker-compose stop')

    elif service:
        assert service in ['django_api', 'polymer', 'proxy', 'db'], "%s is unrecognized service"
        local('docker-compose stop %s' % service)


def fixtures():
    """
    Load fixture data for Site and ReportingEntities.
    """
    local('docker-compose exec django_api python manage.py loaddata sites')
    local('docker-compose exec django_api python manage.py loaddata reporting_entities')
    local('docker-compose exec django_api python manage.py loaddata periodic_tasks')


def fake_data(quantity=1):
    """
    Load example data from generate_fake_data management command.
    """
    local('docker-compose exec django_api python manage.py generate_fake_data --quantity %d --clean_before' % (int(quantity)))


def real_data(area=False):
    """
    Destroy current DB data and uses real sync with PMP API to get all data.
    """
    local('docker-compose exec django_api python manage.py generate_real_data --clean_before %s' % ("--area %s --fast" % area if area else ""))


def generate_reports():
    """
    Generate reports based on current data
    """
    local('docker-compose exec django_api python manage.py generate_reports')


def sync_ocha_partners(area=False):
    """
    Generate reports based on current data
    """
    local('docker-compose exec django_api python manage.py sync_ocha_partners %s' % ("--country %s" % area if area else ""))


def tests(test_path=''):
    """
    Run django_api tests.
    """
    local('docker-compose exec django_api python manage.py test {} --settings=django_api.settings.test --parallel --noinput'.format(test_path))


def update_real_fixtures(area=False):
    """
    Uses real sync with PMP API to update data.
    """
    local('docker-compose exec django_api python manage.py generate_real_data %s --update' % ("--area %s --fast" % area if area else ""))


def backend_lint():
    """
    Run python code linter
    """
    local('docker-compose exec django_api flake8 ./ --count')


def preview_uwsgi_log():
    cmd = 'docker-compose exec django_api tail -f /var/log/uwsgi_global.log'
    local(cmd)
