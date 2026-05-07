import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

export default function Projects() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', description:'' })
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: projects, isLoading } = useQuery({
    queryKey:['projects'],
    queryFn: async () => (await api.get('/projects')).data
  })

  const createProject = useMutation({
    mutationFn: d => api.post('/projects', d),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      toast.success('project created'); setShowModal(false); setForm({ name:'', description:'' })
    },
    onError: err => toast.error(err.response?.data?.message || 'failed')
  })

  return (
    <div style={{ padding:'32px 36px', maxWidth:960, margin:'0 auto' }}>
      <div className="fade-up" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32 }}>
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', letterSpacing:'0.1em', marginBottom:6 }}>// workspace</div>
          <h1 style={{ fontFamily:'var(--mono)', fontSize:22, fontWeight:500, color:'var(--text1)', letterSpacing:'-0.02em' }}>
            projects<span style={{ color:'var(--amber)' }}>[]</span>
          </h1>
        </div>
        {user?.role==='ADMIN' && (
          <button onClick={() => setShowModal(true)} style={{
            padding:'8px 16px', borderRadius:5, cursor:'pointer',
            background:'var(--amber-bg)', border:'1px solid var(--amber2)',
            color:'var(--amber)', fontSize:11, fontFamily:'var(--mono)',
            letterSpacing:'0.06em', transition:'all .12s'
          }}>
            + new_project()
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[...Array(3)].map((_,i) => <div key={i} style={{ height:120, background:'var(--bg2)', borderRadius:6, border:'1px solid var(--border)' }}/>)}
        </div>
      ) : !projects?.length ? (
        <div style={{ border:'1px dashed var(--border)', borderRadius:6, padding:'60px 20px', textAlign:'center' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', marginBottom:12 }}>
            // no projects found
          </div>
          {user?.role==='ADMIN' && (
            <button onClick={() => setShowModal(true)} style={{ background:'none', border:'none', color:'var(--amber)', fontFamily:'var(--mono)', fontSize:11, cursor:'pointer' }}>
              → create_project()
            </button>
          )}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
          {projects.map((p, i) => (
            <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration:'none' }} className={`fade-up-${Math.min(i+1,5)}`}>
              <div style={{
                background:'var(--bg2)', border:'1px solid var(--border)',
                borderRadius:6, padding:'18px 20px', cursor:'pointer', transition:'border-color .12s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                    project
                  </div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--amber)', background:'var(--amber-bg)', padding:'2px 8px', borderRadius:2, border:'1px solid var(--amber2)' }}>
                    {p.tasks?.length ?? 0} tasks
                  </div>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text1)', marginBottom:6, letterSpacing:'-0.01em' }}>
                  {p.name}
                </div>
                {p.description && (
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5, marginBottom:12, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {p.description}
                  </div>
                )}
                <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text3)', paddingTop:10, borderTop:'1px solid var(--bg3)' }}>
                  {p.members?.length} member{p.members?.length!==1?'s':''}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && <Modal title="new_project()" onClose={() => setShowModal(false)}>
        <form onSubmit={e => { e.preventDefault(); createProject.mutate(form) }}>
          <MField label="project_name">
            <MInput value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="my-awesome-project" required autoFocus/>
          </MField>
          <MField label="description" style={{ marginTop:14 }}>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              rows={3} placeholder="// what is this project about?"
              style={{ width:'100%', padding:'9px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text1)', fontSize:12, fontFamily:'var(--mono)', outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.5 }}
              onFocus={e=>e.target.style.borderColor='var(--amber)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'}
            />
          </MField>
          <div style={{ display:'flex', gap:8, marginTop:20, justifyContent:'flex-end' }}>
            <MBtn ghost onClick={()=>setShowModal(false)}>cancel</MBtn>
            <MBtn disabled={createProject.isPending}>{createProject.isPending?'creating...':'→ create()'}</MBtn>
          </div>
        </form>
      </Modal>}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:20 }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:8, width:'100%', maxWidth:420 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--amber)', letterSpacing:'0.06em' }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16, lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:18 }}>{children}</div>
      </div>
    </div>
  )
}

export function MField({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display:'block', fontFamily:'var(--mono)', fontSize:9, color:'var(--text3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>{label}</label>
      {children}
    </div>
  )
}

export function MInput({ style, ...props }) {
  return (
    <input {...props} style={{ width:'100%', padding:'9px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text1)', fontSize:12, fontFamily:'var(--mono)', outline:'none', boxSizing:'border-box', ...style }}
      onFocus={e=>e.target.style.borderColor='var(--amber)'}
      onBlur={e=>e.target.style.borderColor='var(--border)'}
    />
  )
}

export function MSelect({ children, style, ...props }) {
  return (
    <select {...props} style={{ width:'100%', padding:'9px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text1)', fontSize:12, fontFamily:'var(--mono)', outline:'none', boxSizing:'border-box', ...style }}
      onFocus={e=>e.target.style.borderColor='var(--amber)'}
      onBlur={e=>e.target.style.borderColor='var(--border)'}
    >
      {children}
    </select>
  )
}

export function MBtn({ children, ghost, ...props }) {
  return (
    <button {...props} style={{
      padding:'8px 16px', borderRadius:5, cursor: props.disabled?'not-allowed':'pointer',
      fontSize:11, fontFamily:'var(--mono)', letterSpacing:'0.06em',
      opacity: props.disabled ? 0.5 : 1, transition:'all .12s',
      background: ghost ? 'none' : 'var(--amber-bg)',
      border: ghost ? '1px solid var(--border)' : '1px solid var(--amber2)',
      color: ghost ? 'var(--text3)' : 'var(--amber)',
    }}>
      {children}
    </button>
  )
}