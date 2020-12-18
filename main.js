'use strict';

/*
 * Created with @iobroker/create-adapter v1.30.1
 */
 
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const speedTest = require('speedtest-net');

let timerPoll = undefined;
let checkRunning = false;

// Load your modules here, e.g.:
// const fs = require('fs');

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
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named 'testVariable'
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
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
				role: '',
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
				role: '',
				type: 'number',
				desc: 'Upload speed',
				def: 0,
				read: true,
				write: false,
				unit: 'Mbit/s',
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('speedcheck', {
			type: 'state',
			common: {
				'name': 'Run speed test!',
				'type': 'boolean',
				'read': true,
				'role': 'button',
				'write': true,
				'def': false
			},
			native: {},
		});


		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		// this.subscribeStates('testVariable');
		// You can also add a subscription for multiple states. The following line watches all states starting with 'lights.'
		// this.subscribeStates('lights.*');
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		this.subscribeStates('*');

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		// same thing, but the value is flagged 'ack'
		// ack should be always set to true if the value is received from or acknowledged from the target system
		await this.setStateAsync('info.connection', { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		// await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync('admin', 'iobroker');
		this.log.info('check user admin pw iobroker: ' + result);

		result = await this.checkGroupAsync('admin', 'admin');
		this.log.info('check group user admin group admin: ' + result);

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
			clearTimeout(timerPoll);
			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

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
			if (!checkRunning && deviceId === 'speedcheck') {
				this.log.debug('Starting manuell internet speed check');
				setTimeout(async () => await this.speed());
			}
			/*
			if (!checkRunning && deviceId === 'speedcheck') {
				(async () => {
					this.log.debug('Starting manuell internet speed check');
					await speedTest();
				})();
			}
			*/
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires 'common.message' property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }


	async speed() {
		try {
			checkRunning = true;
			this.log.debug('Starting internet speed check');
			let speed = await speedTest({
				acceptLicense: true,
				acceptGdpr: true,
				maxTime: 20000
			});
			let download = (speed.download.bytes / speed.download.elapsed / 1024) * 8;
			let upload = (speed.upload.bytes / speed.upload.elapsed / 1024) * 8;
			download = Math.round(download * 100) / 100;
			upload = Math.round(upload * 100) / 100;
			this.log.debug('Downlaod: ' + download + ' Mbit/s');
			this.log.debug('Upload:  ' + upload + ' Mbit/s');
			await this.setStateAsync('speed.download', { val: download, ack: true });
			await this.setStateAsync('speed.upload', { val: upload, ack: true });
			checkRunning = false;
			return { 'download': download, 'upload': upload };
		} catch (error) {
			this.log.error('Could not check the internet speed');
			checkRunning = false;
			return undefined;
		}
	}

	async start(min) {
		try {
			await this.speed();
			timerPoll = setTimeout(async () => { await this.start(min); }, min * 60 * 1000);
		} catch (error) {

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