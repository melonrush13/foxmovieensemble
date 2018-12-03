import React from "react";
import ReactDOM from "react-dom";
// import "./index.css";
import App, { IMedia } from "./App";
import * as serviceWorker from "./serviceWorker";

// ReactDOM.render(<App />, document.getElementById("root"));
(window as any)["ensemble"] = {
  mountVisualization: (el: HTMLElement, props: IMedia) =>
    ReactDOM.render(<App {...props} />, el)
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
