
// general includes
var assert  = require('assert-plus'),
    bunyan  = require('bunyan'),
    fs      = require('fs'),
    restify = require('restify'),
    path    = require('path'),
    rest    = require('rest'),
    util    = require('util'),
    when    = require('when')

// simple conf file...
var config = JSON.parse(fs.readFileSync('/etc/puck/puck.json').toString())
console.log(config);

console.log(config.PUCK)
console.log(config.PUCK.keystore)

// stupid hax from stupid certs - https://github.com/mikeal/request/issues/418
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

///--- Redis
var redis = require("redis"),
rclient = redis.createClient();    
rclient.on("error", function (err) {
   console.log("Redis client error: " + err);
   // req.log.error("Redis client error: " + err);
});

// file reads to string nodey stuff
var StringDecoder = require('string_decoder').StringDecoder;
var decoder       = new StringDecoder('utf8');

// global PUCK ID for this server's PUCK
try {
    puck_id = fs.readFileSync("/etc/puck/pucks/PUCK/puck.pid")
    puck_id = decoder.write(puck_id);
    puck_id = puck_id.replace(/\n/, '');
} 
catch (e) {
    console.log("no PUCK ID for this potential PUCK... you won't get anywhere w/o it....\n")
    console.log(e)
    process.exit(2)
}

//
// drag in PUCK data to the server
//
// the very first time it's a bit of a chicken and egg thing;
// how do you get the PUCK data loaded into the server if 
// the client hasn't posted it yet? Wait for the first time
// something is posted, that should be the one that we can
// trigger on.
//

console.log('pulling in puck data for the server itself')
var bwana_puck = {}

// wait for the first puck to be loaded in
events    = require('events');
emitter   = new events.EventEmitter();

var uber_puck = function uber_puck() {

    console.log("it's time...!")

    someday_get_https('https://localhost:8080/puck/' + puck_id).then(onFulfilled, onRejected)

    function onFulfilled(res) {
        console.log('finally got server response...')

        if (res.indexOf("was not found") != -1) {
            console.log('no woman no puck: ' + res)
            // trytryagain(options, callback);
        }
        else {
            console.log('puckarrific!')
            // console.log(res)
            res = JSON.parse(res)
            bwana_puck = res
       }
    }

    function onRejected(err) {
        console.log('Error: ', err);
        console.log("well... try again?")
        trytryagain(options, callback);
    }
}
// set the mousetrap
emitter.on('loaded', uber_puck);

// try it once
if (isEmpty(bwana_puck)) {
    emitter.emit('loaded')
}


///--- Errors
function MissingValueError() {
    restify.RestError.call(this, {
        statusCode: 409,
        restCode: 'MissingValue',
        message: '"value" is a required parameter',
        constructorOpt: MissingValueError
    });

    this.name = 'MissingValueError';
}
util.inherits(MissingValueError, restify.RestError);


function PuckExistsError(key) {
    assert.string(key, 'key');

    restify.RestError.call(this, {
        statusCode: 409,
        restCode: 'PuckExists',
        message: key + ' already exists',
        constructorOpt: PuckExistsError
    });

    this.name = 'PuckExistsError';
}
util.inherits(PuckExistsError, restify.RestError);


function PuckNotFoundError(key) {
    assert.string(key, 'key');

    restify.RestError.call(this, {
        statusCode: 404,
        restCode: 'PuckNotFound',
        message: key + ' was not found',
        constructorOpt: PuckNotFoundError
    });

    this.name = 'PuckNotFoundError';
}
util.inherits(PuckNotFoundError, restify.RestError);

function NotImplementedError() {
    restify.RestError.call(this, {
        statusCode: 404,
        restCode: 'NotImplemented',
        message: 'This method is not implemented',
        constructorOpt: NotImplementedError
    });

    this.name = 'NotImplementedError';
}
util.inherits(NotImplementedError, restify.RestError);


