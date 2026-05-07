const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth.middleware')
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/project.controller')

router.use(protect)

router.get('/', getProjects)
router.post('/', createProject)
router.get('/:id', getProject)
router.put('/:id', adminOnly, updateProject)
router.delete('/:id', adminOnly, deleteProject)
router.post('/:id/members', adminOnly, addMember)
router.delete('/:id/members/:userId', adminOnly, removeMember)

module.exports = router