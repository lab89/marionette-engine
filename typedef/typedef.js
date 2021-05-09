/**
 * 
 * @typedef {Object} HrefAction
 * @property {string} type - href
 * @property {Object} config
 * @property {string[]} config.hrefs - extract url from a tag css selector list 
 */

/**
 * 
 * @typedef {Object} ScrapingAction
 * @property {string} type - scraping
 * @property {Object} config
 * @property {Object[]} config.targets - scraping target, column information
 * @property {string} targets[].label - column name of extracted data
 * @property {string} targets[].selector - target css selector
 * @property {string} targets[].postprocess - post process of extracting data
 */

/**
 * 
 * @typedef {Object} VisitAction
 * @property {string} type - visit
 * @property {Object} config
 * @property {string} config.url - url adress to visit
 */

/**
 * 
 * @typedef {Object} ClickAction
 * @property {string} type - click
 * @property {Object} config
 * @property {string} config.target - click target css selector
 */

/**
 * 
 * @typedef {Object} ScrollAction
 * @property {string} type - scroll 
 */

/**
 * 
 * @typedef {Object} TypeAction
 * @property {string} type - click
 * @property {Object} config
 * @property {Object[]} config.input - input actions
 * @property {string} config[].tag - input css selector
 * @property {string} config[]].text - input text
 */

/**
 * Options for showing a dialog.
 * @typedef {Object} Routine
 * @property {String} name - bot name
 * @property {Object} config - configuration of The routine*
 * @property {string} config.startUrl Title of the dialog.
 * @property {number} config.repeat - how many bot action do repeat?*
 * @property {Actions} config.actions Use constants for this. (See docs)
 */

/**
 * @typedef {HrefAction | ScrapingAction | VisitAction | ClickAction | ScrollAction | TypeAction} Actions
 */
/** 
 * @typedef {(Actions)[]} ActionArray 
 */


/**
 * @typedef {Object} MarionetteAction
 * @property {String} type - Marionette Action Type
 * @property {Promise<*>} f - Marionette Action Function
 */