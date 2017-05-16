# etools-partner-reporting-portal

## Container build status
* Polymer: [![Codefresh Polymer build status]( https://g.codefresh.io/api/badges/build?repoOwner=unicef&repoName=etools-partner-reporting-portal&branch=develop&pipelineName=polymer&accountName=UNICEF&type=cf-2)]( https://g.codefresh.io/repositories/unicef/etools-partner-reporting-portal/builds?filter=trigger:build;branch:develop;service:58d57dc1d28e8f0100907a76~polymer)

* PostGIS: [![Codefresh PostGIS build status]( https://g.codefresh.io/api/badges/build?repoOwner=unicef&repoName=etools-partner-reporting-portal&branch=develop&pipelineName=db&accountName=UNICEF&type=cf-2)]( https://g.codefresh.io/repositories/unicef/etools-partner-reporting-portal/builds?filter=trigger:build;branch:develop;service:58d57dc1d28e8f0100907a76~db)

* Django API: [![Codefresh Django build status]( https://g.codefresh.io/api/badges/build?repoOwner=unicef&repoName=etools-partner-reporting-portal&branch=develop&pipelineName=django_api&accountName=UNICEF&type=cf-2)]( https://g.codefresh.io/repositories/unicef/etools-partner-reporting-portal/builds?filter=trigger:build;branch:develop;service:58d57dc1d28e8f0100907a76~django_api)

* Nginx proxy: [![Codefresh Nginx build status]( https://g.codefresh.io/api/badges/build?repoOwner=unicef&repoName=etools-partner-reporting-portal&branch=develop&pipelineName=proxy&accountName=UNICEF&type=cf-2)]( https://g.codefresh.io/repositories/unicef/etools-partner-reporting-portal/builds?filter=trigger:build;branch:develop;service:58d57dc1d28e8f0100907a76~proxy)

## Setup
1. Install Docker for your OS
2. Create .env file in `django_api` with the reference of `.env.example` or receive .env file from your team member.
3. Run `fab up` !
4. Go to http://127.0.0.1:8080/ to see the frontend / polymer running. The Django app is running under http://127.0.0.1:8080/api/
5. Run `fab fixtures` - load fake data like account, core, partner and other modules!

## Development
Here are some docker tips:
   1. display all containers:
   ```
   $ docker-compose ps
   ```
   2. ssh into running django_api container
   ```
   $ fab ssh:django_api
   ```
   3. Stop all containers
   ```
   $ fab stop
   ```
   4. Re-build docker images for containers
   ```
   $ fab rebuild
   ```
