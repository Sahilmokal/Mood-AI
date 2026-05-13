import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'

// ── Data ─────────────────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  {
    id: 'input',
    num: '01',
    title: 'You share your mood',
    color: '#c8ff00',
    icon: '🗣️',
    desc: 'Type how you feel, show your face via webcam, or do both for higher accuracy. The app accepts text (up to 2000 chars), a JPEG frame from your camera, or a combined signal.',
    detail: [
      { label: 'Text mode',     val: 'Your words → Spring Boot → FastAPI /analyze-text' },
      { label: 'Face mode',     val: 'JPEG → Base64 encode → FastAPI /detect-emotion' },
      { label: 'Combined mode', val: 'Both calls run → results fused 60/40 (face/text)' },
    ],
  },
  {
    id: 'text-ai',
    num: '02',
    title: 'Text: DistilRoBERTa reads you',
    color: '#00ffc8',
    icon: '🧠',
    desc: 'Your text is tokenised and passed through a 6-layer transformer. Every word attends to every other word — "overwhelmed" pulling weight from "work" and "today" shifts the output toward stressed.',
    detail: [
      { label: 'Model',      val: 'j-hartmann/emotion-english-distilroberta-base (HuggingFace)' },
      { label: 'Input',      val: 'Up to 512 subword tokens' },
      { label: 'Output',     val: '7 emotion scores → softmax → best label + confidence' },
      { label: 'Speed',      val: '~200 ms on CPU' },
    ],
  },
  {
    id: 'face-ai',
    num: '03',
    title: 'Face: CNN reads your expression',
    color: '#ff4f7b',
    icon: '👁️',
    desc: 'OpenCV finds your face bounding box. The crop is resized to 48×48 grayscale pixels and fed into Mini-Xception — a fast CNN trained on 35,000 labelled face images.',
    detail: [
      { label: 'Detector',    val: 'OpenCV Haar Cascade → bounding box' },
      { label: 'Model',       val: 'Mini-Xception CNN (DeepFace library)' },
      { label: 'Input',       val: '48×48 px grayscale, values 0.0–1.0' },
      { label: 'Output',      val: '7 emotion probabilities, top = dominant mood' },
      { label: 'Speed',       val: '~800 ms on CPU' },
    ],
  },
  {
    id: 'fusion',
    num: '04',
    title: 'Fusion: weighted confidence blend',
    color: '#ffb830',
    icon: '⚗️',
    desc: 'Spring Boot combines both signals. Face gets 60% weight (harder to fake), text gets 40%. The winning mood label and blended confidence score are saved to PostgreSQL.',
    detail: [
      { label: 'Face weight',  val: '60% — real-time involuntary expression' },
      { label: 'Text weight',  val: '40% — deliberate self-report' },
      { label: 'Guard',        val: 'Confidence < 45% → LowConfidenceException' },
      { label: 'Stored',       val: 'MoodHistory row in PostgreSQL with source=COMBINED' },
    ],
  },
  {
    id: 'recs',
    num: '05',
    title: 'Recommendations ranked for you',
    color: '#a78bfa',
    icon: '🎬',
    desc: 'Your mood maps to TMDB genre IDs and YouTube search queries. Items are scored by mood relevance, your past feedback (likes boost score +0.1), and a small diversity factor.',
    detail: [
      { label: 'Movies',     val: 'TMDB Discover API filtered by mood→genre mapping' },
      { label: 'Music',      val: 'YouTube search links — zero API key needed' },
      { label: 'Activities', val: 'Curated local dataset, 3 per mood' },
      { label: 'Score',      val: 'base + feedbackBoost(0.1) + diversity(0–0.05)' },
    ],
  },
  {
    id: 'feedback',
    num: '06',
    title: 'Your feedback trains the loop',
    color: '#00ffc8',
    icon: '🔁',
    desc: 'Every like or dislike is stored in the feedback table. On the next recommendation pass, previously liked external IDs receive a +0.1 score boost, surfacing similar content higher.',
    detail: [
      { label: 'Like',     val: 'externalId added to boosted set; +0.1 on future scores' },
      { label: 'Dislike',  val: 'Stored; used for future diversity filtering' },
      { label: 'Upsert',   val: 'Change your mind anytime — feedback is updated not duplicated' },
      { label: 'History',  val: 'Full mood timeline + confidence graph in your profile' },
    ],
  },
]

const MOOD_LABELS = {
  happy:'😊 Happy', sad:'😢 Sad', angry:'😠 Angry', stressed:'😰 Stressed',
  calm:'😌 Calm', energetic:'⚡ Energetic', fearful:'😨 Fearful',
  surprised:'😲 Surprised', neutral:'😐 Neutral',
}

