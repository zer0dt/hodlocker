## Running Locally

1. Clone the repository.

```bash
git clone https://github.com/zer0dt/hodlocker.git
cd hodlocker
```

2. Install dependencies using npm.

```bash
npm install
```

3. Copy `env.example` to `env` and update the variables.

```bash
cp .env.example .env
``` 

4. 

- Change the DATABASE_URL to your postgres instance - free instance at https://supabase.com/
- Add your PUSHER details for notifications - free at https://pusher.com/
- Add a private key to fund anon posts and replies (10,000 sats  ~ 5000 interactions)
- Add your mainnet TAAL api key from https://platform.taal.com/

5.  Sync your prisma client with the Supabase instance.

   ```bash
npx prisma db push
``` 

6. Seed database

```bash
npm run db:seed
```
  
7. Start the development server.

```bash
npm run dev
```
