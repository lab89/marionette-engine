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

  routines.forEach((routine)=>{
    cluster.queue({routine}, actionScraper)
  })

  await cluster.idle();
  await cluster.close();
}