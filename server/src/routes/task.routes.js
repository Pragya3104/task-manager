const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { createTask, getTasksByProject, updateTask, deleteTask } = require('../controllers/task.controller')

router.use(protect)

router.post('/project/:projectId', createTask)
router.get('/project/:projectId', getTasksByProject)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

module.exports = router