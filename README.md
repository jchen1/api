# api

a simple api for logging events

## todo

### infra

- [x] auto certbot renew
- [x] update script
- [ ] test reprovisioning a server
- [ ] database backups?
- [ ] auto database setup & migrations
- [ ] better commit workflow
  - [ ] github actions OR docker webhook - install ssh key & write some bash
- [ ] terraform
  - [ ] open up ports 443/444 in vultr

### frontend

- [x] simple websocket frontend for incoming events
  - [x] graphs!
  - [x] send an event
  - [x] reconnect when server drops
    - [x] status icon
  - [x] basic time picker
  - [x] move off of static export - deploy to jeffchen.dev/events
  - [ ] auth tokens to view privileged events


### events

- [x] browsed to webpage
  - [x] swapped chrome window
  - [x] closed tab / window
  - [x] install on desktop
- [x] mac app - like rescuetime?
- [x] whoop
- [x] garmin - via apple health
- [x] fitbit (weight) (via apple health)
- [x] mood (firebase?)
- [x] awair
- [x] airthings
- [ ] wunderground
- [ ] ecobee
