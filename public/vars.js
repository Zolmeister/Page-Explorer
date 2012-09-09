var player=document.createElement("canvas");

player.height=500;
player.width=500;

var playC=player.getContext("2d");
//document.body.appendChild(player);
var selectedBone;
var assetsList=[
"head", 
"left arm", 
"left foot", 
"left forearm", 
"left hand", 
"left leg", 
"left thigh",
"neck",
"right arm",
"right foot",
"right forearm",
"right hand",
"right leg",
"right thigh",
"spine", 
"joint",
"joint2",
"none",
"hat1",
"hat2",
"hat3",
"hat4",
"hat5",
"hat6"
];
function getDocHeight() {
    var D = document;
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}
var keysPressed=[];
var assetCount=0;
var assetCallback;
var assets={};
var playQueue=[];
var name=localStorage.name||prompt("name?");
localStorage.name=name;
var chats=[];
var hidden=true;
var chatting=false;
var currentChat="";
var passingThrough=false;
var others={};
var bodyCanvas=document.getElementById("self");
bodyCanvas.style.width=window.innerWidth-15+"px";
bodyCanvas.style.height=getDocHeight()+"px";
bodyCanvas.width=window.innerWidth-15;
bodyCanvas.height=getDocHeight();
var bodyCtx=bodyCanvas.getContext("2d");
var bgCanvas=document.getElementById("bg");
bgCanvas.style.width=window.innerWidth-15+"px";
bgCanvas.style.height=getDocHeight()-1+"px";
bgCanvas.width=window.innerWidth-15;
bgCanvas.height=getDocHeight()-1;


var myHat=Math.floor(Math.random()*6)+1
var bgCtx=bgCanvas.getContext("2d");
var playing=false;
var currentFrame=0;
var locked=false;
var showBone=false;
var jumping=true;
var climbing=false;
var grav=1;
var deltaTime=0;
var blocks=[];
var lastTimestamp=Date.now();

var me={
    x:0,
    y:0,
    width:100,
    height:100,
    dir:"right"
}

