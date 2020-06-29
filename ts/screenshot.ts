// import sanityClient from "@sanity/client"
import fetchData from "node-fetch"
const crypto = require("crypto")

// const client = sanityClient({ 
//   projectId: process.env.SANITY_PROJECT_ID,
//   dataset: "production",
//   token: process.env.SANITY_API_TOKEN,
//   useCdn: false
// })



exports.handler = async (event: NetlifyResponse) => {
  // Checking if request is legit
  const nonceCheck = (timestamp: string, nonce: string) => {
    const hash = crypto.createHash("sha256")
    const nonceValue = hash.update(timestamp)
    return nonceValue.digest("hex") === nonce
  }

  const body = JSON.parse(event.body)

  if(!body || !body.appId || !body.siteUrl || !body.timestamp || !body.nonce ) {
    return {
      statusCode: 400,
      body: JSON.stringify({"response": "Invalid request body", "requestBody": body})
    }
  }

  if(nonceCheck(body.timestamp, body.nonce) === false){
    console.log({"verified": nonceCheck(body.timestamp, body.nonce), "error": "401", "response": "You sneaky bastard! 😡"})
    return {
      statusCode: 401,
      body: JSON.stringify({"error": "401", "response": "You sneaky bastard! 😡", "valid": nonceCheck(body.timestamp, body.nonce) })
    }
  }

  // Rudimentary logging to serverless function console
  // TODO: replace with proper logging eventually
  console.info("Nonce ✅", "\nTaking screenshot")

  const url=`https://api.microlink.io?url=${body.siteUrl}&overlay.browser=dark&overlay.background=%23edf2f7&screenshot=true&meta=false&embed=screenshot.url&viewport.height=800`

  const fetchScreenshot = await fetchData(url)

  if (fetchScreenshot.status !== 200) {
    const resetTimestamp = Number(fetchScreenshot.headers.get("x-rate-limit-reset"))
    const resetTime: string = new Date(resetTimestamp * 1000).toLocaleString()
    const errorMessage = {
      error: fetchScreenshot.statusText,
      rateLimitResetTime: resetTime,
    }
    return { body: JSON.stringify(errorMessage), statusCode: "500" }
  }

  console.info(fetchScreenshot.statusText)

  return { 
    body: JSON.stringify({ "response": fetchScreenshot.statusText}),
    statusCode: 200
  }

  const app = await fetchData(
    `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v1/data/query/production?query=*[_id == "${body.appId}"]`,
    {
      method: "get",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
      },
    }
  )
  .then((response) => response.json())
  .then((result: Record<string, SanityDocument[]>) => result.result)

  console.log(app);

  return {
    statusCode: 200,
    body: JSON.stringify(nonceCheck(body.timestamp, body.nonce))
  };

  // const responseBodyArray: Array<string> = []
  // const documents: Array<SanityDocument> = await documentArray()
  // for (let i = 0; i < documents.length; i++) {
  //   const doc: SanityDocument = documents[i]
  //   const SITE_URL: string = doc.url

  //   const url=`https://api.microlink.io?url=${SITE_URL}&overlay.browser=dark&overlay.background=%23edf2f7&screenshot=true&meta=false&embed=screenshot.url&viewport.height=800`

  //   const fetchScreenshot = await fetchData(url)
  //   const data = await fetchScreenshot
  //   if (data.status !== 200) {
  //     const resetTimestamp = Number(data.headers.get("x-rate-limit-reset"))
  //     const resetTime: string = new Date(resetTimestamp * 1000).toLocaleString()
  //     const errorMessage = {
  //       error: data.statusText,
  //       rateLimitResetTime: resetTime,
  //     }
  //     return { body: JSON.stringify(errorMessage), statusCode: "500" }
  //   } else {
  //     responseBodyArray.push(doc._id)
  //     const screenshotImage = await data.arrayBuffer()
  //     const buff: Buffer = await Buffer.from(
  //       new Uint8Array(await screenshotImage)
  //     )
  //     client.assets
  //       .upload("image", buff, {
  //         filename: `${doc._id}-screenshot.png`,
  //       })
  //       .then((imageAsset: ImageAsset) => {
  //         const mutations = [
  //           {
  //             patch: {
  //               id: doc._id,
  //               set: {
  //                 screenshot: {
  //                   _type: "image",
  //                   asset: {
  //                     _type: "reference",
  //                     _ref: imageAsset._id,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         ]
  //         fetchData(
  //           `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v1/data/mutate/production`,
  //           {
  //             method: "post",
  //             headers: {
  //               "Content-type": "application/json",
  //               Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
  //             },
  //             body: JSON.stringify({ mutations }),
  //           }
  //         )
  //           .then((response) => response.json())
  //           .then((result: string) => {
  //             responseBodyArray.push(result)
  //           })
  //       })
  //   }
  // return { body: JSON.stringify(responseBodyArray), statusCode: "200" }
  
  }
