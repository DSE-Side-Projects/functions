"use strict";
// Step One in updating screenshots in Sanity upon an application update
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
// Triggered by a Github webhook
var node_fetch_1 = require("node-fetch");
var crypto = require("crypto");
var SCREENSHOT_FUNCTION = "http://localhost:8888/.netlify/functions/screenshot";
var generateNonce = function () {
    var timestamp = Date.now().toString();
    var hash = crypto.createHash("sha256");
    var nonce = hash.update(timestamp);
    return { "timestamp": timestamp, "nonce": nonce.digest("hex") };
};
var appsArray = function () { return __awaiter(void 0, void 0, void 0, function () {
    var app;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, node_fetch_1.default("https://" + process.env.SANITY_PROJECT_ID + ".api.sanity.io/v1/data/query/production?query=*[_type == \"app\"]", {
                    method: "get",
                    headers: {
                        "Content-type": "application/json",
                        Authorization: "Bearer " + process.env.SANITY_API_TOKEN,
                    },
                })
                    .then(function (response) { return response.json(); })
                    .then(function (result) { return result.result; })];
            case 1:
                app = _a.sent();
                return [2 /*return*/, app];
        }
    });
}); };
exports.handler = function (event, callback) { return __awaiter(void 0, void 0, void 0, function () {
    var isJsonString, body, siteUrl, appId, findApp, app;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (event.httpMethod !== "POST") {
                    return [2 /*return*/, { statusCode: 405, body: "Method Not Allowed" }];
                }
                isJsonString = function (str) {
                    try {
                        JSON.parse(str);
                    }
                    catch (e) {
                        return false;
                    }
                    return true;
                };
                if (!isJsonString(event.body) || event.body === undefined || event.body === null) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            body: "Invalid Request. Valid JSON body is required."
                        }];
                }
                body = JSON.parse(event.body);
                if (!body.appId || !body.siteUrl || Object.keys(body).length > 2) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            body: "Invalid Request. appId & siteUrl are required. Only these two params are allowed."
                        }];
                }
                siteUrl = body.siteUrl, appId = body.appId;
                findApp = function (appId, siteUrl) { return __awaiter(void 0, void 0, void 0, function () {
                    var app;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, appsArray()
                                    .then(function (docs) {
                                    return docs.find(function (app) { return app._id === appId && app.url === siteUrl; });
                                })];
                            case 1:
                                app = _a.sent();
                                return [2 /*return*/, app];
                        }
                    });
                }); };
                return [4 /*yield*/, findApp(appId, siteUrl)];
            case 1:
                app = _a.sent();
                if (app === undefined) {
                    return [2 /*return*/, { statusCode: 404, body: "App Not Found 🤷🏽‍♀️" }];
                }
                // send these to screenshot function
                node_fetch_1.default(SCREENSHOT_FUNCTION, { method: 'POST', headers: { "Accept": "application/json", "X-Nonce": "app" }, body: JSON.stringify({ "appId": app._id, "siteUrl": app.url, "timestamp": generateNonce().timestamp, "nonce": generateNonce().nonce }) })
                    .then(function (response) { return response.json(); })
                    .then(function (data) { return ({
                    statusCode: 200,
                    body: data
                }); });
                return [2 /*return*/, { statusCode: 200,
                        body: JSON.stringify({ "success": "Going to take a screenshot now!" })
                    }];
        }
    });
}); };
//# sourceMappingURL=search.js.map