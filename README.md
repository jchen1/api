# api

a simple api for logging events

## todo

- [ ] auto certbot renew
- [ ] test reprovisioning a server
- [ ] database backups?
- [ ] auto database setup & migrations
- [x] update script
- [x] simple websocket frontend for incoming events
  - [x] graphs!
  - [x] send an event
  - [x] reconnect when server drops
    - [x] status icon
  - [x] basic time picker
  - [ ] move off of static export - deploy to jeffchen.dev/events
  - [ ] auth tokens to view privileged events
- [ ] better commit workflow
  - [ ] github actions - install ssh key & write some bash
- [ ] oauth table (blocks fitbit)
- [ ] event pushers
  - [x] browsed to webpage
    - [x] swapped chrome window
    - [x] closed tab / window
    - [ ] install on desktop
  - [ ] mac app - like rescuetime?
    - [ ] use hammerspoon?
  - [ ] whoop
    - [x] hr
    - [ ] rest of data...
  - [ ] garmin - steal from https://github.com/cyberjunky/python-garminconnect/blob/master/garminconnect/__init__.py
  - [ ] fitbit (weight) (blocked by oauth)
  - [ ] mood (firebase?)
  - [x] awair
  - [ ] wunderground
  - [ ] roam, when the API exists
  - [ ] ...
