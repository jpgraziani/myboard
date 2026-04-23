import { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from './supabase'

const DEFAULT_LISTS = [
  { id: 'shopping', title: 'Shopping', icon: '◈', color: '#00D4AA', cards: [{ id: 's1', text: 'Highlighters (4 colors)', done: false, priority: 'medium' }, { id: 's2', text: 'Index cards', done: false, priority: 'low' }] },
  { id: 'study', title: 'Study Notes', icon: '◆', color: '#7B8CFF', cards: [{ id: 'n1', text: 'Review pharmacology Ch. 3', done: false, priority: 'high' }, { id: 'n2', text: 'NCLEX practice — cardiac questions', done: false, priority: 'high' }] },
  { id: 'todo', title: 'To-Do', icon: '◉', color: '#FFB547', cards: [{ id: 't1', text: 'Submit lab report by Friday', done: false, priority: 'high' }] },
]

const PRIORITY_CONFIG = {
  high:   { label: 'HIGH', color: '#FF4D6D' },
  medium: { label: 'MED',  color: '#FFB547' },
  low:    { label: 'LOW',  color: '#00D4AA' },
}

const COLORS = ['#00D4AA', '#7B8CFF', '#FFB547', '#FF4D6D', '#38BDF8', '#A78BFA']
const ICONS  = ['◈', '◆', '◉', '▣', '◍', '◐']

function genId() { return Math.random().toString(36).slice(2, 9) }

async function loadFromSupabase() {
  const { data, error } = await supabase.from('boards').select('data').eq('id', 'default').single()
  if (error || !data) return null
  return data.data
}

async function saveToSupabase(lists) {
  await supabase.from('boards').upsert({ id: 'default', data: lists }, { onConflict: 'id' })
}

const CORRECT_PIN = import.meta.env.VITE_PIN

// ─── PIN Screen ───────────────────────────────────────────────────────────────
function PinScreen({ onUnlock }) {
  const [pin, setPin]     = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState(false)

  function handleKey(val) {
    if (pin.length >= 4) return
    const next = pin + val
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => {
        if (next === CORRECT_PIN) { onUnlock() }
        else { setShake(true); setError(true); setTimeout(() => { setPin(''); setShake(false); setError(false) }, 600) }
      }, 100)
    }
  }

  function handleDelete() { setPin(p => p.slice(0, -1)) }
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{ minHeight: '100vh', background: '#080B10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono', monospace", padding: '0 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        html, body, #root { background:#080B10; min-height:100vh; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from { transform:translateY(100%); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
      <div style={{ width:64, height:64, borderRadius:18, background:'rgba(123,140,255,0.12)', border:'1px solid rgba(123,140,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:24, animation:'fadeIn 0.4s ease' }}>◈</div>
      <div style={{ fontSize:10, letterSpacing:4, color:'rgba(255,255,255,0.25)', marginBottom:6, textTransform:'uppercase', animation:'fadeIn 0.4s ease 0.05s both' }}>MY BOARD</div>
      <div style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:-0.5, marginBottom:8, animation:'fadeIn 0.4s ease 0.1s both' }}>Enter PIN</div>
      <div style={{ fontSize:11, color: error ? '#FF4D6D' : 'rgba(255,255,255,0.25)', marginBottom:36, letterSpacing:1, transition:'color 0.2s', animation:'fadeIn 0.4s ease 0.15s both' }}>{error ? 'INCORRECT PIN' : 'ENTER 4-DIGIT CODE'}</div>
      <div style={{ display:'flex', gap:16, marginBottom:48, animation: shake ? 'shake 0.5s ease' : 'fadeIn 0.4s ease 0.2s both' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:16, height:16, borderRadius:'50%', background: i < pin.length ? (error ? '#FF4D6D' : '#7B8CFF') : 'rgba(255,255,255,0.1)', border:`1.5px solid ${i < pin.length ? (error ? '#FF4D6D' : '#7B8CFF') : 'rgba(255,255,255,0.15)'}`, transition:'all 0.15s', transform: i < pin.length ? 'scale(1.1)' : 'scale(1)', boxShadow: i < pin.length && !error ? '0 0 10px #7B8CFF66' : 'none' }} />
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, width:'100%', maxWidth:280, animation:'fadeIn 0.4s ease 0.25s both' }}>
        {keys.map((key, i) => (
          <button key={i} onClick={() => { if (key === '⌫') handleDelete(); else if (key !== '') handleKey(key) }} style={{ height:68, borderRadius:14, background: key==='' ? 'transparent' : key==='⌫' ? 'rgba(255,77,109,0.08)' : 'rgba(255,255,255,0.04)', border: key==='' ? 'none' : key==='⌫' ? '1px solid rgba(255,77,109,0.2)' : '1px solid rgba(255,255,255,0.07)', color: key==='⌫' ? '#FF4D6D' : '#fff', fontSize: key==='⌫' ? 18 : 22, fontWeight:700, cursor: key==='' ? 'default' : 'pointer', fontFamily:'inherit', letterSpacing:-0.5, WebkitTapHighlightColor:'transparent' }}>{key}</button>
        ))}
      </div>
      <div style={{ marginTop:40, fontSize:10, color:'rgba(255,255,255,0.1)', letterSpacing:2, animation:'fadeIn 0.4s ease 0.3s both' }}>PROTECTED · MY BOARD</div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#0E1117', borderTop: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px 20px 0 0', padding: '20px 20px 44px', boxShadow: '0 -20px 60px rgba(0,0,0,0.6)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.1,0.64,1)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', marginBottom: 16, textTransform: 'uppercase' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

