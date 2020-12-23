'use strict';

/*
 * Created with @iobroker/create-adapter v1.30.1
 */

const utils = require('@iobroker/adapter-core');
const speedTest = require('speedtest-net');

let intervallHandle = undefined;
let timeoutHandle = undefined;
let checkRunning = false;

class Speedtest extends utils.Adapter {

  /**
   * @param {Partial<utils.AdapterOptions>} [options={}]
   */
  constructor(options) {
    super({
      ...options,
      name: 'speedtest',
    });
    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
    this.on('objectChange', this.onObjectChange.bind(this));
    this.on('message', this.onMessage.bind(this));
    this.on('unload', this.onUnload.bind(this));
  }

  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    // Initialize your adapter here
    await this.setObjectNotExistsAsync('speed', {
      type: 'channel',
      common: {
        name: 'speed'
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('speed.download', {
      type: 'state',
      common: {
        name: 'download',
        role: 'info.status',
        type: 'number',
        desc: 'Download speed',
        def: 0,
        read: true,
        write: false,
        unit: 'Mbit/s',
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('speed.upload', {
      type: 'state',
      common: {
        name: 'upload',
        role: 'info.status',
        type: 'number',
        desc: 'Upload speed',
        def: 0,
        read: true,
        write: false,
        unit: 'Mbit/s',
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('speed.ping', {
      type: 'state',
      common: {
        name: 'ping',
        role: 'info.status',
        type: 'number',
        desc: 'Ping Latency',
        def: 0,
        read: true,
        write: false,
        unit: 'ms',
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('speed.progress', {
      type: 'state',
      common: {
        name: 'progress',
        role: 'info.status',
        type: 'number',
        desc: 'Progress',
        def: 0,
        read: true,
        write: false,
        unit: '%',
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('speed.speedcheck', {
      type: 'state',
      common: {
        name: 'Run speed test',
        type: 'boolean',
        read: true,
        role: 'button',
        write: true,
        def: false
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('progress', {
      type: 'channel',
      common: {
        name: 'speed'
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('progress.download', {
      type: 'state',
      common: {
        name: 'download',
        role: 'info.status',
        type: 'number',
        desc: 'Download speed',
        def: 0,
        read: true,
        write: false,
        unit: 'Mbit/s',
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('progress.upload', {
      type: 'state',
      common: {
        name: 'upload',
        role: 'info.status',
        type: 'number',
        desc: 'Upload speed',
        def: 0,
        read: true,
        write: false,
        unit: 'Mbit/s',
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('progress.ping', {
      type: 'state',
      common: {
        name: 'ping',
        role: 'info.status',
        type: 'number',
        desc: 'Ping Latency',
        def: 0,
        read: true,
        write: false,
        unit: 'ms',
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('progress.progress', {
      type: 'state',
      common: {
        name: 'progress',
        role: 'info.status',
        type: 'number',
        desc: 'Progress',
        def: 0,
        read: true,
        write: false,
        unit: '%',
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('progress.speedcheck', {
      type: 'state',
      common: {
        name: 'Run speed test',
        type: 'boolean',
        read: true,
        role: 'button',
        write: true,
        def: false
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('info', {
      type: 'channel',
      common: {
        name: 'Information'
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('info.externalip', {
      type: 'state',
      common: {
        name: 'External IP',
        role: 'info.status',
        type: 'string',
        desc: 'External IP',
        read: true,
        write: false,
      },
      native: {},
    });
    await this.setObjectNotExistsAsync('info.internalip', {
      type: 'state',
      common: {
        name: 'Internal IP',
        role: 'info.status',
        type: 'string',
        desc: 'Internal IP',
        read: true,
        write: false,
      },
      native: {},
    });
    this.subscribeStates('*');
    await this.setStateAsync('info.connection', { val: true, ack: true });
    // let result = await this.checkPasswordAsync('admin', 'iobroker');
    // this.log.info('check user admin pw iobroker: ' + result);
    // result = await this.checkGroupAsync('admin', 'admin');
    // this.log.info('check group user admin group admin: ' + result);
    if (this.config.polltime > 1) {
      this.log.info('Checking internet speed every ' + this.config.polltime + ' minutes');
    } else {
      this.log.info('Checking internet speed every ' + this.config.polltime + ' minute');
    }
    await this.start(this.config.polltime);
  }

  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   * @param {() => void} callback
   */
  onUnload(callback) {
    try {
      // Here you must clear all timeouts or intervals that may still be active
      clearTimeout(timeoutHandle);
      clearInterval(intervallHandle);
      callback();
    } catch (e) {
      callback();
    }
  }

  /**
    * Is called if a subscribed object changes
    * @param {string} id
    * @param {ioBroker.Object | null | undefined} obj
    */
  onObjectChange(id, obj) {
    if (obj) {
      // The object was changed
      this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    } else {
      // The object was deleted
      this.log.info(`object ${id} deleted`);
    }
  }

  /**
   * Is called if a subscribed state changes
   * @param {string} id
   * @param {ioBroker.State | null | undefined} state
   */
  onStateChange(id, state) {
    if (state && state.ack === false) {
      let deviceId = id.replace(this.namespace + '.', '');
      // The state was changed
      // this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
      if (deviceId === 'speed.speedcheck' || deviceId === 'progress.speedcheck') {
        this.log.debug('Starting manuell internet speed check');
        setTimeout(async () => await this.speed());
      }
    }
  }

  /**
   * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
   * Using this method requires 'common.message' property to be set to true in io-package.json
   * @param {ioBroker.Message} obj
   */
  onMessage(obj) {
    if (typeof obj === 'object' && obj.message) {
      if (obj.command === 'send') {
        // e.g. send email or pushover or whatever
        this.log.info('send command');
        // Send response in callback if required
        if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
      }
    }
  }

  /**
   * 
   */
  async speed() {
    if (!this.config.license) {
      this.log.warn('Please accept the Ookla and GDPR license terms of speedtest.net!');
      return undefined;
    }
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(async () => {
      try {
        const self = this;
        checkRunning = true;
        this.log.debug('Starting internet speed check');
        let speed = await speedTest({
          sourceIp: this.config.sourceip || undefined,
          acceptLicense: this.config.license,
          acceptGdpr: this.config.license,
          maxTime: 20000,
          progress: async (handle) => await this.progress(self, handle)
        });
        let download = (speed.download.bytes / speed.download.elapsed / 1024) * 8;
        let upload = (speed.upload.bytes / speed.upload.elapsed / 1024) * 8;
        let ping = speed.ping.latency;
        download = Math.round(download * 100) / 100;
        upload = Math.round(upload * 100) / 100;
        ping = Math.round(ping);
        this.log.debug('Downlaod: ' + download + ' Mbit/s');
        this.log.debug('Upload:  ' + upload + ' Mbit/s');
        this.log.debug('Ping:  ' + ping + ' ms');
        await this.setStateAsync('speed.download', { val: download, ack: true });
        await this.setStateAsync('speed.upload', { val: upload, ack: true });
        await this.setStateAsync('speed.ping', { val: ping, ack: true });
        await this.setStateAsync('info.internalip', { val: speed.interface.internalIp, ack: true });
        await this.setStateAsync('info.externalip', { val: speed.interface.externalIp, ack: true });
        checkRunning = false;
        return { 'download': download, 'upload': upload, 'ping': ping };
      } catch (error) {
        this.log.error(error);
        checkRunning = false;
        return undefined;
      }
    });
  }

  /**
   * 
   * @param {*} self 
   * @param {*} speed
   */
  async progress(self, speed) {
    let p = speed.progress;
    p = Math.round(p * 100 * 100) / 100;
    await self.setStateChangedAsync('progress.progress', { val: p, ack: true });
    await self.setStateChangedAsync('speed.progress', { val: p, ack: true });
    if (speed.download) {
      let download = (speed.download.bytes / speed.download.elapsed / 1024) * 8;
      download = Math.round(download * 100) / 100;
      await self.setStateChangedAsync('progress.download', { val: download, ack: true });
    }
    if (speed.upload) {
      let upload = (speed.upload.bytes / speed.upload.elapsed / 1024) * 8;
      upload = Math.round(upload * 100) / 100;
      await self.setStateChangedAsync('progress.upload', { val: upload, ack: true });
    }
    if (speed.ping) {
      let ping = speed.ping.latency;
      ping = Math.round(ping);
      await self.setStateChangedAsync('progress.ping', { val: ping, ack: true });
    }
  }

  /**
   * 
   * @param {*} min 
   */
  async start(min) {
    try {
      await this.speed();
      intervallHandle = setInterval(async () => {
        await this.speed();
      }, min * 60 * 1000);
    } catch (error) {
      this.log.error(error);
    }
  }
}



// @ts-ignore parent is a valid property on module
if (module.parent) {
  // Export the constructor in compact mode
  /**
   * @param {Partial<utils.AdapterOptions>} [options={}]
   */
  module.exports = (options) => new Speedtest(options);
} else {
  // otherwise start the instance directly
  new Speedtest();
}