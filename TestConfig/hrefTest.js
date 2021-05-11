exports.heftTest = {
  
  name: 'bot2',
  config : {
    startUrl : 'http://quotes.toscrape.com',
    repeat : 1,       
    actions : [
      {
        type: 'href',
        config : {
          hrefs : ['div.quote>span>small.author+a']
        }
      },
      {
        type : 'scraping',
        config : {
          targets : [
            {
              label : 'text',
              selector : 'h3.author-title',
              match : '',
              preprocess : ''
            }
          ]                
        }
      }, 
      {
        type : 'href',
        config : {
          hrefs : ['.col-md-8>h1>a']
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
    ]
  }
}