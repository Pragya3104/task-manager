import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data, data.token); toast.success('authenticated'); navigate('/dashboard')
    } catch(err) { toast.error(err.response?.data?.message || 'auth failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--sans)' }}>
      <div style={{ width:360 }} className="fade-up">

        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:500, color:'var(--amber)', letterSpacing:'0.05em', marginBottom:6 }}>
            taskflow<span style={{ color:'var(--text3)' }}>_</span>
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', letterSpacing:'0.08em' }}>
            // authenticate to continue
          </div>
        </div>

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
                email
              </label>
              <input type="email" required value={form.email}
                onChange={e => setForm({...form, email:e.target.value})}
                placeholder="you@company.com"
                style={{ width:'100%', padding:'9px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text1)', fontSize:13, fontFamily:'var(--mono)', outline:'none', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor='var(--amber)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
                password
              </label>
              <input type="password" required value={form.password}
                onChange={e => setForm({...form, password:e.target.value})}
                placeholder="••••••••"
                style={{ width:'100%', padding:'9px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text1)', fontSize:13, fontFamily:'var(--mono)', outline:'none', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor='var(--amber)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'10px', borderRadius:5,
              background: loading ? 'var(--bg3)' : 'var(--amber-bg)',
              border:`1px solid ${loading ? 'var(--border)' : 'var(--amber2)'}`,
              color: loading ? 'var(--text3)' : 'var(--amber)',
              fontSize:12, fontFamily:'var(--mono)', letterSpacing:'0.08em',
              cursor: loading ? 'not-allowed' : 'pointer', transition:'all .15s'
            }}>
              {loading ? '// authenticating...' : '→ sign_in()'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', marginTop:16 }}>
          no account?{' '}
          <Link to="/register" style={{ color:'var(--amber)', textDecoration:'none' }}>register →</Link>
        </p>
      </div>
    </div>
  )
}