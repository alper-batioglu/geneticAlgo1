var alper = alper || {};

alper.stage = (function() {
    function stage() {
        this.candidateDiv = null;
        this.initStage();
    }

    stage.prototype.initStage = function() {
        this.candidateDiv = document.createElement("div");
        document.body.appendChild(this.candidateDiv);
    };
    stage.prototype.clearCandidates = function() {
        while (this.candidateDiv.firstChild) {
            this.candidateDiv.removeChild(this.candidateDiv.firstChild);
        }
    };
    stage.prototype.writeCandidate = function(candidate) {
        var newDiv = document.createElement("div");
        newDiv.textContent = candidate.data + ":" + candidate.fitness;
        this.candidateDiv.appendChild(newDiv);
    };

    stage.prototype.displayInfo = function(genetic) {
        this.clearCandidates();
        genetic.population.iterate((candidate) => {
            this.writeCandidate(candidate);
        });
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

    return jsLib;
})();

alper.geneticAlgorithm = (function() {
    function geneticAlgorithm(options) {
        this.populationsize = options.populationsize || 200;
        this.initialPopulationCB = options.initialPopulationCB || null;
        this.iterationCB = options.iterationCB || null;
        this.fitnessCB = options.fitnessCB || null;

        this.jsLib = new alper.jsLib();
        this.stage = new alper.stage();

        this.population = null;

        this.jsLib.assertFunction(this.initialPopulationCB, "initial population call back should be function");
        this.jsLib.assertFunction(this.fitnessCB, "fitness call back should be function");
    }

    geneticAlgorithm.prototype.iteration = function() {
        this.stage.displayInfo(this);

        if (this.iterationCB) {
            this.population.iterate(function(candidate) {
                this.iterationCB(candidate);
            });
        }
    };

    //initialize population
    geneticAlgorithm.prototype.initialize = function() {
        var pop = new alper.population();
        for (var i = 0; i < this.populationsize; i++) {
            pop.addMember(this.initialPopulationCB());
        }

        this.population = pop;

        this.iteration();
    };

    geneticAlgorithm.prototype.selection = function() {
        this.population.iterate = function(candidate) {
            var fitness = this.fitnessCB(candidate.data);
            candidate.setFitness(fitness);
        };
        this.iteration();
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
