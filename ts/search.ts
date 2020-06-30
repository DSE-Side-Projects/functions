// Step One in updating screenshots in Sanity upon an application update

// Triggered by a Github webhook

import fetchData from "node-fetch";
const crypto = require("crypto")

const SCREENSHOT_FUNCTION = "http://localhost:8888/.netlify/functions/screenshot";

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

exports.handler = async (event: NetlifyResponse, callback: any) => {
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

  const body: Record<string, string> = JSON.parse(event.body);

  if(!body.appId || !body.siteUrl || Object.keys(body).length > 2){
    return {
      statusCode: 400,
      body: "Invalid Request. appId & siteUrl are required. Only these two params are allowed."
    };
  }

  const { siteUrl, appId } = body

  // find app 

  const findApp = async (appId: string, siteUrl?: string ) => {
    const app = await appsArray()
    .then(docs => {
        return docs.find(app => app._id === appId && app.url === siteUrl)
      })
    return app;
  }

  const app = await findApp(appId, siteUrl)

  if(app === undefined) {
    return { statusCode: 404, body: "App Not Found 🤷🏽‍♀️"}
  }
  
  // send these to screenshot function
  fetchData(SCREENSHOT_FUNCTION, { method: 'POST', headers: { "Accept": "application/json", "X-Nonce": "app" }, body: JSON.stringify({"appId": app!._id, "siteUrl" : app!.url, "timestamp": generateNonce().timestamp, "nonce":generateNonce().nonce }) })
    .then(response => response.json())
    .then(data => ({
      statusCode: 200,
      body: data
    }))

  return {statusCode: 200,
    body: JSON.stringify({"success": "Going to take a screenshot now!"})
    }
}
