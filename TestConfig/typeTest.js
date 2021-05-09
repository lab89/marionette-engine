exports.typeTest = {
    type: 'action_scraping',
    name: 'sequence-scraping-bot2',
    config : {
      startUrl : 'http://quotes.toscrape.com',
      repeat : 5,       
      actions : [
        {
          type : 'visit',
          config : {
            url : 'http://quotes.toscrape.com/login'
          }            
        },
        {
          type : 'typing',
          config : {
            input : [
              {
                tag : 'input[name=username]',
                text : 'hello'
              },
              {
                tag : 'input[name=password]',
                text : 'world'
              }
            ]
          }
        },
        {
          type : 'click',
          config : {
            target : 'input[type=submit]'
          }
        },            
        {
          type : 'scraping',
          config : {
            targets : [
              {
                label : 'text',
                selector : 'div.quote>span.text',
                match : '',
                preprocess : ''
              }
            ]                
          }
        }, 
        {
          type : 'waiting',
          config : {
            time : 3000
          }
        }           
      ]
    }
  }