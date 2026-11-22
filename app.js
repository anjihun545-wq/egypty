import { SEED } from './seed.js';

// GitHub Pages + Supabase. 설정 전에는 데모(브라우저 로컬 저장)로 작동합니다.
const cfg = window.EGYPT_CONFIG || {};
const hasBackend = Boolean(cfg.supabaseUrl && cfg.supabasePublishableKey);
const STORAGE_KEY = 'egypt-2027-demo-v1';
const app = document.getElementById('app');
const modalRoot = document.getElementById('modalRoot');
const authGate = document.getElementById('authGate');
const currency = n => `${Number(n || 0).toLocaleString('ko-KR')}원`;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { mode: hasBackend ? 'remote' : 'demo', records: [], page: 'home', selectedDay: 'day-01', bookingFilter: '전체', supabase: null, session: null, channel: null, loading: false };

function records(kind) { return state.records.filter(r => r.kind === kind).sort((a,b) => a.sort_order - b.sort_order); }
function byKey(key) { return state.records.find(r => r.row_key === key); }
function waitToast(message) { const node=document.getElementById('toast'); node.textContent=message; node.classList.add('show'); clearTimeout(waitToast.timer); waitToast.timer=setTimeout(()=>node.classList.remove('show'),3200); }
function replaceRecord(record) { const idx=state.records.findIndex(r=>r.row_key===record.row_key); if(idx>=0) state.records[idx]=record; else state.records.push(record); }
function persistDemo() { try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state.records));} catch {waitToast('저장공간이 부족합니다. 데이터 백업을 권장합니다.');} }
function todayDiff(){const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate());return Math.ceil((new Date(2027,0,11)-today)/86400000);}
function formatDate(v){if(!v)return '날짜 미정'; const d=new Date(v+'T12:00:00');if(Number.isNaN(d.getTime()))return v;return `${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')} (${['일','월','화','수','목','금','토'][d.getDay()]})`;}
function extractDayNum(r){return Number(r.row_key.replace('day-',''))||r.sort_order;}
function artClass(r){ const loc=(r.data.city||'').toLowerCase();return loc.includes('후르가다')? 'art-hurghada':loc.includes('콤옴보')||loc.includes('아스완')?'art-cruise':loc.includes('룩소르')?'art-luxor':'art-cairo'; }
function priorityClass(p) {return p==='필수'?'danger':p==='중요'?'sand':'';}
function statusClass(s){return s==='예약 완료'?'done':s==='예약 중'?'process':'pending';}
function statusLabel(s){return s||'미예약';}
function pageTitle(){return {home:'여행 대시보드',days:'11일 여행 일정',bookings:'예약 관리',budget:'여행 경비',todos:'준비 체크리스트',guide:'여행 정보'}[state.page]||'여행계획서';}
function syncText(text,type=''){
  const t=document.getElementById('syncText'), dot=document.getElementById('syncDot');
  if(t)t.textContent=text; if(dot)dot.className='sync-dot '+type;
}
function renderChrome(){
 const pending=records('booking').filter(r=>r.data.status!=='예약 완료').length;
 document.getElementById('pageCrumb').textContent=pageTitle();
 document.getElementById('navBookingCount').textContent=pending;
 document.querySelectorAll('[data-page]').forEach(node=>node.classList.toggle('active',node.dataset.page===state.page));
 document.getElementById('identity').textContent=state.mode==='remote'?(state.session?.user?.email||'로그인 필요'):'DEMO MODE';
 document.getElementById('logoutButton').classList.toggle('hidden',state.mode!=='remote'||!state.session);
 if(state.mode==='demo')syncText('체험 모드 · 이 기기에만 저장');
 else if(state.session)syncText('두 사람 공동 저장 연결됨','online');
 else syncText('로그인 필요');
}
function render() {
 renderChrome();
 const pages={home:renderHome,days:renderDays,bookings:renderBookings,budget:renderBudget,todos:renderTodos,guide:renderGuide};
 app.innerHTML=(pages[state.page]||renderHome)();
}
function head(eye,title,desc,right=''){return `<div class="page-head"><div><div class="eyebrow">${esc(eye)}</div><h1 class="page-title">${esc(title)}</h1><p class="page-desc">${esc(desc)}</p></div>${right}</div>`;}
function progress(p){return `<div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,p))}%"></div></div>`;}
function renderHome(){
 const b=records('booking'), done=b.filter(x=>x.data.status==='예약 완료').length, d=records('day'), t=records('todo'), tdone=t.filter(x=>x.data.done).length;
 const budget=records('budget'), planned=budget.reduce((n,r)=>n+Number(r.data.planned||0),0), spent=budget.reduce((n,r)=>n+Number(r.data.spent||0),0);
 const diff=todayDiff(); const countdown=diff>0?`D-${diff}`:diff===0?'D-DAY':diff>=-10?'ON TRIP':'MEMORIES';
 return `${head('WELCOME TO YOUR NEXT ADVENTURE','우리가 함께 떠나는 이집트','고대 문명과 나일강, 그리고 홍해. 여행 준비부터 현지 일정까지 한곳에서 관리해요.')}
 <div class="hero"><div class="hero-text"><span class="hero-mini">✧  OUR EGYPT STORY</span><h1>EGYPT<br><em>2027.</em></h1><p>피라미드에서 나일강 크루즈까지,<br>그리고 홍해의 느긋한 오후까지.</p><div class="hero-date">JAN 11 — JAN 21 &nbsp; · &nbsp; 10 NIGHTS / 11 DAYS</div></div><div class="hero-img"></div><div class="hero-art-note">CAIRO · ASWAN · LUXOR · HURGHADA</div></div>
 <div class="stat-grid">
 <div class="stat surface"><div><small>출발까지</small><strong>${countdown}</strong></div><span class="stat-ico">◷</span></div>
 <div class="stat surface"><div><small>여행 일정</small><strong>${d.length}<span>DAYS</span></strong></div><span class="stat-ico">▤</span></div>
 <div class="stat surface"><div><small>예약 완료</small><strong>${done}<span>/ ${b.length}</span></strong></div><span class="stat-ico">◇</span></div>
 <div class="stat surface"><div><small>준비 완료</small><strong>${tdone}<span>/ ${t.length}</span></strong></div><span class="stat-ico">✓</span></div>
 </div>
 ${state.mode==='demo'?`<div class="callout orange" style="margin-bottom:28px"><strong>지금은 체험 모드입니다.</strong>화면에서 수정하면 이 브라우저에만 저장됩니다. 두 사람이 같은 내용을 편집·저장하려면 README의 Supabase 연결을 완료해 주세요.</div>`:''}
 <div class="two-col"><section class="surface white-pad"><div class="section-row"><div><h2 class="section-title">우리의 여행 일정</h2><p class="section-sub">카이로 → 아스완 → 룩소르 → 후르가다 → 카이로</p></div><button class="link-button" data-page="days">전체 일정 보기 ↗</button></div><div class="mini-days">${d.slice(0,6).map(r=>`<button class="mini-day" data-action="home-day" data-key="${esc(r.row_key)}"><span class="mini-day-num">DAY ${String(extractDayNum(r)).padStart(2,'0')}</span><span class="mini-day-title">${esc(r.title)}</span><span class="mini-day-city">${esc(r.data.city)}</span></button>`).join('')}</div><button style="margin-top:16px" class="button button-soft" data-page="days">DAY 01~11 일정 확인 →</button></section>
 <section class="surface white-pad"><div class="section-row"><div><h2 class="section-title">우선 예약할 항목</h2><p class="section-sub">놓치면 안 되는 핵심 예약부터</p></div><button class="link-button" data-page="bookings">예약 관리 ↗</button></div><div class="row-stack">${b.filter(x=>x.data.status!=='예약 완료').slice(0,4).map(r=>`<div class="booking-mini"><div><strong>${esc(r.title)}</strong><small>${esc(formatDate(r.data.start))} · ${esc(r.data.place)}</small></div><button class="small-icon-btn" title="예약 수정" data-action="edit" data-key="${esc(r.row_key)}">↗</button></div>`).join('')||'<div class="callout">모든 예약을 완료했어요! 🎉</div>'}</div><div style="margin-top:19px"><div class="progress-label"><span>전체 예약 진행률</span><strong>${done} / ${b.length}</strong></div>${progress(b.length?done/b.length*100:0)}</div></section></div>
 <div class="two-col" style="margin-top:22px"><section class="surface white-pad"><div class="section-row"><div><h2 class="section-title">여행 예산</h2><p class="section-sub">직접 입력한 금액을 기준으로 계산됩니다.</p></div><button class="link-button" data-page="budget">경비 수정 ↗</button></div><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><div class="section-sub">계획 예산</div><div style="font-size:24px;letter-spacing:-1px;font-weight:800;margin-top:8px">${currency(planned)}</div></div><div><div class="section-sub">실제 지출</div><div style="font-size:24px;letter-spacing:-1px;font-weight:800;margin-top:8px">${currency(spent)}</div></div></div><div style="margin-top:20px">${progress(planned?spent/planned*100:0)}</div></section><section class="callout"><strong>✦ 여행의 핵심 포인트</strong>1/12 카이로에서 아스완으로 이동하고, 1/13부터 크루즈를 탑니다. 1/16에는 룩소르에서 후르가다로 이동하므로 크루즈 하선·관광 종료시간에 맞춘 차량 예약이 중요합니다.</section></div>`;
}
function renderDays(){const ds=records('day');const selected=byKey(state.selectedDay)||ds[0];if(!selected)return '<div class="empty-state">일정 데이터가 없습니다.</div>';state.selectedDay=selected.row_key;
 return `${head('THE JOURNEY / 11 DAYS','하루하루의 여행 기록','날짜를 선택하면 시간대별 계획과 숙소·이동수단을 확인하고 직접 수정할 수 있어요.',`<button class="button button-primary" data-action="edit" data-key="${esc(selected.row_key)}">✎ 선택한 날짜 편집</button>`)}
 <div class="grid-days">${ds.map(r=>`<button class="day-card ${r.row_key===selected.row_key?'selected':''}" data-action="select-day" data-key="${esc(r.row_key)}"><div class="day-card-art ${artClass(r)}"><span class="art-shape"></span><span class="art-day">DAY ${String(extractDayNum(r)).padStart(2,'0')}</span></div><div class="day-card-content"><div class="day-card-date">${esc(formatDate(r.data.date))} · ${esc(r.data.tag)}</div><div class="day-card-title">${esc(r.title)}</div><div class="day-card-city">${esc(r.data.city)}</div></div></button>`).join('')}</div>
 <section id="dayDetails" class="surface day-detail"><div class="day-detail-head"><div><div class="eyebrow">DAY ${String(extractDayNum(selected)).padStart(2,'0')} · ${esc(formatDate(selected.data.date))}</div><h3>${esc(selected.title)}</h3><p>${esc(selected.data.subtitle)}</p></div><button class="button button-primary" data-action="edit" data-key="${esc(selected.row_key)}">✎ 일정 편집</button></div>
 <div class="timeline">${[['오전',selected.data.morning],['오후',selected.data.afternoon],['저녁',selected.data.evening]].map(([label,value])=>`<div class="timeline-row"><div class="timeline-time">${label}</div><div class="timeline-track"><i></i></div><div class="timeline-body">${esc(value||'일정 미정')}</div></div>`).join('')}</div>
 <div class="detail-facts"><div class="fact"><label>⌂ 숙소</label>${esc(selected.data.stay||'미정')}</div><div class="fact"><label>⇢ 이동수단 및 경로</label>${esc(selected.data.move||'미정')}</div></div><div class="detail-note">✧ &nbsp; ${esc(selected.data.note||'추가 메모를 작성해 보세요.')}</div></section>`;}
