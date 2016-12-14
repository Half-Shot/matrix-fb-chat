import { Facebook } from "./facebook";
import { Config } from "./config";
import { FacebookThread } from "./FacebookThread";
import * as Promise from "bluebird";
import * as CLIArgs from "command-line-args";
import * as log from "npmlog";

const args: any = CLIArgs([
    { name: "list-threads", alias: "l", type: Boolean },
    { name: "config", alias: "c", type: String },
]);

if ( Object.keys(args).length === 0 ) {
  log.error("CLI", "Please use a command as an argument. Examples:\n --list-threads");
  process.exit(0);
}

let appCfg: Config = new Config();
try {
  appCfg.readConfig(args.config || "config.yaml");
} catch (err) {
  log.error("CLI", "Couldn't read config. Did you enter the path correctly and use correct syntax?");
  log.error(err.message);
}

if (args["list-threads"]) {
  let fbook: Facebook = new Facebook(appCfg);
  fbook.Login(false).then(() => {
    log.info("Lisiting threads for user..");
    return fbook.GetAllThreads();
  }).map((thread: FacebookThread) => {
    let name: string = fbook.GetThreadName(thread);
    return `Name: ${name}\nThreadID ${thread.threadID}`
  }).then((threads) => {
    log.info("CLI", threads.join("\n====\n"));
  });
}
