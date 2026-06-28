import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const THRESHOLD = 10000; // $100 in cents

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
    revenueAmount: 8600, // $86
    revenueThreshold: THRESHOLD,
    stripeConnected: true,
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
    revenueAmount: 5600, // $56
    revenueThreshold: THRESHOLD,
    stripeConnected: true,
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
    revenueAmount: 2200, // $22
    revenueThreshold: THRESHOLD,
    stripeConnected: false,
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
    revenueAmount: 1000, // $10
    revenueThreshold: THRESHOLD,
    stripeConnected: true,
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
    revenueAmount: 600, // $6
    revenueThreshold: THRESHOLD,
    stripeConnected: true,
  },
];

// Products that already hit the goal and bumped off the homepage
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
    revenueAmount: 10000, // $100
    revenueThreshold: THRESHOLD,
    stripeConnected: true,
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
    revenueAmount: 12400, // $124
    revenueThreshold: THRESHOLD,
    stripeConnected: true,
    bumped: true,
    featured: false,
    bumpedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
  },
];

// Today's payments (for "today" revenue figures), amounts in cents
function makePayments(productId: string, amounts: number[]) {
  return amounts.map((amount, i) => ({
    id: `seed-pay-${productId}-${i}`,
    stripeChargeId: `ch_seed_${productId}_${i}`,
    amount,
    productId,
    createdAt: new Date(Date.now() - i * 3600 * 1000 * 0.5), // spread over last few hours
  }));
}

async function main() {
  for (const p of [...products, ...bumpedProducts]) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // Seed today's payments (mix of one-time and subscription-sized charges)
  const todayPayments: Record<string, number[]> = {
    "seed-1": [1500, 1500, 900], // Notion AI: +$39 today
    "seed-2": [2000, 600],       // Linear: +$26 today
    "seed-3": [1200],            // Loom: +$12 today
    "seed-4": [1000],            // Framer: +$10 today
    "seed-5": [],                // PlantPal: nothing today
  };

  for (const [productId, amounts] of Object.entries(todayPayments)) {
    for (const pay of makePayments(productId, amounts)) {
      await prisma.payment.upsert({
        where: { stripeChargeId: pay.stripeChargeId },
        update: {},
        create: pay,
      });
    }
  }

  console.log("✅ Seeded products and today's revenue");
}

main().catch(console.error).finally(() => prisma.$disconnect());
