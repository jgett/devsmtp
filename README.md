# devsmtp
A local smtp server for developers

This little node script gives you a local smtp server that you can send emails to with your application.

This is useful when developing an app that uses email. You can see if emails are being sent correctly without dealing with a production smtp server.

The websockets server uses cors so that websockets will work cross domain. This allows a client to run on any host and still cconnect to localhost for websockets.

### Installation
`git clone https://github.com/jgett/devsmtp.git`

`cd devsmtp`

`npm install`

`npm start`

### Client
A client for viewing emails is provided, however feel free to develop your own if you prefer.

You can run a node http server using interface.js (run `node interface.js`) or configure a virtual directory in your web server to serve the static folder.

### Service
A script is provided to install devsmtp as a Windows service. Run `node service-install.js` to install and `node service-uinstall.js` to remove.

Be sure to install node-windows and run `npm link node-windows` before running these scripts.

Of course feel free to use any other mechanism for running a node script as a background task, such as nssm or PM2.
