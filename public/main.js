function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function playFrames(){
    for(var i in animationsObj[frameName.value])
        playQueue.push(clone(animationsObj[frameName.value][i]));
    updatedQueue();
}
function sameFrame(f1, f2){
    for(var i in f1){
        var curS=f1[i];
        var tarS=f2[i];
        if(curS.x!=tarS.x)
            return false;
        if(curS.y!=tarS.y)
            return false;
    }
    return true;
}
function movePlay(){
    if(playQueue.length<2){
        playing=false;
    //console.log("stopped playing");
    }
    else if(sameFrame(playQueue[1],playQueue[0])){
        playQueue.splice(0,1);
        updatedQueue();
    }
    else{
        for(var i in playQueue[0]){
            var curS=playQueue[0][i];
            var tarS=playQueue[1][i];//have to align within 60 frames
            var xDistance=curS.x-tarS.x;
            var yDistance=curS.y-tarS.y;
            var rotDistance=curS.rot-tarS.rot;
            var framesLeft=10-currentFrame%10;
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
        
}
function play(){
    playing=true;
    currentFrame=0;
//console.log(playQueue);
}
function drawSkeleton(skeleton, ctx){
    drawBone(skeleton[0], skeleton, ctx);
}
function getDistance(point1,point2){
    var xs = 0;
    var ys = 0;
    xs = point2.x - point1.x;
    xs = xs * xs;
    ys = point2.y - point1.y;
    ys = ys * ys;
    return Math.sqrt( xs + ys );
}
function drawBone(bone, skeleton, ctx){
    if(!bone.skin.self){
        if(bone.skin.bone && bone.skin.bone.indexOf("thigh")!=-1 || bone.name=="root"){
            var img=assets["joint"];
            var x=bone.x-1;
            var y=bone.y;
            var tempCanvas=document.createElement("canvas");
            var tempCtx=tempCanvas.getContext("2d");
            img.width=23;
            img.height=23;
            tempCanvas.width=img.width;
            tempCanvas.height=img.height;
            tempCtx.drawImage(img,0,0, img.width, img.height);
            drawRotatedImage(tempCanvas, x, y, bone.rot, ctx);
        }
        else if(bone.skin.bone && bone.skin.bone.indexOf("arm")!=-1){
            var img=assets["joint2"];
            var x=bone.x;
            var y=bone.y;
            var tempCanvas=document.createElement("canvas");
            var tempCtx=tempCanvas.getContext("2d");
            img.width=20;
            img.height=20;
            tempCanvas.width=img.width;
            tempCanvas.height=img.height;
            tempCtx.drawImage(img,0,0, img.width, img.height);
            drawRotatedImage(tempCanvas, x, y, bone.rot, ctx);
        }
    }
    if(bone.skin.bone && bone.parent!=-1){
        var parent=skeleton[bone.parent];
        var img=assets[bone.skin.bone];
        var x=parent.x-(parent.x-bone.x)/2;
        if(img.name.indexOf("foot")!=-1)
            x+=0;
        var y=parent.y-(parent.y-bone.y)/2;
        var deltaY=bone.y-parent.y;
        var deltaX=bone.x-parent.x;
        //resize image
        var distance=getDistance(bone, parent);
        if(img.name.indexOf("foot")!=-1)
            distance+=25;
        var tempCanvas=document.createElement("canvas");
        var tempCtx=tempCanvas.getContext("2d");
        tempCanvas.width=distance;
        tempCanvas.height=img.height;
        tempCtx.drawImage(img,0,0, distance, img.height);
        
        var rot=Math.atan2(deltaX,deltaY)*-1+Math.PI/2;
        bone.rotSkin=rot;
        //if(img.name.indexOf("foot")!=-1){
            //drawRotatedImage(tempCanvas, x+15, y, rot, ctx);
       // }else{
            drawRotatedImage(tempCanvas, x, y, rot, ctx);
        //}
        
    }
    if(bone.skin.self){
        if(bone.skin.self.name.indexOf("head")!=-1){
           bone.skin.self.x=-12;
           bone.skin.self.y=-62;
        }
        var img=assets[bone.skin.self.name];
        var x=bone.x+bone.skin.self.x;
        var y=bone.y+bone.skin.self.y;
        
        var tempCanvas=document.createElement("canvas");
        var tempCtx=tempCanvas.getContext("2d");
        tempCanvas.width=img.width;
        tempCanvas.height=img.height;
        tempCtx.drawImage(img,0,0, img.width, img.height);
            
        if(bone.skin.self.name.indexOf("hand")!=-1){
                bone.rotSkin+=1.5;
                //bone.rot=skeleton[bone.parent].rot
                //console.log(skeleton[bone.parent].rot)
            }
            else
                bone.rotSkin=bone.rot+.5;
        
        drawRotatedImage(tempCanvas, x, y, bone.rotSkin, ctx);
        if(bone.skin.self.name=="head"){
            //var tempCanvas=mergeImg(img,assets["hat"+myHat]);
            var img=assets["hat"+myHat];
            var tempCanvas=document.createElement("canvas");
            var tempCtx=tempCanvas.getContext("2d");
            tempCanvas.width=img.width;
            tempCanvas.height=img.height;
            tempCtx.drawImage(img,0,0, img.width, img.height);
            drawRotatedImage(tempCanvas, x, y, bone.rotSkin, ctx);
        }
        //drawRotatedImage(img, x, y, bone.rot, ctx);
    /*ctx.strokeRect(x-img.width/2,y-img.height/2, img.width, img.height);
        ctx.strokeRect(x-img.width/2-3,y-img.height/2-3, 6, 6);
        ctx.strokeRect(x+img.width/2-3,y+img.height/2-3, 6, 6);
        ctx.strokeRect(x-img.width/2-3,y+img.height/2-3, 6, 6);
        ctx.strokeRect(x+img.width/2-3,y-img.height/2-3, 6, 6);*/
        
    }
    for(var i=bone.children.length-1;i>=0;i--){
        var child=skeleton[bone.children[i]];
        drawBone(child, skeleton, ctx);
        ctx.beginPath();
        ctx.moveTo(bone.x, bone.y);
        ctx.lineTo(child.x,child.y);
        if(showBone)
            ctx.stroke();
        
    }
    if(showBone)
        ctx.fillRect(bone.x-4,bone.y-4,8,8);
}
function drawRotatedImage(image, x, y, angle, context) { 
    context.save(); 
    context.translate(x, y);
    context.rotate(angle);
    try{
        context.drawImage(image, -(image.width/2), -(image.height/2));
    }
    catch(e){
        
    }
    context.restore(); 
}
function loadAssets(callback){
    assetCallback=callback;
    for(var i in assetsList){
        var asset=assetsList[i];
        assets[asset]=new Image();
        assets[asset].name=asset;
        assets[asset].onload=function(){
            if(this.name=="head" || this.name.indexOf("hat")!=-1){
               this.height=this.height/4;
               this.width=this.width/4; 
            }
            else{
               this.height=this.height/10;
               this.width=this.width/10; 
            }
            assetCount++;
            if(assetCount>=assetsList.length){
                assetCallback();
            }
        }
        assets[asset].src="http://explorer.zolmeister.com/"+asset+".png";
    }
}

function keyactions(){
    if(keysPressed[17] && !jumping){//ctrl
        playQueue=clone([playQueue[0]].concat(animationsObj["jump"]));
        playing=true;
        jumping=true;
        grav=-15;
        updatedQueue();
    }
    if(!jumping && !climbing){
        if(keysPressed[37]){//left
            playQueue=clone([playQueue[0]].concat(animationsObj["walk"]));
            playing=true;
            me.dir="left"
            updatedQueue();
        }
        else if(keysPressed[39]){//right
            playQueue=clone([playQueue[0]].concat(animationsObj["walk"]));
            playing=true;
            me.dir="right"
            updatedQueue();
        }
        else{
            playQueue=clone([playQueue[0]].concat(animationsObj["stand"]));
            playing=true;
            updatedQueue();
        }
        if(keysPressed[40]){//down
            passingThrough=true;
            me.y+=8;
            for(var i=0;i<blocks.length;i++){
                if(blocks[i].type=="horiz" && isCollideBot(blocks[i], me)){
                    jumping=true;
                    window.setTimeout(function(block){
                        passingThrough=false;
                    },150);
                    break;
                }
            }
            me.y-=8;
        }
    }
    else{
        if(keysPressed[37]){//left
            me.dir="left"
        }
        else if(keysPressed[39]){//right
            me.dir="right"
        }
        if(keysPressed[38] && !climbing){//up
            for(var i=0;i<blocks.length;i++){
                if(blocks[i].type=="horiz" && isCollideTop(blocks[i], me)){
                    while(isCollideTop(blocks[i], me))
                        me.y+=1;
                    me.y-=40;
                    playQueue=clone([playQueue[0]].concat(animationsObj["hang"]));
                    playQueue=clone(playQueue.concat(animationsObj["stand"]));
                    playing=true;
                    climbing=true;
                    updatedQueue();
                    window.setTimeout(function(){
                        climbing=false
                    },500);
                    break;
                }
            }
            
        }
    }
}

function drawName(name, me){
    try{
      name=name.substring(0,12);
      bodyCtx.fillText(name,me.x+me.width/2-name.length*10/4,me.y);  
    }
    catch(e){
        
    }
    
}
function chat(text, me, name){
    var oldFont=bodyCtx.font
    bodyCtx.font="20px Arial";
    bodyCtx.fillText(name+": "+text,me.x,me.y-30);
    bodyCtx.font=oldFont;
}

function drawChatBubbles(){
    var alive=[];
    for(var i in chats){
        if(chats[i].life>0){
            chats[i].life--;
            alive.push(chats[i]);
        }
    }
    for(var i in alive){
        chat(alive[i].text, {x:alive[i].x, y:alive[i].y}, alive[i].name);
    }
}

function anim(timestamp){
    requestAnimFrame(anim);
    
    deltaTime=(timestamp-lastTimestamp)/15;
    if(isNaN(deltaTime)){
        deltaTime=1;
    }
    lastTimestamp=timestamp;
    if(currentFrame%60==0)
        bodyCtx.clearRect(0,0,window.innerWidth,getDocHeight());
    else
        bodyCtx.clearRect(me.x-50,me.y-150,me.width+100,me.height+200);
    
     bodyCtx.clearRect(0,0,currentChat.length*10,10);
    bodyCtx.fillText(currentChat,10,10);
    
    if(!playing && playQueue.length>1){
        play();
    //console.log("playing");
    }
    if(!playing && !jumping){
        keyactions();
    }
    if(keysPressed[37]){//left
        me.x-=3*deltaTime;
    }
    else if(keysPressed[39]){//right
        me.x+=3*deltaTime;
    }
    if(playing){
        movePlay();
        playC.clearRect(0,0,500,500);
        //playC.fillRect(0,0,500,500);
        drawSkeleton(playQueue[0],playC);
    }
    if(climbing){
        //grav=Math.abs(grav);
        grav=2.0;
        me.y-=grav*deltaTime;
    }
    else{
        grav=Math.min(grav,15);
        var diff=Math.min(grav*deltaTime, 15);
        me.y+=diff;
        if(grav>0 && !passingThrough){
            for(var i=0;i<blocks.length;i++){
                if(blocks[i].type=="horiz" && isCollideBot(blocks[i], me)){
                    while(isCollideBot(blocks[i], me))
                        me.y-=diff;
                    grav=1;
                    jumping=false;
                    break;
                }
            }
        }
        grav+=.5*deltaTime;
    }
    var sourceX = 260;
    var sourceY = 200;
    var sourceWidth = 500-sourceX;
    var sourceHeight = 500-sourceY;
    var destX = me.x;
    var destY = me.y;
    var maxX=1;
    var maxY=1;
    for(var i in playQueue[0]){
        var q=playQueue[0][i]
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
    /*
    for(var i=0;i<blocks.length;i++){
        if(blocks[i].type=="virt" && (isCollideLeft(blocks[i], me) || isCollideRight(blocks[i], me))){
            while(isCollideLeft(blocks[i], me))
                me.x+=1;
            while(isCollideRight(blocks[i], me))
                me.x-=1;
            break;
        }
    }*/
    
    var destWidth = sourceWidth/2.5;
    var destHeight = sourceHeight/2.5;
    me.width=destWidth;
    me.height=destHeight;
    //drawBlocks(bodyCtx,blocks);
    if(me.height+me.y>getDocHeight()){
        me.x=0;
        me.y=0;
        me.dir="right";
        jumping=false;
        climbing=false;
        grav=1;
        updatedQueue();
    }
    drawOthers();
    drawChatBubbles();
    drawName(name, me);
    if(me.dir=="right"){
        bodyCtx.save();
        bodyCtx.scale(-1, 1);
        bodyCtx.drawImage(player, sourceX, sourceY, sourceWidth, sourceHeight, -destX-destWidth, destY, destWidth, destHeight)
        bodyCtx.restore();
    }
    else
        bodyCtx.drawImage(player, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight)
    currentFrame++;
}
//b must be player
function isCollideTop(a, b) {
    return !(
        ((a.y + a.height) < (b.y)) ||
        (a.y > (b.y + b.height/2)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width))
        );
}
function isCollideBot(a, b) {
    return !(
        ((a.y + a.height) < (b.y+b.height/1.16)) ||
        (a.y > (b.y + b.height)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width))
        );
}
function isCollideLeft(a, b) {
    return !(
        ((a.y + a.height) < (b.y+b.height/2)) ||
        (a.y > (b.y + b.height/2)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width/2))
        );
}
function isCollideRight(a, b) {
    return !(
        ((a.y + a.height) < (b.y+b.height/2)) ||
        (a.y > (b.y + b.height/2)) ||
        ((a.x + a.width/2) < b.x) ||
        (a.x > (b.x + b.width))
        );
}

