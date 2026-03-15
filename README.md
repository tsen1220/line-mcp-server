# line-mcp-tools

MCP Server for LINE Messaging API — let AI agents send messages to LINE users, groups, and rooms. Works with Claude Code, OpenClaw, and any MCP-compatible client.

## Features

| Tool | Description |
|------|-------------|
| `push_text_message` | Send text to a user, group, or room |
| `push_image_message` | Send an image (HTTPS URLs only) |
| `push_sticker_message` | Send a LINE sticker |
| `push_flex_message` | Send a Flex Message (rich layout) |
| `broadcast_text_message` | Broadcast text to all followers |
| `multicast_text_message` | Send text to multiple users (max 500) |
| `get_user_profile` | Get user display name, picture, status, and language |
| `get_group_summary` | Get group name and picture |

## Prerequisites

- Node.js >= 22
- A LINE Official Account with Messaging API enabled
- Channel Access Token

## Create a LINE Official Account

1. Go to [LINE Official Account Manager](https://manager.line.biz/) and create an account
2. Go to [LINE Developers Console](https://developers.line.biz/console/) and log in
3. Create a **Provider** (or select an existing one)
4. Under the Provider, create a **Messaging API Channel** linked to your Official Account
5. Go back to [LINE Developers Console](https://developers.line.biz/console/), select your Provider and Channel
6. In the **Basic settings** tab, find **Your user ID** (`U...`) — for testing push messages to yourself
7. Go to the **Messaging API** tab, scroll to the bottom, and click **Issue** under **Channel access token (long-lived)** to generate your token

### Enable Group Features (Optional)

To use `get_group_summary` or send messages to groups:

1. In [LINE Official Account Manager](https://manager.line.biz/) → **Settings** → **Account settings** → enable **Allow bot to join groups**
2. In [LINE Official Account Manager](https://manager.line.biz/) → **Settings** → **Response settings** → enable **Webhook**
3. In [LINE Developers Console](https://developers.line.biz/console/) → your Channel → **Messaging API** tab → set your **Webhook URL**
4. Invite the bot to a group in the LINE app (search by the bot's **Basic ID** `@xxx` shown in LINE Developers Console → Basic settings)
5. To get the Group ID (`C...`), receive the `join` event or any message event from the group via Webhook — it will contain `source.groupId`

## Setup

```bash
git clone https://github.com/tsen1220/line-mcp-tools.git
cd line-mcp-tools
npm install
npm run build
```

## Register in OpenClaw with mcporter

```bash
mcporter config add line-mcp-tools \
  --command node \
  --arg /path/to/line-mcp-tools/dist/index.js \
  --env CHANNEL_ACCESS_TOKEN=<your-token> \
  --description "LINE Messaging API tools"
```

Verify registration:

```bash
mcporter list line-mcp-tools --schema
```

Call tools directly:

```bash
mcporter call line-mcp-tools.push_text_message to=U... text="Hello"
mcporter call line-mcp-tools.get_user_profile userId=U...
```

## Register in Claude Code

```bash
claude mcp add line-mcp-tools -t stdio \
  -e CHANNEL_ACCESS_TOKEN=<your-token> \
  -- node /path/to/line-mcp-tools/dist/index.js
```

After registration, Claude can call LINE tools directly:

> "Send 'Hello' to my LINE group C1234567890"

## Target ID Prefixes

| Prefix | Type |
|--------|------|
| `U...` | User ID |
| `C...` | Group ID |
| `R...` | Room ID |

## Project Structure

```
src/
├── index.ts                      # Entry point (stdio MCP server)
├── services/
│   └── line.ts                   # LineService interface + LineMessagingClient
├── tools/
│   ├── messaging.ts              # 6 messaging tools
│   └── profile.ts                # 2 profile/group tools
└── utils/
    └── error.ts                  # Error formatting utility
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CHANNEL_ACCESS_TOKEN` | Yes | LINE Messaging API channel access token |

## License

MIT
