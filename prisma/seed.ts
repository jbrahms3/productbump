import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    id: "seed-1",
    name: "Notion AI",
    tagline: "Your documents, supercharged with AI",
    description:
      "Notion AI brings the power of AI right inside your workspace. Summarize, translate, brainstorm, and more — without leaving Notion.",
    websiteUrl: "https://notion.so",
    makerName: "Ivan Zhao",
    makerEmail: "ivan@notion.so",
    category: "Productivity",
    slug: "notion-ai",
    subscriberCount: 43,
    bumpThreshold: 50,
    stripeConnected: true,
    stripeAccountId: null,
  },
  {
    id: "seed-2",
    name: "Linear",
    tagline: "The issue tracker you'll actually enjoy using",
    description:
      "Linear is a streamlined project management tool built for high-performance teams. Keyboard-first, blazing fast, and opinionated by design.",
    websiteUrl: "https://linear.app",
    makerName: "Karri Saarinen",
    makerEmail: "karri@linear.app",
    category: "Developer",
    slug: "linear",
    subscriberCount: 28,
    bumpThreshold: 50,
    stripeConnected: true,
    stripeAccountId: null,
  },
  {
    id: "seed-3",
    name: "Loom",
    tagline: "Video messaging for work",
    description:
      "Record and share video messages. Get your point across better than email, without scheduling another meeting.",
    websiteUrl: "https://loom.com",
    makerName: "Shahed Khan",
    makerEmail: "shahed@loom.com",
    category: "Productivity",
    slug: "loom",
    subscriberCount: 11,
    bumpThreshold: 50,
    stripeConnected: false,
    stripeAccountId: null,
  },
  {
    id: "seed-4",
    name: "Framer",
    tagline: "Design and ship your dream site",
    description:
      "Framer is the only website builder that gives you complete design freedom and powerful marketing tools in one place.",
    websiteUrl: "https://framer.com",
    makerName: "Koen Bok",
    makerEmail: "koen@framer.com",
    category: "Design",
    slug: "framer",
    subscriberCount: 5,
    bumpThreshold: 50,
    stripeConnected: true,
    stripeAccountId: null,
  },
  {
    id: "seed-5",
    name: "PlantPal",
    tagline: "Keep your plants happy and healthy",
    description:
      "PlantPal uses AI to identify your plants, remind you when to water them, and diagnose diseases before they spread.",
    websiteUrl: "https://plantpal.app",
    makerName: "Lily Green",
    makerEmail: "lily@plantpal.app",
    category: "Lifestyle",
    slug: "plantpal",
    subscriberCount: 3,
    bumpThreshold: 50,
    stripeConnected: true,
    stripeAccountId: null,
  },
];

// Hall of Fame entries
const bumpedProducts = [
  {
    id: "seed-hof-1",
    name: "TweetHunter",
    tagline: "Grow your Twitter audience on autopilot",
    description: "TweetHunter helps creators schedule, repurpose, and grow their Twitter presence with AI.",
    websiteUrl: "https://tweethunter.io",
    makerName: "Tibo Louis-Lucas",
    makerEmail: "tibo@tweethunter.io",
    category: "Marketing",
    slug: "tweethunter",
    subscriberCount: 50,
    bumpThreshold: 50,
    stripeConnected: true,
    stripeAccountId: null,
    bumped: true,
    featured: false,
    bumpedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
  },
  {
    id: "seed-hof-2",
    name: "Opal",
    tagline: "Screen time that works for you",
    description: "Opal helps you focus by blocking distracting apps and building better digital habits.",
    websiteUrl: "https://opal.so",
    makerName: "Kenneth Schlenker",
    makerEmail: "kenneth@opal.so",
    category: "Health",
    slug: "opal",
    subscriberCount: 62,
    bumpThreshold: 50,
    stripeConnected: true,
    stripeAccountId: null,
    bumped: true,
    featured: false,
    bumpedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
  },
  {
    id: "seed-hof-3",
    name: "Typefully",
    tagline: "Write and schedule Twitter threads",
    description: "Typefully is the distraction-free editor for Twitter. Write better threads and schedule them effortlessly.",
    websiteUrl: "https://typefully.com",
    makerName: "Francesco Di Lorenzo",
    makerEmail: "f@typefully.com",
    category: "Marketing",
    slug: "typefully",
    subscriberCount: 55,
    bumpThreshold: 50,
    stripeConnected: true,
    stripeAccountId: null,
    bumped: true,
    featured: false,
    bumpedAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // 1d ago
  },
];

// Today's subscriptions (for "today" counts)
function makeSubscriptions(productId: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `seed-sub-${productId}-${i}`,
    stripeSubscriptionId: `sub_seed_${productId}_${i}`,
    stripeCustomerId: `cus_seed_${productId}_${i}`,
    productId,
    createdAt: new Date(Date.now() - i * 3600 * 1000 * 0.5), // spread over last few hours
  }));
}

async function main() {
  // Upsert active products
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // Upsert bumped (Hall of Fame) products
  for (const p of bumpedProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // Seed today's subscriptions
  const todayCounts: Record<string, number> = {
    "seed-1": 5,  // Notion AI: +5 today
    "seed-2": 2,  // Linear: +2 today
    "seed-3": 1,  // Loom: -1 today (still add 1 but it fluctuates)
    "seed-4": 3,  // Framer: +3 today
    "seed-5": 0,  // PlantPal: no new today
  };

  for (const [productId, count] of Object.entries(todayCounts)) {
    for (const sub of makeSubscriptions(productId, count)) {
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: sub.stripeSubscriptionId },
        update: {},
        create: sub,
      });
    }
  }

  console.log("✅ Seeded products, Hall of Fame, and today's subscriptions");
}

main().catch(console.error).finally(() => prisma.$disconnect());