function drawBlocks(ctx, blocks){
    var oldFill=ctx.strokeStyle;
    ctx.strokeStyle="#0F0";
    for(var i in blocks){
        ctx.strokeRect(blocks[i].x,blocks[i].y,blocks[i].width,blocks[i].height);
    }
    ctx.strokeStyle=oldFill;
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();

function findPos(obj,curleft,curtop){
    if(curleft==undefined)
        curleft=0;
    if(curtop==undefined)
        curtop=0;
    curleft += obj.offsetLeft;
    curtop += obj.offsetTop;
    if (obj.offsetParent!=null) {
        return findPos(obj.offsetParent,curleft,curtop)
    }
    return [curleft,curtop];
}

function gatherBlocks(){
    var bl=document.body.getElementsByTagName("div");
    for(var i=0;i<bl.length;i++){
        if(!isVisible(bl[i]) || bl[i].offsetWidth<100 || bl[i].offsetHeight<100)
            continue;
        var pos=findPos(bl[i]);
        var left=pos[0];
        var top=pos[1];
        
        blocks=blocks.concat([{
            x:left,
            y:top,
            width:bl[i].offsetWidth,
            height:2,
            type:"horiz"
        },
        {
            x:left,
            y:top,
            width:2,
            height:bl[i].offsetHeight,
            type:"virt"
        },
        {
            x:left+bl[i].offsetWidth,
            y:top,
            width:2,
            height:bl[i].offsetHeight,
            type:"virt"
        },
        {
            x:left,
            y:top+bl[i].offsetHeight,
            width:bl[i].offsetWidth,
            height:2,
            type:"horiz"
        }]);
    }
    /*blocks.push({
        x:0,
        y:window.innerHeight,
        width:window.innerWidth,
        height:1,
        type:"horiz"
    })*/
}
function isVisible(obj)
{
    if (obj == document) return true
    
    if (!obj) return false
    if (!obj.parentNode) return false
    if (obj.style) {
        if (obj.style.display == 'none') return false
        if (obj.style.visibility == 'hidden') return false
    }
    
    //Try the computed style in a standard way
    if (window.getComputedStyle) {
        var style = window.getComputedStyle(obj, "")
        if (style.display == 'none') return false
        if (style.visibility == 'hidden') return false
    }
    
    //Or get the computed style using IE's silly proprietary way
    var style = obj.currentStyle
    if (style) {
        if (style['display'] == 'none') return false
        if (style['visibility'] == 'hidden') return false
    }
    
    return isVisible(obj.parentNode)
}
window.onload=function(){//load assets
    /*loadAssets(anim);
    gatherBlocks();
    playQueue=clone(playQueue.concat(animationsObj["stand"]));*/
    }
window.onkeydown=function(e){
    //console.log(e.which);
    if(e.which!=116)//F5
        e.preventDefault();
    if(e.which==20){//caps-lock
        if(hidden){//show
            document.getElementById("bg").style.display="block";
            document.getElementById("self").style.display="block";
            hidden=false;
        }
        else{//hide
            document.getElementById("bg").style.display="none";
            document.getElementById("self").style.display="none";
            hidden=true;
        }
    }
    if(!keysPressed[e.which]){
        keysPressed[e.which]=true;
        keyactions();
        updatedQueue();
    }
    if(chatting){
        var k=String.fromCharCode(e.which);
        if(!e.shiftKey)
            k=k.toLowerCase();
        currentChat+=k
    }
    else if(e.which==84){//t
        chatting=true;
    }
    if(e.which==13){//enter
        chatting=false;
        sendChat(currentChat);
        currentChat="";
    }
    if(e.which==8){//backspace
        if(currentChat.length>0)
            currentChat=currentChat.substring(0,currentChat.length-2);
    }
}
window.onkeyup=function(e){
    e.preventDefault();
    delete keysPressed[e.which];
    keyactions();
    updatedQueue()
}

function updatedQueue(){
    var s={
        me:me,
        q:JSON.stringify(playQueue),
        grav:grav,
        keysPressed:keysPressed,
        jumping:jumping,
        climbing:climbing,
        currentFrame:currentFrame,
        name:name,
        hat:myHat
    };
    try{
        socket.emit("updateQueue",s);
    }
    catch(e){
        
    }
}