const {MarionetteEngine} = require('./MarionetteEngine');
const hrefTest = require('./TestConfig/hrefTest');
const actionTest = require('./TestConfig/actionTest');
(async () => {  
  await MarionetteEngine([
    actionTest.actionTest
  ])
})()
