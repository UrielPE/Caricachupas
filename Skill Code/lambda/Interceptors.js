
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const languageStrings = require( './localization' );

module.exports = {
    
    // This request interceptor will log all incoming requests to this lambda
    LoggingRequestInterceptor : {
        process(handlerInput) {
            console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
        }
    },
    
    // This response interceptor will log all outgoing responses of this lambda
    LoggingResponseInterceptor : {
        process(handlerInput, response) {
          console.log(`Outgoing response: ${JSON.stringify(response)}`);
        }
    },
    
    // This request interceptor will bind a translation function 't' to the requestAttributes.
     LocalizationInterceptor : {
      process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
          lng: handlerInput.requestEnvelope.request.locale,
          overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
          resources: languageStrings,
          returnObjects: true
        });
        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function (...args) {
          return localizationClient.t(...args);
        }
      }
}
};