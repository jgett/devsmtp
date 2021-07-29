# devSMTP
A local smtp server for developers

This little node script gives you a local smtp server that you can send emails to with your application.

This is useful when developing an app that uses email. You can see if emails are being sent correctly without dealing with a production smtp server.

A websocket server provides data to your web browser for viewing and deleting received emails. Email sender, recipients, subject, body, and attachments are displayed.

By default the smtp port is 25552. Send emails to localhost:25552 from your application. No authentication is needed. The websockets server runs on port 3000 by default. To change either port edit the variables at the top of the index.js file.

### Installation
`git clone https://github.com/jgett/devsmtp.git`

`cd devsmtp`

`npm install`

`npm start`

### Client
A client for viewing emails is provided, however feel free to develop your own if you prefer.

You can run a node http server using interface.js (run `node interface.js`) or configure a virtual directory in your web server to serve the static folder.

By default the web interface runs on port 3001 (if you're using interface.js). To change this edit the variable at the top of the interface.js file.

The websockets server uses cors so that websockets will work cross domain. This allows a client to run on any host and still cconnect to localhost for websockets.

### Service
A script is provided to install devsmtp as a Windows service. Run `node service-install.js` to install and `node service-uinstall.js` to remove.

Be sure to install node-windows with `npm i node-windows -g` and run `npm link node-windows` in the devsmtp folder before running these scripts.

Of course feel free to use any other mechanism for running a node script as a background task, such as nssm or PM2.
