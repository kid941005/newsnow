![](/public/og-image.png)

English | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md)

> [!NOTE]
> This is a demo version currently supporting Chinese only. A full-featured version with better customization and English content support will be released later.

**_Elegant reading of real-time and hottest news_**

## Features

- Clean and elegant UI design for optimal reading experience
- Real-time updates on trending news
- Local account login and personal configuration
- Keyword / blocked-keyword / push configuration support
- 30-minute default cache duration (logged-in users can force refresh)
- Adaptive scraping interval (minimum 2 minutes) based on source update frequency to optimize resource usage and prevent IP bans
- support MCP server

```json
{
  "mcpServers": {
    "newsnow": {
      "command": "npx",
      "args": [
        "-y",
        "newsnow-mcp-server"
      ],
      "env": {
        "BASE_URL": "https://newsnow.busiyi.world"
      }
    }
  }
}
```
You can change the `BASE_URL` to your own domain.

## Deployment

### Basic Deployment

For deployments without login and caching:

1. Fork this repository
2. Import to platforms like Cloudflare Page or Vercel

### Cloudflare Page Configuration

- Build command: `pnpm run build`
- Output directory: `dist/output/public`

### GitHub OAuth Setup

1. [Create a GitHub App](https://github.com/settings/applications/new)
2. No special permissions required
3. Set callback URL to: `https://your-domain.com/api/oauth/github` (replace `your-domain` with your actual domain)
4. Obtain Client ID and Client Secret

### Environment Variables

Refer to `example.env.server`. For local development, rename it to `.env.server` and configure:

```env
# JWT Secret for local account login
JWT_SECRET=
# Initialize database, must be set to true on first run, can be turned off afterward
INIT_TABLE=true
# Whether to enable cache
ENABLE_CACHE=true
```

### Database Support

Supported database connectors: https://db0.unjs.io/connectors
**Cloudflare D1 Database** is recommended.

1. Create D1 database in Cloudflare Worker dashboard
2. Configure database_id and database_name in wrangler.toml
3. If wrangler.toml doesn't exist, rename example.wrangler.toml and modify configurations
4. Changes will take effect on next deployment

### Docker Deployment

In project root directory:

```sh
docker compose up -d
```

The repository now keeps only the primary `docker-compose.yml`.

Set `JWT_SECRET` before starting the local container if you want to use local account login.

## Development

> [!Note]
> Requires Node.js >= 20

```sh
corepack enable
pnpm i
pnpm dev
```

### Adding Data Sources

Refer to `shared/sources` and `server/sources` directories. The project provides complete type definitions and a clean architecture.

For detailed instructions on how to add new sources, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Roadmap

### Release Notes

#### v0.0.46 (2026-05-25)
- Added user-configurable proxy settings for manual `latest` refreshes only, without affecting normal cached reads or scheduled fetches
- Wired proxy config through local account settings, server-side fetch context, and real-proxy validation against GitHub Trending

#### v0.0.45 (2026-05-25)
- Fixed the keyword tab runtime error by restoring the missing `useQuery` import in `src/components/column/dnd.tsx`
- Removed `docker-compose.local.yml` and kept deployment centered on the single primary `docker-compose.yml`
- Dropped unused compose environment entries (`NODE_ENV`, empty `PRODUCTHUNT_API_TOKEN`) while keeping the required runtime settings

#### v0.0.44 (2026-05-25)
- Removed unused top-level named volume declarations from the primary compose file after switching to bind mounts
- Simplified the repo to keep only the primary `docker-compose.yml`
- Kept the deployment compose config minimal and consistent with the current `./newsnow_data` mount strategy

#### v0.0.43 (2026-05-25)
- Simplified deployment config around a single primary `docker-compose.yml` workflow
- Hardcoded `JWT_SECRET` in compose as chosen, removing extra environment-variable setup friction
- Kept image-based main compose and local build compose aligned for the same runtime settings

#### v0.0.42 (2026-05-25)
- Added a new 关键词 tab to show keyword-filtered news and hide empty source cards
- Updated docker compose files to use `kid941005/newsnow:main` and remove obsolete GitHub OAuth env vars

#### v0.0.41 (2026-05-24)
- Fixed theme persistence so a saved light mode no longer falls back to dark after page refresh

#### v0.0.40 (2026-05-24)
- Removed GitHub OAuth login entry and backend callback route
- Added local account registration/login, personal config, and push config APIs
- Updated Docker local runtime so the local account flow works in container validation

- Add **multi-language support** (English, Chinese, more to come).
- Improve **personalization options** (category-based news, saved preferences).
- Expand **data sources** to cover global news in multiple languages.

**_release when ready_**
![](https://testmnbbs.oss-cn-zhangjiakou.aliyuncs.com/pic/20250328172146_rec_.gif?x-oss-process=base_webp)

## Contributing

Contributions are welcome! Feel free to submit pull requests or create issues for feature requests and bug reports.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute, especially for adding new data sources.

## License

[MIT](./LICENSE) © ourongxing
