import { useState, useMemo } from "react";

// Base path GitHub Pages serves this project from (e.g. "/The-Flower-Within/").
// Every public/ asset reference below is prefixed with this so it resolves
// correctly whether the site is hosted at a domain root or a subpath.
const BASE = import.meta.env.BASE_URL;

/* ============================================================
   THE FLOWER WITHIN — a pressed-flower scrapbook personality game
   ============================================================ */

/* ---------------------------------------------------------
   1. QUESTION DATA — 15 everyday situational questions,
   each with 3 options contributing to hidden OCEAN + DiSC dimensions.
--------------------------------------------------------- */
const QUESTIONS = [
  {
    id: "q1",
    prompt: "Your plans suddenly get cancelled. What do you do?",
    options: [
      { id: "a", text: "Make new plans.", scores: { openness: 2, dominance: 1, extraversion: 1 } },
      { id: "b", text: "Enjoy some quiet time.", scores: { steadiness: 2, agreeableness: 1, neuroticism: -1 } },
      { id: "c", text: "Get things done.", scores: { oceanC: 2, discC: 2, steadiness: 1 } },
    ],
  },
  {
    id: "q2",
    prompt: "You're in a room where you don't know anyone. What do you do?",
    options: [
      { id: "a", text: "Introduce myself to someone.", scores: { extraversion: 2, influence: 2 } },
      { id: "b", text: "Observe the room first.", scores: { openness: 1, oceanC: 2, discC: 1 } },
      { id: "c", text: "Find someone approachable.", scores: { agreeableness: 2, steadiness: 1 } },
    ],
  },
  {
    id: "q3",
    prompt: "Your friends can't decide where to eat.",
    options: [
      { id: "a", text: "Pick a place.", scores: { dominance: 2 } },
      { id: "b", text: "Ask what everyone wants.", scores: { agreeableness: 2, influence: 1, steadiness: 1 } },
      { id: "c", text: "Compare the options.", scores: { oceanC: 2, discC: 2 } },
    ],
  },
  {
    id: "q4",
    prompt: "Someone suggests doing something you've never tried.",
    options: [
      { id: "a", text: '"Absolutely. Let\'s go!"', scores: { openness: 2, extraversion: 1, dominance: 1 } },
      { id: "b", text: '"Tell me more first."', scores: { openness: 1, oceanC: 1, discC: 1 } },
      { id: "c", text: '"Sure, let\'s plan the basics."', scores: { oceanC: 2, steadiness: 1, discC: 1 } },
    ],
  },
  {
    id: "q5",
    prompt: "You suddenly have an entire day to yourself.",
    options: [
      { id: "a", text: "Explore somewhere new.", scores: { openness: 2, extraversion: 1, dominance: 1 } },
      { id: "b", text: "Make plans with friends.", scores: { extraversion: 2, influence: 2 } },
      { id: "c", text: "Work on something I've been meaning to.", scores: { oceanC: 2, discC: 2, steadiness: 1 } },
    ],
  },
  {
    id: "q6",
    prompt: "A friend is having a terrible day.",
    options: [
      { id: "a", text: "Listen; I'm here for them.", scores: { agreeableness: 2, steadiness: 2 } },
      { id: "b", text: "Cheer them up.", scores: { extraversion: 1, influence: 2 } },
      { id: "c", text: "Help them figure it out.", scores: { dominance: 1, oceanC: 1, discC: 1 } },
    ],
  },
  {
    id: "q7",
    prompt: "You walk into a shop you've never been to. What catches your attention first?",
    options: [
      { id: "a", text: "Something new and unusual.", scores: { openness: 2 } },
      { id: "b", text: "Something beautiful.", scores: { openness: 1, extraversion: 1, agreeableness: 1 } },
      { id: "c", text: "Something useful.", scores: { oceanC: 1, discC: 1 } },
    ],
  },
  {
    id: "q8",
    prompt: "A friend strongly disagrees with you.",
    options: [
      { id: "a", text: "Stand by my point.", scores: { dominance: 2, neuroticism: 1 } },
      { id: "b", text: "Understand their side.", scores: { agreeableness: 2, openness: 1, steadiness: 1 } },
      { id: "c", text: "Think it over first.", scores: { openness: 1, oceanC: 1 } },
    ],
  },
  {
    id: "q9",
    prompt: "You're planning a trip with friends.",
    options: [
      { id: "a", text: '"Let\'s pick a place and go."', scores: { dominance: 1, openness: 1 } },
      { id: "b", text: '"Let\'s keep everyone happy."', scores: { agreeableness: 2, steadiness: 1 } },
      { id: "c", text: '"Let\'s research first."', scores: { oceanC: 2, discC: 2 } },
    ],
  },
  {
    id: "q10",
    prompt: 'Your friend says, "I have a crazy idea."',
    options: [
      { id: "a", text: '"Tell me everything!"', scores: { openness: 2, influence: 2 } },
      { id: "b", text: '"What\'s the plan?"', scores: { oceanC: 1, discC: 2 } },
      { id: "c", text: '"I\'m in. Let\'s do it!"', scores: { dominance: 2, extraversion: 1 } },
    ],
  },
  {
    id: "q11",
    prompt: "Someone gives you unexpected criticism.",
    options: [
      { id: "a", text: '"What exactly did I do?"', scores: { oceanC: 1, discC: 2 } },
      { id: "b", text: "Think about it first.", scores: { openness: 1, oceanC: 1 } },
      { id: "c", text: "Talk it through.", scores: { agreeableness: 1, influence: 1, dominance: 1 } },
    ],
  },
  {
    id: "q12",
    prompt: 'You\'re given a blank canvas and told, "Make whatever you want."',
    options: [
      { id: "a", text: "Start with my first idea.", scores: { openness: 1, dominance: 1 } },
      { id: "b", text: "Experiment and see what happens.", scores: { openness: 2 } },
      { id: "c", text: "Find references and plan.", scores: { oceanC: 2, discC: 2 } },
    ],
  },
  {
    id: "q13",
    prompt: "Which would bother you the most?",
    options: [
      { id: "a", text: "Being told what to do.", scores: { dominance: 2 } },
      { id: "b", text: "Unnecessary conflict.", scores: { agreeableness: 2, steadiness: 2 } },
      { id: "c", text: "Someone being unreliable.", scores: { steadiness: 2, oceanC: 1 } },
    ],
  },
  {
    id: "q14",
    prompt: "You're going somewhere you've never been.",
    options: [
      { id: "a", text: "Plan the essentials.", scores: { openness: 1, oceanC: 1 } },
      { id: "b", text: "Research everything.", scores: { oceanC: 2, discC: 2 } },
      { id: "c", text: "Just explore.", scores: { openness: 2 } },
    ],
  },
  {
    id: "q15",
    prompt: "Imagine your personality is a place.",
    options: [
      { id: "a", text: "A bright, lively garden.", scores: { extraversion: 2, openness: 1, dominance: 1 } },
      { id: "b", text: "A warm, welcoming home.", scores: { agreeableness: 2, steadiness: 2 } },
      { id: "c", text: "A quiet studio full of ideas.", scores: { openness: 2, oceanC: 1, discC: 1 } },
    ],
  },
];

