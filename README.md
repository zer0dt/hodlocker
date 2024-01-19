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
3. Install Scrypt-CLI, Initialize, and Build Contract

```bash
npm install -g scrypt-cli
npx scrypt-cli init
npm run build:contract
```

4. Copy `env.example` to `env` and update the variables.

```bash
cp .env.example .env
``` 

5. 

Change the DATABASE_URL to your postgres instance - free instance at https://supabase.com/
Add your PUSHER details for notifications - free at https://pusher.com/
Add a private key to fund anon posts and replies (10,000 sats  ~ 5000 interactions )
aAdd your mainnet TAAL api key from https://platform.taal.com/


6. Start the development server.

```bash
npm run dev
```
