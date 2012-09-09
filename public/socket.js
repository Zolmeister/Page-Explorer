function sendChat(s){
    socket.emit('chat',{text:s,x:me.x,y:me.y, name:name});
}
function drawOthers(){
    for(var i in others){
        otherPhysics(others[i]);
        others[i].ctx.clearRect(0,0,500,500);
        bodyCtx.clearRect(others[i].me.x-70,others[i].me.y-70,others[i].me.width+140,others[i].me.height+140);
        if(others[i].queue.length<2){
        
        }
    else if(sameFrame(others[i].queue[1],others[i].queue[0])){
        others[i].queue.splice(0,1);
    }
    else{
        for(var j in others[i].queue[0]){
            var curS=others[i].queue[0][j];
            var tarS=others[i].queue[1][j];//have to align within 60 frames
            var xDistance=curS.x-tarS.x;
            var yDistance=curS.y-tarS.y;
            var rotDistance=curS.rot-tarS.rot;
            var framesLeft=10-others[i].currentFrame%10;
            if(curS.x!=tarS.x)
                curS.x+=xDistance/framesLeft*-1;
            if(curS.y!=tarS.y)
                curS.y+=yDistance/framesLeft*-1;
            if(curS.rot!=tarS.rot)
                curS.rot+=rotDistance/framesLeft*-1;
            if(framesLeft<1){
                curS.y=tarS.y;
                curS.x=tarS.x;
                curS.rot=tarS.rot;
            }
        }
    }
    others[i].currentFrame++;
    }
    
    for(var i in others){
        drawName(others[i].name, others[i].me);
        var tempHat=myHat;
        myHat=others[i].hat;
        drawSkeleton(others[i].queue[0],others[i].ctx);
        myHat=tempHat;
        var sourceX = 260;
        var sourceY = 200;
        var sourceWidth = 500-sourceX;
        var sourceHeight = 500-sourceY;
        var destX = others[i].me.x;
        var destY = others[i].me.y;
        var maxX=1;
        var maxY=1;
        for(var j in others[i].queue[0]){
            var q=others[i].queue[0][j]
            if(q.x<sourceX)
                sourceX=q.x;
            if(q.y<sourceY)
                sourceY=q.y;
            if(q.y>maxY)
                maxY=q.y;
            if(q.x>maxX)
                maxX=q.x;
        }
        sourceWidth=maxX-sourceX;
        sourceHeight=maxY-sourceY;
         sourceY-=135;
        if(sourceY<0)
            sourceY=0;
        sourceX-=50;
        if(sourceX<0)
            sourceX=0;
        sourceWidth+=20+57;
        sourceHeight+=65+50+40;
        var destWidth = sourceWidth/2.5;
        var destHeight = sourceHeight/2.5;
        others[i].me.width=destWidth;
        others[i].me.height=destHeight;
        if(others[i].me.dir=="right"){
            bodyCtx.save();
            bodyCtx.scale(-1, 1);
            bodyCtx.drawImage(others[i].canv, sourceX, sourceY, sourceWidth, sourceHeight, -destX-destWidth, destY, destWidth, destHeight)
            bodyCtx.restore();
        }
        else
            bodyCtx.drawImage(others[i].canv, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight)

    }
}


function otherPhysics(other){
    if(other.keysPressed[37]){//left
        other.me.x-=3*deltaTime;
    }
    else if(other.keysPressed[39]){//right
        other.me.x+=3*deltaTime;
    }

    if(other.climbing){
        other.grav=Math.abs(other.grav);
        other.grav=2.0;
        other.me.y-=other.grav*deltaTime;
    }
    else{
        other.grav=Math.min(other.grav,15);
        other.me.y+=other.grav*deltaTime;
        if(other.grav>0){
            for(var i=0;i<blocks.length;i++){
                if(blocks[i].type=="horiz" && isCollideBot(blocks[i], other.me)){
                    //while(isCollideBot(blocks[i], other.me))
                        other.me.y-=other.grav*deltaTime;
                    other.grav=1;
                    other.jumping=false;
                    break;
                }
            }
        }
        other.grav+=.5*deltaTime;
    }
}

function init(){
    socket = io.connect('http://explorer.zolmeister.com/');
    socket.emit('join', window.location.host);
    loadAssets(anim);
    gatherBlocks();
    drawBlocks(bgCtx,blocks);
    playQueue=clone(playQueue.concat(animationsObj["stand"]));
    updatedQueue();
    socket.on('updateQueue', function (data) {
        var id=data.id;
        if(!others[id]){
            others[id]={};
            var canv=document.createElement("canvas");
            canv.height=500;
            canv.width=500;
            var ctx=canv.getContext("2d");
            others[id].ctx=ctx;
            others[id].canv=canv;
        }
        others[id].queue=JSON.parse(data.q);
        var me=data.me;
        others[id].me=me;
        others[id].grav=data.grav;
        others[id].keysPressed=data.keysPressed;
        others[id].jumping=data.jumping;
        others[id].climbing=data.climbing;
        others[id].currentFrame=data.currentFrame;
        others[id].name=data.name;
        others[id].hat=data.hat;
    });

    socket.on('removePlayer',function(data){
        delete others[data];
    })

    socket.on('chat',function(data){
        data.life=150;
        chats.push(data);
    })
};
function loadCheck(){
    if(document.readyState === "complete" && io){
        init();
    }
    else{
        setTimeout(loadCheck, 100);
    }

}
setTimeout(loadCheck, 100)
window.onload=init;