function renderBookings(){const all=records('booking');const total=all.length, done=all.filter(x=>x.data.status==='예약 완료').length;
 const filtered=all.filter(r=>state.bookingFilter==='전체'||(state.bookingFilter==='미완료'?r.data.status!=='예약 완료':r.data.status===state.bookingFilter));
 return `${head('BOOKING MANAGEMENT','예약 관리','여행 준비의 핵심. 상태, 업체, 가격, 예약번호와 확인서 링크까지 두 사람이 함께 관리하세요.',`<button class="button button-primary" data-action="add" data-kind="booking">+ 예약 항목 추가</button>`)}
 <div class="surface white-pad" style="margin-bottom:24px"><div class="progress-label"><span>예약 완료 현황</span><strong>${done} / ${total}건</strong></div>${progress(total?done/total*100:0)}<div class="section-sub" style="margin-top:12px">크루즈 → 국내선 항공 → 피라미드 투어 → 숙소 순으로 예약을 권장합니다.</div></div>
 <div class="filter-row">${['전체','미완료','미예약','예약 중','예약 완료'].map(f=>`<button class="filter-tab ${state.bookingFilter===f?'active':''}" data-action="booking-filter" data-value="${esc(f)}">${esc(f)}</button>`).join('')}</div>
 <div class="booking-list">${filtered.map((r,i)=>{const d=r.data;return `<div class="surface booking-card"><div class="booking-icon">${d.priority==='필수'?'✦':'◇'}</div><div><div class="booking-title">${esc(r.title)} <span class="pill ${priorityClass(d.priority)}">${esc(d.priority||'일반')}</span></div><div class="booking-details"><span>◷ ${esc(formatDate(d.start))}${d.end&&d.end!==d.start?' ~ '+esc(formatDate(d.end)):''}</span><span>⌖ ${esc(d.place||'장소 미정')}</span></div><div class="booking-note">${esc(d.note||'')}</div>${d.vendor||d.price||d.reference?`<div class="booking-meta">${d.vendor?`<span>업체: ${esc(d.vendor)}</span>`:''}${d.price?`<span>${esc(d.currency==='KRW'?currency(d.price):Number(d.price).toLocaleString()+' '+d.currency)}</span>`:''}${d.reference?`<span>예약번호: ${esc(d.reference)}</span>`:''}</div>`:''}${d.url?`<div style="margin-top:9px"><a href="${esc(safeUrl(d.url))}" target="_blank" rel="noopener noreferrer" class="link-button" style="display:inline-block;padding:0">예약/확인서 링크 열기 ↗</a></div>`:''}</div><div class="booking-actions"><select data-change="booking-status" data-key="${esc(r.row_key)}" aria-label="${esc(r.title)} 예약 상태">${['미예약','예약 중','예약 완료'].map(s=>`<option value="${s}" ${d.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="small-icon-btn" data-action="edit" data-key="${esc(r.row_key)}" title="상세 수정">✎</button></div></div>`}).join('')||'<div class="surface empty-state"><strong>해당 예약이 없어요.</strong>다른 상태를 선택해 보세요.</div>'}</div>
 <div class="callout orange" style="margin-top:21px"><strong>꼭 확인할 예약</strong>1월 12일 아스완행 국내선 예약 후 기자 투어 종료시간을 확정하세요. 크루즈의 실제 승선 항구와 하선 시간, 룩소르→후르가다 픽업 시간은 서로 맞아야 합니다.</div>`;
}
function renderBudget(){const all=records('budget'),plan=all.reduce((s,r)=>s+Number(r.data.planned||0),0),spent=all.reduce((s,r)=>s+Number(r.data.spent||0),0);return `${head('BUDGET TRACKER','여행 경비 관리','예상 예산과 실제 지출을 원화 기준으로 입력하고 자동으로 합산합니다.',`<button class="button button-primary" data-action="add" data-kind="budget">+ 예산 항목 추가</button>`)}
 <div class="budget-overview"><div class="surface money-stat"><small>전체 계획 예산</small><strong>${currency(plan)}</strong></div><div class="surface money-stat"><small>실제 지출</small><strong>${currency(spent)}</strong></div><div class="surface money-stat"><small>${plan-spent>=0?'남은 예산':'예산 초과'}</small><strong style="color:${spent>plan&&plan>0?'#b86d59':''}">${currency(Math.abs(plan-spent))}</strong></div></div>
 <section class="surface white-pad"><div class="section-row"><div><h2 class="section-title">항목별 지출 내역</h2><p class="section-sub">각 행 오른쪽의 편집 버튼으로 금액을 입력할 수 있습니다.</p></div></div><div style="overflow-x:auto"><table class="budget-table"><thead><tr><th>항목</th><th>예상 예산</th><th>실제 지출</th><th>편집</th></tr></thead><tbody>${all.map(r=>`<tr><td><strong>${esc(r.title)}</strong><small>${esc(r.data.category)}</small></td><td>${currency(r.data.planned)}</td><td>${currency(r.data.spent)}</td><td><button class="small-icon-btn" data-action="edit" data-key="${esc(r.row_key)}" title="경비 편집">✎</button></td></tr>`).join('')}</tbody></table></div></section>
 <div class="callout" style="margin-top:18px"><strong>금액 입력 기준</strong>원화(KRW)로 통일해서 입력하면 두 사람이 언제든 같은 총액을 볼 수 있어요. 달러나 이집트 파운드로 결제했다면 카드 승인 금액 또는 직접 정한 환산 원화를 기록해 주세요. 아직 입력하지 않은 항목은 0원으로 표시됩니다.</div>`;}
function renderTodos(){const all=records('todo'),done=all.filter(r=>r.data.done).length;return `${head('TRIP PREPARATION','여행 준비 체크리스트','비자, 예약 바우처, 준비물까지. 체크할 때마다 상대방에게도 진행 상황이 공유됩니다.',`<button class="button button-primary" data-action="add" data-kind="todo">+ 준비물 추가</button>`)}
 <div class="surface white-pad" style="margin-bottom:21px"><div class="progress-label"><span>출발 준비 진행률</span><strong>${done} / ${all.length} 완료</strong></div>${progress(all.length?done/all.length*100:0)}</div>
 <div class="check-grid">${all.map(r=>`<div class="surface todo-card ${r.data.done?'is-done':''}"><input class="todo-check" type="checkbox" data-change="todo-check" data-key="${esc(r.row_key)}" ${r.data.done?'checked':''} aria-label="${esc(r.title)}"/><div style="flex:1;min-width:0"><div class="todo-title">${esc(r.title)}</div><div class="todo-category">${esc(r.data.category||'기타')}${r.data.note?' · '+esc(r.data.note):''}</div></div><button class="small-icon-btn todo-edit" data-action="edit" data-key="${esc(r.row_key)}" title="준비물 수정">✎</button></div>`).join('')}</div>
 <div class="callout orange" style="margin-top:21px"><strong>여행 안전 팁</strong>1월 이집트는 아침저녁으로 쌀쌀하며, 후르가다에서는 바람 때문에 체감 온도가 낮을 수 있습니다. 여권·비자·여행자보험·바우처는 출발 전 다시 확인하세요.</div>`;}
function renderGuide(){return `${head('TRAVEL ESSENTIALS','이집트 여행 정보','여행 중 빠르게 확인할 수 있는 공식 링크와 중요한 동선 팁을 모았습니다.')}
 <div class="guide-hero"><div class="eyebrow" style="color:#e7c78e">A LITTLE TRAVEL GUIDE</div><h2 style="font-size:25px;margin:0">11일 동안 기억할 핵심 이동</h2><p>카이로(1/11) → 기자(1/12) → 아스완(1/12 밤) → 크루즈(1/13~16) → 룩소르(1/16) → 후르가다(1/16~19) → 카이로(1/19~21).</p></div>
 <div class="guide-grid">
 <div class="surface guide-block"><h3>🔺 기자 피라미드</h3><p>1월 12일 피라미드·스핑크스를 관람한 뒤 아스완행 항공편에 맞춰 공항으로 이동합니다.</p><a href="https://egymonuments.com/" target="_blank" rel="noopener">이집트 유적지 공식 예매 ↗</a></div>
 <div class="surface guide-block"><h3>🚢 나일강 크루즈</h3><p>1월 13일 아스완 승선, 16일 룩소르 하선 예정. 선박별 관광 포함·하선시간을 예약 시 확인합니다.</p><a href="https://www.google.com/search?q=Aswan+Luxor+3+nights+Nile+cruise+January+13+2027" target="_blank" rel="noopener">크루즈 일정 비교 ↗</a></div>
 <div class="surface guide-block"><h3>🏖️ 후르가다 겨울 휴양</h3><p>1월 낮 기온은 대체로 20℃ 안팎이며 바람이 변수입니다. 온수풀과 리조트 시설을 중심으로 선택하세요.</p><a href="https://www.google.com/maps/search/?api=1&query=Hurghada+Egypt" target="_blank" rel="noopener">지도 보기 ↗</a></div>
 <div class="surface guide-block"><h3>🏛️ 이집트 대박물관</h3><p>1월 20일 관람 예정. 시간대별 입장권과 공식 가이드 이용 가능 여부를 사전에 확인하세요.</p><a href="https://tickets.gem.eg/" target="_blank" rel="noopener">GEM 공식 예매 ↗</a></div>
 <div class="surface guide-block"><h3>🛂 비자·출입국</h3><p>비자 발급 유형, 여권 유효기간, 최신 입국 요건은 반드시 공식 사이트를 통해 확인하세요.</p><a href="https://www.visa2egypt.gov.eg/" target="_blank" rel="noopener">이집트 e-Visa ↗</a><a href="https://0404.go.kr/" target="_blank" rel="noopener">외교부 해외안전정보 ↗</a></div>
 <div class="surface guide-block"><h3>✈️ 여행 이동정보</h3><p>국내선과 크루즈의 연결 일정은 여유 있게 확보하고, 룩소르→후르가다 픽업을 사전 예약하는 편이 안전합니다.</p><a href="https://www.google.com/maps/dir/Luxor,+Egypt/Hurghada,+Egypt/" target="_blank" rel="noopener">룩소르 → 후르가다 경로 ↗</a></div>
 </div><div class="callout orange" style="margin-top:18px"><strong>정보 업데이트 안내</strong>이 페이지의 관광지·기후 정보는 계획 수립용이며, 2027년 1월 실제 출발 전에는 예약 가격, 입장시간, 항공편, 안전정보를 다시 확인해 주세요.</div>`;}
function safeUrl(url){try{const p=new URL(url);return ['http:','https:'].includes(p.protocol)?p.href:'#';}catch{return '#';}}
const baseFields={title:{label:'항목 이름',type:'text',full:true,required:true}};
const fields={
 day:[['data.date','날짜','date'],['data.city','도시 / 지역','text'],['title','일정 제목','text',true],['data.subtitle','간단한 설명','text',true],['data.tag','일정 종류','text'],['data.morning','오전 일정','textarea',true],['data.afternoon','오후 일정','textarea',true],['data.evening','저녁 일정','textarea',true],['data.stay','숙소','text',true],['data.move','이동 경로 / 교통수단','textarea',true],['data.note','여행 메모 / 유의사항','textarea',true]],
 booking:[['title','예약 항목','text',true],['data.start','시작 날짜','date'],['data.end','종료 날짜','date'],['data.place','장소 / 이동 구간','text',true],['data.status','예약 상태','select',false,['미예약','예약 중','예약 완료']],['data.priority','중요도','select',false,['필수','중요','선택']],['data.vendor','예약 업체 / 호텔 / 항공사','text',true],['data.price','예약 금액','number'],['data.currency','결제 통화','select',false,['KRW','USD','EGP','EUR']],['data.reference','예약번호','text',true],['data.url','예약 링크 / 바우처 URL','url',true],['data.cancel_by','무료 취소 기한','date'],['data.note','예약 메모','textarea',true]],
 budget:[['title','경비 항목','text',true],['data.category','분류','text'],['data.planned','계획 예산 (원)','number'],['data.spent','실제 지출 (원)','number'],['data.note','메모','textarea',true]],
 todo:[['title','준비할 항목','text',true],['data.category','분류','text'],['data.done','진행 상태','select',false,['미완료','완료']],['data.note','메모','textarea',true]]
};
function makeField([key,label,type,full,options],record){let value=key==='title'?record.title:record.data[key.slice(5)]; if(key==='data.done') value=value?'완료':'미완료';const elName=esc(key);const valueStr=esc(value??''); let control='';
 if(type==='textarea')control=`<textarea name="${elName}" rows="3">${valueStr}</textarea>`;
 else if(type==='select')control=`<select name="${elName}">${options.map(o=>`<option value="${esc(o)}" ${value===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
 else control=`<input type="${type}" name="${elName}" value="${valueStr}" ${key==='title'?'required':''} ${type==='number'?'min="0" step="1"':''} placeholder="${esc(label)}">`;
 return `<div class="form-field ${full?'full':''}"><label for="">${esc(label)}</label>${control}</div>`;
}
function openEditor(key,kind){const record=key?byKey(key):{row_key:'',kind,sort_order:Math.max(0,...records(kind).map(r=>r.sort_order))+1,title:'',data:{status:'미예약',priority:'중요',currency:'KRW',planned:0,spent:0,done:false}}; if(!record)return waitToast('항목을 찾을 수 없습니다.');
 const isNew=!key;const allowDelete=!isNew&&record.kind!=='day';
 modalRoot.innerHTML=`<div class="modal-backdrop" data-action="close-modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="항목 편집"><div class="modal-head"><h2>${isNew?'새 항목 추가':`✎ ${esc(record.title)} 편집`}</h2><button class="modal-close" data-action="close-modal" title="닫기">×</button></div><form class="modal-form" id="editForm" data-key="${esc(record.row_key)}" data-kind="${esc(record.kind)}" data-version="${record.version||1}"><div id="modalRemoteNotice" class="error-inline hidden">다른 사람이 이 항목을 수정했습니다. 현재 내용을 복사해 보관한 뒤 창을 닫고 최신 내용을 다시 열어주세요. 기존 내용으로 덮어쓰지 않습니다.</div><div class="form-grid">${fields[record.kind].map(f=>makeField(f,record)).join('')}</div><div class="modal-footer"><span class="modal-hint">${state.mode==='demo'?'체험 모드 · 이 브라우저에만 저장':'저장하면 두 사람에게 동기화됩니다.'}</span>${allowDelete?`<button class="button button-danger" type="button" data-action="delete" data-key="${esc(record.row_key)}">삭제</button>`:''}<button class="button button-ghost" type="button" data-action="close-modal">취소</button><button class="button button-primary" type="submit" id="modalSaveButton">저장하기 →</button></div></form></section></div>`;
 document.body.classList.add('modal-open');
}
function closeEditor(){modalRoot.innerHTML='';document.body.classList.remove('modal-open');}
function parseForm(form){const fd=new FormData(form),kind=form.dataset.kind, old=form.dataset.key?byKey(form.dataset.key):null; const result={row_key:old?.row_key||`${kind}-custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,kind,sort_order:old?.sort_order??(Math.max(0,...records(kind).map(r=>r.sort_order))+1),title:old?.title||'',data:{...(old?.data||{})},version:old?.version??1};
 for(const field of fields[kind]){const [key,,type]=field;let v=fd.get(key)??'';if(type==='number')v=Math.max(0,Number(v)||0);if(key==='data.done')v=v==='완료'; if(key==='title')result.title=String(v).trim();else result.data[key.slice(5)]=v;}
 return result;
}
async function saveRecord(next,isNew=false,expectedVersion){
 if(!next.title.trim())return {ok:false,message:'이름을 입력해 주세요.'};
 if(state.mode==='demo'){
  const old=byKey(next.row_key);
  replaceRecord({...next,version:(old?.version||0)+1,updated_at:new Date().toISOString(),updated_by:'체험 사용자'});
  persistDemo();render();return {ok:true};
 }
 if(!state.supabase||!state.session)return {ok:false,message:'로그인 연결이 필요합니다.'};
 try{
  if(isNew){const {data,error}=await state.supabase.from('travel_records').insert({row_key:next.row_key,kind:next.kind,sort_order:next.sort_order,title:next.title,data:next.data}).select('*').single();if(error)throw error;replaceRecord(data);}
  else {const {data,error}=await state.supabase.from('travel_records').update({title:next.title,data:next.data}).eq('row_key',next.row_key).eq('version',expectedVersion).select('*').maybeSingle();if(error)throw error;if(!data){await reloadRemote();return {ok:false,conflict:true,message:'다른 사용자가 먼저 수정했어요. 기존 내용을 덮어쓰지 않았습니다. 내용을 복사한 뒤 최신 버전으로 다시 편집해 주세요.'};}replaceRecord(data);}
  render();return {ok:true};
 }catch(e){return {ok:false,message:'저장에 실패했습니다: '+(e?.message||'네트워크 상태를 확인하세요.')};}
}
async function deleteRecord(key){const old=byKey(key);if(!old)return; if(!confirm(`“${old.title}” 항목을 삭제할까요? 두 사람 모두에게 반영됩니다.`))return;
 if(state.mode==='demo'){state.records=state.records.filter(x=>x.row_key!==key);persistDemo();closeEditor();render();waitToast('삭제했습니다.');return;}
 const {data,error}=await state.supabase.from('travel_records').delete().eq('row_key',key).eq('version',old.version).select('row_key');
 if(error){waitToast('삭제 실패: '+error.message);return;}
 if(!data?.length){await reloadRemote();waitToast('상대방의 변경과 충돌했습니다. 새로 확인해 주세요.');return;}
 state.records=state.records.filter(x=>x.row_key!==key);closeEditor();render();waitToast('공동 저장 데이터에서 삭제했습니다.');
}
async function quickUpdate(key,change){const old=byKey(key);if(!old)return;const next={...old,data:{...old.data,...change}};const result=await saveRecord(next,false,old.version);if(!result.ok){render();waitToast(result.message);}else waitToast(state.mode==='demo'?'이 브라우저에 저장했어요.':'공동 여행계획서에 저장했어요.');}
async function reloadRemote(){if(!state.supabase||!state.session)return;const {data,error}=await state.supabase.from('travel_records').select('*').order('sort_order');if(error)throw error;if(!data?.length){waitToast('공유 일정 데이터가 비어 있습니다. SQL 초기 설정을 확인해 주세요.');}state.records=data||[];render();}
function setPage(page){state.page=page;window.location.hash=page;render();window.scrollTo({top:0,behavior:'smooth'});}
function navigateHash(){const page=location.hash.slice(1);if(['home','days','bookings','budget','todos','guide'].includes(page)){state.page=page;render();}}
async function setupRemote(){
 syncText('공동 저장 연결 중...');
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  state.supabase=createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  state.supabase.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){state.session=null;state.records=[];authGate.classList.remove('hidden');render();syncText('로그인 필요','error');}});
  const {data,error}=await state.supabase.auth.getSession();if(error)throw error;
  if(data.session)await connectSession(data.session);else{authGate.classList.remove('hidden');render();}
 }catch(e){authGate.classList.remove('hidden');document.getElementById('loginError').textContent='연결 설정 오류: '+(e?.message||e);document.getElementById('loginError').classList.remove('hidden');syncText('연결 설정 오류','error');}
}
async function connectSession(session){
 if(state.loading)return;state.loading=true;state.session=session;
 try{
  const {data:allowed,error:rpcError}=await state.supabase.rpc('has_editor_access');if(rpcError)throw rpcError;
  if(!allowed){authGate.classList.remove('hidden');const el=document.getElementById('loginError');el.textContent='이 계정은 공동 편집자로 등록되지 않았습니다. SQL allowed_editors 이메일을 확인해 주세요.';el.classList.remove('hidden');await state.supabase.auth.signOut();return;}
  await reloadRemote();if(state.channel)await state.supabase.removeChannel(state.channel);
  state.channel=state.supabase.channel('egypt2027-records')
   .on('postgres_changes',{event:'*',schema:'public',table:'travel_records'},payload=>{
    const key=payload.new?.row_key||payload.old?.row_key;
    if(payload.eventType==='DELETE')state.records=state.records.filter(x=>x.row_key!==key);
    else if(payload.new?.row_key)replaceRecord(payload.new);
    const open=document.getElementById('editForm');
    if(open?.dataset.key===key){document.getElementById('modalRemoteNotice')?.classList.remove('hidden');}
    render();
   }).subscribe(status=>{if(status==='SUBSCRIBED')syncText('두 사람 공동 저장 연결됨','online');if(status==='CHANNEL_ERROR')syncText('실시간 연결 오류 · 새로고침 권장','error');});
  authGate.classList.add('hidden');document.getElementById('loginError').classList.add('hidden');render();
 }catch(e){authGate.classList.remove('hidden');const el=document.getElementById('loginError');el.textContent='공유 데이터 접속 실패: '+(e?.message||e);el.classList.remove('hidden');syncText('공동 저장 연결 실패','error');}
 finally{state.loading=false;}
}
// 모든 버튼은 한 이벤트 라우터를 사용합니다.
document.addEventListener('click',async e=>{
 const page=e.target.closest('[data-page]');if(page){setPage(page.dataset.page);return;}
 const button=e.target.closest('[data-action]');if(!button)return;const action=button.dataset.action,key=button.dataset.key;
 if(action==='close-modal-backdrop'){if(e.target===button)closeEditor();return;}
 if(action==='close-modal'){closeEditor();return;}
 if(action==='edit'){openEditor(key);return;}
 if(action==='add'){openEditor(null,button.dataset.kind);return;}
 if(action==='delete'){await deleteRecord(key);return;}
 if(action==='select-day'){state.selectedDay=key;render();requestAnimationFrame(()=>document.getElementById('dayDetails')?.scrollIntoView({behavior:'smooth',block:'start'}));return;}
 if(action==='home-day'){state.selectedDay=key;setPage('days');requestAnimationFrame(()=>document.getElementById('dayDetails')?.scrollIntoView({behavior:'smooth',block:'start'}));return;}
 if(action==='booking-filter'){state.bookingFilter=button.dataset.value;render();return;}
 if(action==='copy-link'){try{await navigator.clipboard.writeText(location.href);waitToast('사이트 주소를 복사했어요.');}catch{window.prompt('이 주소를 복사해 주세요.',location.href);}return;}
 if(action==='export'){const content=JSON.stringify({exported_at:new Date().toISOString(),trip:'Egypt 2027',records:state.records},null,2);const file=new Blob([content],{type:'application/json'});const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download='egypt-2027-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);waitToast('JSON 백업 파일을 저장했어요.');return;}
 if(action==='logout'){if(state.supabase){closeEditor();await state.supabase.auth.signOut();}return;}
});
document.addEventListener('change',async e=>{
 const el=e.target;if(el.dataset.change==='booking-status')await quickUpdate(el.dataset.key,{status:el.value});
 if(el.dataset.change==='todo-check')await quickUpdate(el.dataset.key,{done:el.checked});
});
document.addEventListener('submit',async e=>{
 if(e.target.id==='loginForm'){
  e.preventDefault();if(!state.supabase)return;const fd=new FormData(e.target),button=e.target.querySelector('button[type=submit]');button.disabled=true;button.textContent='로그인 중...';
  try{const {data,error}=await state.supabase.auth.signInWithPassword({email:String(fd.get('email')).trim(),password:String(fd.get('password'))});if(error)throw error;await connectSession(data.session);}catch(err){const el=document.getElementById('loginError');el.textContent='로그인 실패: '+(err.message||err);el.classList.remove('hidden');}finally{button.disabled=false;button.textContent='여행계획서 열기 →';}return;
 }
 if(e.target.id==='editForm'){
  e.preventDefault();const form=e.target,button=form.querySelector('#modalSaveButton');button.disabled=true;button.textContent='저장 중...';
  const result=await saveRecord(parseForm(form),!form.dataset.key,Number(form.dataset.version));
  if(result.ok){closeEditor();waitToast(state.mode==='demo'?'이 브라우저에 저장했어요.':'저장 완료! 두 사람에게 공유됩니다.');}
  else {let error=form.querySelector('#modalSaveError');if(!error){error=document.createElement('div');error.id='modalSaveError';error.className='error-inline';form.prepend(error);}error.textContent=result.message;if(result.conflict)document.getElementById('modalRemoteNotice')?.classList.remove('hidden');}
  button.disabled=false;button.textContent='저장하기 →';
 }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeEditor();});
window.addEventListener('hashchange',navigateHash);
window.addEventListener('online',()=>{if(state.mode==='remote'&&state.session)reloadRemote().catch(()=>{});});

function init(){
 try{const cache=localStorage.getItem(STORAGE_KEY);state.records=cache?JSON.parse(cache):structuredClone(SEED);if(!Array.isArray(state.records))state.records=structuredClone(SEED);}catch{state.records=structuredClone(SEED);}
 navigateHash();render();if(state.mode==='remote')setupRemote();
}
init();
