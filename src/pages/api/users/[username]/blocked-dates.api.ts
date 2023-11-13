import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function Availability(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)

  const { year, month } = req.query

  if (!year || !month) {
    return res.status(400).json({ message: 'Year or month not specified' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User dos not exist' })
  }

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDays) => availableWeekDays.week_day === weekDay,
    )
  })

  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
    SELECT
      EXTRACT(DAY FROM schedulings.date) AS dates,
      COUNT(schedulings.date) AS amount
    FROM schedulings

    LEFT JOIN user_time_intervals
      ON user_time_intervals.week_day = EXTRACT(ISODOW FROM schedulings.date) + 1

    WHERE schedulings.user_id = ${`'${user.id}'`}
      AND to_char(schedulings.date, 'YYYY-mm') = ${`'${year}-${month}'`}
    
    GROUP BY EXTRACT(DAY FROM schedulings.date)
  `

  console.log('This is the thing: ', blockedDatesRaw)

  const blockedDates = blockedDatesRaw.map((item) => item.date)

  return res.json({ blockedWeekDays, blockedDates })
}
