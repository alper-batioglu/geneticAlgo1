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



    window.genetic = new alper.geneticAlgorithm({
        populationsize: 500,
        initialPopulationCB: function() {
            var length = sampleInst.randomNumber(5, 35);
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
            fitness *= 100;

            var diff = Math.abs(data.length - targetData.length);
            fitness -= (diff * 10);
            fitness = (fitness > 0) ? fitness : 0;
            return fitness / targetData.length;
        },
        matingCB: function(firstParent, secondParent){
            var first = firstParent.substring(0, firstParent.length / 2);
            var second = secondParent.substring(secondParent.length / 2, secondParent.length);
            var child = first + second;
            return child;
        },
        mutationCB: function(data){
            var retVal = "";
            if (sampleInst.randomNumber(0, 100) < 5){
                var targetNum = sampleInst.randomNumber(0, data.length);
                retVal = data.substring(0, targetNum);
                retVal += sampleInst.randomChar();
                if (data.length > targetNum + 1){
                    retVal += data.substring(targetNum + 1, data.length);
                }
            }else{
                retVal = data;
            }

            var rand = sampleInst.randomNumber(0, 100);
            switch (rand) {
                case 1:
                retVal += sampleInst.randomChar();
                    break;
                case 2:
                retVal = retVal.substring(0, retVal.length - 1);
                    break;
            }

            return retVal;
        }
    });


    genetic.initialize();
    genetic.startEvolve();
};
