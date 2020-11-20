var c, ctx, game;

function Link( dial1, pos1, dial2, pos2)
{
  this.source = function() { return dial1.getItem( pos1); }
  this.target = function() { return dial2.getItem( pos2); }
}

function Item( value, parent) {
  this.value = value;
  this.parent = parent;
}

function Dial( itemValues, x, y, radius) {
  this.itemCount = itemValues.length;
  this.linkCount = 0;
  this.items = [];
  this.links = [];
  this.animation = 0;
  this.x = x;
  this.y = y;
  this.radius = radius;

  for( var i=0; i<itemValues.length; i++)
    this.items.push( new Item( itemValues[i], this));

  this.getItem = function( index) {
    return this.items[ index];
  }

  this.addLink = function( link) {
    this.linkCount++;
    this.links.push( link);
  }

  this.getLink = function( index) {
    return this.links[ index];
  }

  this.rotate = function( clockwise)
  {
    if( this.animation != 0)
      return;

    if( clockwise === true)
    {
      this.items.unshift( this.items.pop());
      this.animation = 100;
    } else {
      this.items.push( this.items.shift());
      this.animation = -100;
    }
  }

  this.toString = function()
  {
    var str = "";

    for( var i=0; i<this.itemCount; i++)
      str += this.getItem( i).value + " ";

    return str;
  }

  this.update = function() {
    if( this.animation > 0)
      this.animation = Math.max( this.animation-game.speed, 0);
    else if( this.animation < 0)
      this.animation = Math.min( this.animation+game.speed, 0);
  }
}

function Dials() {
  this.dials = [];
  this.dialCount = 0;

  this.addDial = function( dial) {
    this.dials.push( dial);
    this.dialCount++;
  }

  this.getDial = function( index) {
    return this.dials[ index];
  }

  this.toString = function() {
    var str = "";

    for( var i=0; i<this.dialCount; i++)
      str += this.getDial( i).toString() + "\n";

    return str;
  }
}

function Game( scale) {
  this.dials = new Dials();
  this.scale = scale;
  this.itemSize = 2.5;
  this.speed = 5;

  this.colours = [ "rgb(145, 106, 106)", "#A593AF", "rgb(145, 106, 106)", "#FF0", "#F0F", "#0FF"];

  this.addDial = function( dial) {
    this.dials.addDial( dial);
  }

  this.getDial = function( index) {
    return this.dials.getDial( index);
  }

  this.addLink = function( dial1, pos1, dial2, pos2) {
    dial1.addLink( new Link( dial1, pos1, dial2, pos2));
    dial2.addLink( new Link( dial2, pos2, dial1, pos1));

    dial2.getItem( pos2).value = dial1.getItem( pos1).value;
  }

  this.toString = function() {
    return this.dials.toString();
  }

  this.getDialCount = function() {
    return this.dials.dialCount;
  }

  this.rotate = function( dial, clockwise)
  {
    dial.rotate( clockwise);
    this.animation = 100;

    for( var i=0; i<dial.linkCount; i++)
    {
      dial.getLink( i).target().value = dial.getLink( i).source().value;
    }
  }

  this.update = function() {
    for( var i=0; i<this.dials.dialCount; i++)
      this.getDial( i).update();
  }

  this.isAnimating = function() {

    for( var i=0; i<this.dials.dialCount; i++)
      if( this.getDial( i).animation != 0) return true;

    return false;
  }

  this.getAnimating = function()
  {
    for( var i=0; i<this.dials.dialCount; i++)
      if( this.getDial( i).animation != 0) return this.getDial( i); 

    return null;
  }
}

function init()
{
  // Controller bits

  document.getElementById('rotate1cw').onclick = function() { game.rotate( game.getDial( 0), true); };
  document.getElementById('rotate1ccw').onclick = function() { game.rotate( game.getDial( 0), false); };
  document.getElementById('rotate2cw').onclick = function() { game.rotate( game.getDial( 1), true); };
  document.getElementById('rotate2ccw').onclick = function() { game.rotate( game.getDial( 1), false); };
  document.getElementById('rotate3cw').onclick = function() { game.rotate( game.getDial( 2), true); };
  document.getElementById('rotate3ccw').onclick = function() { game.rotate( game.getDial( 2), false); };

  // --

  game = new Game();

  c = document.getElementById( 'buck');
  ctx = c.getContext("2d");
  game.scale =  7;
  
  game.addDial( new Dial( [1,1,1,1,1,1], 30, 20, 10));
  game.addDial( new Dial( [2,2,2,2,2,2], 38.7, 25, 10));
  game.addDial( new Dial( [2,1,1,2,1,2], 30, 30, 10));

  game.addLink( game.getDial( 0), 1, game.getDial( 1), 0);
  game.addLink( game.getDial( 0), 3, game.getDial( 1), 4);

  game.addLink( game.getDial( 0), 2, game.getDial( 2), 1);
  game.addLink( game.getDial( 0), 4, game.getDial( 2), 5);

  game.addLink( game.getDial( 1), 3, game.getDial( 2), 2);
  game.addLink( game.getDial( 1), 5, game.getDial( 2), 0);


  //game.addLink( game.getDial( 0), 2, game.getDial( 1), 6);

  setInterval( update, 1000/60);
}

// View

function update()
{
  game.update();
  draw();
}

function drawItem( ctx, colour)
{

  var size = game.itemSize * game.scale;

  ctx.fillStyle = colour;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = .3*game.scale;
  ctx.beginPath();
  ctx.arc(-size/2, -size/2, size, 0, Math.PI*2, true); 
  //ctx.arc( -game.itemSize*game.scale, -1*game.itemSize*game.scale, game.itemSize*scale, 0, Math.PI*2, true); 
  //ctx.arc( -1*game.itemSize*game.scale, -1*game.itemSize*game.scale, game.itemSize*scale, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba( 255, 255, 255, 0.5)"
  ctx.beginPath();
  ctx.arc(-size/2 + size/4, -size/2 - size/4, size/2, 0, Math.PI*2, true); 
  //ctx.arc( -game.itemSize*game.scale + game.itemSize*game.scale/2, -game.itemSize*game.scale - game.itemSize*game.scale/2, game.itemSize*game.scale/2, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}

function draw()
{
  c.width = game.scale * 100;
  c.height = game.scale * 50;

  ctx.fillStyle = "rgb(31, 27, 37)";
  ctx.fillRect( 0, 0, c.width, c.height);

  for( var d=0; d<game.getDialCount(); d++)
  {
    var dial = game.getDial( d);
    var stepSize = 360/dial.itemCount;

    for( var i=0; i<dial.itemCount; i++)
    {
      ctx.save();

      ctx.translate( dial.x*game.scale, dial.y*game.scale);

      ctx.fillStyle = '#000';

      ctx.rotate( ( (stepSize * i) - (dial.animation * (stepSize/100))) * Math.PI / 180);
      ctx.translate( 0, -dial.radius*game.scale);
      ctx.rotate( ( (stepSize * i) - (dial.animation * (stepSize/100))) * -Math.PI / 180);

      // Are we to draw or not to draw?

      var toDraw = true;
      for( var l=0; l<dial.linkCount; l++)
      {
        if( (dial.getLink( l).target().parent.animation != 0) && (dial.getLink( l).source() === dial.getItem( i)))
          toDraw = false;
      }

      if( toDraw)
        drawItem( ctx, game.colours[ dial.getItem( i).value]);

      ctx.restore();
    }
  }
}