const DIMENSIONS = [
  "openness", "oceanC", "extraversion", "agreeableness", "neuroticism",
  "dominance", "influence", "steadiness", "discC",
];

/* ---------------------------------------------------------
   2. FLOWER ARCHETYPE DATA
   Result pages are pre-designed images in /public — this only
   needs enough data to pick the closest match and find its image.
--------------------------------------------------------- */
const FLOWERS = [
  {
    id: "sunflower",
    name: "Sunflower",
    image: `${BASE}Sunflower.png`,
    mobileImage: `${BASE}Sunflower_Mobile.png`,
    saveImage: `${BASE}Sunflower_Save.png`,
    mobileSaveImage: `${BASE}Sunflower_Mbl_Save.png`,
    target: { openness: 6.85, oceanC: 1.39, extraversion: 7.55, agreeableness: 1.53, neuroticism: 10, dominance: 10, influence: 3.7, steadiness: 1, discC: 1.43 },
  },
  {
    id: "rose",
    name: "Rose",
    image: `${BASE}Rose.png`,
    mobileImage: `${BASE}Rose_Mobile.png`,
    saveImage: `${BASE}Rose_Save.png`,
    mobileSaveImage: `${BASE}Rose_Mbl_Save.png`,
    target: { openness: 5.95, oceanC: 2.17, extraversion: 8.36, agreeableness: 6.82, neuroticism: 5.5, dominance: 2.69, influence: 7.3, steadiness: 5.5, discC: 2.71 },
  },
  {
    id: "orchid",
    name: "Orchid",
    image: `${BASE}Orchid.png`,
    mobileImage: `${BASE}Orchid_Mobile.png`,
    saveImage: `${BASE}Orchid_Save.png`,
    mobileSaveImage: `${BASE}Orchid_Mbl_Save.png`,
    target: { openness: 4.15, oceanC: 8.04, extraversion: 1, agreeableness: 3.12, neuroticism: 5.5, dominance: 1.56, influence: 1, steadiness: 4.21, discC: 8.71 },
  },
  {
    id: "hydrangea",
    name: "Hydrangea",
    image: `${BASE}Hydrangea.png`,
    mobileImage: `${BASE}Hydrangea_Mobile.png`,
    saveImage: `${BASE}Hydrangea_Save.png`,
    mobileSaveImage: `${BASE}Hydrangea_Mbl_Save.png`,
    target: { openness: 1.9, oceanC: 8.04, extraversion: 1, agreeableness: 3.12, neuroticism: 5.5, dominance: 2.69, influence: 1, steadiness: 4.86, discC: 8.29 },
  },
  {
    id: "chrysanthemum",
    name: "Chrysanthemum",
    image: `${BASE}Chrysanthemum.png`,
    mobileImage: `${BASE}Chrysanthemum_Mobile.png`,
    saveImage: `${BASE}Chrysanthemum_Save.png`,
    mobileSaveImage: `${BASE}Chrysanthemum_Mbl_Save.png`,
    target: { openness: 3.25, oceanC: 3.35, extraversion: 1.82, agreeableness: 10, neuroticism: 1, dominance: 1.56, influence: 2.8, steadiness: 10, discC: 3.14 },
  },
];

