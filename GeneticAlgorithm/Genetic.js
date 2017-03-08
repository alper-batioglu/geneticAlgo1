var alper = alper || {};

alper.stage = (function() {
    function stage() {
        this.candidateDiv = null;
        this.reportDiv = null;
        this.initStage();
    }

    stage.prototype.initStage = function() {
        this.candidateDiv = document.createElement("span");
        this.reportDiv = document.createElement("span");
        document.body.appendChild(this.candidateDiv);
        document.body.appendChild(this.reportDiv);
    };
    stage.prototype.clearCandidates = function() {
        while (this.candidateDiv.firstChild) {
            this.candidateDiv.removeChild(this.candidateDiv.firstChild);
        }
    };
    stage.prototype.clearReports = function() {
        while (this.reportDiv.firstChild) {
            this.reportDiv.removeChild(this.reportDiv.firstChild);
        }
    };
    stage.prototype.writeCandidate = function(candidate) {
        var newDiv = document.createElement("div");
        newDiv.textContent = candidate.data + ":" + candidate.fitness;
        this.candidateDiv.appendChild(newDiv);
    };
    stage.prototype.writeReport = function(maxFitness, generationNumber, maxGenotype) {
        var newDiv = document.createElement("div");
        var newDiv2 = document.createElement("div");
        var genoDiv = document.createElement("div");
        newDiv.textContent = "maxFitness: " + maxFitness;
        newDiv2.textContent = "generationNumber: " + generationNumber;
        genoDiv.textContent = "best Genotype : " + maxGenotype;
        this.reportDiv.appendChild(newDiv);
        this.reportDiv.appendChild(newDiv2);
        this.reportDiv.appendChild(genoDiv);
    };

    stage.prototype.displayInfo = function(genetic) {
        this.clearCandidates();
        genetic.population.iterate((candidate) => {
            this.writeCandidate(candidate);
        });
        this.clearReports();
        this.writeReport(genetic.maxFitness, genetic.generationNumber, genetic.maxGenotype);
    };


    return stage;
})();

alper.jsLib = (function() {
    function jsLib() {

    }
    jsLib.error = function(msg) {
        throw new Error(msg);
    };
    jsLib.Types = {
        Function: "[object Function]"
    };
    jsLib.prototype.getType = function(item) {
        return Object.prototype.toString.call(item);
    };
    jsLib.prototype.assertFunction = function(item, msg) {
        if (this.getType(item) !== jsLib.Types.Function) {
            jsLib.error(msg);
        }
    };

    jsLib.prototype.proportion = function (curValue, min, max) {
        if (curValue < min || curValue > max){
            jsLib.error("curValue error: " + curValue + " min: " + min + " max: " + max);
        }
        var diff = max - min;
        var curDiff = curValue - min;
        return curDiff * 100 / diff;
    };

    jsLib.prototype.randomNumber = function(min, max) {
        var diff = max - min;
        var randNo = Math.floor(Math.random() * diff) + min;
        return randNo;
    };

    return jsLib;
})();