var skeleton=[{
    "name": "root",
    "rot": 0,
    "x": 279,
    "y": 266,
    "skin": {},
    "parent": -1,
    "id": 0,
    "children": [6, 7, 8]
}, {
    "name": "head",
    "rot": 0,
    "x": 282,
    "y": 150,
    "skin": {
        "self": {
            "name":"head",
            "x":0,
            "y":-20
        },
        "bone": "neck"
    },
    "parent": 6,
    "id": 1,
    "children": []
}, {
    "name": "right elbow",
    "rot": 0,
    "x": 248,
    "y": 182,
    "skin": {
        "bone":"right arm"
    },
    "parent": 6,
    "id": 2,
    "children": [4]
}, {
    "name": "left elbow",
    "rot": 0,
    "x": 319,
    "y": 192,
    "skin": {
        "bone":"left arm"
    },
    "parent": 6,
    "id": 3,
    "children": [5]
}, {
    "name": "right hand",
    "rot": 0,
    "x": 212,
    "y": 207,
    "skin": {
        "self": {
            "name":"right hand",
            "x":0,
            "y":0
        },
        "bone":"right forearm"
    },
    "parent": 2,
    "id": 4,
    "children": []
}, {
    "name": "left hand",
    "rot": 0,
    "x": 346,
    "y": 223,
    "skin": {
        "self": {
            "name":"left hand",
            "x":0,
            "y":0
        },
        "bone":"left forearm"
    },
    "parent": 3,
    "id": 5,
    "children": []
}, {
    "name": "top spine",
    "rot": 0,
    "x": 280,
    "y": 183,
    "skin": {
        "bone":"spine"
    },
    "parent": 0,
    "id": 6,
    "children": [1, 2, 3]
}, {
    "name": "right knee",
    "rot": 0,
    "x": 307,
    "y": 315,
    "skin": {
        "bone":"right thigh"
    },
    "parent": 0,
    "id": 7,
    "children": [9]
}, {
    "name": "left knee",
    "rot": 0,
    "x": 245,
    "y": 311,
    "skin": {
        "bone":"left thigh"
    },
    "parent": 0,
    "id": 8,
    "children": [10]
}, {
    "name": "right ankle",
    "rot": 0,
    "x": 316,
    "y": 365,
    "skin": {
        "bone":"right leg"
    },
    "parent": 7,
    "id": 9,
    "children": [11]
}, {
    "name": "left ankle",
    "rot": 0,
    "x": 232,
    "y": 367,
    "skin": {
        "bone":"left leg"
    },
    "parent": 8,
    "id": 10,
    "children": [12]
}, {
    "name": "right toe",
    "rot": 0,
    "x": 279,
    "y": 367,
    "skin": {
        "self": {
            "name":"none",
            "x":0,
            "y":0
        },
        "bone":"left foot"
    },
    "parent": 9,
    "id": 11,
    "children": []
}, {
    "name": "left toe",
    "rot": 0,
    "x": 198,
    "y": 362,
    "skin": {
        "self": {
            "name":"none",
            "x":0,
            "y":0
        },
        "bone":"left foot"
    },
    "parent": 10,
    "id": 12,
    "children": []
}

];
var animationsObj=JSON.parse('{"walk":[[{"name":"root","rot":0,"x":275,"y":254,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.5,"x":257,"y":199,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":280,"y":234,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":258,"y":236,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":244,"y":260,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":223,"y":246,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":264,"y":215,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":267,"y":284,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":243,"y":281,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":295,"y":299,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":251,"y":313,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":272,"y":313,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":222,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":275,"y":254,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.6,"x":253,"y":199,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":265,"y":230,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":285,"y":223,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":224,"y":250,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":246,"y":259,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":264,"y":215,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":247,"y":285,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":278,"y":283,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":248,"y":317,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":300,"y":304,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":224,"y":317,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":276,"y":318,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}]],"jump":[[{"name":"root","rot":0,"x":273,"y":264,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.7,"x":251,"y":220,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":281,"y":247,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":260,"y":246,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":244,"y":260,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":226,"y":256,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":268,"y":231,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":271,"y":291,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":240,"y":286,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":295,"y":312,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":251,"y":313,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":265,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":222,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":273,"y":264,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.4,"x":256,"y":197,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":299,"y":229,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":250,"y":239,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":307,"y":197,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":220,"y":233,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":266,"y":223,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":284,"y":293,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":250,"y":288,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":300,"y":316,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":251,"y":313,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":290,"y":339,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":241,"y":333,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}]],"hang":[[{"name":"root","rot":0,"x":275,"y":254,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.4,"x":257,"y":199,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":284,"y":195,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":239,"y":204,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":308,"y":123,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":208,"y":124,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":264,"y":215,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":284,"y":284,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":245,"y":283,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":275,"y":308,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":239,"y":308,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":248,"y":333,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":215,"y":326,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":262,"y":254,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.10000000000000003,"x":269,"y":196,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":291,"y":194,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":251,"y":200,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":308,"y":123,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":208,"y":124,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":270,"y":216,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":281,"y":283,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":256,"y":284,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":286,"y":307,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":253,"y":314,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":312,"y":333,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":263,"y":337,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":266,"y":174,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.10000000000000003,"x":270,"y":89,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":284,"y":117,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":248,"y":116,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":308,"y":123,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":208,"y":124,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":268,"y":126,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":293,"y":210,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":238,"y":194,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":294,"y":239,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":243,"y":230,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":281,"y":275,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":227,"y":254,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":265,"y":158,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":0.19999999999999998,"x":282,"y":90,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":290,"y":112,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":247,"y":106,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":313,"y":136,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":218,"y":130,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":266,"y":115,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":281,"y":165,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":234,"y":132,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":298,"y":181,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":202,"y":118,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":289,"y":207,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":167,"y":133,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":244,"y":106,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":0.19999999999999998,"x":240,"y":57,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":285,"y":78,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":197,"y":65,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":305,"y":104,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":189,"y":94,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":243,"y":79,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":262,"y":120,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":232,"y":122,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":279,"y":114,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":202,"y":118,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":290,"y":137,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":187,"y":136,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}]],"stand":[[{"name":"root","rot":0,"x":275,"y":254,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.4,"x":269,"y":193,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":291,"y":228,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":254,"y":224,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":290,"y":260,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":253,"y":258,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":272,"y":214,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":282,"y":283,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":257,"y":286,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":295,"y":312,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":251,"y":313,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":265,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":222,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":275,"y":254,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.5,"x":269,"y":193,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":292,"y":223,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":254,"y":221,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":291,"y":257,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":253,"y":254,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":272,"y":214,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":282,"y":283,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":257,"y":286,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":295,"y":312,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":251,"y":313,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":265,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":222,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}]]}');
animationsObj["walk"]=JSON.parse('[[{"name":"root","rot":0,"x":275,"y":254,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.4,"x":257,"y":199,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":297,"y":229,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":250,"y":251,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":295,"y":266,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":217,"y":233,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":264,"y":215,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":267,"y":284,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":243,"y":281,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":295,"y":312,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":251,"y":313,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":265,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":222,"y":312,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":274,"y":253,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.6,"x":254,"y":201,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":279,"y":242,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":280,"y":237,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":249,"y":267,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":245,"y":261,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":265,"y":217,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":265,"y":277,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":270,"y":284,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":283,"y":291,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":282,"y":311,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":258,"y":298,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":255,"y":313,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":276,"y":253,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.5,"x":255,"y":201,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":254,"y":250,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":297,"y":220,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":225,"y":236,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":300,"y":259,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":265,"y":217,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":253,"y":281,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":278,"y":283,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":250,"y":309,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":294,"y":311,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":223,"y":309,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":266,"y":311,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":277,"y":251,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.6,"x":253,"y":203,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":272,"y":234,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":279,"y":230,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":244,"y":248,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":254,"y":263,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":263,"y":216,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":264,"y":281,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":270,"y":278,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":277,"y":310,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":285,"y":294,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":248,"y":311,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":260,"y":298,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}]]');
animationsObj["jump"]=JSON.parse('[[{"name":"root","rot":0,"x":254,"y":255,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.20000000000000004,"x":258,"y":195,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":284,"y":221,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":227,"y":221,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":296,"y":260,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":198,"y":185,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":253,"y":219,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":262,"y":285,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":243,"y":281,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":276,"y":309,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":251,"y":313,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":269,"y":338,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":238,"y":336,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}]]');
animationsObj["hang"]=JSON.parse('[[{"name":"root","rot":0,"x":250,"y":252,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.20000000000000004,"x":257,"y":195,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":305,"y":215,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":209,"y":203,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":319,"y":157,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":198,"y":164,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":255,"y":213,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":259,"y":280,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":243,"y":281,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":265,"y":306,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":237,"y":305,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":262,"y":329,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":234,"y":328,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":250,"y":173,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.20000000000000004,"x":248,"y":105,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":261,"y":174,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":237,"y":174,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":308,"y":163,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":195,"y":175,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":248,"y":126,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":264,"y":216,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":239,"y":214,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":264,"y":237,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":238,"y":241,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":265,"y":273,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":236,"y":268,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}],[{"name":"root","rot":0,"x":256,"y":147,"skin":{},"parent":-1,"id":0,"children":[6,7,8]},{"name":"head","rot":-0.4,"x":236,"y":95,"skin":{"self":{"name":"head","x":0,"y":-20},"bone":"neck"},"parent":6,"id":1,"children":[]},{"name":"right elbow","rot":0,"x":294,"y":130,"skin":{"bone":"right arm"},"parent":6,"id":2,"children":[4]},{"name":"left elbow","rot":0,"x":199,"y":133,"skin":{"bone":"left arm"},"parent":6,"id":3,"children":[5]},{"name":"right hand","rot":-4.100000000000001,"x":307,"y":172,"skin":{"self":{"name":"right hand","x":0,"y":0},"bone":"right forearm"},"parent":2,"id":4,"children":[]},{"name":"left hand","rot":-4.000000000000002,"x":198,"y":175,"skin":{"self":{"name":"left hand","x":0,"y":0},"bone":"left forearm"},"parent":3,"id":5,"children":[]},{"name":"top spine","rot":0,"x":248,"y":113,"skin":{"bone":"spine"},"parent":0,"id":6,"children":[1,2,3]},{"name":"right knee","rot":0,"x":271,"y":159,"skin":{"bone":"right thigh"},"parent":0,"id":7,"children":[9]},{"name":"left knee","rot":0,"x":233,"y":155,"skin":{"bone":"left thigh"},"parent":0,"id":8,"children":[10]},{"name":"right ankle","rot":0,"x":263,"y":179,"skin":{"bone":"right leg"},"parent":7,"id":9,"children":[11]},{"name":"left ankle","rot":0,"x":220,"y":179,"skin":{"bone":"left leg"},"parent":8,"id":10,"children":[12]},{"name":"right toe","rot":0,"x":284,"y":180,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":9,"id":11,"children":[]},{"name":"left toe","rot":0,"x":243,"y":179,"skin":{"self":{"name":"none","x":0,"y":0},"bone":"left foot"},"parent":10,"id":12,"children":[]}]]');