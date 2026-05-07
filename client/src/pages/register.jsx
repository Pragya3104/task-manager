import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'MEMBER' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data, data.token); toast.success('account created'); navigate('/dashboard')
    } catch(err) { toast.error(err.response?.data?.message || 'failed') }
    finally { setLoading(false) }
  }

  const inputStyle = { width:'100%', padding:'9px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text1)', fontSize:13, fontFamily:'var(--mono)', outline:'none', boxSizing:'border-box' }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--sans)' }}>
      <div style={{ width:360 }} className="fade-up">
        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:500, color:'var(--amber)', letterSpacing:'0.05em', marginBottom:6 }}>
            taskflow<span style={{ color:'var(--text3)' }}>_</span>
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', letterSpacing:'0.08em' }}>
            // create new account
          </div>
        </div>

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:24 }}>
          <form onSubmit={handleSubmit}>
            {[
              { key:'name', label:'full_name', type:'text', placeholder:'John Doe' },
              { key:'email', label:'email', type:'email', placeholder:'you@company.com' },
              { key:'password', label:'password', type:'password', placeholder:'••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
                  {label}
                </label>
                <input type={type} required placeholder={placeholder}
                  value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor='var(--amber)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>
            ))}

            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
                role
              </label>
              <div style={{ display:'flex', gap:8 }}>
                {['MEMBER','ADMIN'].map(r => (
                  <button type="button" key={r} onClick={() => setForm({...form,role:r})} style={{
                    flex:1, padding:'8px', borderRadius:5, cursor:'pointer',
                    fontSize:11, fontFamily:'var(--mono)', letterSpacing:'0.06em',
                    transition:'all .12s',
                    background: form.role===r ? 'var(--amber-bg)' : 'var(--bg3)',
                    border: form.role===r ? '1px solid var(--amber2)' : '1px solid var(--border)',
                    color: form.role===r ? 'var(--amber)' : 'var(--text3)',
                  }}>
                    {r.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'10px', borderRadius:5,
              background: loading ? 'var(--bg3)' : 'var(--amber-bg)',
              border:`1px solid ${loading ? 'var(--border)' : 'var(--amber2)'}`,
              color: loading ? 'var(--text3)' : 'var(--amber)',
              fontSize:12, fontFamily:'var(--mono)', letterSpacing:'0.08em',
              cursor: loading ? 'not-allowed' : 'pointer', transition:'all .15s'
            }}>
              {loading ? '// creating...' : '→ create_account()'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', marginTop:16 }}>
          have an account?{' '}
          <Link to="/login" style={{ color:'var(--amber)', textDecoration:'none' }}>sign in →</Link>
        </p>
      </div>
    </div>
  )
}