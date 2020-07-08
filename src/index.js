import "core-js/features/map";
import "core-js/features/set";
import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";

//let gLog = require("./glog");

// Init VK  Mini App

/*

bridge
  .send('VKWebAppGetEmail')
  .then(data => {
    // Обработка события в случае успеха
    console.log(data.email);
  })
  .catch(error => {
    // Обработка события в случае ошибки
  });

  */

async function main()
{
  bridge.send("VKWebAppInit");

  bridge.send("VKWebAppGetAuthToken", {"app_id": 7531571, "scope": "friends,status"})
  .then(data => {
    // Обработка события в случае успеха
    console.log(JSON.stringify(data));
  })
  .catch(error => {
    console.log(JSON.stringify(error));
    alert("Error occured");
  });

  ReactDOM.render(<App />, document.getElementById("root"));
  if (process.env.NODE_ENV === "development") {
    import("./eruda").then(({ default: eruda }) => {}); //runtime download
  }
}

main();

