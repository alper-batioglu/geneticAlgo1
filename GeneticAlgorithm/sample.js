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




    var genetic = new alper.geneticAlgorithm({
        populationsize: 10,
        initialPopulationCB: function() {
            var length = sampleInst.randomNumber(15, 25);
            var retVal = "";
            for (var i = 0; i < length; i++) {
                retVal += sampleInst.randomChar();
            }
            return retVal;
        }
    });

    genetic.initialize();
};