/**
 * This is a nonsensical custom content-type 'application/puck', just to
 * demonstrate how to support additional content-types.  Really this is
 * the same as text/plain, where we pick out 'value' if available
 */
function formatPuck(req, res, body) {
    if (body instanceof Error) {
        res.statusCode = body.statusCode || 500;
        body = body.message;
    } else if (typeof (body) === 'object') {
        body = body.value || JSON.stringify(body);
    } else {
        body = body.toString();
    }

    res.setHeader('Content-Length', Buffer.byteLength(body));
    return (body);
}



///--- Handlers

/**
 * Only checks for HTTP Basic Authenticaion
 *
 * Some handler before is expected to set the accepted user/pass combo
 * on req as:
 *
 * req.allow = { user: '', pass: '' };
 *
 * Or this will be skipped.
 */
function authenticate(req, res, next) {
    if (!req.allow) {
        req.log.debug('skipping authentication');
        next();
        return;
    }

    var authz = req.authorization.basic;
    if (!authz) {
        res.setHeader('WWW-Authenticate', 'Basic realm="puckapp"');
        next(new restify.UnauthorizedError('authentication required'));
        return;
    }

    if (authz.username !== allow.user || authz.password !== allow.pass) {
        next(new restify.ForbiddenError('invalid credentials'));
        return;
    }

    next();
}


/**
 * Note this handler looks in `req.params`, which means we can load request
 * parameters in a "mixed" way, like:
 *
 * POST /puck?key=foo HTTP/1.1
 * Host: localhost
 * Content-Type: application/json
 * Content-Length: ...
 *
 * {"value": "json value of Puck data"}
 *
 * Which would have `key` and `value` available in req.params
 */
