const prisma = require('../lib/prisma')

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id
    const now = new Date()

    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    })
    const projectIds = userProjects.map(p => p.projectId)

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      prisma.task.count({ where: { projectId: { in: projectIds } } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
      prisma.task.count({
        where: {
          projectId: { in: projectIds },
          status: { not: 'DONE' },
          dueDate: { lt: now }
        }
      })
    ])

    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    res.json({ total, todo, inProgress, done, overdue, recentTasks })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getDashboard }