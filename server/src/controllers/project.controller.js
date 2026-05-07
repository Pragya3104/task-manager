const prisma = require('../lib/prisma')

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ message: 'Project name is required' })

    const project = await prisma.project.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: req.user.id
          }
        }
      },
      include: { members: { include: { user: true } } }
    })

    res.status(201).json(project)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: true
      }
    })
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getProject = async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.user.id } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: { include: { assignee: { select: { id: true, name: true, email: true } } } }
      }
    })

    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description }
    })
    res.json(project)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } })
    res.json({ message: 'Project deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const addMember = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.id } }
    })
    if (existing) return res.status(400).json({ message: 'User already in project' })

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId: req.params.id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    })

    res.status(201).json(member)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const removeMember = async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: req.params.userId,
          projectId: req.params.id
        }
      }
    })
    res.json({ message: 'Member removed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember }