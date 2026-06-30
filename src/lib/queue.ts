import { prisma } from "@/lib/prisma";

const HOMEPAGE_SLOTS = 8;

// Pull the next product into a vacated slot. The random slot draws from anywhere
// in the queue; every other slot draws the oldest submission (FIFO).
async function fillSlot(isRandomSlot: boolean) {
  const queue = await prisma.product.findMany({
    where: { featured: false, bumped: false },
    orderBy: { createdAt: "asc" },
  });
  if (queue.length === 0) return null;

  const next = isRandomSlot ? queue[Math.floor(Math.random() * queue.length)] : queue[0];

  return prisma.product.update({
    where: { id: next.id },
    data: { featured: true, featuredAt: new Date(), randomSlot: isRandomSlot },
  });
}

// Guarantees exactly one current homepage slot is flagged as the random slot,
// once there's at least one featured product to carry the flag.
export async function ensureRandomSlot() {
  const hasRandom = await prisma.product.findFirst({
    where: { featured: true, bumped: false, randomSlot: true },
  });
  if (hasRandom) return;

  const candidate = await prisma.product.findFirst({
    where: { featured: true, bumped: false },
    orderBy: { featuredAt: "desc" },
  });
  if (candidate) {
    await prisma.product.update({ where: { id: candidate.id }, data: { randomSlot: true } });
  }
}

// Backfills any open homepage slots (e.g. after a new submission). Reserves the
// last slot to fill as the random slot if one isn't already assigned.
export async function fillOpenSlots() {
  let featuredCount = await prisma.product.count({ where: { featured: true, bumped: false } });
  const hasRandomSlot = await prisma.product.findFirst({
    where: { featured: true, bumped: false, randomSlot: true },
  });

  while (featuredCount < HOMEPAGE_SLOTS) {
    const isLastSlot = featuredCount === HOMEPAGE_SLOTS - 1 && !hasRandomSlot;
    const filled = await fillSlot(isLastSlot);
    if (!filled) break;
    featuredCount++;
  }

  await ensureRandomSlot();
}

// Called when a product bumps off — frees its slot and pulls in a replacement.
export async function replaceBumpedProduct(wasRandomSlot: boolean) {
  await fillSlot(wasRandomSlot);
  await ensureRandomSlot();
}
