booth-node-defender
===================

Protect your node client for as long as possible. Defend against waves of murderous server side code that wants nothing more than to kill and disconnect your node client.

## Setup `&&` Run

1. `npm install`
2. `npm start`

## Testing

Run `grunt`.

## Configuration

The configuration of the server is available via environment variables. For example:

```PORT=4000 npm start```

or for multiple configurations:

```PORT=4000 LOGLEVEL=info npm start```

* `PORT` - Application port. (Default: 8080)
* `LOGLEVEL` - How verbose should the log be. (Default: info)
* `DELAY` - How long should the server wait to respond to a player action. (Default: 1000)
* `MONGOHOST` - Hostname for the mongodb backend (Default: 127.0.0.1)
* `MONGOPORT` - Port for the mongodb backend (Default: 27017)
* `MONGODB` - Defender DB (Default: node-defender)