/* ---------------------------------------------------------
   3. SCORING ENGINE
--------------------------------------------------------- */
function computeBounds() {
  const bounds = {};
  DIMENSIONS.forEach((d) => (bounds[d] = { min: 0, max: 0 }));
  QUESTIONS.forEach((q) => {
    DIMENSIONS.forEach((d) => {
      const vals = q.options.map((o) => o.scores[d] || 0);
      bounds[d].max += Math.max(0, ...vals, 0);
      bounds[d].min += Math.min(0, ...vals, 0);
    });
  });
  return bounds;
}
const BOUNDS = computeBounds();

function computeResult(answers) {
  const raw = {};
  DIMENSIONS.forEach((d) => (raw[d] = 0));
  QUESTIONS.forEach((q) => {
    const chosen = answers[q.id];
    if (!chosen) return;
    const opt = q.options.find((o) => o.id === chosen);
    if (!opt) return;
    DIMENSIONS.forEach((d) => (raw[d] += opt.scores[d] || 0));
  });

  const scaled = {};
  DIMENSIONS.forEach((d) => {
    const { min, max } = BOUNDS[d];
    const span = max - min;
    scaled[d] = span === 0 ? 5.5 : 1 + ((raw[d] - min) / span) * 9;
  });

  const distances = FLOWERS.map((f) => {
    let sumSq = 0;
    DIMENSIONS.forEach((d) => {
      const diff = scaled[d] - f.target[d];
      sumSq += diff * diff;
    });
    return { flower: f, distance: Math.sqrt(sumSq) };
  }).sort((a, b) => a.distance - b.distance);

  // deterministic tie-breaker when the top two are very close
  if (distances.length > 1 && Math.abs(distances[0].distance - distances[1].distance) < 0.35) {
    const [first, second] = distances;
    let bestDim = null;
    let bestGap = -1;
    DIMENSIONS.forEach((d) => {
      const gap = Math.abs(first.flower.target[d] - second.flower.target[d]);
      if (gap > bestGap) {
        bestGap = gap;
        bestDim = d;
      }
    });
    const firstCloser = Math.abs(scaled[bestDim] - first.flower.target[bestDim]) <=
      Math.abs(scaled[bestDim] - second.flower.target[bestDim]);
    if (!firstCloser) return second.flower;
    return first.flower;
  }

  return distances[0].flower;
}

