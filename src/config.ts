import * as Fs from "fs";
import * as Path from "path";
import * as Yaml from "js-yaml";
import { Auth } from "./auth";
import { RoomMapping } from "./roomMapping";

export class Config {
  private fbUserId: string;
  private fbEmail: string;
  private fbPassword: string;
  private mxUserId: string;
  private mxToken: string;
  private mxHomeserver: string;
  private roomMappings: RoomMapping[];

  get FacebookId(): string {
    return this.fbUserId;
  }

  get UserId (): string {
    return this.mxUserId;
  }
  get Token (): string {
    return this.mxToken;
  }
  get Homeserver (): string {
    return this.mxHomeserver;
  }

  get Rooms (): RoomMapping[] {
    return this.roomMappings;
  }

  public GetRoomByRoom(roomId: string): RoomMapping {
    return this.Rooms.find((room: RoomMapping) : boolean => {
      return room.room === roomId;
    });
  }

  public GetRoomByThread(thread: string): RoomMapping  {
    return this.Rooms.find((room: RoomMapping) : boolean => {
      return room.thread === thread;
    });
  }

  public readConfig(file: string) {
    file = Path.resolve(file);
    let regObj = Yaml.safeLoad(Fs.readFileSync(file, "utf8"));
    this.fbUserId = regObj.facebook.user_id;
    this.fbEmail = regObj.facebook.email;
    this.fbPassword = regObj.facebook.password;
    this.mxUserId = regObj.matrix.user_id;
    this.mxToken = regObj.matrix.token;
    this.mxHomeserver = regObj.matrix.homeserver;
    this.roomMappings = regObj.rooms;

  }

  public getFBAuth(): Auth {
    return new Auth(this.fbEmail, this.fbPassword);
  }
}
