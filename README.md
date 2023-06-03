# Snotels are fun
[Snotels](https://en.wikipedia.org/wiki/SNOTEL) are really imprerssive pieces of engineering, but unfortunately, 
the UI to interact with the data does not live up to the quality of its real-world 
siblings in the mountains. Snotels were created to provide crucial data on climate change, the state of
watersheds and used to forecast water supply. They are also used by skiers, for a less important, but more fun goal
of finding the best areas to ski tour so what if we used the amazing data from these remote sensors, and just conveyed the information in a way more geared for skiers?

this was my attempt https://funtel.herokuapp.com/


### 🎯 goals I was seeking to solve
* ease for mobile users, to quickly navigate to a known snotel, and be able
quicky see both snow depth and temp on a chart without any wonky scrolling
while doing last min planning on where to ski that morning.
* ease for users to get a state-wide level view of absolute snow depths.
Snotel's current map snows relative since the point of snotels is not chasing
deep snow totals.
* (WIP) Make it easy for the user to also get the NWS point forecast at the same
location as the Snotel site.


## notes for me

### to run manually
* start backend server `python manage.py runserver`
* if first time, add snotel sites with `python manage.py runscript run_setup`
* update data to database `python manage.py runscript refresh_datahub --script-args 200` where 200 is number of hours to go back
* start server with `yarn start`


### TODO
* add weather forecasts to site pages
* static urls.py is a bad hack, and user cant go directly to a site page
* add wind rose to site pages
* handle local/utc time better, right now just hard-coded to colorado
* pass station name thru to site so dont need to make another call
