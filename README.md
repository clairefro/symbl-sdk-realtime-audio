## symbl.ai sdk test

Tests [symbl.ai](https://docs.symbl.ai/docs/)'s sdk for supporting realtime audio transcript with live insights feed. 

Based on 
https://docs.symbl.ai/docs/javascript-sdk/guides/push-audio-get-realtime-data

### Env variables

#### App credentials
[Make an account](https://platform.symbl.ai/#/login) with symbl.ai to get API credentials.

#### User info

Provide `USER_NAME` and `USER_EMAIL` if you would like a person associated with this transcript.

A link to an overview of conversation insights will be emailed to the provided address. Leave blank if email is not desired.

### Pre-install

Make sure you have [sox](https://at.projects.genivi.org/wiki/display/PROJ/Installation+of+SoX+on+different+Platforms) installed on your device.

This app uses the [mic](https://www.npmjs.com/package/mic) library which is dependent on `sox`.

### Install

`yarn install`

### Usage 

#### Run

`node index.js`

Start speaking aloud and a live transcript will appear on screen.

To end the stream, press `ctrl + C`. The conversationId will be displayed.

#### Viewing conversation insights

At the end of the session, a conversation ID is printed to the console.

Use the [symbl.ai API](https://docs.symbl.ai/docs/?_ga=2.206273873.31393513.1615136991-182210743.1614828840) to extract conversation insights.

**Conversation info**
`GET https://api.symbl.ai/v1/conversations/{{conversation_id}}`

**Transcript**
`GET https://api.symbl.ai/v1/conversations/{{conversation_id}}/messages`

**Topics**
`GET https://api.symbl.ai/v1/conversations/{{conversation_id}}/topics`

**Topics w/ sentiment analysis**
`GET https://api.symbl.ai/v1/conversations/{{conversation_id}}/topics?sentiment=true`

**Members**
`GET https://api.symbl.ai/v1/conversations/{{conversation_id}}/members`

**Analytics**
`GET https://api.symbl.ai/v1/conversations/{{conversation_id}}/analytics`
