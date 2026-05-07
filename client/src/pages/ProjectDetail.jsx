import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'
import { Modal, MField, MInput, MSelect, MBtn } from './Projects'

const COLS = ['TODO','IN_PROGRESS','DONE','OVERDUE']
const CM = {
  TODO:        { label:'todo',        dot:'var(--text2)',  color:'var(--text2)',  bg:'var(--bg3)',                 border:'var(--border)' },
  IN_PROGRESS: { label:'in_progress', dot:'var(--amber)',  color:'var(--amber)',  bg:'var(--amber-bg)',            border:'var(--amber2)' },
  DONE:        { label:'done',        dot:'var(--green)',  color:'var(--green)',  bg:'rgba(16,185,129,0.08)',      border:'rgba(16,185,129,0.3)' },
  OVERDUE:     { label:'overdue',     dot:'var(--red)',    color:'var(--red)',    bg:'rgba(239,68,68,0.08)',       border:'rgba(239,68,68,0.3)' },
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showTask, setShowTask] = useState(false)
  const [showMember, setShowMember] = useState(false)
  const [taskForm, setTaskForm] = useState({ title:'', description:'', status:'TODO', dueDate:'', assigneeId:'' })
  const [memberEmail, setMemberEmail] = useState('')

  const { data: project, isLoading } = useQuery({
    queryKey:['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data
  })

  const createTask = useMutation({
    mutationFn: d => api.post(`/tasks/project/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id]); queryClient.invalidateQueries(['dashboard'])
      toast.success('task created'); setShowTask(false)
      setTaskForm({ title:'', description:'', status:'TODO', dueDate:'', assigneeId:'' })
    },
    onError: err => toast.error(err.response?.data?.message || 'failed')
  })

  const updateTask = useMutation({
    mutationFn: ({ taskId, data }) => api.put(`/tasks/${taskId}`, data),
    onSuccess: () => { queryClient.invalidateQueries(['project', id]); queryClient.invalidateQueries(['dashboard']) }
  })

  const deleteTask = useMutation({
    mutationFn: taskId => api.delete(`/tasks/${taskId}`),
    onSuccess: () => { queryClient.invalidateQueries(['project', id]); queryClient.invalidateQueries(['dashboard']); toast.success('deleted') }
  })

  const addMember = useMutation({
    mutationFn: email => api.post(`/projects/${id}/members`, { email }),
    onSuccess: () => { queryClient.invalidateQueries(['project', id]); toast.success('member added'); setShowMember(false); setMemberEmail('') },
    onError: err => toast.error(err.response?.data?.message || 'failed')
  })

  const handleTask = e => {
    e.preventDefault()
    const p = { ...taskForm }
    if (!p.dueDate) delete p.dueDate
    if (!p.assigneeId) delete p.assigneeId
    createTask.mutate(p)
  }

  if (isLoading) return (
    <div style={{ padding:'32px 36px' }}>
      {[...Array(3)].map((_,i) => <div key={i} style={{ height:48, background:'var(--bg2)', borderRadius:6, marginBottom:10, border:'1px solid var(--border)' }}/>)}
    </div>
  )
  if (!project) return <div style={{ padding:32, fontFamily:'var(--mono)', fontSize:12, color:'var(--text3)' }}>// project not found</div>

  const grouped = {}
  COLS.forEach(c => grouped[c] = project.tasks?.filter(t => t.status===c) || [])

  return (
    <div style={{ padding:'32px 36px', maxWidth:1140, margin:'0 auto' }}>
      <div className="fade-up" style={{ marginBottom:24 }}>
        <Link to="/projects" style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', textDecoration:'none', letterSpacing:'0.08em', display:'inline-flex', alignItems:'center', gap:4, marginBottom:16 }}>
          ← cd ../projects
        </Link>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', letterSpacing:'0.1em', marginBottom:4 }}>// project</div>
            <h1 style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:500, color:'var(--text1)', letterSpacing:'-0.02em', marginBottom:8 }}>
              {project.name}<span style={{ color:'var(--amber)' }}>/</span>
            </h1>
            {project.description && <p style={{ fontSize:13, color:'var(--text2)', marginBottom:12 }}>{project.description}</p>}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {project.members?.map(m => (
                <div key={m.id} title={m.user.name} style={{
                  width:24, height:24, borderRadius:3,
                  background:'var(--amber-bg)', border:'1px solid var(--amber2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--mono)', fontSize:9, fontWeight:500, color:'var(--amber)'
                }}>
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text3)', marginLeft:4 }}>
                {project.members?.length} member{project.members?.length!==1?'s':''}
              </span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {user?.role==='ADMIN' && (
              <button onClick={() => setShowMember(true)} style={{
                padding:'7px 14px', borderRadius:5, cursor:'pointer',
                background:'none', border:'1px solid var(--border)',
                color:'var(--text2)', fontSize:11, fontFamily:'var(--mono)', letterSpacing:'0.06em'
              }}>
                + member
              </button>
            )}
            <button onClick={() => setShowTask(true)} style={{
              padding:'7px 14px', borderRadius:5, cursor:'pointer',
              background:'var(--amber-bg)', border:'1px solid var(--amber2)',
              color:'var(--amber)', fontSize:11, fontFamily:'var(--mono)', letterSpacing:'0.06em'
            }}>
              + task
            </button>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {COLS.map(col => (
          <div key={col} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, overflow:'hidden' }}>
            <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:CM[col].dot, display:'inline-block' }}/>
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  {CM[col].label}
                </span>
              </div>
              <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text3)', background:'var(--bg3)', padding:'1px 6px', borderRadius:2 }}>
                {grouped[col].length}
              </span>
            </div>
            <div style={{ padding:8, minHeight:80 }}>
              {grouped[col].map(task => (
                <TaskCard key={task.id} task={task} user={user}
                  onDelete={() => deleteTask.mutate(task.id)}
                  onStatus={s => updateTask.mutate({ taskId:task.id, data:{ status:s } })}
                />
              ))}
              {grouped[col].length===0 && (
                <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--bg3)', textAlign:'center', padding:'16px 0' }}>empty</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTask && (
        <Modal title="new_task()" onClose={() => setShowTask(false)}>
          <form onSubmit={handleTask}>
            <MField label="title">
              <MInput value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} placeholder="what needs to be done?" required autoFocus/>
            </MField>
            <MField label="description" style={{ marginTop:14 }}>
              <textarea value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})}
                rows={2} placeholder="// optional details"
                style={{ width:'100%', padding:'9px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text1)', fontSize:12, fontFamily:'var(--mono)', outline:'none', resize:'none', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='var(--amber)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}
              />
            </MField>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:14 }}>
              <MField label="status">
                <MSelect value={taskForm.status} onChange={e=>setTaskForm({...taskForm,status:e.target.value})}>
                  <option value="TODO" style={{background:'var(--bg2)'}}>todo</option>
                  <option value="IN_PROGRESS" style={{background:'var(--bg2)'}}>in_progress</option>
                  <option value="DONE" style={{background:'var(--bg2)'}}>done</option>
                </MSelect>
              </MField>
              <MField label="due_date">
                <MInput type="date" value={taskForm.dueDate} onChange={e=>setTaskForm({...taskForm,dueDate:e.target.value})}/>
              </MField>
            </div>
            <MField label="assign_to" style={{ marginTop:14 }}>
              <MSelect value={taskForm.assigneeId} onChange={e=>setTaskForm({...taskForm,assigneeId:e.target.value})}>
                <option value="" style={{background:'var(--bg2)'}}>unassigned</option>
                {project.members?.map(m => (
                  <option key={m.user.id} value={m.user.id} style={{background:'var(--bg2)'}}>{m.user.name}</option>
                ))}
              </MSelect>
            </MField>
            <div style={{ display:'flex', gap:8, marginTop:20, justifyContent:'flex-end' }}>
              <MBtn ghost onClick={()=>setShowTask(false)}>cancel</MBtn>
              <MBtn disabled={createTask.isPending}>{createTask.isPending?'creating...':'→ create()'}</MBtn>
            </div>
          </form>
        </Modal>
      )}

      {showMember && (
        <Modal title="add_member()" onClose={() => setShowMember(false)}>
          <MField label="email_address">
            <MInput type="email" value={memberEmail} onChange={e=>setMemberEmail(e.target.value)} placeholder="colleague@company.com" autoFocus/>
          </MField>
          <p style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', marginTop:8 }}>
            // user must already have an account
          </p>
          <div style={{ display:'flex', gap:8, marginTop:20, justifyContent:'flex-end' }}>
            <MBtn ghost onClick={()=>setShowMember(false)}>cancel</MBtn>
            <MBtn onClick={()=>addMember.mutate(memberEmail)} disabled={addMember.isPending||!memberEmail}>
              {addMember.isPending?'adding...':'→ add()'}
            </MBtn>
          </div>
        </Modal>
      )}
    </div>
  )
}

function TaskCard({ task, user, onDelete, onStatus }) {
  const [hover, setHover] = useState(false)
  const CM2 = {
    TODO:        { color:'var(--text2)',  bg:'var(--bg3)',            border:'var(--border)' },
    IN_PROGRESS: { color:'var(--amber)',  bg:'var(--amber-bg)',       border:'var(--amber2)' },
    DONE:        { color:'var(--green)',  bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.3)' },
    OVERDUE:     { color:'var(--red)',    bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.3)' },
  }
  return (
    <div
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{ background: hover?'var(--bg3)':'var(--bg)', border:'1px solid var(--border)', borderRadius:5, padding:'10px 10px 8px', marginBottom:6, transition:'background .12s' }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:6 }}>
        <p style={{ fontSize:12, color:'var(--text1)', fontWeight:500, lineHeight:1.4, margin:0 }}>{task.title}</p>
        {user?.role==='ADMIN' && hover && (
          <button onClick={onDelete} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:0, flexShrink:0, fontSize:12, lineHeight:1 }}
            onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}
          >×</button>
        )}
      </div>
      {task.description && (
        <p style={{ fontSize:11, color:'var(--text3)', marginTop:4, lineHeight:1.4, fontFamily:'var(--mono)', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {task.description}
        </p>
      )}
      <div style={{ marginTop:8, display:'flex', alignItems:'center', justifyContent:'space-between', gap:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {task.assignee && (
            <div title={task.assignee.name} style={{ width:16, height:16, borderRadius:2, background:'var(--amber-bg)', border:'1px solid var(--amber2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:8, color:'var(--amber)' }}>
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          )}
          {task.dueDate && (
            <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text3)' }}>
              {new Date(task.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
            </span>
          )}
        </div>
        <select value={task.status} onChange={e=>onStatus(e.target.value)} style={{
          background:'none', border:'none', cursor:'pointer', padding:0,
          fontFamily:'var(--mono)', fontSize:9, fontWeight:600, letterSpacing:'0.06em',
          color: CM2[task.status]?.color, outline:'none'
        }}>
          <option value="TODO" style={{background:'var(--bg2)',color:'var(--text1)'}}>todo</option>
          <option value="IN_PROGRESS" style={{background:'var(--bg2)',color:'var(--text1)'}}>in_progress</option>
          <option value="DONE" style={{background:'var(--bg2)',color:'var(--text1)'}}>done</option>
          <option value="OVERDUE" style={{background:'var(--bg2)',color:'var(--text1)'}}>overdue</option>
        </select>
      </div>
    </div>
  )
}