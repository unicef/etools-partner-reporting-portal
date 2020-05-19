ENV_VARS=SECRET_KEY=123 \
	ENV=dev \
	POSTGRES_DB=unicef_prp \
	POSTGRES_USER=postgres \
	POSTGRES_PASSWORD= \
	POSTGRES_HOST=localhost \
	DATA_VOLUME=/tmp \
	REDIS_URL=redis://localhost:6379/0


help:
	@echo ' '
	@echo 'Usage: '
	@echo '   make test                       run tests '
	@echo '   make migrate                    run local migrations '
	@echo '   make loaddata                   load fixtures '
	@echo '   make run                        run local instance '
	@echo '   make export                     export ENV Vars '


test:
	${ENV_VARS} python manage.py test --keepdb --failfast

migrate:
	${ENV_VARS} python manage.py migrate

loaddata:
	${ENV_VARS} python manage.py loaddata sites
	${ENV_VARS} python manage.py loaddata reporting_entities

run:
	${ENV_VARS} python manage.py runserver

export:
	export ${ENV_VARS}

lint:
	flake8 .; exit 0;
	isort django_api/ --check-only -rc; exit 0;