alper.geneticAlgorithm = (function() {
    function geneticAlgorithm(options) {
        this.populationsize = options.populationsize || 200;
        this.initialPopulationCB = options.initialPopulationCB || null;
        this.iterationCB = options.iterationCB || null;
        this.fitnessCB = options.fitnessCB || null;
        this.matingCB = options.matingCB || null;
        this.mutationCB = options.mutationCB || null;

        this.jsLib = new alper.jsLib();
        this.stage = new alper.stage();

        this.population = null;
        this.matingPool = null;
        this.evolving = false;
        this.generationNumber = 0;
        this.maxFitness = null;
        this.maxFenotype = null;

        this.jsLib.assertFunction(this.initialPopulationCB, "initial population call back should be function");
        this.jsLib.assertFunction(this.fitnessCB, "fitness call back should be function");
        this.jsLib.assertFunction(this.matingCB, "mating call back should be function");
        this.jsLib.assertFunction(this.mutationCB, "mutation call back should be function");
    }

    geneticAlgorithm.prototype.iteration = function() {
        this.stage.displayInfo(this);

        if (this.iterationCB) {
            this.iterationCB();
        }
    };

    //initialize population
    geneticAlgorithm.prototype.initialize = function() {
        var pop = new alper.population();
        for (var i = 0; i < this.populationsize; i++) {
            pop.addMember(this.initialPopulationCB());
        }

        this.population = pop;
        var self = this;
        this.calculateFitness(function(){
            self.iteration();
            self.startEvolve();
        });

    };

    geneticAlgorithm.prototype.stop = function(){
        this.evolving = false;
    };

    geneticAlgorithm.prototype.startEvolve = function(){
        this.evolving = true;
        this.evolve();
    };

    geneticAlgorithm.prototype.evolve = function(){
        if (!this.evolving){
            return;
        }
        this.performSelection();
        this.performReproduction();
        this.performMutation();
        var self = this;
        this.calculateFitness(function (){
            self.generationNumber++;
            self.iteration();

            if (self.maxFitness >= 99){
                return;
            }

            self.evolveTimeout = setTimeout(function(){
                self.evolve();
            });
        });
    };

    geneticAlgorithm.prototype.calculateFitness = function(endCallBack) {
        var self = this;
        var maxFitness = null, maxGenotype = null;
        var fitnessEndCounter = 0;
        this.population.iterate(function(candidate) {
            self.fitnessCB(candidate.data, function(fitness){
                fitnessEndCounter++;
                candidate.setFitness(fitness);
                if (maxFitness == null || candidate.fitness > maxFitness){
                    maxFitness = candidate.fitness;
                    maxGenotype = candidate.data;
                }
                if (fitnessEndCounter == self.populationsize){
                    self.maxGenotype = maxGenotype;
                    self.maxFitness = maxFitness;
                    setTimeout(endCallBack);
                }
            });
        });
    };

    geneticAlgorithm.prototype.performSelection = function(){
        var maxFitness = 0;
        this.population.iterate((candidate) => {
            maxFitness = candidate.fitness > maxFitness ? candidate.fitness : maxFitness;
        });

        var matingPool = [];
        this.population.iterate((candidate) => {
            var ratio = Math.floor(this.jsLib.proportion(candidate.fitness, 0, maxFitness));
            for (var i = 0; i < ratio; i++){
                matingPool.push(candidate);
            }
        });
        this.matingPool = matingPool;
    };

    geneticAlgorithm.prototype.performReproduction = function(){
        var newPop = new alper.population();
        for (var i = 0; i < this.populationsize; i++){
            var firstParentIndex = this.jsLib.randomNumber(0, this.matingPool.length);
            var secondParentIndex = this.jsLib.randomNumber(0, this.matingPool.length);
            var firstParent = this.matingPool[firstParentIndex];
            var secondParent = this.matingPool[secondParentIndex];
            var childData = this.matingCB(firstParent.data, secondParent.data);
            newPop.addMember(childData);
        }
        this.population = newPop;
    };

    geneticAlgorithm.prototype.performMutation = function(){
        var mutationCB = this.mutationCB;
        this.population.iterate(function(candidate){
            candidate.data = mutationCB(candidate.data);
        });
    };

    return geneticAlgorithm;
})();

alper.candidate = (function() {
    function candidate() {
        this.fitness = 0;
        this.data = null;
    }

    candidate.prototype.setFitness = function(fitness) {
        this.fitness = fitness;
    };

    return candidate;
})();

alper.population = (function() {
    function population() {
        this.candidates = [];
    }
    population.prototype.addMember = function(member) {
        var candidate = new alper.candidate();
        candidate.data = member
        this.candidates.push(candidate);
    };
    population.prototype.iterate = function(candidateCB) {
        for (var i = 0; i < this.candidates.length; i++) {
            candidateCB(this.candidates[i]);
        }
    };

    return population;
})();
