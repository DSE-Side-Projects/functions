"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// import sanityClient from "@sanity/client"
var node_fetch_1 = require("node-fetch");
var crypto = require("crypto");
// const client = sanityClient({ 
//   projectId: process.env.SANITY_PROJECT_ID,
//   dataset: "production",
//   token: process.env.SANITY_API_TOKEN,
//   useCdn: false
// })
exports.handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var nonceCheck, body, url, fetchScreenshot, resetTimestamp, resetTime, errorMessage, app;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nonceCheck = function (timestamp, nonce) {
                    var hash = crypto.createHash("sha256");
                    var nonceValue = hash.update(timestamp);
                    return nonceValue.digest("hex") === nonce;
                };
                body = JSON.parse(event.body);
                if (!body || !body.appId || !body.siteUrl || !body.timestamp || !body.nonce) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            body: JSON.stringify({ "response": "Invalid request body", "requestBody": body })
                        }];
                }
                if (nonceCheck(body.timestamp, body.nonce) === false) {
                    console.log({ "verified": nonceCheck(body.timestamp, body.nonce), "error": "401", "response": "You sneaky bastard! 😡" });
                    return [2 /*return*/, {
                            statusCode: 401,
                            body: JSON.stringify({ "error": "401", "response": "You sneaky bastard! 😡", "valid": nonceCheck(body.timestamp, body.nonce) })
                        }];
                }
                // Rudimentary logging to serverless function console
                // TODO: replace with proper logging eventually
                console.info("Nonce ✅", "\nTaking screenshot");
                url = "https://api.microlink.io?url=" + body.siteUrl + "&overlay.browser=dark&overlay.background=%23edf2f7&screenshot=true&meta=false&embed=screenshot.url&viewport.height=800";
                return [4 /*yield*/, node_fetch_1.default(url)];
            case 1:
                fetchScreenshot = _a.sent();
                if (fetchScreenshot.status !== 200) {
                    resetTimestamp = Number(fetchScreenshot.headers.get("x-rate-limit-reset"));
                    resetTime = new Date(resetTimestamp * 1000).toLocaleString();
                    errorMessage = {
                        error: fetchScreenshot.statusText,
                        rateLimitResetTime: resetTime,
                    };
                    return [2 /*return*/, { body: JSON.stringify(errorMessage), statusCode: "500" }];
                }
                console.info(fetchScreenshot.statusText);
                return [2 /*return*/, {
                        body: JSON.stringify({ "response": fetchScreenshot.statusText }),
                        statusCode: 200
                    }];
            case 2:
                app = _a.sent();
                console.log(app);
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify(nonceCheck(body.timestamp, body.nonce))
                    }];
        }
    });
}); };
//# sourceMappingURL=screenshot.js.map