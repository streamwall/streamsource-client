# streamsource-client
Node API Client for Streamsource

## State of the project
Highly volatile; breaking changes will be committed unapologetically

## Install
```
npm install streamsource-client
```

## Prerequisite: Obtain a JWT from the Streamsource server
Certain methods may require an authenticated and/or authorized JSON Web Token. To obtain this token, follow the steps documented in the [Streamsource README](https://github.com/streamwall/streamsource/#getting-started-with-authentication).

## Examples
```javascript
// Create an API client with your JWT
const StreamsourceClient = require('streamsource-client')
const streamsource = StreamsourceClient(YOUR_STREAMSOURCE_JWT)

// Search for streams
const streamsData = await streamsource.getStreamsData({
  notPlatform: 'WSDOT',
  isExpired: false,
  isPinned: false,
  orderFields: ['createdAt'].join(','),
  orderDirections: ['DESC'].join(','),
})

// Get info on a specific stream
const streamData = await streamsource.getStreamData(12345)

// Add a new stream
const streamOptions = {
  link: 'https://my-stream-url.com/',
  postedBy: 'My Bot Name',
  city: 'Seattle',
  region: 'WA',
}
await streamsource.createStream(streamOptions)

// Update a stream
const updatedStream = await streamsource.updateStream({id: 12345, status: 'Live'})

// Expire a stream
await streamsource.expireStream(12345)
```