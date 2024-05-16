## Getting Started

Install dependencies:

```bash
pnpm install
```

First, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## TODOs

- [x] Add table pagination
- [x] Add table sorting
- [ ] Add table filtering
- [ ] Account Details: Merge compressed transactions overview with transactions overview
- [ ] Account Details: Merge compressed token accounts overview with token accounts overview
- [ ] Make it possible to search and view account details based on the compressed account address instead of the hash
- [ ] Add support for custom compression URLs
- [ ] Save custom URLs in local storage
- [ ] Add Mainnet, Testnet, and Devnet once available
- [ ] Improve meta tags
- [ ] Add zod for schema and validation of fetched data
- [ ] Performance optimizations using SSR: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
- [ ] Improve overall design
- [ ] Improve mobile/tablet responsiveness
- [x] Connect to https://photon.helius.dev
