"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = require("dotenv");
dotenv.config();
var SUPABASE_URL = process.env.SUPABASE_URL || '';
var SUPABASE_KEY = process.env.SUPABASE_KEY || '';
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
exports.default = supabase;
