import * as fblogin from "facebook-chat-api";
import {Config} from "./config";
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

  public Login() {
    Promise.promisify(fblogin)(this.appConfig.getFBAuth(), {
      selfListen: true,
      logLevel: "warn",
    }).then((api) => {
      this.api = Promise.promisifyAll(api);
      this.api.getThreadListAsync(0, 99, "inbox").then( (threads) => {
        // Get all the unique id's of the threads in use.
        let ids = [];
        for (let thread of threads) {
          if (this.boundThreads.includes(thread.threadID)) {
            ids = ids.concat(thread.participantIDs.filter((item) => {
              return !ids.includes(item);
            }));
          }
        }
        log.info("Facebook", "Unique id's:", ids);
        return api.getUserInfoAsync(ids);
      }).then((profiles) => {
        this.userProfiles = profiles;
      }).catch((err) => {
        log.error("Facebook", "Failed to get profiles for thread participants.");
      });
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
    }).catch((err) => {
      log.error("Facebook", err);
    });
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
}
