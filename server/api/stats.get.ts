export default defineEventHandler(async () => {
  const aggregate = await prisma.donation.aggregate({
    where: { status: 'paid' },
    _sum: { amount: true },
    _count: { _all: true },
  })

  return {
    totalTerkumpul: Number(aggregate._sum.amount ?? 0),
    totalPendukung: aggregate._count._all,
  }
})