help:
	@echo '                                              '
	@echo 'Usage:                                        '
	@echo '   make test                       run tests  '


test:
	SECRET_KEY=123 \
	ENV=dev \
	POSTGRES_DB=unicef-prp \
	POSTGRES_USER=postgres \
	POSTGRES_PASSWORD= \
	POSTGRES_HOST=localhost \
	DATA_VOLUME=/tmp \
	python manage.py test --keepdb --failfast
