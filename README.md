# etools-partner-reporting-portal

## Setup
1. Install Docker for your OS
2. Create .env file in `django_api` with the reference of `.env.example` or receive .env file from your team member.
3. Run `docker-compose up` !
4. Go to http://127.0.0.1:8080/ to see the frontend / polymer running. The Django app is running under http://127.0.0.1:8080/api/

## Development
If You want enter inside backend, You should run command:
   1. display all containers and read "CONTAINER ID" for your backend:
   ```
   $ docker ps
   ```
   2. enter inside backend (with TTY communications)
   ```
   $ docker exec -t -i "CONTAINER ID" bash
   ```
