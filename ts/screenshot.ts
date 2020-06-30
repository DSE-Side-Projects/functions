const sanityClient = require("@sanity/client")
import fetchData from "node-fetch"
const crypto = require("crypto")

const client = sanityClient({ 
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: "production",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
})

exports.handler = async (event: NetlifyResponse) => {
  // Checking if request is legit
  const nonceCheck = (timestamp: string, nonce: string) => {
    const hash = crypto.createHash("sha256")
    const nonceValue = hash.update(timestamp)
    return nonceValue.digest("hex") === nonce
  }

  const body: Record<string, string> = JSON.parse(event.body);

  const {timestamp, nonce, appId, siteUrl } = body

  const validBody = (body: Record<string, string>) => {
    if(!body || !appId || !siteUrl || !timestamp || !nonce ) {
      console.error({"response": "Invalid request body", "requestBody": body})
      return false;
    }

    if(nonceCheck(timestamp, nonce) === false){
      console.log({"verified": nonceCheck(timestamp, nonce), "error": "401", "response": "You sneaky bastard! 😡"})
      return false
    }
    
    // Rudimentary logging to serverless function console
    // TODO: replace with proper logging eventually
    console.info("Nonce ✅", "\nBody Valid ✅", "\nAll params valid ✅", "\nTaking screenshot...")
    return true
  }
  if(!validBody(body)){
    return {
      body: JSON.stringify({"status": "❌", "response": "Validation failed"}),
      statusCode: 400
    }
  }

  const url=`https://api.microlink.io?url=${body.siteUrl}&overlay.browser=dark&overlay.background=%23edf2f7&screenshot=true&meta=false&embed=screenshot.url&viewport.height=800`

  const fetchScreenshot = await fetchData(url)

  if (fetchScreenshot.status !== 200) {
    const resetTimestamp = Number(fetchScreenshot.headers.get("x-rate-limit-reset"))
    const resetTime: string = new Date(resetTimestamp * 1000).toLocaleString()
    const errorMessage = {
      error: fetchScreenshot.statusText,
      rateLimitResetTime: resetTime,
    }
    console.error("❌ Screenshot not taken", "\nRate Limit exceeded or something: " + fetchScreenshot.statusText)
    return { body: JSON.stringify(errorMessage), statusCode: "500" }
  }else{
    console.info("✅ Screenshot taken", "\nUploading to Sanity")
  }

  const datetime = new Date();
  const screenshotImage = await fetchScreenshot.arrayBuffer()
  const buff: Buffer = Buffer.from(
    new Uint8Array(screenshotImage)
  )

  const upload = await client.assets
    .upload("image", buff, {
      filename: `${body.appId}-screenshot.png`,
    })
    .then((imageAsset) => {
      const mutations = [{
        patch: {
          id: body.appId,
          set: {
            screenshot: {
              image: {
                _type: "image",
                asset: {
                  _type: "reference",
                  _ref: imageAsset._id,
                },
              },
              screenshotMetadata: {
                timestamp: datetime.toISOString(),
                source: "function"
              }
            },
          },
        },
      }]

      return fetchData(
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
      .then((response) => response.json())
      .then((result: string) => {
        return result
      })
    })
  
    console.log({"status": "✅", "response": upload, "metadata": { "timestamp": Date.now()}})

  return { 
    body: JSON.stringify({"status": "✅", "response": upload, "metadata": { "timestamp": Date.now()}}),
    statusCode: 200
  }
}
