# Snotels are fun




## to run manually
* start backend server `python manage.py runserver`
* if first time, add snotel sites with `python manage.py runscript run_setup`
* update data to database `python manage.py runscript refresh_datahub --script-args 200` where 200 is number of hours to go back
* cd to `frontend` then start server with `yarn start`




## TODO
* get rid of suds and ulmo
* add weather forecasts to site pages
* add wind rose to site pages
* handle local/utc time better