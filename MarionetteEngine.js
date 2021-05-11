const cheerio = require('cheerio');
const {getHrefs, wait} = require('./util');
const fs = require('fs');
const fetch = require('node-fetch')
const { Cluster } = require('puppeteer-cluster')
const vanillaPuppeteer = require('puppeteer')
const { addExtra } = require('puppeteer-extra')
const Stealth = require('puppeteer-extra-plugin-stealth')
const chalk = require('chalk');
const {actionScraper} = require('./Scraper/actionScraper')
const eventBus = require('js-event-bus')();

exports.isCanceled = {
  flag : false
};
  
exports.eb = eventBus;


/**
 * execute list of routines. *
 * @param {Routine[]} routines - The routine include of action information* 
 */
exports.MarionetteEngine = async (routines) => {  
  const puppeteer = addExtra(vanillaPuppeteer)
  puppeteer.use(Stealth())

  // Launch cluster with puppeteer-extra
  const cluster = await Cluster.launch({
    puppeteer,
    maxConcurrency: 2,
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    dumpio: true,    
    timeout : 2147483647, //32 bit signed integer max value
    puppeteerOptions: {
      headless: true,
    },
  })

  setTimeout(()=> {
    eventBus.emit('cancel', null, 'bot1');
  }, 10000)

  eventBus.on('cancelWorker', async (cancelBotName, workerId, deleteInf) => {  
    // console.log(cluster.workers.length)
    // console.log(workerId)     
    // console.log(cluster.workers[workerId])    
    // cluster.workers.splice(workerId, 1);
    // cluster.jobQueue.list.splice(workerId, 1);
    // console.log(cluster.jobQueue.list);
    // console.log(cluster.workers.length);
    // const a = cluster.workersBusy.map((w, i)=> w.id === workerId ? i : null).filter((d)=> d !== null);
    // if(a.length){            
    //   cluster.workers[a[0]]
    // }
    // console.log(cluster.workersBusy)
    // console.log(cluster.workersAvail)
    console.log(chalk.redBright(cancelBotName + ' 봇 워커 종료'))   
    this.isCanceled.flag = true;
    // eventBus.emit('cancelTask', null, cancelBotName)
    //삭제 정보를 넘겨 받고 .. 처리하는 곳
  })

  eventBus.on('error', (errType, message) => {
    // 에러 받습니다 ~ 
  })

  routines.forEach((routine)=>{
    cluster.queue({routine}, actionScraper)
  })

  await cluster.idle();
  await cluster.close();
}