const prisma = require('../lib/prisma')

const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assigneeId } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.projectId,
        assigneeId: assigneeId || null
      },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    })

    res.status(201).json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: { assignee: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(tasks)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assigneeId } = req.body

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null })
      },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    })

    res.json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createTask, getTasksByProject, updateTask, deleteTask }