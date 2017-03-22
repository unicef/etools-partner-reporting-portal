#!/usr/bin/env bash

coverage run manage.py test apps --keepdb --settings=settings.test