const CONFIDENCE_DEMO = [
  { mood:'happy',    face:88, text:72 },
  { mood:'stressed', face:54, text:91 },
  { mood:'sad',      face:76, text:68 },
  { mood:'angry',    face:93, text:55 },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function PipelineCard({ step, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.4 }}
      className="border border-border rounded-2xl overflow-hidden"
      style={{ background:'#111118' }}>

      <button
        onClick={onToggle}
        className="w-full flex items-center gap-5 p-6 text-left hover:bg-white/[0.02] transition-colors">
        <span className="font-mono text-xs shrink-0" style={{ color: step.color }}>{step.num}</span>
        <span className="text-2xl shrink-0">{step.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-snow text-base leading-snug">
            {step.title}
          </h3>
          <p className="font-body text-sm text-dim mt-0.5 line-clamp-1">{step.desc}</p>
        </div>
        <span className="text-dim shrink-0">
          {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height:0, opacity:0 }}
            animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.25 }}
            className="overflow-hidden">
            <div className="px-6 pb-6 border-t border-border pt-5">
              <p className="font-body text-sm text-soft leading-relaxed mb-5">{step.desc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {step.detail.map(d => (
                  <div key={d.label}
                    className="bg-surface border border-border rounded-xl p-4">
                    <p className="font-mono text-xs text-dim mb-1.5 uppercase tracking-wider">
                      {d.label}
                    </p>
                    <p className="font-body text-sm text-snow leading-snug">{d.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FusionDemo() {
  const [idx, setIdx] = useState(0)
  const item = CONFIDENCE_DEMO[idx]
  const faceScore  = item.face / 100
  const textScore  = item.text / 100
  const combined   = Math.round(faceScore * 0.6 * 100 + textScore * 0.4 * 100)
  const winner     = (faceScore * 0.6) >= (textScore * 0.4) ? 'face' : 'text'
  const moodLabel  = MOOD_LABELS[item.mood] || item.mood

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <p className="section-label mb-4">interactive fusion demo</p>
      <div className="flex gap-2 flex-wrap mb-6">
        {CONFIDENCE_DEMO.map((c, i) => (
          <button key={c.mood} onClick={() => setIdx(i)}
            className={`px-4 py-2 rounded-full font-mono text-xs transition-all
              ${idx===i ? 'bg-volt text-ink' : 'bg-muted text-dim hover:text-soft'}`}>
            {MOOD_LABELS[c.mood]?.split(' ')[0]} {c.mood}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Face */}
        <div className="bg-panel border border-border rounded-xl p-4">
          <p className="font-mono text-xs text-dim mb-3 uppercase">Face detection</p>
          <p className="font-display font-bold text-2xl text-rose mb-2">{item.face}%</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div key={item.face} initial={{width:0}} animate={{width:`${item.face}%`}}
              transition={{duration:0.6}} className="h-full bg-rose rounded-full"/>
          </div>
          <p className="font-mono text-xs text-dim">weight: 60%</p>
          <p className="font-mono text-xs text-dim">contribution: {Math.round(item.face*0.6)}%</p>
        </div>

        {/* Text */}
        <div className="bg-panel border border-border rounded-xl p-4">
          <p className="font-mono text-xs text-dim mb-3 uppercase">Text sentiment</p>
          <p className="font-display font-bold text-2xl text-aurora mb-2">{item.text}%</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div key={item.text} initial={{width:0}} animate={{width:`${item.text}%`}}
              transition={{duration:0.6}} className="h-full bg-aurora rounded-full"/>
          </div>
          <p className="font-mono text-xs text-dim">weight: 40%</p>
          <p className="font-mono text-xs text-dim">contribution: {Math.round(item.text*0.4)}%</p>
        </div>

        {/* Combined */}
        <div className="bg-panel border border-volt/30 rounded-xl p-4"
          style={{boxShadow:'0 0 20px #c8ff0010'}}>
          <p className="font-mono text-xs text-volt mb-3 uppercase">Combined result</p>
          <p className="font-display font-bold text-2xl text-volt mb-2">{combined}%</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div key={combined} initial={{width:0}} animate={{width:`${combined}%`}}
              transition={{duration:0.7}} className="h-full bg-volt rounded-full"/>
          </div>
          <p className="font-mono text-xs text-dim">mood: {moodLabel}</p>
          <p className="font-mono text-xs text-dim">
            won by: <span className={winner==='face' ? 'text-rose':'text-aurora'}>{winner}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function ArchDiagram() {
  const layers = [
    { label:'React frontend',        sub:'Vite · Tailwind · Framer Motion',    color:'#c8ff00', tag:'port 3000' },
    { label:'Spring Boot API',        sub:'Java 17 · JWT auth · WebClient',     color:'#00ffc8', tag:'port 8080' },
    { label:'Python ML service',      sub:'FastAPI · DeepFace · HuggingFace',  color:'#ff4f7b', tag:'port 8000' },
    { label:'PostgreSQL database',    sub:'Flyway migrations · 5 tables',       color:'#ffb830', tag:'port 5432' },
  ]
  const externals = [
    { label:'TMDB API', color:'#a78bfa' },
    { label:'YouTube',  color:'#ff4f7b' },
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <p className="section-label mb-6">system architecture</p>
      <div className="flex flex-col gap-2">
        {layers.map((l, i) => (
          <motion.div key={l.label}
            initial={{opacity:0, x:-12}}
            whileInView={{opacity:1, x:0}}
            viewport={{once:true}}
            transition={{delay:i*0.08}}
            className="flex items-center gap-4 bg-panel border border-border rounded-xl px-5 py-4">
            <div className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{background:l.color, boxShadow:`0 0 8px ${l.color}60`}}/>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-snow">{l.label}</p>
              <p className="font-mono text-xs text-dim mt-0.5">{l.sub}</p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full border shrink-0"
              style={{color:l.color, borderColor:`${l.color}30`, background:`${l.color}10`}}>
              {l.tag}
            </span>
          </motion.div>
        ))}

        {/* Arrow down */}
        <div className="flex items-center gap-2 pl-7 py-1">
          <div className="w-px h-4 bg-border"/>
          <p className="font-mono text-xs text-dim">Spring Boot calls external APIs</p>
        </div>

        <div className="flex gap-2">
          {externals.map(e => (
            <div key={e.label}
              className="flex-1 flex items-center gap-3 bg-panel border border-border rounded-xl px-5 py-3">
              <div className="w-2 h-2 rounded-full shrink-0"
                style={{background:e.color}}/>
              <p className="font-mono text-xs" style={{color:e.color}}>{e.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MoodModelViz() {
  const emotions = [
    { label:'joy → happy',           pct:81, color:'#c8ff00' },
    { label:'neutral → neutral',     pct:72, color:'#9898b8' },
    { label:'anger → angry',         pct:68, color:'#ff4f7b' },
    { label:'sadness → sad',         pct:79, color:'#60a5fa' },
    { label:'fear → fearful',        pct:65, color:'#a78bfa' },
    { label:'surprise → surprised',  pct:61, color:'#00ffc8' },
    { label:'disgust → disgusted',   pct:57, color:'#4ade80' },
  ]
  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <p className="section-label mb-2">model output example</p>
      <p className="font-body text-xs text-dim mb-5">
        Softmax scores for input: "I'm absolutely thrilled, this is amazing!"
      </p>
      <div className="space-y-3">
        {emotions.map((e, i) => (
          <div key={e.label} className="flex items-center gap-3">
            <span className="font-mono text-xs text-dim w-36 shrink-0">{e.label}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{width:0}}
                whileInView={{width:`${e.pct}%`}}
                viewport={{once:true}}
                transition={{delay:i*0.06, duration:0.7, ease:[0.22,1,0.36,1]}}
                className="h-full rounded-full"
                style={{background:e.color}}/>
            </div>
            <span className="font-mono text-xs w-8 text-right shrink-0"
              style={{color:e.color}}>{e.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CNNLayers() {
  const layers = [
    { name:'Input',             shape:'48×48×1',   note:'grayscale face crop' },
    { name:'Conv2D ×2',         shape:'44×44×8',   note:'edge & corner detectors' },
    { name:'Xception Block 1',  shape:'22×22×16',  note:'eyes, brows, nose shapes' },
    { name:'Xception Block 2',  shape:'11×11×32',  note:'facial regions' },
    { name:'Xception Block 3',  shape:'6×6×64',    note:'expression patterns' },
    { name:'Xception Block 4',  shape:'3×3×128',   note:'abstract emotion features' },
    { name:'GlobalAvgPool',     shape:'128',        note:'collapses spatial dims' },
    { name:'Dense + Softmax',   shape:'7',          note:'emotion probabilities' },
  ]
  const colors = [
    '#c8ff00','#b8ef00','#00ffc8','#00e8b4','#ff4f7b','#e8446e','#ffb830','#a78bfa'
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <p className="section-label mb-2">mini-xception cnn architecture</p>
      <p className="font-body text-xs text-dim mb-5">
        Each block reduces spatial size while increasing feature depth
      </p>
      <div className="space-y-2">
        {layers.map((l, i) => (
          <motion.div key={l.name}
            initial={{opacity:0, x:-8}}
            whileInView={{opacity:1, x:0}}
            viewport={{once:true}}
            transition={{delay:i*0.05}}
            className="flex items-center gap-3 bg-panel border border-border rounded-xl px-4 py-3">
            <div className="w-1.5 h-6 rounded-full shrink-0"
              style={{background:colors[i]}}/>
            <span className="font-display font-medium text-sm text-snow w-36 shrink-0">
              {l.name}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-lg shrink-0"
              style={{color:colors[i], background:`${colors[i]}15`, border:`1px solid ${colors[i]}25`}}>
              {l.shape}
            </span>
            <span className="font-body text-xs text-dim truncate">{l.note}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const [openStep, setOpenStep] = useState(null)

  const toggle = (id) => setOpenStep(prev => prev === id ? null : id)

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">

      {/* Hero */}
      <motion.div
        initial={{opacity:0, y:-16}}
        animate={{opacity:1, y:0}}
        className="mb-14">
        <p className="section-label mb-4">under the hood</p>
        <h1 className="font-display font-extrabold text-5xl sm:text-6xl text-snow
                       leading-[1.05] tracking-tight mb-5">
          How it{' '}
          <span className="text-volt">works</span>
        </h1>
        <p className="font-body text-soft text-lg leading-relaxed max-w-2xl">
          MoodRec is a multi-modal AI system. Your face and your words are processed by two
          separate ML models, fused into a single mood signal, then matched to movies,
          music and activities using real APIs.
        </p>
      </motion.div>

      {/* Architecture overview */}
      <motion.div
        initial={{opacity:0, y:16}}
        whileInView={{opacity:1, y:0}}
        viewport={{once:true}}
        className="mb-10">
        <ArchDiagram />
      </motion.div>

      {/* Pipeline steps */}
      <div className="mb-12">
        <p className="section-label mb-5">end-to-end pipeline</p>
        <div className="space-y-3">
          {PIPELINE_STEPS.map(step => (
            <PipelineCard
              key={step.id}
              step={step}
              isOpen={openStep === step.id}
              onToggle={() => toggle(step.id)}
            />
          ))}
        </div>
      </div>

      {/* Fusion demo */}
      <motion.div
        initial={{opacity:0, y:16}}
        whileInView={{opacity:1, y:0}}
        viewport={{once:true}}
        className="mb-10">
        <FusionDemo />
      </motion.div>

      {/* Two-col: model outputs + CNN layers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <motion.div
          initial={{opacity:0, y:16}}
          whileInView={{opacity:1, y:0}}
          viewport={{once:true}}>
          <MoodModelViz />
        </motion.div>
        <motion.div
          initial={{opacity:0, y:16}}
          whileInView={{opacity:1, y:0}}
          viewport={{once:true}}
          transition={{delay:0.1}}>
          <CNNLayers />
        </motion.div>
      </div>

      {/* Quick facts */}
      <motion.div
        initial={{opacity:0, y:16}}
        whileInView={{opacity:1, y:0}}
        viewport={{once:true}}
        className="mb-12">
        <p className="section-label mb-5">quick facts</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { val:'~200ms', label:'text analysis' },
            { val:'~800ms', label:'face detection' },
            { val:'10',     label:'mood categories' },
            { val:'60/40',  label:'face/text weight' },
          ].map(f => (
            <div key={f.label}
              className="bg-surface border border-border rounded-2xl p-5 text-center">
              <p className="font-display font-extrabold text-3xl text-volt mb-1">{f.val}</p>
              <p className="font-mono text-xs text-dim uppercase tracking-wider">{f.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{opacity:0, y:16}}
        whileInView={{opacity:1, y:0}}
        viewport={{once:true}}
        className="bg-panel border border-volt/20 rounded-2xl p-8 text-center"
        style={{boxShadow:'0 0 40px #c8ff0008'}}>
        <p className="text-3xl mb-3">🧪</p>
        <h2 className="font-display font-bold text-2xl text-snow mb-2">
          Ready to try it?
        </h2>
        <p className="font-body text-dim text-sm mb-6 max-w-sm mx-auto">
          The whole pipeline runs in your local Docker stack — no cloud needed.
        </p>
        <Link to="/" className="btn-volt inline-flex mx-auto">
          Analyse My Mood <ArrowRight size={15}/>
        </Link>
      </motion.div>
    </div>
  )
}
