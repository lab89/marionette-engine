const {getHrefs, wait} = require('../util');
const cheerio = require('cheerio');
const fs = require('fs');
const fetch = require('node-fetch');
const chalk = require('chalk');
const engine = require('../MarionetteEngine.js');

/**  
 * @param {Object} page - puppeteer page * 
 * @param {String[]} hrefs - hrefs array *
 * @param {String} startUrl - start url *
 */
async function hrefsExtract(page, hrefs, startUrl){ 
  const hrefsToUrl = [];
  async function dfs(url, deep = 0){        
    await page.goto(url);   
    const links = await getHrefs(page, hrefs[deep])        
    for(let i = 0; i < links.length; i++){      
      if(deep === (hrefs.length - 1)){
        hrefsToUrl.push(links[i]);             
      }else{        
        await dfs(links[i], deep + 1);
      }      
    }    
  }
  await dfs(startUrl); 
  return hrefsToUrl
};  

/** 
 * @param {Object} page - puppeteer page *
 * @param {ActionArray} actions - actions *
 * @param {string} startUrl - bot startUrl *
 * @returns {ActionArray} final Actions Data *
 */
async function GenerateActionData(page, actions, startUrl){
  const root = actions.shift();
  Object.assign(root, { children : [] });

  /**
   * 
   * @param {Actions} actions 
   * @param {Actions} root
   */
  function recur(actions, root){
    while(actions.length){
      let action = actions.shift();
      Object.assign(action, { children : []});
      root.children.push(action);
      recur(actions, action)
    }
    return;
  }

  const result = []
  /**
   * 
   * @param {Object} page  - puppeteer page
   * @param {Actions} root 
   */
  async function flatten(page, root){
    if(root.type === 'href'){
      const hrefs = await hrefsExtract(page, root.config.hrefs, startUrl)
      for(let i = 0; i < hrefs.length; i++){
        result.push({
          type : 'visit',
          config : {
            url : hrefs[i]
          }
        })
        if(root.children.length === 0) return;
        await flatten(page, root.children[0])
      }
    }else{
      result.push({
        type : root.type,
        config : root.config
      })
      if(root.children.length === 0) return;
      await flatten(page, root.children[0])
    }
  }

  try {
    recur(actions, root);
    await flatten(page, root);
    return result
  }catch(e){
    console.log(e);
  }
}
/**
 * 
 * @param {ActionArray} actions 
 * @returns {MarionetteAction[]}
 */
