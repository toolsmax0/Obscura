const Service = require('node-windows').Service;

const svc = new Service({
	name: 'MTGA Deck Analyzer',
	script: './app.js',
	wait: '1', 
	grow: '0.25', 
	maxRestarts: '40', 
});

svc.on('install', () => {
	svc.start();
	console.log('Installation completed.');
});
svc.on('uninstall', () => console.log('Uninstallation completed.'));

if (svc.exists) return svc.uninstall();

svc.install();
