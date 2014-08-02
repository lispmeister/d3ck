#!/usr/bin/env node

var port        = 8080,
    fs          = require('fs'),
    https       = require('https'),
    static      = require('node-static'),
    file        = new static.Server('.'),
    home        = "/etc/d3ck/d3cks/D3CK",
    key         = fs.readFileSync(home + "/d3ck.key"),
    cert        = fs.readFileSync(home + "/d3ck.crt"),
    ca          = fs.readFileSync(home + "/ca.crt"),
    uuid = require('node-uuid'),
    crypto = require('crypto'),
    credentials = {key: key, cert: cert, ca: ca};

// HTTPs server
server = require('https').createServer({
    key                 : key, 
    cert                : cert, 
    ca                  : ca,
    ciphers             : 'ECDHE-RSA-AES256-SHA384:AES256-SHA256:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    secureOptions       : require('constants').SSL_OP_CIPHER_SERVER_PREFERENCE,
    honorCipherOrder    : true,
    requestCert         : true,
    rejectUnauthorized  : false,
    strictSSL           : false
    }, function (request, response) {

    server.on('upgrade', function (req, socket, head) {
        server.handleUpgrade(req, socket, head);
    });


    request.addListener('end', function () {
        // Serve files!
        file.serve(request, response);
    }).resume();
})

io  = require('socket.io').listen(server);

io.set('log level', 4)

function describeRoom(name) {
    var clients = io.sockets.clients(name);
    var result = {
        clients: {}
    };
    clients.forEach(function (client) {
        result.clients[client.id] = client.resources;
    });
    return result;
}

function safeCb(cb) {
    if (typeof cb === 'function') {
        return cb;
    } else {
        return function () {};
    }
}

io.sockets.on('connection', function (client) {

    console.log('a user connected... well, a browser, actually')

    client.resources = {
        screen: false,
        video: true,
        audio: false
    };

    // pass a message to another id
    client.on('message', function (details) {
        if (!details) return;

        var otherClient = io.sockets.sockets[details.to];
        if (!otherClient) return;

        details.from = client.id;
        otherClient.emit('message', details);
    });

    client.on('shareScreen', function () {
        client.resources.screen = true;
    });

    client.on('unshareScreen', function (type) {
        client.resources.screen = false;
        removeFeed('screen');
    });

    client.on('join', join);

    function removeFeed(type) {
        if (client.room) {
            io.sockets.in(client.room).emit('remove', {
                id: client.id,
                type: type
            });
            if (!type) {
                client.leave(client.room);
                client.room = undefined;
            }
        }
    }

    function join(name, cb) {
        // sanity check
        if (typeof name !== 'string') return;
        // leave any existing rooms
        removeFeed();
        safeCb(cb)(null, describeRoom(name));
        client.join(name);
        client.room = name;
    }

    // we don't want to pass "leave" directly because the
    // event type string of "socket end" gets passed too.
    client.on('disconnect', function () {
        removeFeed();
    });
    client.on('leave', function () {
        removeFeed();
    });

    client.on('create', function (name, cb) {
        if (arguments.length == 2) {
            cb = (typeof cb == 'function') ? cb : function () {};
            name = name || uuid();
        } else {
            cb = name;
            name = uuid();
        }
        // check if exists
        if (io.sockets.clients(name).length) {
            safeCb(cb)('taken');
        } else {
            join(name);
            safeCb(cb)(null, name);
        }
    });

    // tell client about stun and turn servers and generate nonces
    client.emit('stunservers', config.stunservers || []);

    // create shared secret nonces for TURN authentication
    // the process is described in draft-uberti-behave-turn-rest
    var credentials = [];
    config.turnservers.forEach(function (server) {
        var hmac = crypto.createHmac('sha1', server.secret);
        // default to 86400 seconds timeout unless specified
        var username = Math.floor(new Date().getTime() / 1000) + (server.expiry || 86400) + "";
        hmac.update(username);
        credentials.push({
            username: username,
            credential: hmac.digest('base64'),
            url: server.url
        });
    });
    client.emit('turnservers', credentials);
});



server.listen(port, function () {
    console.log('listening to https://0.0.0.0:' + port)
})


server.on('error', function (e) {
    console.log('Server error: ' + JSON.stringify(e))
})

