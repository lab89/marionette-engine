const {MarionetteEngine, MarionetteEventBus} = require('./MarionetteEngine');
const hrefTest = require('./TestConfig/hrefTest');
const actionTest = require('./TestConfig/actionTest');
(async () => {    
  MarionetteEventBus.on('text', (botName, fileData) => {
    console.log("bot name : ", botName);
    console.log(fileData)    
  });
  MarionetteEventBus.on('image', (botName, imgData) => {
    console.log("bot name : ", botName);
    console.log(imgData)    
  });
  MarionetteEventBus.on('robot', (botName, robotData) => {
    console.log("bot name : ", botName);
    console.log(robotData)    
  });
  MarionetteEventBus.on('log', (botName, logData) => {
    console.log("bot name : ", botName);
    MarionetteEventBus.emit('cancel', null, botName);
    console.log("bot name : ", botName);
    console.log(logData)    
  });
  await MarionetteEngine([
    actionTest.actionTest,
    hrefTest.heftTest,
  ])

  

})()
