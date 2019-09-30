const Alexa = require('ask-sdk-core');

var speakOutput = '';
var AWS = require('aws-sdk'); // Load the AWS SDK for Node.js
AWS.config.update({region: 'us-east-1'}); // Set the region
var s3 = new AWS.S3({apiVersion: '2006-03-01'}); // Create S3 service object

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        speakOutput = 'Welcome sir, how can i help you?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const FetchBucketsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FetchBucketsIntent';
    },
    async handle(handlerInput) {
        fetchSpeakOutput = '';
        // Call S3 to list the buckets
        await s3.listBuckets(function(err, data) {
            if (err) {
                console.log("Error", err);
                fetchSpeakOutput = 'There was an error while fetching your buckets.';
            } else {
                console.log("Success", data.Buckets);
                fetchSpeakOutput = 'You have ' + data.Buckets.length + ' buckets.';
            }
        }).promise();
        return handlerInput.responseBuilder.speak(fetchSpeakOutput).getResponse();
    }
};

const ListBucketsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListBucketsIntent';
    },
    async handle(handlerInput) {
        names = '';
        listSpeakOutput = 'first speach output';
        await s3.listBuckets(function (err, data) {
            if (err) {
                console.log("Error", err);
                listSpeakOutput = 'There was an error while fetching your buckets';
            }
            else {
                nameCount = data.Buckets.length;
                for (var i in data.Buckets) {
                    names += data.Buckets[i]['Name'];
                    if (i == nameCount - 2) {
                        names += ' and ';
                    }
                    else if (i != nameCount - 1) {
                        names += ', ';
                    }
                }
            }
            listSpeakOutput = 'You\'re buckets are, ' + names;
        }).promise();
        console.log(listSpeakOutput);
        return handlerInput.responseBuilder.speak(listSpeakOutput).getResponse();
    }
};

// this needs some errorhandling
const CreateBucketsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreateBucketsIntent';
    },
    async handle(handlerInput) {
        createspeakOutput = '';
        // Create the parameters for calling createBucket
        var bucketParams = {
            Bucket : Alexa.getSlotValue(handlerInput.requestEnvelope, 'bucketname'),
            ACL : 'public-read',
            // CreateBucketConfiguration: {
            //     LocationConstraint: 'us-east-1'
            // },
        };
        console.log(bucketParams)
        // call S3 to create the bucket
        await  s3.createBucket(bucketParams, function(err, data) {
            if (err) {
                console.log("Error", err);
                createspeakOutput = 'There was an error creating the bucket.';
            } else {
                console.log("Success", data);
                createspeakOutput = 'You have created ' + data.bucketname + ' bucket.';
            }
        }).promise();
        return handlerInput.responseBuilder.speak(createspeakOutput).getResponse();
    }
};

// this too needs some error handling
const DeleteBucketsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteBucketsIntent';
    },
    async handle(handlerInput) {
        // var bucketName = this.event.requestEnvelope.request.intent.slots['bucketname'].value
        // Create params for S3.deleteBucket
        var bucketParams = {
            Bucket : Alexa.getSlotValue(handlerInput.requestEnvelope, 'bucketname'),
        };
        // Call S3 to delete the bucket
        await s3.deleteBucket(bucketParams, function(err, data) {
            if (err) {
                console.log("Error", err);
                deleteSpeakOutput = 'There was a problem deleting that bucket sir. This is the error am getting';
            } else {
                console.log("Success", data);
                deleteSpeakOutput = 'You have successfully deleted';
            }
        }).promise();
        return handlerInput.responseBuilder.speak(deleteSpeakOutput).getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        speakOutput = 'You can say hello to me! How can I help?';

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
        speakOutput = 'Goodbye!';
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

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

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
        FetchBucketsIntentHandler,
        ListBucketsIntentHandler,
        CreateBucketsIntentHandler,
        DeleteBucketsIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();

// TO-DO List
// AWS s3 API calls Error and Exception handling for all handler requests.
