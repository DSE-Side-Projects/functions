// Step One in updating screenshots in Sanity upon an application update

// Triggered by a Github webhook

import fetchData from "node-fetch";
const crypto = require("crypto")

const SCREENSHOT_FUNCTION = "https://dse-functions.netlify.app/.netlify/functions/screenshot"

const generateNonce = () => {
  const timestamp = Date.now().toString();
  const hash = crypto.createHash("sha256")
  const nonce = hash.update(timestamp)
  return {"timestamp": timestamp, "nonce": nonce.digest("hex")};
}

const appsArray = async () => {
  const app = await fetchData(
      `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v1/data/query/production?query=*[_type == "app"]`,
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
  return app
}

exports.handler = async (event: NetlifyResponse) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const isJsonString: ValidateJson = (str: string) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

  if(!isJsonString(event.body) || event.body === undefined || event.body === null){
    return {
      statusCode: 400,
      body: "Invalid Request. Valid JSON body is required."
    };
  }

  const body: Required<GithubPayload> = JSON.parse(event.body);

  if(!body.repository){
    return {
      statusCode: 400,
      body: "Invalid Request"
    };
  }

  const githubHookSecret = event.headers["x-hub-signature"]
  const githubHookSecretHash = crypto.createHmac("sha1", process.env.GITHUB_HOOK_SECRET)
  const githubHookHashedSecret = githubHookSecretHash.update(event.body)
  const githubHookSecretResult = githubHookHashedSecret.digest('hex')
  console.log(githubHookSecret, `\nsha1=${githubHookSecretResult}`)

  if(githubHookSecret !== `sha1=${githubHookSecretResult}`){
    return {
      statusCode: 401,
      body: "Unauthorized"
    };
  }

  const { homepage } = body.repository

  // find app 

  const findApp = async (siteUrl: string) => {
    const app = await appsArray()
    .then(docs => {
        return docs.find(app => app.url === siteUrl)
      })
    return app;
  }

  const app = await findApp(homepage)

  if(app === undefined) {
    return { statusCode: 404, body: "App Not Found 🤷🏽‍♀️"}
  }
  
  // send these to screenshot function
  const debug = await fetchData(SCREENSHOT_FUNCTION, { method: 'POST', headers: { "Accept": "application/json", "X-Nonce": "app" }, body: JSON.stringify({"appId": app!._id, "siteUrl" : app!.url, "timestamp": generateNonce().timestamp, "nonce":generateNonce().nonce }) })
    .then(response => response.json())
    .then(data => ({
      statusCode: 200,
      body: data
    }))

    console.log(JSON.stringify({"appId": app!._id, "siteUrl" : app!.url, "timestamp": generateNonce().timestamp, "nonce":generateNonce().nonce}))

  return {statusCode: 200,
    body: JSON.stringify({"success": "Going to take a screenshot now!", "passed along": JSON.stringify({"appId": app!._id, "siteUrl" : app!.url, "timestamp": generateNonce().timestamp, "nonce":generateNonce().nonce })})
    }
}
