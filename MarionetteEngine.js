const { Cluster } = require('puppeteer-cluster')
const vanillaPuppeteer = require('puppeteer')
const { addExtra } = require('puppeteer-extra')
const Stealth = require('puppeteer-extra-plugin-stealth')
const chalk = require('chalk');
const {actionScraper} = require('./Scraper/actionScraper')
const {eventBus} = require('./util');
/**
 * execute list of routines. *
 * @param {Routine[]} routines - The routine include of action information* 
 */
exports.MarionetteEventBus = eventBus;
exports.MarionetteEngine = async (routines) => {    
  const puppeteer = addExtra(vanillaPuppeteer)
  puppeteer.use(Stealth())

  // Launch cluster with puppeteer-extra
  const cluster = await Cluster.launch({
    puppeteer,
    maxConcurrency: 2,
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    timeout : 2147483647, //32 bit signed integer max value
    monitor : true,
    puppeteerOptions: {
      headless: true,
    },
  })

  routines.forEach((routine)=>{
    cluster.queue({routine}, actionScraper)
  })

  await cluster.idle();
  await cluster.close();
}
