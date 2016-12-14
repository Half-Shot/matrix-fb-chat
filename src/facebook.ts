import * as fblogin from "facebook-chat-api";
import {Config} from "./config";
import {FacebookThread} from "./facebookThread";
import {FacebookUserProfile} from "./userInfo";
import * as Promise from "bluebird";
import * as log from "npmlog";

export class Facebook {
  public onThreadMessage: (body: string, thread: string, messageId: string, sender: string) => void;
  private appConfig: Config;
  private boundThreads: string[];
  private userProfiles: any;
  private api;
  constructor(config: Config) {
    this.appConfig = config;
    this.boundThreads = [];
  }

  public Login(listen: boolean = true): Promise<void> {
    let ids = [];
    return Promise.promisify(fblogin)(this.appConfig.getFBAuth(), {
      logLevel: "warn",
      selfListen: true,
    }).then((api) => {
      this.api = Promise.promisifyAll(api);
      return this.GetAllThreads();
    }).each( (thread: FacebookThread) => {
      // If we are listening, just get the relevant users. Otherwise, get them all.
      if (this.boundThreads.includes(thread.threadID) || !listen) {
        ids = ids.concat(thread.participantIDs.filter((item) => {
          return !ids.includes(item);
        }));
      }
    }).then(() => {
      return this.api.getUserInfoAsync(ids);
    }).then((profiles) => {
      this.userProfiles = profiles;
      if (listen) {
        this.startListening();
      }
    }).catch((err) => {
    log.error("Facebook", err);
    });
  }

  public GetAllThreads(type: string = "inbox", end: number = 99, start: number = 0): Promise<FacebookThread[]> {
    return this.api.getThreadListAsync(start, end, type).catch((err) => {
      log.error("Facebook", "Couldn't get threads.");
    });
  }

  public GetThreadParticipantNames(thread: FacebookThread): Map<string, FacebookUserProfile> {
    let names: Map<string, FacebookUserProfile> = new Map();
    thread.participantIDs.forEach( (id) => {
      names.set(id, this.userProfiles[id] || null );
    });
    return names;
  }

  public GetThreadName(thread: FacebookThread): string {
    if (thread.name !== "" && thread.name) {
      return thread.name;
    } else if (thread.participantIDs.length === 2) {
      let names: Map<string, FacebookUserProfile> = this.GetThreadParticipantNames(thread);
      for (let name of names) {
        if (name[0] !== this.appConfig.FacebookId) {
          return name[1] !== null ? name[1].name : "Unknown User";// TODO: Attempt to get info on this user?
        }
      }
    } else if (thread.participantIDs.length > 2) {
      return `Group chat with ${thread.participantIDs.length} people.`;
    } else {
      return "Unnamed chat.";
    }
  }

  public BindThread(thread: string) {
    this.boundThreads.push(thread);
  }

  public SendMessage (msg: string, thread: string) {
    return this.api.sendMessageAsync({body: msg}, thread).then((sentMsg: any) => {
      log.info("Facebook", "Message sent!");
      return sentMsg.messageID;
    }).catch((err) => {
      log.error("Facebook", "Couldn't send message!\n" + err);
    });
  }

  public SendEmote (msg: string, thread: string) {
    this.SendMessage("/me " + msg, thread); // TODO:improve this
  }

  private startListening(): void {
    this.api.listen((err, msg) => {
      if (err) {
        log.error("Facebook", "Couldn't listen for new messages." + err);
        return;
      }
      let sender = this.userProfiles[msg.senderID] ? this.userProfiles[msg.senderID].name : msg.senderID;
      let body = "Unknown type";
      if (msg.type === "message") {
        body = msg.body ? msg.body : "";
        for (let attachment of msg.attachments) {
          if (attachment.url) {
            body += " " + attachment.url;
          }
        }
      }
      this.onThreadMessage(msg.body, msg.threadID, msg.messageID, sender);
    });
  }
}
