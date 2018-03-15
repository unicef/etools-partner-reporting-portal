# CartoDB location sync

## Purpose

PRP relies on real geo data for many data models and business logic in place. UNICEF has been utilizing CartoDB service as a single source of truth when it come to Location and geographic polygon data. Similarly done in PMP, PRP also has an identical copy of **CartoDB** sync Celery task with Django admin interface on Location table.

## Requirements

CartoDB sync process is a Celery task, therefore it requires a Celery worker running in the background.

### Local environment setup steps

Docker-compose environment spins up Celery workers for you. Make sure your docker-compose is up: `fab up` If your docker-compose is running, that means Celery worker should be also active.

### Docker cloud environment steps

Make sure Docker cloud has stackfile definitions for celery containers from local docker-compose.yml: `beater-prp, celerycam-prp, worker-prp, flower-prp, prp-redis`

```text
beater-prp:
  command: python manage.py celery beat --loglevel=debug
  deployment_strategy: high_availability
  environment:
    - CELERY_VISIBILITY_TIMEOUT=18000
    - DJANGO_ALLOWED_HOST=
    - DJANGO_DEBUG=true
    - DOMAIN_NAME=
    - EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
    - EMAIL_HOST_PASSWORD=
    - EMAIL_HOST_USER=apikey
    - ENV=dev
    - EXCLUDE_BASIC_AUTH=1
    - PMP_API_PASSWORD=
    - PMP_API_USER=
    - POSTGRES_DB=postgres
    - POSTGRES_HOST=prp-db
    - POSTGRES_PASSWORD=
    - POSTGRES_USER=postgres
    - 'REDIS_URL=redis://prp-redis:6379/'
    - SECRET_KEY=
  image: 'unicef/etools-prp:develop'
  restart: always
  tags:
    - prp
    - staging
    - unicef
  target_num_containers: 1
celerycam-prp:
  autoredeploy: true
  command: python manage.py celerycam
  deployment_strategy: high_availability
  environment:
    - CELERY_VISIBILITY_TIMEOUT=18000
    - DJANGO_ALLOWED_HOST=
    - DJANGO_DEBUG=true
    - DOMAIN_NAME=
    - EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
    - EMAIL_HOST_PASSWORD=
    - EMAIL_HOST_USER=apikey
    - ENV=dev
    - EXCLUDE_BASIC_AUTH=1
    - PMP_API_PASSWORD=
    - PMP_API_USER=
    - POSTGRES_DB=postgres
    - POSTGRES_HOST=prp-db
    - POSTGRES_PASSWORD=
    - POSTGRES_USER=postgres
    - 'REDIS_URL=redis://prp-redis:6379/'
    - SECRET_KEY=ldsfskdljfsdf98483u4530495iofjweiosjfsdjfLKJSLDFJ09
  image: 'unicef/etools-prp:develop'
  restart: always
  tags:
    - prp
    - staging
    - unicef
  target_num_containers: 1
flower-prp:
  autoredeploy: true
  command: 'flower --address=0.0.0.0 --port=8080 --broker=redis://prp-redis:6379/0 -l DEBUG --auto_refresh=False --debug=True --autoreload=False --url_prefix=flower'
  environment:
    - CELERY_VISIBILITY_TIMEOUT=18000
    - DJANGO_ALLOWED_HOST=
    - DJANGO_DEBUG=true
    - DOMAIN_NAME=
    - EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
    - EMAIL_HOST_PASSWORD=
    - EMAIL_HOST_USER=apikey
    - ENV=dev
    - EXCLUDE_BASIC_AUTH=1
    - "EXTRA_SETTINGS=reqrep ^([^\\ :]*)\\ /flower/(.*)     \\1\\ /\\2"
    - PMP_API_PASSWORD=
    - PMP_API_USER=
    - POSTGRES_DB=postgres
    - POSTGRES_HOST=prp-db
    - POSTGRES_PASSWORD=
    - POSTGRES_USER=postgres
    - 'REDIS_URL=redis://prp-redis:6379/0'
    - SECRET_KEY=
    - VIRTUAL_HOST_WEIGHT=1
  expose:
    - '8080'
  image: 'unicef/etools-prp:develop'
  restart: always
  tags:
    - prp
    - staging
    - unicef
  target_num_containers: 1
prp-redis:
  autoredeploy: true
  image: 'tivix/etools-prp-redis:develop'
  restart: on-failure
  tags:
    - prp
    - staging
    - unicef
  target_num_containers: 1
worker-prp:
  autoredeploy: true
  command: python manage.py celery worker -E --loglevel=info
  deployment_strategy: every_node
  environment:
    - CELERY_VISIBILITY_TIMEOUT=18000
    - C_FORCE_ROOT=1
    - DJANGO_ALLOWED_HOST=
    - DJANGO_DEBUG=true
    - DOMAIN_NAME=
    - EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
    - EMAIL_HOST_PASSWORD=
    - EMAIL_HOST_USER=apikey
    - ENV=dev
    - EXCLUDE_BASIC_AUTH=1
    - PMP_API_PASSWORD=
    - PMP_API_USER=
    - POSTGRES_DB=postgres
    - POSTGRES_HOST=prp-db
    - POSTGRES_PASSWORD=
    - POSTGRES_USER=postgres
    - 'REDIS_URL=redis://prp-redis:6379/0'
    - SECRET_KEY=
  image: 'unicef/etools-prp:develop'
  restart: always
  tags:
    - prp
    - staging
    - unicef
```

### How to sync locations

* Open up a browser and go \`http://localhost:8080/api/admin/core/cartodbtable/\` and log in.
* In order to get real data, you'll need to go to etools.carto.com for getting dataset names. Here are the sample working dataset names:
  * Pakistan
    * pak\_adm0\_gaul\_1
    * pak\_adm1\_pco\_20110324\_1
    * pak\_adm2\_pco\_20150528\_1
    * pak\_adm3\_pco\_20150528\_1
    * pak\_adm4\_2010floodaffected\_pco\_20150826\_1\_1
  * Mali
    * mli\_admbnda\_adm0\_gov\_1
    * mli\_admbnda\_adm1\_gov\_ocha\_itos\_1
    * mli\_admbnda\_adm2\_gov\_ocha\_itos\_1
    * mli\_admbnda\_adm3\_gov\_ocha\_1
    * mli\_admbnda\_adm4\_iom\_gov\_1
* Click "ADD CARTO DB TABLE" button in Django admin and fill the following information:
  * Domain: https://etools.carto.com
  * API KEY: \*\*\*\*\*
  * Table name: \(Use above dataset name\) 
  * Location type: \(Create a new one with right admin level\)
  * Parent: \(Choose the parent carto db table object if admin level is not 0\)
* Repeat Step 4 for each country until every single admin level carto db table is created.
* After creating a carto db table, select 1 carto db table at a time \(with admin level descending\) and do "Import sites" Django admin action.
* After that, the new locations should be created if import is successful.