function createPuck(req, res, next) {

    if (!req.params.value) {
        req.log.warn('createPuck: missing value');
        console.log('createPuck: missing value');
        next(new MissingValueError());
        return;
    }

    var puck = {
        key: req.params.key || req.params.value.replace(/\W+/g, '_'),
        value:  JSON.stringify(req.params.value)
    };

    // TODO: Check if Puck exists using EXISTS and fail if it does

    req.log.debug("key: " + puck.key);
    req.log.debug("value: " + puck.value);

    rclient.set(puck.key, puck.value, function(err) {
        if (err) {
            req.log.warn(err, 'putPuck: unable to store in Redis db');
            next(err);
        } else {
            req.log.debug({puck: req.body}, 'putPuck: done');
            // if we still haven't loaded our PUCK data in, do so now
            if (isEmpty(bwana_puck)) {
                emitter.emit('loaded')
            }
            res.send(204);
            next();
        }
    });
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Deletes a Puck by key
 */
function deletePuck(req, res, next) {
    rclient.del(req.params.key, function (err) {
        if (err) {
            req.log.warn(err,
                         'deletePuck: unable to delete %s',
                         req.puck);
            next(err);
        } else {
            req.log.debug('deletePuck: success deleting %s', req.puck);
            res.send(204);
            next();
        }
    });
}


/**
 * Deletes all Pucks (in parallel)
 */
function deleteAll(req, res, next) {
        req.log.warn({params: req.params}, 'deleteAll: not implemented');
        next(new NotImplementedError());
        return;
}

/**
 * Loads a Puck by key
 */
function getPuck(req, res, next) {

    rclient.get(req.params.key, function (err, reply) {

        if (err) {
            req.log.warn(err, 'getPuck: unable to retrieve %s', req.puck);
            next(err);
        } else {
            if (reply == null) {
                req.log.warn(err, 'getPuck: unable to retrieve %s', req.puck);
                next(new PuckNotFoundError(req.params.key));
            } else {
                // console.log("Value retrieved: " + reply.toString());
                res.send(200, reply);
                next(); 
            }
        }
    });
}

/**
 * Simple returns the list of Puck Ids that are stored in redis
 */
function listPucks(req, res, next) {
    rclient.keys('*', function (err, keys) {
        if (err) {
            req.log.warn(err, 'listPuck: unable to retrieve all Pucks');
            next(err);            
        } else {
            req.log.warn('Number of Pucks found: ', keys.length);
            res.send(200, JSON.stringify(keys));
            next();
        }
    });
}

/**
 * Echo reply
 * TODO: Return actual Puck ID
 */
function echoReply(req, res, next) {

    console.log('pingasaurus')

    var response = {status: "OK", "name": bwana_puck.PUCK.name, "pid": puck_id}
    res.send(200, response)

    next();

}

/**
 * Echo reply status
 * TODO: Check that the ID is our own and only return OK if it is.
 *       Otherwise throw error.
 */
function echoStatus(req, res, next) {
    res.send(200, "{\"status\": \"OK\"}");
    next();
}

 /**
 * Start the local OpenVPN server. We execute an external bash script.
 * Returns OK if we succeed.
 * TODO: We might want to use https://github.com/arturadib/shelljs#readme
 *
 * Note: We can also use child_process.execFile(file, args, options, callback)
 *       if that is more convenient.
 */
function startVPN(req, res, next) {
    var exec = require('child_process').exec;
    var child;
    var command = 'date';
    child = exec(command,
                 function (error, stdout, stderr) {
                     req.log.debug('startVPN stdout: ' + stdout);
                     req.log.debug('startVPN stderr: ' + stderr);
                     if (error !== null) {
                         req.log.error('exec error: ' + error);
                         res.send(500, "{\"status\": \"Failed\"}");
                         next();
                     } else {
                         res.send(200, "{\"status\": \"OK\"}");
                         next();
                     }
                 });
}

function startVPN2(req, res, next) {

    console.log('start vpn2')
    console.log(req.params)

    var puck_web_home = "/puck.html"

    // bail if we don't get ID
    if (typeof req.params.puckid === 'undefined' || req.params.puckid == "") {
      console.log("error... requires a PUCK ID!");
      // redirect to the home-o-the-puck
      // fix ;)
      res.header('Location', puck_web_home);
      res.send(302);
      return next(false);
    }
   
    console.log('onto the execution...')

    puckid = req.params.puckid
    ipaddr = req.params.ipaddr

    console.log(puckid, ipaddr)

    var vpn   = '/etc/puck/exe/start_vpn.sh'

    args = [puckid, ipaddr]
    cmd = vpn

    var fs = require('fs'),

    spawn = require('child_process').spawn,

    out = fs.openSync('/etc/puck/tmp/std.log', 'a'),

    err = fs.openSync('/etc/puck/tmp/err.log', 'a');

    var child = spawn(cmd, args, {
        detached: true,
        stdio: [ 'ignore', out, err ]
    });

    child.unref();

    console.log('post execution')

    // now slice and dice output, errors, etc.

// xxx... 
//  vpn.stdout.on('data', function (data) {
//    console.log('start_vpn.sh stdout: ' + data);
//  });

//  vpn.stderr.on('data', function (data) {
//    console.log('start_vpn.sh stderr: ' + data);
//    vpn_error = "data"
//  });

//  vpn.on('close', function (code) {
//    console.log('start_vpn.sh process exited with code ' + code);
//  });

    // redirect to the home-o-the-puck

    var vpn_home = "/vpn.html"
    res.header('Location', vpn_home);
    res.send(302);
    return next(false);
}


/**
 * Replaces a Puck completely
 */
function putPuck(req, res, next) {
    if (!req.params.value) {
        req.log.warn({params: req.params}, 'putPuck: missing value');
        next(new MissingValueError());
        return;
    }

    req.log.warn({params: req.params}, 'putPuck: not implemented');
    next(new NotImplementedError());
    return;
}


//
// ... zen added
//

function back_to_home (res) {
    var home = "/puck.html"
    res.statusCode = 302;
    res.setHeader("Location", home)
    res.end()
}

// this... unfortunately... is mine
function handleForm(req, res, next) {

    // console.log('handle form called with' + req.params)

    console.log('handle form')
    // console.log(req.params)

    if (typeof req.params.puck_action === 'undefined' || req.params.puck_action == "") {
        console.log("error... unrecognized action: " + req.params.puck_action);
    }

    else if (req.params.puck_action == 'CREATE') {
        formCreate(req, res, next)
    }

    else if (req.params.puck_action == 'DELETE') {
        formDelete(req, res, next)
    }
    // errror
    else {
        console.log("error... unrecognized action: " + req.params.action);
    }

back_to_home(res)

}

function formDelete(req, res, next) {

    console.log("deleting puck...")
    console.log(req.params.puckid)
    // script below needs: puck-id

    // have to have these
    var puckid = req.params.puckid

    // TODO - figure out how/create some global vars to read in
    var puck_fs_home = __dirname

    //
    // execute a shell script with appropriate args to create a puck.
    // ... of course... maybe should be done in node/js anyway...
    // have to ponder some imponderables....
    //
    var util  = require('util')
    var spawn = require('child_process').spawn

    // this simply takes the pwd and finds the exe area... really 
    // want to use a reasonable puck home here!
    console.log(puck_fs_home + '/../exe/delete_puck.sh', [puckid])
    var pucky = spawn(puck_fs_home + '/../exe/delete_puck.sh', [puckid])

    // now slice and dice output, errors, etc.
    pucky.stdout.on('data', function (data) {
      console.log('delete_puck.sh stdout: ' + data);
    });

    pucky.stderr.on('data', function (data) {
      console.log('delete_puck.sh stderr: ' + data);
    });

    pucky.on('exit', function (code) {
      console.log('delete_puck.sh process exited with code ' + code);
    });

}


function httpsPing(ipaddr, res, next) {

   var https    = require('https')

   console.log("pinging... " + ipaddr)

   // xxx - read port/+ from conf...!
   var url = 'https://' + ipaddr + ':8080/ping'

   https.get(url, function(resget) {
      console.log("statusCode: ", resget.statusCode);
      console.log("headers: ", resget.headers);

      resget.on('data', function(d) {
         console.log('ping werx')
         process.stdout.write(d);
         // {"status":"OK","name":"?","pid":"0FE4224CBE3E238BB06097192E424258D125626A"}Object null  HTTP/1.1
         var response = {status: "OK", "name": d.name, "pid": d.pid}

         res.send(200, response)
         next();
      })

   }).on('error', function(e) {
      console.log('sping dead')
      console.error(e);
      var response = {status: "OK", "name": 'err', "pid": 'errxxx'}
      res.send(200, response)
      next();
   })

}

//
// promise her anything... buy her a chicken.  A json chicken, of course.
//
function someday_get_https(url) {

    console.log('someday... I will get get_https ' + url)

    var Q        = require('q')
    var deferred = Q.defer();
    var https    = require('https')

    https.get(url, function(res) {
        res.on('error', function(e) {
            console.log("Erz: " + e.message);
        })
        res.on('data', function(data) {
            console.log("... data is in...!")
            var res = decoder.write(data)
            deferred.resolve(res)
        })
    })

    return deferred.promise;

}



function formCreate(req, res, next) {

    console.log("creating puck...")

    // have to have these
    var ip_addr = req.params.ip_addr

    console.log(ip_addr)

    var url = 'https://' + ip_addr + ':8080/ping'

    console.log('get_https ' + url)

    // is it a puck?
    someday_get_https(url)
        .done(function(res) {

            // console.log(res)

            if (res.indexOf("was not found") != -1) {
                console.log('no woman no ping: ' + res)
            }
            else {
                console.log('ping sez yes')
                console.log(res)

                console.log('starting... writing...')
                // make the puck's dir... should not exist!

                res = JSON.parse(res)
                // now get remote information
                url = 'https://' + ip_addr + ':8080/puck/' + res.pid

                var puck_dir = config.PUCK.keystore + '/' + res.pid

                fs.mkdir(puck_dir, function(err){
                    if(err) {
                        // xxx - user error, bail
                        console.log(e);
                    }
                });

                // if successful, write appropriate data
                someday_get_https(url)
                    .done(function(res) {

                        res = JSON.parse(res)
                        console.log('remote puck info in...!')

                        // console.log(res);

                        // write the key stuff to the FS

                        var ca   = res.PUCK.vpn_client.ca.join('\n')
                        var key  = res.PUCK.vpn_client.key.join('\n')
                        var cert = res.PUCK.vpn_client.cert.join('\n')
                        // var dh   = res.PUCK.vpn_client.dh.join('\n')
                        // var tls  = res.PUCK.vpn_client.tlsauth.join('\n')

                        // xxx - errs to user!
                        fs.writeFile(puck_dir + '/puck.pid', res.PUCK['PUCK-ID'], function(err) {
                            if (err) { console.log('err: ' + err) }
                            else { console.log('wrote pid') }
                        });
                        fs.writeFile(puck_dir + '/puckroot.crt', ca, function(err) {
                            if (err) { console.log('err: ' + err) }
                            else { console.log('wrote root crt') }
                        });
                        fs.writeFile(puck_dir + '/puck.key', key, function(err) {
                            if (err) { console.log('err: ' + err) }
                            else { console.log('wrote key') }
                        });
                        fs.writeFile(puck_dir + '/puck.crt', cert, function(err) {
                            if (err) { console.log('err: ' + err) }
                            else { console.log('wrote crt') }
                        });
                        // fs.writeFile(puck_dir + '/ta.key', tls, function(err) {
                        //     if (err) { console.log('err: ' + err) }
                        //     else { console.log('wrote tlsauth') }
                        // });
                        // fs.writeFile(puck_dir + '/dh.params', dh, function(err) {
                        //     if (err) { console.log('err: ' + err) }
                        //     else { console.log('wrote dh') }
                        // });

                        // now actually create the PUCK
                        // puck-id picture IP-addr owner email

                        //
                        // PUCK: 
                        //    { name: '?',
                        //    'PUCK-ID': '1FCF1073DBB25FD0DB535403741F23913DFD7FA2',
                        //    image: 'img/puck.png',
                        //    ip_addr: '192.168.0.138',
                        //    ip_addr_vpn: '192.168.0.138',
                        //    owner: { name: '?', email: 'puck@example.com' },

                        var puck_fs_home = __dirname

                        //
                        // execute a shell script with appropriate args to create a puck.
                        // ... of course... maybe should be done in node/js anyway...
                        // have to ponder some imponderables....
                        //
                        var util  = require('util')
                        var spawn = require('child_process').spawn

                        // this simply takes the pwd and finds the exe area...

                            console.log(puck_fs_home + '/../exe/create_puck.sh',   [res.PUCK['PUCK-ID'], res.PUCK.image, res.PUCK.ip_addr, res.PUCK.owner.name, res.PUCK.owner.email])
                        var pucky = spawn(puck_fs_home + '/../exe/create_puck.sh', [res.PUCK['PUCK-ID'], res.PUCK.image, res.PUCK.ip_addr, res.PUCK.owner.name, res.PUCK.owner.email])

                        // now slice and dice output, errors, etc.
                        pucky.stdout.on('data', function (data) {
                            console.log('create_puck.sh stdout: ' + data);
                        });

                        pucky.stderr.on('data', function (data) {
                            console.log('create_puck.sh stderr: ' + data);
                        });

                        pucky.on('exit', function (code) {
                            console.log('create_puck.sh process exited with code ' + code);
                        });

                    })
                }
        })


}
  

///--- API

/**
 * Returns a server with all routes defined on it
 */
function createServer(options) {

    assert.object(options, 'options');
    assert.object(options.log, 'options.log');

    // Cert stuff
    var key  = fs.readFileSync("/etc/puck/pucks/PUCK/puck.key")
    var cert = fs.readFileSync("/etc/puck/pucks/PUCK/puck.crt")

    // Create a server with our logger and custom formatter
    // Note that 'version' means all routes will default to
    // 1.0.0
    var server = restify.createServer({
	certificate : cert,
	key         : key,
	puck_id     : puck_id,
        log         : options.log,
        name        : 'PuckApp',
        version     : '0.0.2',
        formatters: {
            'application/puck; q=0.9': formatPuck
        }
    });

    // Ensure we don't drop data on uploads
    server.pre(restify.pre.pause());

    // Clean up sloppy paths like //puck//////1//
    server.pre(restify.pre.sanitizePath());

    // Handles annoying user agents (curl)
    server.pre(restify.pre.userAgentConnection());

    // Set a per request bunyan logger (with requestid filled in)
    server.use(restify.requestLogger());

    // Allow 5 requests/second by IP, and burst to 10
    server.use(restify.throttle({
        burst: 99,
        rate: 99,
        ip: true,
    }));

    // Use the common stuff you probably want
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser());

    // zen
    server.use(restify.CORS());
    server.use(restify.fullResponse());

    // Now our own handlers for authentication/authorization
    // Here we only use basic auth, but really you should look
    // at https://github.com/joyent/node-http-signature
    server.use(function setup(req, res, next) {
        req.dir = options.directory;
        if (options.user && options.password) {
            req.allow = {
                user: options.user,
                password: options.password
            };
        }
        next();
    });
    server.use(authenticate);


    /// Now the real handlers. Here we just CRUD on Puck blobs

    server.post('/puck', createPuck);
    server.get('/puck', listPucks);
    server.head('/puck', listPucks);

    // Ping action
    server.get('/ping', echoReply);
    server.get('/ping/:key', echoStatus);

   // cuz ajax doesn't like to https other sites...
    server.get('/sping/:key', function (req, res, next) {
        console.log('spinging')
        httpsPing(req.params.key, res, next)
    });


    // Start the OpenVPN server locally. Return OK if we succeed.
    server.get('/startVPN', startVPN);

    // Return a Puck by key

    server.get('/puck/:key', getPuck);
    server.head('/puck/:key', getPuck);

    // Overwrite a complete Puck - here we require that the body
    // be JSON - otherwise the caller will get a 415 if they try
    // to send a different type
    // With the body parser, req.body will be the fully JSON
    // parsed document, so we just need to serialize and save
    server.put({
        path: '/puck/:key',
        contentType: 'application/json'
    }, putPuck);

    // Delete a Puck by key
    server.del('/puck/:key', deletePuck);

    // Destroy everything
    server.del('/puck', deleteAll, function respond(req, res, next) {
        res.send(204);
        next();
    });


    // Register a default '/' handler

    server.get('/', function root(req, res, next) {
        var routes = [
            'GET     /',
            'POST    /puck',
            'GET     /puck',
            'DELETE  /puck',
            'PUT     /puck/:key',
            'GET     /puck/:key',
            'DELETE  /puck/:key',
            'GET     /ping',
            'GET     /ping/:key',
            'GET     /sping/:key',
            'GET     /startVPN',
        ];
        res.send(200, routes);
        next();
    });

    server.del('/puck/:key', deletePuck);


    /// zen....
    server.post('/form', handleForm);

    server.post('/VPN', startVPN2);

    server.get(".*", restify.serveStatic({ 
      directory: './public', 
      default: 'index.html' 
    }));

    // EOZen


    // Setup an audit logger
    if (!options.noAudit) {
        server.on('after', restify.auditLogger({
            body: true,
            log: bunyan.createLogger({
                level: 'info',
                name: 'PuckApp-audit',
                stream: process.stdout
            })
        }));
    }

    return (server);
}



///--- Exports

module.exports = {
    createServer: createServer
}
