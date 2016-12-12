import * as FS from "fs";
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

  get userId (): string {
    return this.mxUserId;
  }
  get token (): string {
    return this.mxToken;
  }
  get homeserver (): string {
    return this.mxHomeserver;
  }

  get rooms (): RoomMapping[] {
    return this.roomMappings;
  }

  public GetRoomByRoom(roomId: string): RoomMapping {
    return this.rooms.find((room: RoomMapping) : boolean => {
      return room.room === roomId;
    });
  }

  public GetRoomByThread(thread: string): RoomMapping  {
    return this.rooms.find((room: RoomMapping) : boolean => {
      return room.thread === thread;
    });
  }

  public readConfig(file: string) {
    let regObj = Yaml.safeLoad(FS.readFileSync(file, "utf8"));
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
