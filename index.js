
// This is the port used by express for websocket and downloading attacments. Change this if needed.
var port = 3000;

// This is the port used by the smtp server. Change this if needed.
var smtpPort = 25552;

const {v4: uuid} = require('uuid');
const dayjs = require('dayjs');

var inbox = {};

function removeMessage(id) {
    delete inbox[id];
}

function findMessage(id) {
    return inbox[id];
}

function getAttachment(args) {
    var msg = findMessage(args.id);
    
    if (msg) {
        if ('attachments' in msg) {
            var search = msg.attachments.filter(x => x.filename === args.file);
            var att = (search.length) ? search[0] : null;
            return att;
        } else {
            console.log('no attachments in message: ' + args.id);
        }
    }
    
    return null;
}

function getInboxItems() {
    var result = [];
    
    for (let id in inbox) {
        var msg = inbox[id];
        
        var from = ('from' in msg) ? msg.from.html : "";
        var to = ('to' in msg) ? msg.to.html : "";
        var cc = ('cc' in msg) ? msg.cc.html : "";
        var atts = ('attachments' in msg) ? msg.attachments.map(a => a.filename) : [];
        
        result.push({
            "id": id,
            "subject": msg.subject,
            "received": dayjs(msg.date).format('YYYY-MM-DD HH:mm:ss'),
            "from": from,
            "to": to,
            "cc": cc,
            "body": msg.textAsHtml,
            "attachments": atts
        });
    }
    
    return result;
}

const express = require('express');

const ws = require('ws');
const app = express();

// enable CORS without external module
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function sendInbox(socket) {
    var items = getInboxItems();
    socket.send(JSON.stringify({"inbox": items}));
}

const connectedSockets = new Set();

connectedSockets.broadcast = function() {
    for (let socket of this) {
        sendInbox(socket);
    }
};

// Set up a headless websocket server that prints any events that come in.
const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', socket => {
    console.log('socket connected');
    
    socket.on('message', function(msg) {
        var args = JSON.parse(msg);
        if (args.command === 'delete-all') {
            console.log('deleting all');
            inbox = {};
            connectedSockets.broadcast();
        } else if (args.command === 'delete') {
            console.log('deleting message ' + args.id);
            removeMessage(args.id);
            connectedSockets.broadcast();
        }
    });
    
    socket.on('end', function() {
        connectedSockets.delete(socket);
    });
    
    connectedSockets.add(socket);
    
    sendInbox(socket);
});

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server

const server = app.listen(port, () => {
  console.log(`devsmtp web server listening on port ${port}`)
});

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});

app.get('/attachment/:id/:file', function(req, res) {
    var att = getAttachment(req.params);
    
    if (!att)
        res.sendStatus(404);
    else {
        res.writeHead(200, {
            'Content-Disposition': `attachment; filename="${att.filename}"`,
            'Content-Type': att.contentType,
        });
        
        res.end(att.content);
    }
});

const SMTPServer = require("smtp-server").SMTPServer;
const simpleParser = require('mailparser').simpleParser;

const smtp = new SMTPServer({
    secure: false,
    authOptional: true,
    onData(stream, session, callback) {
        stream.on("end", callback);
        
        console.log('email received');
        
        simpleParser(stream, null).then(parsed => {
            inbox[uuid()] = parsed;
            connectedSockets.broadcast();
        }).catch(err => {
            console.log(err);
        });
    }
});

smtp.listen(smtpPort);

console.log(`devsmtp smtp server listening on port ${smtpPort}`);

smtp.on("error", err => {
  console.log("Error %s", err.message);
});

