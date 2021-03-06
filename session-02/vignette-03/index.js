var express = require('express')
var app = express();
var server = require('http').Server(app)
var io = require('socket.io')(server);
var ip = require('ip')

var sockets = []

const validActions = ['U', 'R', 'D', 'L'];

// Make static assets available at the /static endpoint.
app.use('/static', express.static('assets'));

// Serve index.html when the request comes in
app.get('/', (req, res) => {
    console.log('[request] \t GET \t received a get request.');
    res.sendFile(__dirname + '/index.html');
});


// Listen for updates!
app.post('/', (req, res) => {

    if (typeof req.headers.action !== 'undefined' && validActions.indexOf(req.headers.action) !== -1) {

        io.emit('update', {direction: req.headers.action});
        console.log('[update] \t POST \t received an ' + req.headers.action +'.');
        res.json({"success": true, "message": 'You sent ' + req.headers.action + '!' });

    } else if (typeof req.headers.action !== 'undefined') {

        console.log('[update] \t POST \t received an invalid action (' + req.headers.action + ').');
        res.json({"success": false, "message": 'You sent an invalid action (' + req.headers.action + ').' });

    } else {

        console.log('[update] \t POST \t received an action-less request.');
        res.json({"success": false, "message": 'You didn\'t send an action!' });

    }

});



// Send the IP address of the server to the client, so we can display where
// People should connect.
io.on('connection', (socket) => { socket.emit('ip', {ip: ip.address()}); });


server.listen(8080)
