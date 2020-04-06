# Development Setup

## Local Setup

1. Install [Docker](https://docs.docker.com/engine/installation/) for your OS. Also install Fabric via `pip install fabric`
2. Create .env file with the reference of`.env.example`or receive .env file from your team member.
3. Run`fab up`
4. Go to [http://127.0.0.1:8081/](http://127.0.0.1:8081/) to see the frontend / polymer running. The Django app is running under [http://127.0.0.1:8082/api/](http://127.0.0.1:8082/api/). ID management will be running at [http://127.0.0.1:8082/id-management/](http://127.0.0.1:8082/id-management/).
5. Run`fab fixtures`
   * It loads fake data like account, core, partner and other modules!
   * Once fixtures are loaded, the Celery Periodic Tasks will be shown at Django Admin -&gt; djcelery -&gt; Periodic Tasks. Once the tasks are enabled, they will be scheduled to run automatically.
     * If you'd like to get PMP data going **now**, run `fab ssh:django_api`  and run `./manage.py shell_plus` . Then import some celery task functions.
       * `from core.tasks import *`
       * `from partner.tasks import *`
       * `process_workspaces()`
       * `process_partners()`
       * We would import programme documents later on.
6. Go to Django Admin -&gt; Core -&gt; Carto db tables. Add new record for each CartoDB dataset to import. Start from admin level 0 to N and import site one by one per country. Please see [CartoDB location sync section](cartodb-location-sync.md) for more info.
   1. Once the locations are imported, now you can run Programme Document sync from PMP. Run `fab ssh:django_api`  and run `./manage.py shell_plus` . Then import some celery task functions.
      1. `from unicef.tasks import *`
      2. `process_programme_documents(True, <BUSINESS_AREA_CODE>)`
7. Run `fab ssh:django_api`  and run `./manage.py shell_plus` to create some superusers. Make sure you use `.set_password()` method to set the password and save the user.
   1. Make sure you create a User with username `default_unicef_user` for PMP integration.
8. After creating some users, go to Django Admin -&gt; Core -&gt; Prp roles. Create new Prp role per user to give ID management access on IP reporting and cluster reporting.
9. Go to [http://127.0.0.1:8081/api/admin/](http://127.0.0.1:8081/api/admin/) login with admin/Passw0rd! and can now go to

   [http://127.0.0.1:8081/app/](http://127.0.0.1:8081/app/) to see the frontend interface. Replace 'ip-reporting' or 'cluster-reporting' in the URL's or use UI switcher to switch between the two interfaces.

## K8s remote environment setup

1. Make sure all K8s deployment and services are running. Ingress controller should be set up to handle L7 routes to Django backend, Polymer, and React deployment.
2. Polymer and React deployment should be using bundle command and serve it with express http server.
3. Make sure Ingress controller is running HTTPS annotation.
4. Configure Frontend and backend deployments with environment variables for API credentials, connection info, and etc.
5. Make sure Ingress Controller to handle routing for `/`,  `/api`, and `/id-management` correctly. Especially for `/id-management`, Ingress controller needs to make sure that the routing for `id-management` is taken by `id-management` deployment.
6. Go to Django backend pod's SSH shell. Run to load fixtures.
   * `./manage.py loaddata sites`
   * `./manage.py loaddata reporting_entities`
   * `./manage.py loaddata periodic_tasks`
     * It loads fake data like account, core, partner and other modules!
   * Once fixtures are loaded, the Celery Periodic Tasks will be shown at Django Admin -&gt; djcelery -&gt; Periodic Tasks. Once the tasks are enabled, they will be scheduled to run automatically.
     * If you'd like to get PMP data going **now**, go to Django backend pod's SSH shell. Run `./manage.py shell_plus` . Then import some celery task functions.
       * `from core.tasks import *`
       * `from partner.tasks import *`
       * `process_workspaces()`
       * `process_partners()`
       * We would import programme documents later on.
7. Go to Django Admin -&gt; Core -&gt; Carto db tables. Add new record for each CartoDB dataset to import. Start from admin level 0 to N and import site one by one per country. Please see [CartoDB location sync section](cartodb-location-sync.md) for more info.
   1. Once the locations are imported, now you can run Programme Document sync from PMP. Go to Django backend pod's SSH shell. Run `./manage.py shell_plus` . Then import some celery task functions.
      1. `from unicef.tasks import *`
      2. `process_programme_documents(True, <BUSINESS_AREA_CODE>)`
8. Go to Django backend pod's SSH shell. Run `./manage.py shell_plus` to create some superusers. Make sure you use `.set_password()` method to set the password and save the user.
   1. Make sure you create a User with username `default_unicef_user` for PMP integration.
9. After creating some users, go to Django Admin -&gt; Core -&gt; Prp roles. Create new Prp role per user to give ID management access on IP reporting and cluster reporting.

## Helpful Commands

Here are some docker tips:

display all containers:

```text
$ docker-compose ps
```

ssh into running django\_api container

```text
$ fab ssh:django_api
```

Restart just one container

```text
$ fab restart:django_api
```

Stop all containers by kill signal

```text
$ fab kill
```

Re-build docker images for containers

```text
$ fab rebuild
```