function generateActions(actions, isCanceled){
  return actions.map((action)=>{
    if(action.type === 'visit'){
      return {
        type : action.type,
        f : async (page) => {          
          try {     
            if(isCanceled.flag) return;   
            await Promise.all([page.goto(action.config.url),page.waitForNavigation({waitUntil : 'load'})])
            // await page.goto(action.config.url)       
            // await page.waitForNavigation({waitUntil : 'domcontentloaded'})
          }catch(e){
            console.log(e)
          }
        }
      }
    }else if(action.type === 'scroll'){
      return {
        type : action.type,
        f : async (page) => {
          try {
            // page.on('console', async msg => {
            //   const args = msg.args();
            //   const vals = [];
            //   for (let i = 0; i < args.length; i++) {
            //     vals.push(await args[i].jsonValue());
            //   }
            //   console.log(vals.join('\t'));
            // });
            
            await page.evaluate((isCanceled)=> {    
              const wait = (duration) => { 
                console.log('waiting', duration);
                return new Promise(resolve => setTimeout(resolve, duration)); 
              };          
              (async () => {
                if(isCanceled.flag) {
                  window.atBottom = true
                  return;
                }
                window.atBottom = false;
                const scroller = document.documentElement;  // usually what you want to scroll, but not always
                let lastPosition = -1;
                while(!window.atBottom) {
                  scroller.scrollTop += 1000;
                  // scrolling down all at once has pitfalls on some sites: scroller.scrollTop = scroller.scrollHeight;
                  if(isCanceled.flag) {
                    window.atBottom = true
                    break;
                  }
                  await wait(300);
                  const currentPosition = scroller.scrollTop;
                  if (currentPosition > lastPosition) {
                    console.log('currentPosition', currentPosition);
                    lastPosition = currentPosition;
                  }
                  else {
                    window.atBottom = true;
                  }
                }
                console.log('Done!');          
              })();          
            }, isCanceled);
          
            await page.waitForFunction('window.atBottom == true', {
              timeout: 90000000,
              polling: 1000 // poll for finish every second
            });
          
            // await page.evaluate(async (action) => {
            //   await new Promise((resolve, reject) => {
            //     var totalHeight = 0;
            //     var distance = 100;
            //     var timer = setInterval(() => {
            //         var scrollHeight = document.body.scrollHeight;
            //         window.scrollBy(0, distance);
            //         totalHeight += distance;                  
            //         if(totalHeight >= scrollHeight){
            //             clearInterval(timer);                        
            //             resolve();
            //         }
            //     }, 100);
            //   });          
            // }, action)              
          } catch(e){
            console.log(e);
          }          
        }
      }      
    }else if(action.type === 'scraping'){
      return {
        type : action.type,
        f : async(page) => {
          try {
            const content = await page.content();
            let $ = cheerio.load(content);       
            const scrapedTextMap = {}
            const images = []
            if(isCanceled.flag) return false;

            action.config.targets.forEach(async (target)=>{
              if(isCanceled.flag) return;
              const label = target.label;
              const selector = target.selector;
              const el = $(selector);
              if(!scrapedTextMap.hasOwnProperty(label)) scrapedTextMap[label] = [];      
              if(!el.length) {
                console.log(chalk.redBright(selector + " is not found"))
                scrapedTextMap[label].push(undefined)
              }
              else {
                el.each(async (index, target)=>{
                  
                  if(isCanceled.flag) return;
                  const tag = $(target);
                  if(tag[0].name === 'img'){            
                    let src = tag.attr('src');
                    let srcArray = src.split('/')
                    let pos = srcArray.length - 1
                    let filename = srcArray[pos]
                    images.push({
                      url : src,
                      filename : filename
                    })
                  }else{
                    scrapedTextMap[label].push(tag.text())   
                  }
                })
              }
            })          
  
            // 데이터 아예 없는거 삭제 (이미지)
            Object.keys(scrapedTextMap).forEach((label)=>{
              if(!scrapedTextMap[label].length) delete scrapedTextMap[label];
            })
            
            const fileData = []
            const columns = Object.values(scrapedTextMap);
            const labels = Object.keys(scrapedTextMap);
  
            while(true){    
              if(isCanceled.flag) return;
              let temp = {};
              for(let i = 0; i < columns.length; i++){
                temp[labels[i]] = columns[i].shift();      
              }    
              const checker = Object.values(temp).reduce((acc, curr)=> {
                return curr || acc
              }, undefined);    
              if(checker === undefined) break;       
              fileData.push(temp); 
            } 
            return {
              images : images,
              fileData : fileData
            }
          }catch(e){
            console.log(e);
          }
          
        }
      }
    }else if(action.type === 'click'){
      return {
        type : action.type,
        f: async(page)=>{
          try {
            if(isCanceled.flag) return;
            const content = await page.content();
            let $ = cheerio.load(content);    
            await page.waitForSelector(action.config.target)
            const target = await page.$$(action.config.target); 
            if($(action.config.target).length > 1) {
              console.log(chalk.redBright('클릭 타겟이 두개 이상입니다. 첫번째 것을 클릭합니다.'))              
              await Promise.all([target[0].click(), page.waitForNavigation({waitUntil : 'load'})])   
            }else{            
              await Promise.all([page.click(action.config.target), page.waitForNavigation({waitUntil : 'load'})])   
            }
          }catch(e){
            console.log(e);
          }          
        }
      }
    }else if(action.type === 'typing'){
      return {
        type : action.type,
        f : async(page)=>{
          if(isCanceled.flag) return;
          for(let i = 0 ; i < action.config.input.length; i++){
            await page.type(action.config.input[i].tag, action.config.input[i].text)
          }
        }
      }
    }else if(action.type === 'waiting'){
      return {
        type : action.type,
        f : async(page) => {
          if(isCanceled.flag) return;
          return new Promise((resolve, reject)=>{
            setTimeout(()=>{resolve(true)}, action.config.time)
          })
        }
      }
    }else if(action.type === 'href'){
      return {
        type : action.type,
        f : async (page) => {
          try {
            if(isCanceled.flag) return;
            const hrefs = await hrefsExtract({page : page, data : {hrefs : action.config.hrefs}})
            return hrefs;
          }catch(e){
            console.log(e);
          }
        }
      }
    }
    else if(action.type === 'download'){

    }else if(action.type === 'upload'){

    }else if(action.type === 'capture'){
      
    }
  })
}
/**
 * 
 * @param {Object} page - puppeteer page
 * @param {ActionArray} data 
 */
