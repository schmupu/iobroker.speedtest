![Logo](admin/speedtest.png)
# ioBroker.speedtest

[![NPM version](http://img.shields.io/npm/v/iobroker.speedtest.svg)](https://www.npmjs.com/package/iobroker.speedtest)
[![Downloads](https://img.shields.io/npm/dm/iobroker.speedtest.svg)](https://www.npmjs.com/package/iobroker.speedtest)
![Number of Installations (latest)](http://iobroker.live/badges/speedtest-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/speedtest-stable.svg)
[![Dependency Status](https://img.shields.io/david/schmupu/iobroker.speedtest.svg)](https://david-dm.org/schmupu/iobroker.speedtest)
[![Known Vulnerabilities](https://snyk.io/test/github/schmupu/ioBroker.speedtest/badge.svg)](https://snyk.io/test/github/schmupu/ioBroker.speedtest)

[![NPM](https://nodei.co/npm/iobroker.speedtest.png?downloads=true)](https://nodei.co/npm/iobroker.speedtest/)

**Tests:** ![Test and Release](https://github.com/schmupu/ioBroker.speedtest/workflows/Test%20and%20Release/badge.svg)

## speedtest adapter for ioBroker

checks the speed of your Internet connection in regular, specified intervals

### Getting started
Install the Internet speed adapter and configure how often the adapter shall check the Internet speed (poll rhythm).  
You can always start manual the speed test by pressing the 'speed check' button.  
The adapter uses the [speedtest-net](https://github.com/ddsol/speedtest.net) library.  The library uses the speedtest.net API. You have to accept the Ookla license terms and GDPR terms of speedtest.net. Please read it carefully on the speedtest.net site.

## Changelog

### 0.0.1
* (Thorsten Stueben) initial release

## License
MIT License

Copyright (c) 2020 Thorsten Stueben <thorsten@stueben.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.