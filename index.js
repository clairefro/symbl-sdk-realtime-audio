require('dotenv').config()
const { sdk } = require("symbl-node");
const uuid = require("uuid").v4;
// For demo purposes, we're using mic to simply get audio from microphone and pass it on to websocket connection
const mic = require("mic");


const sampleRateHertz = 16000;

const micInstance = mic({
  rate: sampleRateHertz,
  channels: "1",
  debug: false,
  device: 'default', // NOTE - needed to add this to override the device from mic library, which is suited for raspberry pi
  exitOnSilence: 6,
});

let conversationId;

(async () => {
  try {
    // Initialize the SDK
    await sdk.init({
      appId: process.env.APP_ID,
      appSecret: process.env.APP_SECRET,
      basePath: "https://api.symbl.ai",
    });

    // Need unique Id
    const id = uuid();

    // Start Real-time Request (Uses Realtime WebSocket API behind the scenes)
    const connection = await sdk.startRealtimeRequest({
      id,
      insightTypes: ["action_item", "question"],
      config: {
        meetingTitle: `My Test Meeting ${new Date().toISOString()}`,
        confidenceThreshold: 0.7,
        timezoneOffset: 480, // Offset in minutes from UTC
        languageCode: "en-US",
        sampleRateHertz,
      },
      speaker: {
        // Optional, if not specified, will simply not send an email in the end.
        userId: process.env.USER_EMAIL,
        name: process.env.USER_NAME,
      },
      handlers: {
        /**
         * This will return live speech-to-text transcription of the call.
         */
        onSpeechDetected: (data) => {
          console.log(JSON.stringify(data));
          if (data) {
            const { punctuated } = data;
            console.log("Live: ", punctuated && punctuated.transcript);
          }
        },
        /**
         * When processed messages are available, this callback will be called.
         */
        onMessageResponse: (data) => {
          console.log("onMessageResponse", JSON.stringify(data, null, 2));
          // console.log("onMessageResponse", data.map(i => i.payload.content));
        },
        /**
         * When Symbl detects an insight, this callback will be called.
         */
        onInsightResponse: (data) => {
          console.log("onInsightResponse", JSON.stringify(data, null, 2));
        },
        /**
         * When Symbl detects a topic, this callback will be called.
         */
        onTopicResponse: (data) => {
          console.log("onTopicResponse", JSON.stringify(data, null, 2));
        },
      },
    });
    console.log(
      "Successfully connected. Conversation ID: ",
      connection.conversationId
    );

    conversationId = connection.conversationId;

    const micInputStream = micInstance.getAudioStream();

    /** Raw audio stream */
    micInputStream.on("data", (data) => {
      // Push audio from Microphone to websocket connection
      connection.sendAudio(data);
    });

    micInputStream.on("error", function (err) {
      cosole.log("Error in Input Stream: " + err);
    });

    micInputStream.on("startComplete", function () {
      console.log("Started listening to Microphone.");
    });

    micInputStream.on("silence", function () {
      console.log("Got SIGNAL silence");
    });

    micInstance.start();
    
    // gracefully shut down on sigint
    process.on("SIGINT", async function () {
      
      micInstance.stop();
      console.log("Stopped listening to Microphone.");
      try {
        // Stop connection
        await connection.stop();
        console.log("Connection Stopped.");
      } catch (e) {
        console.error("Error while stopping the connection.", e);
      }
      if (conversationId) {
        console.log(
          "Details of this conversation stream can be queried at conversationId: ",
          conversationId
        );
      }

      process.exit();
    });

    // setTimeout(async () => {
    //   // Stop listening to microphone
    // }, 60 * 1000 ); // Stop connection after 10 sec
  } catch (e) {
    console.error("Error: ", e);
  } 
})();