export default defineEventHandler(async (event) => {
  const db = useDB(event)

  const row = await db.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
     FROM donations
     WHERE status = 'paid'`
  ).first<{ total: number; count: number }>()

  return {
    totalCollected: Number(row?.total ?? 0),
    totalSupporters: Number(row?.count ?? 0),
  }
})
