# matrix-fb-chat

A quick n dirty facebook bot bridge.

## ⚠️ Warning

This API is undocumented, and likely against the Facebook TOS. I am not responsible if you
go and get yourself banned from Facebook. This tool is here for anybody to use, but comes
with no warrantys or guarantees. In addition, this software is *a hack*, not a completed or even partially completed work so support will be limited.

## What can it do?

* Bridge one conversation to one room.
* Send text messages from matrix.
* Recieve messages and urls from facebook.

## Instructions

1. Run ``npm install``
2. Run ``npm run-script build``
3. We now have a tool to retrieve thread numbers, see below.
4. Clone ``config.yaml.sample`` and fill it in.
  - Your facebook id can be seen in your cookies or requests as "c_user".
  - You will need a threadID in addition to a room_id.
  - ~~Currently you need to do some digging on [getThreadList](https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#getThreadList) to find it, which requires a bit of manual work. A tool to pretty print your threads might arrive in the future.~~
5. Run ``npm run-script start``
6. Chat away!

## ``fb-tool``

This tool allows you to retrieve values used for configuring the bot.

### ``--list-threads``.

You can get thread numbers by running the tool with ``npm run-script tool -- --list-threads``. Make sure you've filled in the config.yaml first with your facebook details.

## Contributing

This was a quick half day hack for me so I won't be developing this into a full bridge just yet. PRs are welcome and a full review will be given. 
