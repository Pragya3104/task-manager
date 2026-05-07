import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'

export default function Layout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const at = (p) => location.pathname.startsWith(p)
  const { theme, toggle } = useThemeStore()

  return (
    <div style={{ display:'flex', width:'100vw', height:'100vh', overflow:'hidden', background:'var(--bg)', fontFamily:'var(--sans)' }}>

      <aside style={{
        width:200, minWidth:200, height:'100vh',
        background:'var(--bg2)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column'
      }}>
        <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:500, color:'var(--amber)', letterSpacing:'0.05em' }}>
              taskflow<span style={{ color:'var(--text3)' }}>_</span>
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', marginTop:3, letterSpacing:'0.08em' }}>
              v1.0.0 — workspace
            </div>
          </div>
          <button onClick={toggle} title={`switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} style={{
            background:'var(--bg3)', border:'1px solid var(--border)',
            borderRadius:4, padding:'4px 7px', cursor:'pointer',
            fontSize:12, lineHeight:1, color:'var(--text2)',
            transition:'all .12s', flexShrink:0
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--amber)'; e.currentTarget.style.color='var(--amber)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)' }}
          >
            {theme === 'dark' ? '☀' : '●'}
          </button>
        </div>

        <nav style={{ flex:1, padding:'12px 10px' }}>
          <div style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--text3)', letterSpacing:'0.12em', padding:'0 8px 8px', textTransform:'uppercase' }}>
            nav
          </div>
          {[
            { to:'/dashboard', label:'dashboard', icon:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z' },
            { to:'/projects',  label:'projects',  icon:'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
          ].map(({ to, label, icon }) => (
            <Link key={to} to={to} style={{
              display:'flex', alignItems:'center', gap:9,
              padding:'7px 8px', borderRadius:5, marginBottom:1,
              fontSize:12, fontFamily:'var(--mono)', letterSpacing:'0.04em',
              textDecoration:'none', transition:'all .12s',
              color: at(to) ? 'var(--amber)' : 'var(--text2)',
              background: at(to) ? 'var(--amber-bg)' : 'transparent',
              borderLeft: at(to) ? '2px solid var(--amber)' : '2px solid transparent',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={icon}/>
              </svg>
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding:'12px 10px', borderTop:'1px solid var(--border)' }}>
          <div style={{ padding:'8px', borderRadius:5, background:'var(--bg3)', marginBottom:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:24, height:24, borderRadius:3,
                background:'var(--amber-bg)', border:'1px solid var(--amber2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--mono)', fontSize:10, fontWeight:500, color:'var(--amber)',
                flexShrink:0
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user?.name?.split(' ')[0].toLowerCase()}
                </div>
                <div style={{ fontSize:9, color:'var(--text3)', fontFamily:'var(--mono)', letterSpacing:'0.08em' }}>
                  {user?.role?.toLowerCase()}
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} style={{
            width:'100%', display:'flex', alignItems:'center', gap:8,
            padding:'7px 8px', borderRadius:5, border:'none', cursor:'pointer',
            background:'none', fontSize:11, fontFamily:'var(--mono)',
            color:'var(--text3)', letterSpacing:'0.04em', transition:'all .12s'
          }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='rgba(239,68,68,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.background='none' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            sign_out
          </button>
        </div>
      </aside>

      <main style={{ flex:1, height:'100vh', overflowY:'auto', background:'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}