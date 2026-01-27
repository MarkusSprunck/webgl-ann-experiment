const { ModelFactory } = require('./src/ModelFactory');

(function main(){
  const factory = new ModelFactory();
  const network = factory.createBindTestPattern();
  console.log('Created network with layers:', network.getLayers().length);
  // match UI parameters: totalIterations=100, steps=10 (total passes=1000)
  const totalIterations = 100;
  const steps = 10;
  const t0 = Date.now();
  for(let i=0;i<totalIterations;i++){
    for(let s=0;s<steps;s++){
      network.trainBackpropagation(factory, 1, 1);
    }
  }
  const t1 = Date.now();
  const rms = network.rms(factory);
  console.log(`Training done RMS=${rms.toFixed(6)} elapsed=${(t1-t0)/1000}s`);
})();