// ─── Card Form ────────────────────────────────────────────────────────────────
function CardForm({ initial, listColor, submitLabel, onSubmit, onDelete }) {
  const [text, setText] = useState(initial?.text || '')
  const [priority, setPriority] = useState(initial?.priority || 'medium')
  return (
    <>
      <textarea autoFocus value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="What needs to be done..." style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: `1px solid ${listColor}55`, borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 15, lineHeight: 1.5, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 16 }} />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase' }}>Priority</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setPriority(key)} style={{ flex: 1, padding: '9px 0', background: priority === key ? `${cfg.color}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${priority === key ? cfg.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: priority === key ? cfg.color : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'inherit' }}>{cfg.label}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => text.trim() && onSubmit({ text: text.trim(), priority })} style={{ flex: 1, padding: '14px 0', background: listColor, border: 'none', borderRadius: 10, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 }}>{submitLabel}</button>
        {onDelete && <button onClick={onDelete} style={{ padding: '14px 18px', background: 'rgba(255,77,109,0.12)', border: '1px solid #FF4D6D33', borderRadius: 10, color: '#FF4D6D', fontSize: 13, cursor: 'pointer' }}>Delete</button>}
      </div>
    </>
  )
}

// ─── List Form ────────────────────────────────────────────────────────────────
function ListForm({ initial, submitLabel, onSubmit, onDelete, onClearAll }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [color, setColor] = useState(initial?.color || COLORS[0])
  const [icon, setIcon]   = useState(initial?.icon  || ICONS[0])
  return (
    <>
      <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="List name..." style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}55`, borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 15, outline: 'none', fontFamily: 'inherit', marginBottom: 16 }} />
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase' }}>Color</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {COLORS.map(c => <div key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '2px solid #fff' : '2px solid transparent', boxShadow: color === c ? `0 0 10px ${c}` : 'none', transition: 'all 0.15s' }} />)}
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase' }}>Icon</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {ICONS.map(i => <div key={i} onClick={() => setIcon(i)} style={{ width: 36, height: 36, borderRadius: 8, cursor: 'pointer', background: icon === i ? `${color}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${icon === i ? color : 'rgba(255,255,255,0.08)'}`, color: icon === i ? color : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.15s' }}>{i}</div>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: onClearAll ? 10 : 0 }}>
        <button onClick={() => title.trim() && onSubmit({ title: title.trim(), color, icon })} style={{ flex: 1, padding: '14px 0', background: color, border: 'none', borderRadius: 10, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{submitLabel}</button>
        {onDelete && <button onClick={onDelete} style={{ padding: '14px 18px', background: 'rgba(255,77,109,0.12)', border: '1px solid #FF4D6D33', borderRadius: 10, color: '#FF4D6D', fontSize: 13, cursor: 'pointer' }}>Delete</button>}
      </div>
      {onClearAll && (
        <button onClick={onClearAll} style={{ width: '100%', padding: '12px 0', background: 'transparent', border: '1px solid rgba(255,77,109,0.2)', borderRadius: 10, color: 'rgba(255,77,109,0.6)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'inherit' }}>
          CLEAR ALL ITEMS
        </button>
      )}
    </>
  )
}

// ─── Swipeable Card (swipe left OR right to delete) ──────────────────────────
function SwipeCard({ card, listColor, pri, onToggle, onEdit, onDelete, isDragging }) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const isScrolling = useRef(null)
  const THRESHOLD = 80

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isScrolling.current = null
    setIsSwiping(true)
  }

  function onTouchMove(e) {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current
    if (isScrolling.current === null) {
      isScrolling.current = Math.abs(dy) > Math.abs(dx)
    }
    if (isScrolling.current) { setIsSwiping(false); setSwipeX(0); return }
    // Allow both directions, cap at ±THRESHOLD
    const capped = Math.max(-THRESHOLD, Math.min(THRESHOLD, dx))
    setSwipeX(capped)
  }

  function onTouchEnd() {
    setIsSwiping(false)
    if (Math.abs(swipeX) > THRESHOLD * 0.7) {
      onDelete()
    } else {
      setSwipeX(0)
    }
  }

  const absSwipe = Math.abs(swipeX)
  const swipeProgress = absSwipe / THRESHOLD
  const showDelete = absSwipe > 15
  const isLeft = swipeX < 0

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 9, opacity: isDragging ? 0.4 : 1 }}>
      {/* Left delete hint (swipe right reveals) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '100%',
        background: `rgba(255,77,109,${showDelete && !isLeft ? swipeProgress * 0.25 : 0})`,
        display: 'flex', alignItems: 'center', paddingLeft: 16,
        transition: isSwiping ? 'none' : 'background 0.2s',
        borderRadius: 9,
      }}>
        <span style={{ fontSize: 11, color: '#FF4D6D', fontWeight: 700, letterSpacing: 1.5, opacity: showDelete && !isLeft ? swipeProgress : 0, transition: isSwiping ? 'none' : 'opacity 0.2s' }}>⟵ DELETE</span>
      </div>
      {/* Right delete hint (swipe left reveals) */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%',
        background: `rgba(255,77,109,${showDelete && isLeft ? swipeProgress * 0.25 : 0})`,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16,
        transition: isSwiping ? 'none' : 'background 0.2s',
        borderRadius: 9,
      }}>
        <span style={{ fontSize: 11, color: '#FF4D6D', fontWeight: 700, letterSpacing: 1.5, opacity: showDelete && isLeft ? swipeProgress : 0, transition: isSwiping ? 'none' : 'opacity 0.2s' }}>DELETE ⟶</span>
      </div>

      {/* Card */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 12px',
          background: card.done ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${card.done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
          borderLeft: `2px solid ${card.done ? 'rgba(255,255,255,0.06)' : pri.color}`,
          borderRadius: 9,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.25,1,0.5,1)',
          transform: `translateX(${swipeX}px)`,
          position: 'relative', zIndex: 1,
          userSelect: 'none',
        }}
      >
        <div onClick={onToggle} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer', background: card.done ? `${listColor}30` : 'transparent', border: `1.5px solid ${card.done ? listColor : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {card.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke={listColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
        <span style={{ flex: 1, fontSize: 12, lineHeight: 1.55, color: card.done ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.82)', textDecoration: card.done ? 'line-through' : 'none', letterSpacing: 0.2 }}>{card.text}</span>
        {!card.done && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, color: pri.color, background: `${pri.color}18`, padding: '3px 7px', borderRadius: 4, border: `1px solid ${pri.color}33`, flexShrink: 0 }}>{pri.label}</span>}
        <button onClick={onEdit} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, width: 28, height: 28, color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✎</button>
      </div>
    </div>
  )
}

// ─── Charts View ──────────────────────────────────────────────────────────────
function ChartsView({ lists }) {
  const donutData = lists.map(l => ({ name: l.title, value: l.cards.filter(c => !c.done).length, color: l.color, icon: l.icon, total: l.cards.length })).filter(d => d.total > 0)
  const priorityData = [
    { label: 'HIGH', color: '#FF4D6D', count: lists.reduce((a, l) => a + l.cards.filter(c => !c.done && c.priority === 'high').length, 0) },
    { label: 'MED',  color: '#FFB547', count: lists.reduce((a, l) => a + l.cards.filter(c => !c.done && c.priority === 'medium').length, 0) },
    { label: 'LOW',  color: '#00D4AA', count: lists.reduce((a, l) => a + l.cards.filter(c => !c.done && c.priority === 'low').length, 0) },
  ]
  const completionData = lists.map(l => ({ name: l.title, color: l.color, done: l.cards.filter(c => c.done).length, pending: l.cards.filter(c => !c.done).length, pct: l.cards.length > 0 ? Math.round((l.cards.filter(c => c.done).length / l.cards.length) * 100) : 0 }))
  const totalItems = lists.reduce((a, l) => a + l.cards.length, 0)
  const totalDone  = lists.reduce((a, l) => a + l.cards.filter(c => c.done).length, 0)
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0
  const RADIAN = Math.PI / 180
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fontFamily="IBM Plex Mono">{`${Math.round(percent * 100)}%`}</text>
  }
  return (
    <div style={{ padding: '0 14px 60px' }}>
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 16px', marginBottom: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', marginBottom: 16, textTransform: 'uppercase' }}>Overall Progress</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <ResponsiveContainer width={90} height={90}>
              <PieChart><Pie data={[{ v: totalDone }, { v: Math.max(totalItems - totalDone, 0) }]} dataKey="v" innerRadius={28} outerRadius={40} startAngle={90} endAngle={-270} strokeWidth={0}><Cell fill="#00D4AA" /><Cell fill="rgba(255,255,255,0.05)" /></Pie></PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#00D4AA', letterSpacing: -1 }}>{overallPct}%</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{totalDone} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/ {totalItems} done</span></div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{totalItems - totalDone} items remaining</div>
            <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${overallPct}%`, background: 'linear-gradient(90deg,#00D4AA,#7B8CFF)', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 16px', marginBottom: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', marginBottom: 16, textTransform: 'uppercase' }}>Pending by List</div>
        {donutData.every(d => d.value === 0) ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.2)', fontSize: 12, letterSpacing: 2 }}>ALL DONE 🎉</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={donutData.filter(d => d.value > 0)} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3} labelLine={false} label={renderLabel}>{donutData.filter(d => d.value > 0).map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip contentStyle={{ background: '#0E1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'IBM Plex Mono', fontSize: 11 }} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {donutData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{d.icon} {d.name}</span>
                  <span style={{ fontSize: 11, color: d.color, fontWeight: 700 }}>{d.value} left</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>/ {d.total}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 16px', marginBottom: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', marginBottom: 16, textTransform: 'uppercase' }}>Completion Rate</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {completionData.map((d, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{d.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.pct}%`, background: `linear-gradient(90deg,${d.color}bb,${d.color})`, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{d.done} done · {d.pending} pending</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 16px' }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', marginBottom: 16, textTransform: 'uppercase' }}>Pending by Priority</div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={priorityData} barSize={36} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'IBM Plex Mono', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#0E1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'IBM Plex Mono', fontSize: 11 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>{priorityData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
          {priorityData.map(d => (
            <div key={d.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: d.color, letterSpacing: -1 }}>{d.count}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked]   = useState(false)
  const [lists, setLists]         = useState(DEFAULT_LISTS)
  const [collapsed, setCollapsed] = useState({})
  const [modal, setModal]         = useState(null)
  const [tab, setTab]             = useState('board')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const boardRef = useRef(null)

  // Touch drag state stored in refs to avoid re-renders during drag
  const dragState = useRef(null)
  const [draggingCardId, setDraggingCardId] = useState(null)
  const [draggingListId, setDraggingListId] = useState(null)
  const cardRefs = useRef({})  // cardId -> DOM ref
  const listRefs = useRef({})  // listId -> DOM ref
  const ghostRef = useRef(null)

  useEffect(() => {
    loadFromSupabase().then(data => {
      if (data) setLists(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading) return
    setSaving(true)
    const t = setTimeout(() => { saveToSupabase(lists).finally(() => setSaving(false)) }, 800)
    return () => clearTimeout(t)
  }, [lists])

  function updateCard(listId, cardId, patch) {
    setLists(ls => ls.map(l => l.id !== listId ? l : { ...l, cards: l.cards.map(c => c.id !== cardId ? c : { ...c, ...patch }) }))
  }
  function removeCard(listId, cardId) {
    setLists(ls => ls.map(l => l.id !== listId ? l : { ...l, cards: l.cards.filter(c => c.id !== cardId) }))
  }
  function addCard(listId, card) {
    setLists(ls => ls.map(l => l.id !== listId ? l : { ...l, cards: [card, ...l.cards] }))
    setTimeout(() => { boardRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, 50)
  }
  function updateList(listId, patch) {
    setLists(ls => ls.map(l => l.id !== listId ? l : { ...l, ...patch }))
  }
  function removeList(listId) {
    setLists(ls => ls.filter(l => l.id !== listId))
  }
  function addList(data) {
    setLists(ls => [...ls, { id: genId(), cards: [], ...data }])
  }
  function clearAllCards(listId) {
    setLists(ls => ls.map(l => l.id !== listId ? l : { ...l, cards: [] }))
  }

  // ── Touch drag for CARDS ──────────────────────────────────────────────────
  function onCardLongPress(cardId, listId) {
    dragState.current = { type: 'card', cardId, listId }
    setDraggingCardId(cardId)
    if (navigator.vibrate) navigator.vibrate(40)
  }

  function onCardTouchMove(e, cardId, listId) {
    if (!dragState.current || dragState.current.type !== 'card') return
    e.preventDefault()
    const touch = e.touches[0]

    // Find which card we're hovering over
    for (const [id, el] of Object.entries(cardRefs.current)) {
      if (!el || id === cardId) continue
      const rect = el.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        // Find which list this card belongs to
        const targetList = lists.find(l => l.cards.some(c => c.id === id))
        if (!targetList) continue
        const fromListId = dragState.current.listId
        const fromCardId = dragState.current.cardId
        setLists(ls => {
          const sourceList = ls.find(l => l.id === fromListId)
          const card = sourceList?.cards.find(c => c.id === fromCardId)
          if (!card) return ls
          const toIdx = targetList.cards.findIndex(c => c.id === id)
          let updated = ls.map(l => l.id !== fromListId ? l : { ...l, cards: l.cards.filter(c => c.id !== fromCardId) })
          updated = updated.map(l => {
            if (l.id !== targetList.id) return l
            const cards = l.cards.filter(c => c.id !== fromCardId)
            const insertAt = cards.findIndex(c => c.id === id)
            const newCards = [...cards]
            newCards.splice(insertAt >= 0 ? insertAt : cards.length, 0, card)
            return { ...l, cards: newCards }
          })
          return updated
        })
        dragState.current.listId = targetList.id
        break
      }
    }
  }

  function onCardTouchEnd() {
    dragState.current = null
    setDraggingCardId(null)
  }

  // ── Touch drag for LISTS ──────────────────────────────────────────────────
  function onListLongPress(listId) {
    dragState.current = { type: 'list', listId }
    setDraggingListId(listId)
    if (navigator.vibrate) navigator.vibrate(40)
  }

  function onListTouchMove(e, listId) {
    if (!dragState.current || dragState.current.type !== 'list') return
    e.preventDefault()
    const touch = e.touches[0]
    for (const [id, el] of Object.entries(listRefs.current)) {
      if (!el || id === listId) continue
      const rect = el.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        setLists(ls => {
          const fromIdx = ls.findIndex(l => l.id === listId)
          const toIdx   = ls.findIndex(l => l.id === id)
          if (fromIdx === -1 || toIdx === -1) return ls
          const updated = [...ls]
          const [moved] = updated.splice(fromIdx, 1)
          updated.splice(toIdx, 0, moved)
          return updated
        })
        break
      }
    }
  }

  function onListTouchEnd() {
    dragState.current = null
    setDraggingListId(null)
  }

  // Long press hook
  function useLongPress(callback, ms = 500) {
    const timerRef = useRef(null)
    const fired = useRef(false)
    function start(e) {
      fired.current = false
      timerRef.current = setTimeout(() => {
        fired.current = true
        callback()
      }, ms)
    }
    function cancel() { clearTimeout(timerRef.current) }
    return { onTouchStart: start, onTouchEnd: cancel, onTouchMove: cancel }
  }

  const totalPending = lists.reduce((a, l) => a + l.cards.filter(c => !c.done).length, 0)
  const totalHigh    = lists.reduce((a, l) => a + l.cards.filter(c => !c.done && c.priority === 'high').length, 0)

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080B10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: 3, fontFamily: 'IBM Plex Mono, monospace' }}>LOADING...</div>
    </div>
  )

  return (
    <div ref={boardRef} style={{ minHeight: '100vh', height: '100vh', overflowY: 'auto', background: '#080B10', fontFamily: "'IBM Plex Mono', 'Courier New', monospace", color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        html, body, #root { background:#080B10; min-height:100vh; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>

      {/* Header */}
      <div style={{ padding: '24px 18px 0', position: 'sticky', top: 0, zIndex: 10, background: 'linear-gradient(180deg,#080B10 75%,transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,0.25)', marginBottom: 4, textTransform: 'uppercase' }}>DASHBOARD</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -1 }}>My Board</div>
              {saving && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>SAVING...</div>}
            </div>
          </div>
          <button onClick={() => setModal({ type: 'newList' })} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 1.5, fontFamily: 'inherit' }}>+ LIST</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 4 }}>
          {[['board', '▦  BOARD'], ['charts', '◉  CHARTS']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px 0', background: tab === key ? 'rgba(255,255,255,0.08)' : 'transparent', border: tab === key ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent', borderRadius: 7, color: tab === key ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', marginBottom: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          {[{ label: 'LISTS', value: lists.length, color: '#7B8CFF' }, { label: 'PENDING', value: totalPending, color: '#00D4AA' }, { label: 'URGENT', value: totalHigh, color: '#FF4D6D' }].map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '14px 0', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: -1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      {tab === 'board' && (
        <div style={{ padding: '0 14px 60px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lists.map((list, li) => {
            const pending = list.cards.filter(c => !c.done).length
            const isCol = collapsed[list.id]
            const toggleCol = () => setCollapsed(c => ({ ...c, [list.id]: !c[list.id] }))
            const isDraggingThis = draggingListId === list.id

            return (
              <div
                key={list.id}
                ref={el => listRefs.current[list.id] = el}
                onTouchMove={e => onListTouchMove(e, list.id)}
                onTouchEnd={onListTouchEnd}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isDraggingThis ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 14, overflow: 'hidden',
                  animation: `fadeIn 0.3s ease ${li * 0.06}s both`,
                  opacity: isDraggingThis ? 0.7 : 1,
                  transform: isDraggingThis ? 'scale(1.02)' : 'scale(1)',
                  transition: 'opacity 0.15s, transform 0.15s, border 0.15s',
                  boxShadow: isDraggingThis ? '0 8px 30px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {/* List header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: isCol ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Drag handle — long press to reorder lists */}
                  <div
                    onTouchStart={() => onListLongPress(list.id)}
                    onTouchEnd={onListTouchEnd}
                    style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: isDraggingThis ? `${list.color}30` : `${list.color}18`, border: `1px solid ${list.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: list.color, cursor: 'grab', animation: isDraggingThis ? 'pulse 0.8s infinite' : 'none' }}
                    title="Hold to reorder"
                  >{list.icon}</div>

                  <div onClick={toggleCol} style={{ flex: 1, cursor: 'pointer' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.2 }}>{list.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2, letterSpacing: 0.5 }}>{pending} pending · tap to {isCol ? 'open' : 'close'}</div>
                  </div>

                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${list.color}20`, border: `1px solid ${list.color}44`, color: list.color, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending}</div>
                  <button onClick={() => setModal({ type: 'editList', list })} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, width: 28, height: 28, color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✎</button>
                </div>

                {/* Cards */}
                {!isCol && (
                  <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {list.cards.length === 0 && <div style={{ textAlign: 'center', padding: '18px 0', color: 'rgba(255,255,255,0.12)', fontSize: 11, letterSpacing: 2 }}>NO ITEMS</div>}
                    {list.cards.map((card, ci) => {
                      const pri = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.medium
                      const isDraggingCard = draggingCardId === card.id
                      return (
                        <div
                          key={card.id}
                          ref={el => cardRefs.current[card.id] = el}
                          onTouchMove={e => onCardTouchMove(e, card.id, list.id)}
                          onTouchEnd={onCardTouchEnd}
                          style={{ position: 'relative' }}
                        >
                          {/* Long-press drag handle strip on left */}
                          <div
                            onTouchStart={() => onCardLongPress(card.id, list.id)}
                            onTouchEnd={onCardTouchEnd}
                            style={{
                              position: 'absolute', left: 0, top: 0, bottom: 0, width: 8,
                              zIndex: 2, cursor: 'grab',
                              borderRadius: '9px 0 0 9px',
                              background: isDraggingCard ? `${list.color}60` : 'transparent',
                              transition: 'background 0.2s',
                            }}
                          />
                          <SwipeCard
                            card={card}
                            listColor={list.color}
                            pri={pri}
                            onToggle={() => updateCard(list.id, card.id, { done: !card.done })}
                            onEdit={() => setModal({ type: 'editCard', listId: list.id, card })}
                            onDelete={() => removeCard(list.id, card.id)}
                            isDragging={isDraggingCard}
                          />
                        </div>
                      )
                    })}
                    <button onClick={() => setModal({ type: 'addCard', list })} style={{ marginTop: 4, padding: '10px 0', background: 'transparent', border: `1px dashed ${list.color}30`, borderRadius: 9, color: `${list.color}70`, fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', fontFamily: 'inherit' }}>+ ADD ITEM</button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Hint */}
          <div style={{ textAlign: 'center', padding: '8px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.1)', letterSpacing: 1.5 }}>
            HOLD ICON TO REORDER · SWIPE CARD TO DELETE
          </div>
        </div>
      )}

      {tab === 'charts' && <ChartsView lists={lists} />}

      {/* Modals */}
      {modal?.type === 'editCard' && (() => {
        const list = lists.find(l => l.id === modal.listId)
        return <Modal title="Edit Item" onClose={() => setModal(null)}><CardForm initial={modal.card} listColor={list?.color || '#fff'} submitLabel="Save Changes" onSubmit={data => { updateCard(modal.listId, modal.card.id, data); setModal(null) }} onDelete={() => { removeCard(modal.listId, modal.card.id); setModal(null) }} /></Modal>
      })()}
      {modal?.type === 'addCard' && <Modal title={`Add to ${modal.list.title}`} onClose={() => setModal(null)}><CardForm listColor={modal.list.color} submitLabel="Add Item" onSubmit={data => { addCard(modal.list.id, { id: genId(), done: false, ...data }); setModal(null) }} /></Modal>}
      {modal?.type === 'newList' && <Modal title="New List" onClose={() => setModal(null)}><ListForm submitLabel="Create List" onSubmit={data => { addList(data); setModal(null) }} /></Modal>}
      {modal?.type === 'editList' && (
        <Modal title="Edit List" onClose={() => setModal(null)}>
          <ListForm
            initial={modal.list}
            submitLabel="Save Changes"
            onSubmit={data => { updateList(modal.list.id, data); setModal(null) }}
            onDelete={() => { removeList(modal.list.id); setModal(null) }}
            onClearAll={() => { clearAllCards(modal.list.id); setModal(null) }}
          />
        </Modal>
      )}
    </div>
  )
}
