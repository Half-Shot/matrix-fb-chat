import { Config } from "./config";
import { Facebook } from "./facebook";
import { Matrix } from "./matrix";
import { RoomMapping } from "./roomMapping";
import * as CLIArgs from "command-line-args";
import * as log from "npmlog";

import "polyfill.js";

function main (args) {
  const checkThreads = args["list-threads"] === true;

  let appCfg: Config = new Config();
  appCfg.readConfig(args.config || "config.yaml");

  let fbook: Facebook = new Facebook(appCfg);
  let matrix: Matrix = new Matrix(appCfg.Homeserver, appCfg.Token, appCfg.UserId);
  let ignoreList = [];
  for (let roomDef of appCfg.Rooms) {
    matrix.AddRoom(roomDef.room);
    fbook.BindThread(roomDef.thread);
  }
  matrix.onRoomMessage = (content: any, roomId: string) => {
    // TODO Catch the bots messages.
    let room: RoomMapping = appCfg.GetRoomByRoom(roomId);
    if (content.msgtype === "m.text") {
      fbook.SendMessage(content.body, room.thread).then((id) => {
        ignoreList.push(id);
      });
    } else if (content.msgtype === "m.emote") {
      fbook.SendEmote(content.body, room.thread);
    }
    log.info("MatrixFB", `MSG from ${roomId} going to ${room.thread}`);
  };

  fbook.onThreadMessage = (body: string, thread: string, messageId: string, sender: string) => {
    if (ignoreList.includes(messageId)) {
      log.info("MatrixFB", "Ignoring dupe message");
      return;
    }
    let room: RoomMapping = appCfg.GetRoomByThread(thread);
    log.info("MatrixFB", `MSG from ${thread} going to ${room.room}`);
    matrix.SendMessage(body, sender, room.room);
  };
  matrix.Start();
  fbook.Login();

}

const args: any = CLIArgs([
      { name: "config", alias: "c", type: String },
]);
main(args);
