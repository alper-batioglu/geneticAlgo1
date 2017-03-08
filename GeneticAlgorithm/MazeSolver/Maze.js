var maze = (function(){
    function maze(options){
        options = options || {};
        options.sizeX = options.sizeX || 100;
        options.sizeY = options.sizeY || 100;
        this.sizeX = options.sizeX;
        this.sizeY = options.sizeY;
        this.resolution = 4;
        this.players = [];
    }

    maze.prototype.resetPlayers = function(){
        this.players = [];
    };

    maze.prototype.iteratePlayers = function(callBack){
        for (var i = 0; i < this.players.length; i++){
            callBack(this.players[i]);
        }
    };

    maze.prototype.startMoving = function(){
        var self = this;
        var moving = function(){
            self.move();
            setTimeout(moving); //animasyon
        };
        moving();
    };
    maze.prototype.move = function(){
        this.iteratePlayers(function(player){
            player.move();
        });
    };

    maze.prototype.draw = function(){
        fill(color(200));
        rect(0, 0, this.sizeX * this.resolution, this.sizeY * this.resolution);
        this.iteratePlayers(function(player){
            player.draw();
        });
    };

    maze.prototype.addPlayer = function(dna, endCallBack){
        var newPlayer = new player();
        newPlayer.setUp(this, dna, endCallBack);
        this.players.push(newPlayer);
    };

    return maze;
})();

var player = (function(){
    function player(){
        this.x = 1;
        this.y = 1;
    }
    player.prototype.setUp = function(maze, dna, endCallBack){
        this.color = color(0);
        this.maze = maze;
        this.dna = dna;
        this.curDnaLoc = 0;
        this.endCallBack = endCallBack;
    };
    player.prototype.draw = function(){
        fill(this.color);
        var res = this.maze.resolution;
        ellipse(this.x * res, this.y * res, res, res);
    };
    player.prototype.move = function(){
        if (this.curDnaLoc >= this.dna.length){
            if (this.endCallBack){
                this.endCallBack(this);
                this.endCallBack = null;
            }
            return false;
        }
        var direction = {x:0, y:0};
        switch (this.dna[this.curDnaLoc++]) {
            case "L":
                direction.x = -1; break;
            case "R":
                direction.x = 1; break;
            case "U":
                direction.y = -1; break;
            case "D":
                direction.y = 1; break;
        }
        this.x = this.x + direction.x;
        this.y = this.y + direction.y;
        this.x = this.x >= this.maze.sizeX ? this.maze.sizeX - 1 : this.x;
        this.y = this.y >= this.maze.sizeY ? this.maze.sizeY - 1 : this.y;
        this.x = this.x <= 0 ? 1 : this.x;
        this.y = this.y <= 0 ? 1 : this.y;
        return true;
    };
    return player;
})();

var m = new maze({
    sizeX: 200,
    sizeY: 100
});

var target = {x: 50, y: 60};

function hadi(){

    var jsLib = new alper.jsLib();
    var randomChar = function(){
        var char = "";
        switch (jsLib.randomNumber(1, 5)) {
            case 1: char = "U"; break;
            case 2: char = "D"; break;
            case 3: char = "L"; break;
            case 4: char = "R"; break;
        }
        return char;
    };
    window.genetic = new alper.geneticAlgorithm({
        populationsize: 500,
        initialPopulationCB: function() {
            var length = jsLib.randomNumber(5, 100);
            var retVal = "";
            for (var i = 0; i < length; i++) {
                retVal += randomChar();
            }
            return retVal;
        },
        iterationCB: function(){
            m.resetPlayers();
        },
        fitnessCB: function(data, endCallBack) {
            m.addPlayer(data, function(player){
                var xDif = player.x - target.x;
                var yDif = player.y - target.y;
                var fitness = xDif * xDif + yDif * yDif;
                fitness = fitness == 0 ? 1 : 1 / fitness;
                endCallBack(fitness);
            });
        },
        matingCB: function(firstParent, secondParent){
            var first = firstParent.substring(0, firstParent.length / 2);
            var second = secondParent.substring(secondParent.length / 2, secondParent.length);
            var child = first + second;
            return child;
        },
        mutationCB: function(data){
            var retVal = "";
            if (jsLib.randomNumber(0, 100) < 5){
                var targetNum = jsLib.randomNumber(0, data.length);
                retVal = data.substring(0, targetNum);
                retVal += randomChar();
                if (data.length > targetNum + 1){
                    retVal += data.substring(targetNum + 1, data.length);
                }
            }else{
                retVal = data;
            }

            var rand = jsLib.randomNumber(0, 100);
            var randNum = jsLib.randomNumber(0, 50);
            switch (rand) {
                case 1:
                case 2:
                case 3:
                case 4:
                    for (var i = 0; i < randNum; i++){
                        retVal += randomChar();
                    }
                    break;
                case 5:
                case 6:
                case 7:
                case 8:
                    for (var i = 0; i < randNum; i++){
                        retVal = retVal.substring(0, retVal.length - 1);
                    }
                    break;
            }

            return retVal;
        }
    });


    genetic.initialize();
}


function setup() {
    createCanvas(1000, 500);
    m.startMoving();
    //noLoop();
}

function draw() {
    background(240);
    m.draw();
    ellipse(target.x * 4, target.y * 4, 4, 4);
}
