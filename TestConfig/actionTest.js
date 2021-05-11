exports.actionTest = {
  name: 'bot1',
  config : {
    startUrl : 'http://quotes.toscrape.com',
    repeat : 5,       
    actions : [
      {
        type : 'visit',
        config : {
          url : 'http://quotes.toscrape.com/scroll'
        }            
      },
      {
        type : 'waiting',
        config : {
          time : 2000
        }
      },
      {
        type : 'scroll',
        config : {
          scrollX : 0,
          scrollY : 100
        }
      },
      {
        type : 'scraping',
        config : {                
          targets : [
            {
              label : 'content',
              selector : 'div.quote>span.text',
              match : '',
              preprocess : ''
            },
            {
              label : 'content2',
              selector : 'div.quote>span.text',
              match : '',
              preprocess : ''
            }
          ] 
        }
      },
      {
        type : 'click',
        config : {
          target : '.col-md-8>h1>a'
        }
      },
      {
        type : 'click',
        config : {
          target : 'div.quote>span>small.author+a'
        }
      },
      {
        type : 'scraping',
        config : {
          targets : [
            {
              label : 'author',
              selector : 'div.author-details>h3.author-title',
              match : '',
              preprocess : ''
            }
          ]  
        }
      },            
    ]
  }
}