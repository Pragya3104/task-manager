const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

const authRoutes = require('./routes/auth.routes')
const projectRoutes = require('./routes/project.routes')
const taskRoutes = require('./routes/task.routes')
const dashboardRoutes = require('./routes/dashboard.routes')

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})