async function* sequenceAction(page, data, iscanceled){    
  const actions = await generateActions(data, iscanceled) 
  try {
    while(actions.length){  
      let action = actions.shift();      
      // console.log(action.type);
      const result = await action.f(page)      
      if(action.type === 'scraping') yield result;          
    }
  }catch(e){
    console.log(e);
  }
}

/** 
 * @param {Object} param
 * @param {*} param.page - puppeteer page
 * @param {Object} param.data - cluster data 
 * @param {Routine} param.data.routine - routine
 */
const actionScraper = async ({page, data, worker}) => {
  try {
    const isCanceled = {flag : false};
    let dataIdx = 0;
    data.routine.config.actions.unshift({
      type : 'visit',
      config : {
        url : data.routine.config.startUrl
      }
    })    
    engine.eb.on('cancel', (cancelBotName) => {      
      if(cancelBotName === data.routine.name){
        console.log(chalk.redBright(cancelBotName + ' 봇 강제 종료'))  
        isCanceled.flag = true;
      }
    })
    
    console.log(chalk.blueBright('액션 데이터 생성중'))  
    const actionsData = await GenerateActionData(page, data.routine.config.actions, data.routine.config.startUrl);
    if(actionsData[1].type === 'visit') actionsData.shift();
    const fileData = actionsData.filter((d)=> d.type === 'scraping').map(()=> [])
    console.log(chalk.blueBright('액션 데이터 생성 완료'))  
    console.log(chalk.greenBright('액션 시퀀스 실행 시작'))  
    for(let i = 0 ; i < data.routine.config.repeat; i++){
      for await(const result of sequenceAction(page, actionsData, isCanceled)){     
        if(result){
          if(result.images.length){
            const imgDownloaded = {};
            while(images.length){
              const image = images.shift();
              if(imgDownloaded.hasOwnProperty(image.filename)) continue;
        
              const response = await fetch(image.url)      
              const dest = fs.writeFile(image.filename);
              response.body.pipe(dest)
              imgDownloaded[image.filename] = image.url;      
            }    
          }        
          fileData[dataIdx].push(...result.fileData)
          dataIdx++;
        }
      }
      dataIdx = 0;
    }
    if(!isCanceled.flag){      
      console.log(chalk.blueBright(data.routine.name + "의 결과를 json으로 기록중"))
      fileData.forEach((fileContent, i)=>{
        fs.writeFileSync(
          data.routine.name + '-data'+ i+'-result.json'
          ,JSON.stringify(fileContent)
          ,{'flag': 'a'}
        );
      }) 
      console.log(chalk.blueBright(data.routine.name + "의 결과를 json으로 기록완료"))

    }
    
    console.log(chalk.greenBright(data.routine.name + '의 액션 시퀀스 실행 종료'))      
  } catch(e){
    console.log(e);
  }
}

exports.actionScraper = actionScraper