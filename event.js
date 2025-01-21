import { EventEmitter } from "events";

const messageEmitter = new EventEmitter();

messageEmitter.on("message", (message) => {
  console.log(message);
});

messageEmitter.emit("message", "Hello, world!");

export default messageEmitter;
