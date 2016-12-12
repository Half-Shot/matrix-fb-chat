import * as MatrixSDK from "matrix-js-sdk";
import * as log from "npmlog";

export class Matrix {
  public onRoomMessage: (content: any, roomId: string) => void;
  private mxClient;
  private userId: string;
  private rooms: string[];

  constructor(baseUrl: string, accessToken: string, userId: string) {
    this.mxClient = MatrixSDK.createClient({
       baseUrl,
       accessToken,
       userId,
    });
    this.rooms = [];
    this.userId = userId;
    this.mxClient.on("sync", (state, prevState, data) => {
      if (state === "PREPARED") {
        this.mxClient.on("event", this.onEvent.bind(this));
      }
    });
  }

  public AddRoom(roomId: string): Promise<void> {
    this.rooms.push(roomId);
    return this.mxClient.joinRoom(roomId).catch((err) => {
      log.error("Facebook", "Failed to join ", roomId, "\n", err);
    });
  }

  public SendMessage(body: string, user: string, roomId: string) {
    this.mxClient.sendTextMessage(roomId, `${user}: ${body}`);
  }

  public Start() {
    this.mxClient.startClient();
  }

  private onEvent(event) {
    if (event.event.type === "m.room.message"
      && this.rooms.includes(event.event.room_id)
      && event.event.sender !== this.userId
    ) {
      this.onRoomMessage(event.event.content, event.event.room_id);
    }
  }
}
