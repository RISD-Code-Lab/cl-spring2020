// Script

/**
 * Create a Socket IO connection looking at localhost
 * // NOTE: Brittle, This wont work if the server is running anywhere other
 * than your computer.
 * // TODO: Fix, get the URL from window.location, rather than hardcode.
 */
var socket = io.connect('http://localhost:8080');


/**
 * Player object starts out with an initial x and y position in viewport
 * units, 0 dx and dy velocity, and a constant width and height in viewport units.
 * // NOTE: units, all units are viewport units.
 */
var player = {id:"player", type: "player", display: "centered", x: 50, y: 90, dx: 0, dy: 0, w: 1.5, h: 1.5};


var game = [
    {id: "goal", type: "goal", display: "centered", x: 50, y: 10, w: 1.5, h: 1.5},
    {id: "block-A", type: "wall", x: 10, y: 45, w: 55, h: 5},
    {id: "block-B", type: "wall", x: 55, y: 65, w: 35, h: 10}
];

const framerate = 30;
const increment = 0.005;
const indicators = true;
var count = 0;

socket.on('ip', function( data ) {
    $(document).ready(function() {
        $('#connection-info').text("🕹️ " + data.ip + ":" + window.location.port + "");
    })
});

function viewportMin(object) {
    return Math.min(object.w, object.h) + ((object.w > object.h) ? 'vh' : 'vw');
}

function create(object) {
    var element = $('<div>')
        .attr( 'id', object.id)
        .addClass(object.type)
        .css('top', object.y + 'vh')
        .css('left', object.x + 'vw')
        .css('width', (object.display === "centered") ? viewportMin(object) : object.w + 'vw' )
        .css('height', (object.display === "centered") ? viewportMin(object) : object.h + 'vh' )
        .css('transition-duration', (1000 / framerate) + 'ms');

    $('body').append(element).addClass('running')
}

function update(object) {
    // Update State with current dx
    object.x = object.x + object.dx;
    object.y = object.y + object.dy;

    // Optionally decay dx and dy?

    // Draw update
    $('.player')
        .css('top', object.y + 'vh')
        .css('left', object.x + 'vw');

    if (indicators && (object.dx != 0 || object.dy != 0) && count % 100 == 0) {
        var indicator = $('<div>')
            .addClass('indicator')
            .css('top', object.y + 'vh')
            .css('left', object.x + 'vw');

        $('body').append(indicator);

        count = 1;
    }

    count += 1;

}


function setup() {
    /**
     * Create the player object.
     */
    create(player);

    /**
     * For each object on the game board, create it.
     */
    game.forEach(create);

}


function intersects(player, object) {
    var player_min_x = player.x - player.w / 2
    var player_max_x = player.x + player.w / 2
    var player_min_y = player.y - player.h / 2
    var player_max_y = player.y + player.h / 2

    if ( object.display === "centered" ) {
        var object_min_x = object.x - object.w / 2
        var object_max_x = object.x + object.w / 2
        var object_min_y = object.y - object.h / 2
        var object_max_y = object.y + object.h / 2
    } else {
        var object_min_x = object.x
        var object_max_x = object.x + object.w
        var object_min_y = object.y
        var object_max_y = object.y + object.h
    }

    var in_bounds_x =  player_min_x <= object_max_x && player_min_x >= object_min_x
                    || player_max_x <= object_max_x && player_max_x >= object_min_x

    var in_bounds_y = player_min_y <= object_max_y && player_min_y >= object_min_y
                   || player_max_y <= object_max_y && player_max_y >= object_min_y

    return in_bounds_x && in_bounds_y;
}

function check(player, game) {

    var state = game.reduce(function(state, object) {

        state.over = state.over || intersects(player, object)
        state.win = state.win || state.over && object.type == "goal";

        return state

    }, {over: false, win: false});

    if (state.over) {
        $('body').removeClass('running').addClass((state.win) ? "win" : "loss");
        console.log(player);
        console.log(game);
    }
}


function step(timestamp) {
    /**
     * Update the player's position based on the
     * player's current velocity.
     */
    update(player);

    /**
     * Check to see if the player has intersected with
     * any of the goals, or hit any obstacles.
     */
    check(player, game);

    /**
     * If the game's not over, step the game forward for one frame,
     * according to the preferred framerate.
     */
    if ( $('body').hasClass('running') ) {
        window.setTimeout( function() {
            window.requestAnimationFrame(step);
        }, 1000 / framerate)
    }
}


function mapPropertyToIncrement(property, mapping) {
    // Accellerate up
    if (property == mapping[0]) { player.dy -= increment; }

    // Accellerate right
    else if (property == mapping[1]) { player.dx += increment;}

    // Accellerate down
    else if (property == mapping[2]) { player.dy += increment;}

    // Accellerate left
    else if (property == mapping[3]) {player.dx -= increment;}
}



$(document).ready(function() {

    setup();

    window.requestAnimationFrame(step);

    $("body").keyup((e) => mapPropertyToIncrement(e.which, [38, 39, 40, 37]));

    socket.on('update', (data) => mapPropertyToIncrement(data.direction, ['U', 'R', 'D', 'L']));

});
