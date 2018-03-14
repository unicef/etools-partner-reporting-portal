---
description: Steps for a developer to setup their local development environment quickly
---

# Development Setup

## Local Setup

1. Install [Docker](https://docs.docker.com/engine/installation/) for your OS. Also install Fabric via `pip install fabric`
2. Create .env file with the reference of`.env.example `or receive .env file from your team member.
3. Run`fab up`
4. Go to [http://127.0.0.1:8080/](http://127.0.0.1:8080/) to see the frontend / polymer running. The Django app is running under

   [http://127.0.0.1:8080/api/](http://127.0.0.1:8080/api/)

5. Run`fab fixtures`
   * load fake data like account, core, partner and other modules!
6. TEMP: Go to [http://127.0.0.1:8080/api/admin/](http://127.0.0.1:8080/api/admin/) login with admin/Passw0rd! and can now go to

   [http://127.0.0.1:8080/app/](http://127.0.0.1:8080/app/) to see the frontend interface. Replace 'ip-reporting' or 'cluster-reporting' in the URL's to switch between the two interfaces.

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

Stop all containers

```text
$ fab stop
```

Re-build docker images for containers

```text
$ fab rebuild
```



