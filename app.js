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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var nodemailer = require("nodemailer");
var googleapis_1 = require("googleapis");
var supabaseClient_1 = require("./db/supabaseClient"); // Import Supabase client
var dotenv = require("dotenv");
dotenv.config();
// Google OAuth Credentials (Move to environment variables for security)
var credentials = {
    clientId: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    redirectUri: process.env.REDIRECT_URI || '',
    refreshToken: process.env.REFRESH_TOKEN || '',
};
// Initialize OAuth2 Client
var oAuth2Client = new googleapis_1.google.auth.OAuth2(credentials.clientId, credentials.clientSecret, credentials.redirectUri);
oAuth2Client.setCredentials({ refresh_token: credentials.refreshToken });
/**
 * Fetch event details from Supabase based on event_id
 */
function getEventDetails(eventId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("Fetching event with event_id: ".concat(eventId));
                    return [4 /*yield*/, supabaseClient_1.default
                            .from('Events_Table')
                            .select('*')
                            .eq('event_id', eventId.toString()) // Convert number to string
                            .maybeSingle()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching event:', error.message);
                        return [2 /*return*/, null];
                    }
                    if (!data) {
                        console.log("No event found with event_id: ".concat(eventId));
                        return [2 /*return*/, null];
                    }
                    console.log('Fetched event:', data);
                    return [2 /*return*/, data];
                case 2:
                    error_1 = _b.sent();
                    console.error('Unexpected error:', error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send event details via email
 */
function sendMail(eventId, recipientEmail) {
    return __awaiter(this, void 0, void 0, function () {
        var event_1, accessToken, transport, mailOptions, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getEventDetails(eventId)];
                case 1:
                    event_1 = _a.sent();
                    if (!event_1) {
                        console.log('Event not found. Email not sent.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, oAuth2Client.getAccessToken()];
                case 2:
                    accessToken = _a.sent();
                    transport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            type: 'OAuth2',
                            user: 'integreatapi@gmail.com', // Replace with your email
                            clientId: credentials.clientId,
                            clientSecret: credentials.clientSecret,
                            refreshToken: credentials.refreshToken,
                            accessToken: accessToken.token || '',
                        },
                    });
                    mailOptions = {
                        from: 'INTEGREAT API <integreatapi@gmail.com>', // Replace with your email
                        to: recipientEmail,
                        subject: "Event Details: ".concat(event_1.name),
                        html: "\n                <h1>Event Details</h1>\n                <p><strong>Name:</strong> ".concat(event_1.name, "</p>\n                <p><strong>Date:</strong> ").concat(event_1.date, "</p>\n                <p><strong>Start Time:</strong> ").concat(event_1.start_time, "</p>\n                <p><strong>End Time:</strong> ").concat(event_1.end_time, "</p>\n                <p><strong>Location:</strong> ").concat(event_1.location, "</p>\n                <p><strong>Description:</strong> ").concat(event_1.description, "</p>\n            "),
                    };
                    return [4 /*yield*/, transport.sendMail(mailOptions)];
                case 3:
                    result = _a.sent();
                    console.log('Email sent successfully:', result);
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error sending email:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Example Usage: Send event details for event_id = 1
var eventId = 1;
var recipientEmail = 'gabrielleynigo.faurillo.cics@ust.edu.ph'; // Replace with recipient email
sendMail(eventId, recipientEmail);
