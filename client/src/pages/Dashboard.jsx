import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

const S = {
  TODO:        { label:'todo',        color:'var(--text2)',  bg:'var(--bg3)',                    border:'var(--border)' },
  IN_PROGRESS: { label:'in_progress', color:'var(--amber)',  bg:'var(--amber-bg)',               border:'var(--amber2)' },
  DONE:        { label:'done',        color:'var(--green)',  bg:'rgba(16,185,129,0.08)',          border:'rgba(16,185,129,0.3)' },
  OVERDUE:     { label:'overdue',     color:'var(--red)',    bg:'rgba(239,68,68,0.08)',           border:'rgba(239,68,68,0.3)' },
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey:['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data
  })

  const stats = [
    { label:'total',       value: data?.total,      accent:'var(--amber)' },
    { label:'todo',        value: data?.todo,        accent:'var(--text2)' },
    { label:'in_progress', value: data?.inProgress,  accent:'var(--amber)' },
    { label:'done',        value: data?.done,        accent:'var(--green)' },
    { label:'overdue',     value: data?.overdue,     accent:'var(--red)' },
  ]

  return (
    <div style={{ padding:'32px 36px', maxWidth:960, margin:'0 auto' }}>

      <div className="fade-up" style={{ marginBottom:32 }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', letterSpacing:'0.1em', marginBottom:6 }}>
          // workspace
        </div>
        <h1 style={{ fontFamily:'var(--mono)', fontSize:22, fontWeight:500, color:'var(--text1)', letterSpacing:'-0.02em' }}>
          {user?.name?.split(' ')[0].toLowerCase()}<span style={{ color:'var(--amber)' }}>.</span>dashboard
        </h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:28 }}>
        {stats.map(({ label, value, accent }, i) => (
          <div key={label} className={`fade-up-${i+1}`} style={{
            background:'var(--bg2)', border:'1px solid var(--border)',
            borderRadius:6, padding:'16px 14px',
            borderBottom:`2px solid ${accent}`
          }}>
            {isLoading
              ? <div style={{ height:28, background:'var(--bg3)', borderRadius:3, marginBottom:8 }}/>
              : <div style={{ fontFamily:'var(--mono)', fontSize:26, fontWeight:400, color:'var(--text1)', marginBottom:4 }}>
                  {value ?? 0}
                </div>
            }
            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="fade-up-3" style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            recent_tasks[]
          </span>
          <Link to="/projects" style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--amber)', textDecoration:'none' }}>
            cd /projects →
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding:16 }}>
            {[...Array(4)].map((_,i) => <div key={i} style={{ height:40, background:'var(--bg3)', borderRadius:4, marginBottom:8 }}/>)}
          </div>
        ) : !data?.recentTasks?.length ? (
          <div style={{ padding:'40px 16px', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)' }}>
              // no tasks found. create a project to begin.
            </div>
          </div>
        ) : data.recentTasks.map((task, i) => (
          <div key={task.id} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px 16px',
            borderBottom: i < data.recentTasks.length-1 ? '1px solid var(--bg3)' : 'none',
          }}>
            <div>
              <div style={{ fontSize:13, color:'var(--text1)', fontWeight:500, marginBottom:2 }}>{task.title}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)' }}>{task.project?.name}</div>
            </div>
            <span style={{
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.06em',
              padding:'3px 10px', borderRadius:3,
              background: S[task.status]?.bg,
              color: S[task.status]?.color,
              border:`1px solid ${S[task.status]?.border}`
            }}>
              {S[task.status]?.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}