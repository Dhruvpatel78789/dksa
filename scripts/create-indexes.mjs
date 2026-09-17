import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

let uri = process.env.MONGODB_URI;

if (!uri) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const match = envFile.match(/^MONGODB_URI\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match) {
      uri = match[1];
    }
  }
}

if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
  console.error('Error: MONGODB_URI is missing or invalid in environment and .env.local');
  console.error('Expected a connection string starting with "mongodb://" or "mongodb+srv://"');
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('medtech');

  console.log('Creating indexes...');

  await db.collection('products').createIndexes([
    { key: { createdAt: -1 } },
    { key: { isPromoted: 1, updatedAt: -1 } },
    { key: { slug: 1 }, sparse: true },
  ]);
  console.log('✓ products indexes');

  await db.collection('reviews').createIndexes([
    { key: { isSelectedForHome: 1, createdAt: -1 } },
    { key: { product: 1, createdAt: -1 } },
  ]);
  console.log('✓ reviews indexes');

  await db.collection('orders').createIndexes([
    { key: { createdAt: -1 } },
    { key: { userId: 1 } },
    { key: { paymentStatus: 1 } },
  ]);
  console.log('✓ orders indexes');

  await db.collection('carts').createIndexes([
    { key: { userId: 1 }, sparse: true },
    { key: { guestCartId: 1 }, sparse: true },
  ]);
  console.log('✓ carts indexes');

  console.log('\nAll indexes created successfully!');
  await client.close();
}

main().catch(console.error);
