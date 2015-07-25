c=document.createElement("canvas");
c.setAttribute("style","width:100px;height:100px;position: absolute;top:0px;left:0px;display:none;");
c.id="bg"
document.body.appendChild(c);

var c=document.createElement("canvas");
c.setAttribute("style","width:100px;height:100px;position: absolute;top:0px;left:0px;display:none;");
c.id="self"
document.body.appendChild(c);



function loadScript(name){
    var s=document.createElement("script");
    s.src="http://localhost:3003/"+name+".js";
    document.body.appendChild(s);
}
loadScript("socket.io/socket.io")
loadScript("vars");
loadScript("main");
loadScript("socket");
