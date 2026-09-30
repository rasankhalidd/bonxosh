// The app files talk to each other and to their libraries through `window`
// (they used to be separate <script> tags). Put the libraries there first.
import React from "react";
import * as ReactDOM from "react-dom/client";
import { PostgrestClient } from "@supabase/postgrest-js";

window.React = React;
window.ReactDOM = ReactDOM;

// The site only reads the catalog, so ship Supabase's database client alone
// instead of all of supabase-js (~200 KB of auth/realtime/storage we don't
// use yet). Same createClient(url, key).from()/.rpc() shape catalog.js uses;
// swap in @supabase/supabase-js when accounts arrive.
window.supabase = {
  createClient(url, key) {
    return new PostgrestClient(url.replace(/\/+$/, "") + "/rest/v1", {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
  },
};
