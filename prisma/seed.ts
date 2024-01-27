import { PrismaClient } from '@prisma/client';
import bsv from 'bsv'
import 'dotenv/config'

const NEXT_DIRECT_URL = process.env.NEXT_DIRECT_URL as string
const ANON_PRIVATE_KEY = process.env.ANON_PRIVATE_KEY as string
if (!NEXT_DIRECT_URL || !ANON_PRIVATE_KEY) throw new Error("Missing env variable.")

const prisma = new PrismaClient({
    datasources: { db: { url: NEXT_DIRECT_URL } },
});

async function seed() {
  const tag = await prisma.tag.create({
    data: {
      name: 'BSV',
      fullName: 'Bitcoin',
    },
  });
  console.log(`Created tag with ID: ${tag.id}`);

  const privateKey = bsv.PrivateKey.fromWIF(ANON_PRIVATE_KEY);
  const publicKey = privateKey.publicKey;
  const publicKeyHex = publicKey.toString();
  const bitcoiner = await prisma.bitcoiner.create({
    data: {
      handle: 'anon',
      pubkey: publicKeyHex
    },
  });
  console.log(`Created bitcoiner with handle: ${bitcoiner.handle}`);
}

seed()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
