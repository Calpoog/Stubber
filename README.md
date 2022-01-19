# Stubber

Chrome extension for stubbing endpoints in-browser.

## Getting Started

### Installation

```sh
$ git clone https://www.github.com/Calpoog/Stubber.git
$ cd Stubber
$ yarn install
```

## Development

There are two ways in which you can build and run the web app:

* Build for ***Production*** (Minifies, mangles, builds crx):
  * `$ yarn build`
  * Drop .crx file into Chrome

* Build for ***Development*** (Source maps, keeps expanded):
  * `$ yarn start`
  * `chrome://extensions/` > Load unpacked extension > `Stubber/build` (or use reload link if already loaded)

## Testing

**(TBD)**

Tests are incomplete in develop branch:

```sh
$ npm run test
```

To run unit tests continuously during development (watch tests), use:

```sh
$ npm run test:watch
```

## FAQ

### What's this for?

Simplify development and testing by using in-browser stubs to get the data exactly as you need it for your current scenario. Does not require modifying your project to point to a stub server or setting up a local server solely for the purpose of serving stubs. No hassle about only hitting a stubbing server for a particular URL you may need vs. pointing your entire project toward a stubbed local server.

## TODO

- [ ] Watch `src/assets/extensions` for changes
- [ ] Maybe write some tests
- [ ] Any more ideas?
