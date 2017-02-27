var sample = (function() {
    function sample() {
        this.jsLib = new alper.jsLib();
    }
    sample.prototype.randomNumber = function(min, max) {
        return this.jsLib.randomNumber(min, max);
    };

    sample.prototype.randomChar = function() {
        return String.fromCharCode(this.randomNumber(32, 127));
    };


    return sample;
})();

window.onload = function() {
    var sampleInst = new sample();
    var targetData = "To be or not to be";



    var genetic = new alper.geneticAlgorithm({
        populationsize: 10,
        initialPopulationCB: function() {
            var length = sampleInst.randomNumber(15, 25);
            var retVal = "";
            for (var i = 0; i < length; i++) {
                retVal += sampleInst.randomChar();
            }
            return retVal;
        },
        fitnessCB: function(data) {
            var fitness = 0;
            for (var i = 0; i < targetData.length; i++) {
                if (data.length <= i) {
                    break;
                }
                if (targetData[i] === data[i]) {
                    fitness++;
                }
            }
            var diff = data.length - targetData.length;
            if (diff > 0) {
                fitness -= diff;
            }
            fitness = (fitness > 0) ? fitness : 0;
            return fitness / targetData.length;
        }
    });

    genetic.initialize();
    genetic.evolve();
};
