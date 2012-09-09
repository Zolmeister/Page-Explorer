
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
io.set('log level', 1);
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/bookmark', routes.bookmark);

app.listen(3003);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var players={};
io.sockets.on('connection', function (socket) {
  players[socket.id]={};
  players[socket.id].update=[];
  players[socket.id].room="none";
  players[socket.id].socket=socket;
  socket.on('join', function (data){
      players[socket.id].room=data;
        socket.on('updateQueue', function (data) {
            data.id=socket.id;
            players[socket.id].update=[data];
            /*setTimeout(function(){
            socket.broadcast.emit('updateQueue',data);  
            },100)*/

        });
        
        socket.on('chat',function(data){
            for(var i in players){
                if(players[i].room==players[socket.id].room){
                    players[i].socket.emit("chat",data);
                }
                
            }
        })
  
  })
  
  socket.on('disconnect', function(){
      for(var i in players){
          if(players[i].room==players[socket.id].room){
            try{
                players[i].socket.emit('removePlayer',socket.id);
            }
            catch(e){

            }
          }
          
      }
      delete players[socket.id];
  });
});
function tick(){
  for(var i in players){
      if(players[i].update.length>0){
          for(var ii in players){
              if(players[i].room==players[ii].room && i!=ii)
                players[ii].socket.emit('updateQueue', players[i].update[0])
        }
      }
      players[i].update=[];
      //updates[i][0].broadcast.emit('updateQueue', updates[i][1])
  }
  setTimeout(tick,33);
}
tick();