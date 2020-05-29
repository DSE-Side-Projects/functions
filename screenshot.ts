const sanityClient = require("@sanity/client")
const fetchData = require("node-fetch")

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: "production",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const documentArray: responseArray = async () => {
  const docs = await fetchData(
    `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v1/data/query/production?query=*[_type == "app"]`,
    {
      method: "get",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
      },
    }
  )
    .then((response: Body) => response.json())
    .then((result: Record<string, any>) => result.result)
  return docs
}

exports.handler = async () => {
  const responseBodyArray: Array<string> = []
  const documents: Array<SanityDocument> = await documentArray()
  for (let i = 0; i < documents.length; i++) {
    const doc: SanityDocument = documents[i]
    const SITE_URL: string = doc.url
  
    const url = `https://api.apiflash.com/v1/urltoimage?access_key=7f3eb66149a5493abd0711522577c96b&format=jpeg&quality=85&response_type=image&transparent=true&url=${SITE_URL}&width=1080`

    const fetchScreenshot: Promise<Record<string, any>> = await fetchData(url)
    const data = await fetchScreenshot
    if (data.status !== 200) {
      const resetTimestamp = data.headers.get("x-rate-limit-reset")
      const resetTime: string = new Date(resetTimestamp * 1000).toLocaleString()
      const errorMessage = {
        error: data.statusText,
        rateLimitResetTime: resetTime,
      }
      return { body: JSON.stringify(errorMessage), statusCode: "500" }
    } else {
      responseBodyArray.push(doc._id)
      const screenshotImage = await data.arrayBuffer()
      const buff: Buffer = await Buffer.from(new Uint8Array(await screenshotImage))
      client.assets
        .upload("image", buff, {
          filename: `${doc._id}-screenshot.png`,
        })
        .then((imageAsset: any) => {
          const mutations = [
            {
              patch: {
                id: doc._id,
                set: {
                  screenshot: {
                    _type: "image",
                    asset: {
                      _type: "reference",
                      _ref: imageAsset._id,
                    },
                  },
                },
              },
            },
          ]
          fetchData(
            `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v1/data/mutate/production`,
            {
              method: "post",
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
              },
              body: JSON.stringify({ mutations }),
            }
          )
            .then((response: any) => response.json())
            .then((result: any) => {
              responseBodyArray.push(result)
            })
        })
    }
  }

  return { body: JSON.stringify(responseBodyArray), statusCode: "200" }
}
