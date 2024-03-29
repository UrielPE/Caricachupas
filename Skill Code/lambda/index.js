// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.

// import dependencies
const Alexa = require('ask-sdk-core');

// import interceptors
const interceptors = require( './Interceptors' );

// Definiendo el obj para obtener  slots
const {
    getSlotValue
} = require('ask-sdk-core');

// these are the permissions needed to get the first name
const GIVEN_NAME_PERMISSION = ['alexa::profile:given_name:read'];

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        
        const { attributesManager, serviceClientFactory, requestEnvelope } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        if( !sessionAttributes['name'] )
        {
            //obtener desde apis de Alexa
            try
            {
                const { permissions } = requestEnvelope.context.System.user;
                if( !permissions )
                    throw { statusCode: 401, message: 'No permissions available' }; //  there are zone permissions, no point in intializing the API
                    
                const upsServiceClient = serviceClientFactory.getUpsServiceClient();
                const profileName = await upsServiceClient.getProfileGivenName();  
                
                if (profileName) { // the user might not have set the name
                  //save to session and persisten attributes
                  sessionAttributes['name'] = profileName;
                } 
            }catch( error ){
                console.log(JSON.stringify(error));
                if (error.statusCode === 401 || error.statusCode === 403) {
                    // the user needs to enable the permissions for given name, let's send a silent permissions card.
                  handlerInput.responseBuilder.withAskForPermissionsConsentCard(GIVEN_NAME_PERMISSION);
                }
            }
        }//end if
        
        const requestAttributes = attributesManager.getRequestAttributes(); 
        const name = sessionAttributes[ 'name' ] ? sessionAttributes['name' ] : '';
        const speakOutput = requestAttributes.t('WELCOME_MESSAGE', name);
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

//RulesIntentHandler
const RulesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RulesIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('RULES_MESSAGE');
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};//end RulesIntentHandler

//CategoryIntentHandler
const CategoryIntentHandler = {
    canHandle( handlerInput ){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CategoryIntent';
    },
    handle( handlerInput ){
        
        //sessionAttributes declared
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        //Localización del host
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        
        // obteniendo y asignado en valor a la variable category
        var category = getSlotValue(handlerInput.requestEnvelope, 'category');
        
        
        // Obteniendo el Id del slot
        const {intent} = handlerInput.requestEnvelope.request;
        const categoryId = intent.slots.category.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        
        // guardando la variable dentro de la session
        sessionAttributes.category = category;
        sessionAttributes.categoryId = categoryId;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        const speakOutput = requestAttributes.t( 'CATEGORY_MSG', category);
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};///end CategoryIntentHandler 

//GameIntentHandler
const GameIntentHandler = {
    canHandle( handlerInput ){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GameIntent';
    },
    handle( handlerInput )
    {
        const { attributesManager, requestEnvelope } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        const animalArray = ["caballos", "aves", "perros", "gatos"];

        
        //Get values sessionAttributes
        const sessionAttributes = attributesManager.getSessionAttributes();
        const categoryName = sessionAttributes.category;
        var speakOutput = null;
        var animalName = getSlotValue(handlerInput.requestEnvelope, 'Animaltype');
        
        if(animalName === undefined && !sessionAttributes.animalName){
            speakOutput =  requestAttributes.t( 'CARICACHUPAS_MSG', categoryName );
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        sessionAttributes.animalName = animalName;
        for(var i = 0; i < animalArray.length; i++){
            if( animalName === animalArray[i]){
            speakOutput = requestAttributes.t('OK_MSG');
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
            }
        }
        
        speakOutput =  requestAttributes.t( 'LOSE_MSG' );
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};///end GameIntentHandler

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const { attributesManager, requestEnvelope } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t( 'GOODBYE_MSG' );
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RulesIntentHandler,
        HelpIntentHandler,
        CategoryIntentHandler,
        GameIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(
        interceptors.LocalizationInterceptor,
        interceptors.LoggingRequestInterceptor)
    .addResponseInterceptors(
        interceptors.LoggingResponseInterceptor)
    .addErrorHandlers(
        ErrorHandler
    )
    .withApiClient(new Alexa.DefaultApiClient() )
    .lambda();
