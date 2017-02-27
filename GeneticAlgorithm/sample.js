var sample = (function() {
    function sample() {

    }
    sample.prototype.randomNumber = function(min, max) {
        var diff = max - min;
        var randNo = Math.floor(Math.random() * diff) + min;
        return randNo;
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
            return fitness / targetData.length;
        }
    });

    genetic.initialize();
};