/* ---------------------------------------------------------
   4. DECORATIVE BITS
--------------------------------------------------------- */
function downloadImage(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function EntryProgress({ total, current }) {
  return (
    <div className="progress-row" role="status" aria-label={`Entry ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`progress-dot ${i <= current ? "progress-dot-filled" : ""}`} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   5. SCREENS
--------------------------------------------------------- */
function CoverScreen({ onBegin, onLearnMore }) {
  return (
    <>
      <div className="image-page desktop-only">
        <img className="full-bleed-img" src={`${BASE}Home%20page.png`} alt="The Flower Within — every flower has a personality, which one is yours?" />
        <button className="hotspot hotspot-begin" onClick={onBegin} aria-label="Let's find out" />
        <button className="cover-about cover-about-desktop" onClick={onLearnMore}>About game</button>
      </div>
      <div className="image-page-mobile mobile-only">
        <img className="full-bleed-img" src={`${BASE}Homepage_Mobile.png`} alt="The Flower Within — every flower has a personality, which one is yours?" />
        <button className="hotspot hotspot-begin-m" onClick={onBegin} aria-label="Let's find out" />
        <button className="cover-about cover-about-mobile" onClick={onLearnMore}>About game</button>
      </div>
    </>
  );
}

function LearnMoreModal({ onClose }) {
  return (
    <div className="learn-more-backdrop" onClick={onClose}>
      <div className="learn-more-card" onClick={(e) => e.stopPropagation()}>
        <button className="learn-more-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="learn-more-title">About this little game</h2>
        <p>
          The Flower Within is a personality quiz dressed up as a pressed-flower scrapbook.
          Answer 15 quick, everyday questions and we'll match the way you naturally move
          through the world to one of five flowers: Sunflower, Rose, Orchid, Hydrangea, or
          Chrysanthemum: each with its own strengths, quirks, and the people it bonds with best.
        </p>
        <p>
          It takes about three minutes, there are no right answers, and it isn't a scientific
          assessment; just a small, fond mirror. Once you get your flower, you can save it and
          come back to retake it any time.
        </p>
      </div>
    </div>
  );
}

function QuestionScreen({ question, index, total, selected, onSelect, onBack }) {
  const [justSelected, setJustSelected] = useState(null);

  const handleSelect = (optId) => {
    setJustSelected(optId);
    onSelect(question.id, optId);
  };

  return (
    <div className="page question-page">
      <div className="question-top-row">
        <button className="btn-back" onClick={onBack} aria-label="Go back to previous entry">
          ‹ Back
        </button>
        <span className="entry-label">
          ENTRY {String(index + 1).padStart(2, "0")} / {total}
        </span>
      </div>
      <EntryProgress total={total} current={index} />

      <div className="question-header">
        <h2 className="question-prompt">{question.prompt}</h2>
      </div>

      <div className="option-stack" role="group" aria-label={question.prompt}>
        {question.options.map((opt) => {
          const isSelected = selected === opt.id || justSelected === opt.id;
          return (
            <button
              key={opt.id}
              className={`option-strip ${isSelected ? "option-selected" : ""}`}
              onClick={() => handleSelect(opt.id)}
              aria-pressed={isSelected}
            >
              <span className="option-letter">{opt.id.toUpperCase()}.</span>
              <span className="option-text">{opt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultScreen({ flower, onRestart, onHome }) {
  const handleSave = () => downloadImage(flower.saveImage, `${flower.name}-The-Flower-Within.png`);
  const handleSaveMobile = () => downloadImage(flower.mobileSaveImage, `${flower.name}-The-Flower-Within.png`);

  return (
    <>
      <div className="image-page desktop-only">
        <img className="full-bleed-img" src={flower.image} alt={`You are a ${flower.name}!`} />
        <button className="hotspot hotspot-save" onClick={handleSave} aria-label="Save" />
        <button className="hotspot hotspot-home" onClick={onHome} aria-label="Home" />
        <button className="hotspot hotspot-retry" onClick={onRestart} aria-label="Retry" />
      </div>
      <div className="image-page-mobile mobile-only">
        <img className="full-bleed-img" src={flower.mobileImage} alt={`You are a ${flower.name}!`} />
        <button className="hotspot hotspot-save-m" onClick={handleSaveMobile} aria-label="Save" />
        <button className="hotspot hotspot-home-m" onClick={onHome} aria-label="Home" />
        <button className="hotspot hotspot-retry-m" onClick={onRestart} aria-label="Retry" />
      </div>
    </>
  );
}

/* ---------------------------------------------------------
   6. APP SHELL
--------------------------------------------------------- */
export default function App() {
  const [screen, setScreen] = useState("cover"); // cover | question | result
  const [answers, setAnswers] = useState({});
  const [qIndex, setQIndex] = useState(0);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const result = useMemo(() => (screen === "result" ? computeResult(answers) : null), [screen, answers]);

  const handleSelect = (qid, optId) => {
    setAnswers((prev) => ({ ...prev, [qid]: optId }));
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduce ? 0 : 180;
    setTimeout(() => {
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex((i) => i + 1);
      } else {
        setScreen("result");
      }
    }, delay);
  };

  const handleBack = () => {
    if (qIndex === 0) {
      setScreen("cover");
    } else {
      setQIndex((i) => i - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setQIndex(0);
    setScreen("question");
  };

  const handleHome = () => {
    setAnswers({});
    setQIndex(0);
    setScreen("cover");
  };

  const currentQuestion = QUESTIONS[qIndex];

  return (
    <div className="app-root">
      <style>{CSS}</style>
      <div className="scrapbook-surface">
        {screen === "cover" && <CoverScreen onBegin={() => setScreen("question")} onLearnMore={() => setShowLearnMore(true)} />}
        {screen === "question" && (
          <QuestionScreen
            key={currentQuestion.id}
            question={currentQuestion}
            index={qIndex}
            total={QUESTIONS.length}
            selected={answers[currentQuestion.id]}
            onSelect={handleSelect}
            onBack={handleBack}
          />
        )}
        {screen === "result" && result && <ResultScreen flower={result} onRestart={handleRestart} onHome={handleHome} />}
      </div>
      {showLearnMore && <LearnMoreModal onClose={() => setShowLearnMore(false)} />}
      <footer className="site-footer">© Vanikalyani R 2026</footer>
    </div>
  );
}

/* ---------------------------------------------------------
   7. STYLES
--------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Special+Elite&family=Radley:wght@400;500;600&display=swap');

:root{
  --paper:#f3ece0;
  --paper-deep:#ece2cc;
  --ink:#2f2620;
  --ink-soft:#5a4b3a;
  --kraft:#c9a876;
  --lavender:#b6aad0;
  --rust:#b1604a;
  --slate:#8b96a3;
  --line:#cdbd9a;
}

.app-root{
  font-family:'Work Sans', sans-serif;
  color:var(--ink);
  min-height:100%;
}

.scrapbook-surface{
  min-height:100vh;
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:32px 16px;
  background:var(--paper-deep);
  box-sizing:border-box;
}

.site-footer{
  position:fixed;
  left:0;
  right:0;
  bottom:6px;
  text-align:center;
  font-size:11px;
  color:#9a9a9a;
  pointer-events:none;
  z-index:5;
}

/* ---- full-image pages (cover + result) ---- */
.image-page{
  position:relative;
  width:100%;
  max-width:1040px;
  aspect-ratio:1366/768;
  background:var(--paper);
  box-shadow:0 20px 50px rgba(47,38,32,0.16), 0 2px 8px rgba(47,38,32,0.1);
  overflow:hidden;
}
.full-bleed-img{
  display:block;
  width:100%;
  height:100%;
  object-fit:contain;
  user-select:none;
  pointer-events:none;
}
.hotspot{
  position:absolute;
  background:transparent;
  border:none;
  padding:0;
  margin:0;
  cursor:pointer;
}
.hotspot:focus-visible{ outline:3px solid var(--slate); outline-offset:2px; }
.hotspot-begin{ left:34%; top:61%; width:30%; height:10%; }
.hotspot-save{ left:91%; top:68%; width:9%; height:9%; }
.hotspot-home{ left:91%; top:78%; width:9%; height:8.5%; }
.hotspot-retry{ left:91%; top:87%; width:9%; height:9%; }

.cover-about{
  position:absolute;
  display:flex;
  align-items:center;
  justify-content:center;
  background:none;
  border:none;
  padding:0;
  margin:0;
  cursor:pointer;
  font-family:'Radley', serif;
  color:var(--ink-soft);
  text-decoration:underline;
  text-underline-offset:3px;
  transition:color 0.12s ease;
}
.cover-about:hover{ color:var(--ink); }
.cover-about:focus-visible{ outline:3px solid var(--slate); outline-offset:2px; }
.cover-about-desktop{ left:38%; top:85%; width:24%; height:6%; font-size:17px; }

/* ---- responsive: desktop vs mobile assets ---- */
.desktop-only{ display:block; }
.mobile-only{ display:none; }
@media (max-width:640px){
  .desktop-only{ display:none; }
  .mobile-only{ display:block; }
}

.image-page-mobile{
  position:relative;
  width:100%;
  max-width:480px;
  aspect-ratio:853/1844;
  background:var(--paper);
  box-shadow:0 20px 50px rgba(47,38,32,0.16), 0 2px 8px rgba(47,38,32,0.1);
  overflow:hidden;
}
.hotspot-begin-m{ left:25%; top:53.5%; width:49%; height:9%; }
.cover-about-mobile{ left:30%; top:73%; width:40%; height:5%; font-size:16px; }
.hotspot-save-m{ left:38%; top:84%; width:24%; height:8.5%; }
.hotspot-home-m{ left:8%; top:96%; width:24%; height:4%; }
.hotspot-retry-m{ left:68%; top:96%; width:24%; height:4%; }

/* ---- question page (card layout) ---- */
.page{
  position:relative;
  width:100%;
  max-width:760px;
  background:var(--paper);
  box-shadow:0 20px 50px rgba(47,38,32,0.16), 0 2px 8px rgba(47,38,32,0.1);
  padding:56px 48px 44px;
  box-sizing:border-box;
}
@media (max-width:640px){
  .page{ padding:36px 22px 32px; }
  .scrapbook-surface{ padding:16px 10px; }
}

.question-page{
  max-width:1040px;
  aspect-ratio:1366/768;
  background-image:url('${BASE}Questions%20background.png');
  background-size:cover;
  background-position:center;
  background-repeat:no-repeat;
  background-color:var(--paper);
  padding:13% 11% 9%;
  display:flex;
  flex-direction:column;
  justify-content:center;
}
@media (max-width:640px){
  .question-page{ aspect-ratio:auto; min-height:480px; padding:15% 8% 10%; }
}

.btn-back{
  display:inline-flex;
  align-items:center;
  gap:2px;
  border:none;
  border-radius:20px;
  background:none;
  color:var(--ink-soft);
  font-family:'Radley', monospace;
  font-weight:600;
  font-size:14px;
  cursor:pointer;
  padding:9px 18px 9px 14px;
  min-height:40px;
  transition:background 0.12s ease;
}
.btn-back:hover{ background:rgba(142, 117, 100, 0.16); }
.btn-back:focus-visible{ outline:3px solid var(--slate); outline-offset:2px; }

/* ---- learn more modal ---- */
.learn-more-backdrop{
  position:fixed;
  inset:0;
  background:rgba(47,38,32,0.45);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  z-index:20;
}
.learn-more-card{
  position:relative;
  max-width:480px;
  width:100%;
  max-height:80vh;
  overflow-y:auto;
  background:var(--paper);
  padding:40px 32px 32px;
  box-shadow:0 24px 60px rgba(47,38,32,0.35);
  clip-path:polygon(0.5% 2%,99% 0%,100% 98%,0.5% 100%);
}
.learn-more-close{
  position:absolute;
  top:14px;
  right:16px;
  background:none;
  border:none;
  font-size:26px;
  line-height:1;
  color:var(--ink-soft);
  cursor:pointer;
  padding:6px;
}
.learn-more-close:hover{ color:var(--ink); }
.learn-more-title{
  font-family:'Baloo 2', sans-serif;
  font-weight:700;
  font-size:22px;
  margin:0 0 16px;
  color:var(--ink);
}
.learn-more-card p{
  font-size:14.5px;
  line-height:1.7;
  color:var(--ink-soft);
  margin:0 0 14px;
}
.learn-more-card p:last-child{ margin-bottom:0; }

.question-top-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:6px;
}
.entry-label{
  font-family:'Special Elite', monospace;
  font-size:11px;
  letter-spacing:0.14em;
  color:var(--ink-soft);
  opacity:0.75;
}
.progress-row{
  display:flex;
  gap:5px;
  margin:10px 0 22px;
  flex-wrap:wrap;
}
.progress-dot{
  width:7px; height:7px;
  border-radius:50%;
  background:var(--line);
}
.progress-dot-filled{ background:#8a6a45; }

.question-header{
  position:relative;
  background:var(--kraft);
  padding:30px 34px;
  margin:0 0 30px;
  clip-path:polygon(0.5% 3%,99% 0%,100% 96%,1% 100%);
  box-shadow:0 6px 16px rgba(47,38,32,0.14);
}
.question-prompt{
  font-family:'Radley', sans-serif;
  font-weight:700;
  font-size:24px;
  line-height:1.35;
  text-align:center;
  margin:0;
  color:#2c2013;
}
@media (max-width:480px){ .question-prompt{ font-size:19px; } }

.option-stack{
  display:flex;
  flex-direction:column;
  gap:14px;
}
.option-strip{
  position:relative;
  text-align:left;
  background:var(--lavender);
  border:none;
  padding:18px 30px 18px 22px;
  min-height:48px;
  display:flex;
  align-items:baseline;
  gap:10px;
  cursor:pointer;
  font-family:'Radley', sans-serif;
  font-size:16px;
  color:#241c2c;
  clip-path:polygon(0% 0%,96% 0%,100% 18%,97% 34%,100% 50%,96% 66%,100% 82%,97% 100%,0% 100%);
  box-shadow:0 2px 0 rgba(47,38,32,0.06);
  transition:background 0.08s ease, box-shadow 0.08s ease;
}
.option-strip:hover, .option-strip:focus-visible{
  background:var(--rust);
  color:#2b160f;
  box-shadow:0 6px 14px rgba(47,38,32,0.18);
}
.option-strip:focus-visible{ outline:3px solid var(--slate); outline-offset:2px; }
.option-selected{
  background:var(--rust);
  color:#2b160f;
  box-shadow:0 6px 14px rgba(47,38,32,0.2);
}
.option-letter{
  font-family:'Baloo 2', sans-serif;
  font-weight:700;
  flex-shrink:0;
}
.option-text{ line-height:1.4; }
`;
