const fetch = require('node-fetch')

// Maps server keys to client keys; whitelists attributes
const STREAM_DATA_MAP = {
  'id':        'id',
  'source':    'source',
  'platform':  'platform',
  'link':      'link',
  'status':    'status',
  'title':     'title',
  'isPinned':  'isPinned',
  'isExpired': 'isExpired',
  'checkedAt': 'checkedAt',
  'liveAt':    'liveAt',
  'embedLink': 'embedLink',
  'postedBy':  'postedBy',
  'city':      'city',
  'region':    'region',
  'createdAt': 'createdAt',
  'updatedAt': 'updatedAt',
}

class Client {
  #DEFAULT_BASE_URI = "https://streams.streamwall.io"

  constructor(jwt, base_uri) {
    if (!jwt) {
      throw new Error("You must pass an authentication token")
    }
    this.jwt = jwt
    this.base_uri = base_uri || this.#DEFAULT_BASE_URI
  }

  async getStreamData(id) {
    if (!id) {
      throw new Error("getStreamData requires an id")
    }
    const endpoint = `${this.base_uri}/streams/${id}`
    return fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        const data = response.data
        return data.map(streamData => {
          const mappedStream = {}
          for (let [sourceKey, destinationKey] of Object.entries(STREAM_DATA_MAP)) {
            stream[destinationKey] = streamData[sourceKey]
          }
          return mappedStream
        })
      })
      .catch(error => {
        console.error(`Could not fetch stream id ${id}: `, endpoint, error)
        return []
      })
  }

  async getStreamsData(options) {
    const endpoint = `${this.base_uri}/streams`
    const url = new URL(endpoint)
    const params = new URLSearchParams(options)
    url.search = params

    return fetch(url)
      .then(async response => {
        return response.json()
      })
      .then(async response => {
        const data = response.data
        const mappedStreams = []
        data.forEach(streamData => {
          const stream = {}
          for (let [sourceKey, destinationKey] of Object.entries(STREAM_DATA_MAP)) {
            stream[destinationKey] = streamData[sourceKey]
          }
          mappedStreams.push(stream)
        })
        return mappedStreams
      })
      .catch(error => {
        console.log("Could not fetch streams: ", endpoint, error)
        return []
      })
  }

  async createStream({ link, city, region, source, postedBy, platform, status }) {
    if (!link) {
      throw new Error("createStream requires a link")
    }
    const endpoint = `${this.base_uri}/streams`
    const streamData = {
      link,
      city,
      region,
      source,
      postedBy,
      platform,
      status
    }
    const jsonStreamData = JSON.stringify(streamData)
    // console.log("Sending stream data: ", jsonStreamData)
    return fetch(
      endpoint, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${this.jwt}`
        },
        body:    jsonStreamData
      })
      .then(response => {
        return {
          status: response.status,
          data:   response.json()
        }
      })
      .then(({ status, data }) => {
        return {
          status,
          data
        }
      })
      .catch(error => {
        console.error("Error creating stream: ", endpoint, streamData, error)
        return
      })
  }

  async updateStream({ id, source, platform, link, title, status, city, region, postedBy, checkedAt, liveAt, embedLink }) {
    if (!id) {
      throw new Error("updateStream requires an id")
    }
    const endpoint = `${this.base_uri}/streams/${id}`
    const streamData = {
      source,
      platform,
      link,
      title,
      status,
      city,
      region,
      postedBy,
      checkedAt,
      liveAt,
      embedLink
    }
    const jsonStreamData = JSON.stringify(streamData)
    // console.log(`Updating stream id ${id}`, jsonStreamData)
    return fetch(
      endpoint, {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${this.jwt}`
        },
        body:    jsonStreamData
      })
      .then(response => {
        return response.json()
      })
      .then(response => {
        const data = response.data
        // console.log(`Updated stream ${id}`, data)
        return data
      })
      .catch(error => {
        console.error(`Error updating stream ${id}`, endpoint, streamData, error)
        return false
      })
  }

  async expireStream(streamId) {
    if (!streamId) {
      throw new Error("Must provide a stream id")
    }
    const endpoint = `${this.base_uri}/streams/${streamId}`
    return fetch(
      endpoint, {
        method:  'DELETE',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${this.jwt}`
        },
      })
      .then(response => {
        if (response.status != 204) {
          throw new Error("non-204 response", response)
        }
        return true
      })
      .catch(error => {
        console.error("Error expiring stream: ", endpoint, error)
        return false
      })
  }
}

module.exports.StreamsourceClient = Client
