# line-mcp-server

[![npm version](https://img.shields.io/npm/v/line-mcp-server.svg)](https://www.npmjs.com/package/line-mcp-server)
[![Node.js](https://img.shields.io/node/v/line-mcp-server.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/npm/l/line-mcp-server.svg)](./LICENSE)

MCP Server for LINE Messaging API — let AI agents send messages, manage groups, configure rich menus, and query analytics on LINE. Works with Claude Code, OpenClaw, and any MCP-compatible client.

## Features

### Messaging (12 tools)

| Tool | Description |
|------|-------------|
| `push_text_message` | Send text to a user, group, or room |
| `push_image_message` | Send an image (HTTPS URLs only) |
| `push_sticker_message` | Send a LINE sticker |
| `push_flex_message` | Send a Flex Message (rich layout) |
| `push_video_message` | Send a video (HTTPS URLs only) |
| `push_audio_message` | Send an audio clip (HTTPS URLs only) |
| `push_location_message` | Send a location (lat/lng) |
| `show_loading_indicator` | Display a loading animation in a chat |
| `broadcast_text_message` | Broadcast text to all followers |
| `multicast_text_message` | Send text to multiple users (max 500) |
| `broadcast_flex_message` | Broadcast a Flex Message to all followers |
| `multicast_flex_message` | Send a Flex Message to multiple users (max 500) |

### Profile (2 tools)

| Tool | Description |
|------|-------------|
| `get_user_profile` | Get user display name, picture, status, and language |
| `get_group_summary` | Get group name and picture (bot must be a member of the group) |

### Group & Room Management (8 tools)

| Tool | Description |
|------|-------------|
| `get_group_member_count` | Get number of members in a group |
| `get_group_member_ids` | List all member IDs in a group |
| `get_group_member_profile` | Get a specific member's profile within a group |
| `leave_group` | Bot leaves a group (permanent) |
| `get_room_member_count` | Get number of members in a room |
| `get_room_member_ids` | List all member IDs in a room |
| `get_room_member_profile` | Get a specific member's profile within a room |
| `leave_room` | Bot leaves a room (permanent) |

### Rich Menu (9 tools)

| Tool | Description |
|------|-------------|
| `create_rich_menu` | Create a new rich menu |
| `list_rich_menus` | List all rich menus |
| `get_rich_menu` | Get a specific rich menu by ID |
| `delete_rich_menu` | Delete a rich menu |
| `set_default_rich_menu` | Set the default rich menu for all users |
| `get_default_rich_menu` | Get the current default rich menu ID |
| `cancel_default_rich_menu` | Remove the default rich menu |
| `link_rich_menu_to_user` | Assign a rich menu to a specific user |
| `unlink_rich_menu_from_user` | Remove a user's assigned rich menu |

### Insight & Analytics (13 tools)

| Tool | Description |
|------|-------------|
| `get_bot_info` | Get bot's display name, ID, chat mode, and mark-as-read mode |
| `get_message_quota` | Get monthly message sending quota |
| `get_message_quota_consumption` | Get messages sent this month |
| `get_follower_ids` | List follower user IDs (paginated) |
| `get_number_of_followers` | Get follower count statistics for a date (yyyyMMdd, UTC+9) |
| `get_friend_demographics` | Get follower demographic data (age, gender, area) |
| `get_sent_reply_count` | Get number of sent reply messages for a date (yyyyMMdd, UTC+9) |
| `get_sent_push_count` | Get number of sent push messages for a date (yyyyMMdd, UTC+9) |
| `get_sent_multicast_count` | Get number of sent multicast messages for a date (yyyyMMdd, UTC+9) |
| `get_sent_broadcast_count` | Get number of sent broadcast messages for a date (yyyyMMdd, UTC+9) |
| `get_message_deliveries` | Get number of message deliveries for a date (yyyyMMdd, UTC+9) |
| `get_message_event` | Get message event statistics by request ID |
| `get_statistics_per_unit` | Get statistics for a custom aggregation unit within a date range |

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

### Enable Group/Room Features (Optional)

To use group/room tools or send messages to groups and rooms:

1. In [LINE Official Account Manager](https://manager.line.biz/) → **Settings** → **Account settings** → enable **Allow bot to join groups**
2. In [LINE Official Account Manager](https://manager.line.biz/) → **Settings** → **Response settings** → enable **Webhook**
3. In [LINE Developers Console](https://developers.line.biz/console/) → your Channel → **Messaging API** tab → set your **Webhook URL**
4. Invite the bot to a group or room in the LINE app (search by the bot's **Basic ID** `@xxx` shown in LINE Developers Console → Basic settings)
5. To get the ID, receive the `join` event or any message event via Webhook — it will contain `source.groupId` (for groups) or `source.roomId` (for rooms)

## Setup (npx — recommended)

No installation needed — just configure your MCP client.

### Claude Code

```bash
claude mcp add line-mcp-server -t stdio \
  -e CHANNEL_ACCESS_TOKEN=<your-token> \
  -- npx -y line-mcp-server
```

### OpenClaw (mcporter)

```bash
mcporter config add line-mcp-server \
  --command npx \
  --arg -y --arg line-mcp-server \
  --env CHANNEL_ACCESS_TOKEN=<your-token> \
  --description "LINE Messaging API tools"
```

### Other MCP clients

Add the following to your MCP client configuration:

```json
{
  "mcpServers": {
    "line-mcp-server": {
      "command": "npx",
      "args": ["-y", "line-mcp-server"],
      "env": {
        "CHANNEL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

## Setup (build from source)

```bash
git clone https://github.com/tsen1220/line-mcp-server.git
cd line-mcp-server
npm install
npm run build   # compiles TypeScript to dist/
```

### Claude Code

```bash
claude mcp add line-mcp-server -t stdio \
  -e CHANNEL_ACCESS_TOKEN=<your-token> \
  -- node /path/to/line-mcp-server/dist/index.js
```

### OpenClaw (mcporter)

```bash
mcporter config add line-mcp-server \
  --command node \
  --arg /path/to/line-mcp-server/dist/index.js \
  --env CHANNEL_ACCESS_TOKEN=<your-token> \
  --description "LINE Messaging API tools"
```

### Verify & call tools (mcporter)

```bash
mcporter list line-mcp-server --schema
mcporter call line-mcp-server.push_text_message to=U... text="Hello"
mcporter call line-mcp-server.get_user_profile userId=U...
mcporter call line-mcp-server.get_bot_info
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
├── index.ts                          # Entry point (stdio MCP server)
├── services/
│   └── line.ts                       # LineService interface + LineMessagingClient
├── tools/
│   ├── messaging.ts                  # 12 messaging tools
│   ├── profile.ts                    # 2 profile tools
│   ├── group.ts                      # 8 group/room management tools
│   ├── richmenu.ts                   # 9 rich menu tools
│   └── insight.ts                    # 13 insight/analytics tools
└── utils/
    ├── error.ts                      # Error formatting utility
    └── flex.ts                       # Flex message JSON validation

tests/
├── helpers/
│   └── mock-line-service.ts          # Shared mock LineService for all tests
├── integration/
│   └── server.test.ts                # MCP server integration test (all 44 tools)
├── services/
│   └── line.test.ts                  # LineMessagingClient unit tests
├── tools/
│   ├── messaging.test.ts             # Messaging tool handler tests
│   ├── profile.test.ts               # Profile tool handler tests
│   ├── group.test.ts                 # Group/room tool handler tests
│   ├── richmenu.test.ts              # Rich menu tool handler tests
│   └── insight.test.ts               # Insight tool handler tests
└── utils/
    └── error.test.ts                 # Error formatting tests
```

## Testing

```bash
npm test              # run all tests
npm run test:coverage # run with coverage report
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CHANNEL_ACCESS_TOKEN` | Yes | LINE Messaging API channel access token |

## License

MIT
