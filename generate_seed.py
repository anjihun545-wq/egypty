import json
from pathlib import Path
base=Path(__file__).parent
records=[]

def add(id,kind,order,title,**data):
 records.append({'row_key':id,'kind':kind,'sort_order':order,'title':title,'data':data})

D=[
('2027-01-11','카이로','이집트에 도착한 첫날','여행의 속도를 천천히 올리는 날','도착', '12:30 카이로 공항 도착 및 입국수속', '호텔 체크인, 점심 및 휴식', '나일강 산책, 이집트 첫 저녁 식사', '카이로 1박', '공항 → 카이로 숙소', '공항 이동시간과 입국수속을 넉넉히 잡기'),
('2027-01-12','기자 · 아스완','피라미드와 첫 번째 대모험','기자 유적지 관광 후 아스완으로 이동','관광 + 항공','기자 피라미드·스핑크스 투어', '파노라마 포인트, 점심 및 투어 마무리', '카이로→아스완 국내선 이동, 체크인', '아스완 1박', '카이로 → 기자 → 카이로 공항 → 아스완', '국내선 출발시간에 맞춰 가이드 투어 종료시간 확정'),
('2027-01-13','아스완','나일강 크루즈 출항','아스완에서 3박 4일 크루즈 탑승','크루즈 D1','호텔 체크아웃 및 크루즈 승선 준비', '크루즈 체크인·점심, 필레 신전 등 포함 관광', '선상 저녁 및 휴식', '나일강 크루즈 1박', '아스완 선착장 → 크루즈', '필레 신전 및 펠루카 포함 여부는 예약 상품 확인'),
('2027-01-14','콤옴보 · 에드푸','신전 사이로 흐르는 나일강','강을 따라 고대 이집트의 흔적을 만나는 하루','크루즈 D2','선상 조식 및 콤옴보 신전', '에드푸 호루스 신전 및 항해', '선상 식사, 휴식 및 프로그램', '나일강 크루즈 2박', '나일강 크루즈', '콤옴보·에드푸 방문 순서는 선박 일정에 따름'),
('2027-01-15','룩소르','신전의 도시 룩소르','웅장한 기둥과 신전이 기다리는 날','크루즈 D3','나일강 항해 및 에스나 수문', '카르나크 신전 관광(상품 일정 확인)', '룩소르 신전 및 선상 마지막 밤', '나일강 크루즈 3박', '에드푸 → 룩소르 (크루즈)', '실제 신전 방문 시간은 선박 확정 일정표 반영'),
('2027-01-16','룩소르 · 후르가다','왕들의 도시에서 홍해로','유적지 관람을 마치고 리조트에 도착','이동','크루즈 하선, 왕가의 계곡 등 포함 관광', '전용 차량으로 후르가다 이동', '후르가다 리조트 체크인 및 휴식', '후르가다 1박', '룩소르 → 후르가다 (육로 약 4~5시간)', '하선·왕가의 계곡 투어 종료시간에 맞춰 픽업 예약'),
('2027-01-17','후르가다','홍해에서 보내는 느린 하루','여행 중 마음껏 쉬기 위해 비워둔 하루','휴양','느긋한 조식', '해변·온수풀·리조트 휴식', '선셋 및 저녁 식사', '후르가다 2박', '리조트 내 자유시간', '1월에는 해풍이 있어 온수풀과 방풍 좋은 해변 추천'),
('2027-01-18','후르가다','바다가 허락하면 스노클링','날씨에 따라 선택하는 액티비티 데이','선택 투어','현지 해상 날씨 확인', '기프툰섬 보트투어 / 스노클링 (선택)', '리조트 자유시간 및 스파', '후르가다 3박', '기프툰섬 또는 리조트', '바다 수온이 낮고 바람 강하면 실내·리조트 일정으로 교체'),
('2027-01-19','후르가다 · 카이로','카이로로 돌아오는 길','후르가다에서 카이로로 이동하는 날','장거리 이동','후르가다 리조트 체크아웃', '버스·전용차량·항공편으로 카이로 이동', '호텔 체크인 및 근처 저녁 식사', '카이로 1박 (두 번째 숙소)', '후르가다 → 카이로', '버스·차량은 교통상황에 따라 장거리 소요'),
('2027-01-20','기자 · 카이로','이집트 대박물관 완전 정복','여행의 마지막 하이라이트, GEM 관람','박물관','대박물관 입장 및 주요 전시 관람', '투탕카멘 전시·메인 갤러리, 선택 가이드', '자유 관람·기념품 쇼핑·저녁', '카이로 2박 (두 번째 숙소)', '호텔 ↔ 이집트 대박물관', '공식 웹사이트에서 날짜별 입장시간과 관람권 확인'),
('2027-01-21','카이로','이집트를 뒤로하고 집으로','마지막 하루는 여유 있게','귀국','조식 및 짐 정리', '근거리 자유시간 및 점심', '공항 이동 → 19:00 항공편 출발', '귀국 비행', '카이로 호텔 → 국제공항', '국제선 약 3시간 전 공항 도착을 목표로 이동')]
for n,d in enumerate(D,1):
 date,city,title,subtitle,tag,morning,afternoon,evening,stay,move,note=d
 add(f'day-{n:02d}','day',n,title,date=date,city=city,subtitle=subtitle,tag=tag,morning=morning,afternoon=afternoon,evening=evening,stay=stay,move=move,note=note)

B=[
('cruise','나일강 크루즈 3박 4일','2027-01-13','2027-01-16','아스완 → 룩소르','필수','크루즈 시작 및 종료 항구, 포함 신전, 가이드, 왕가의 계곡 확인'),
('flight','카이로 → 아스완 국내선','2027-01-12','2027-01-12','카이로 공항 → 아스완 공항','필수','12일 저녁 출발 권장. 13일 승선 지연 위험 대비'),
('giza','기자 피라미드 투어','2027-01-12','2027-01-12','기자 피라미드·스핑크스','필수','아스완 국내선 출발과 투어 종료시간 충돌 주의'),
('cairo-first','카이로 숙소 · 첫날','2027-01-11','2027-01-12','카이로 · 1박','필수','첫날 공항 및 12일 기자 투어 접근성 우선'),
('hurghada','후르가다 리조트','2027-01-16','2027-01-19','후르가다 · 3박','필수','온수풀/바람 피하는 해변/식사 포함 여부 확인'),
('cairo-last','카이로 숙소 · 마지막','2027-01-19','2027-01-21','카이로 · 2박','중요','GEM 및 귀국 공항 이동 동선 고려'),
('aswan','아스완 숙소','2027-01-12','2027-01-13','아스완 · 1박','중요','크루즈 선착장 접근성 및 늦은 체크인 가능 여부'),
('luxor-transfer','룩소르 → 후르가다 이동','2027-01-16','2027-01-16','룩소르 → 후르가다','중요','크루즈 하선·관광 종료시간에 맞춰 픽업 예약'),
('cairo-transfer','후르가다 → 카이로 이동','2027-01-19','2027-01-19','후르가다 → 카이로','중요','차량·버스·항공편 비교'),
('gem','이집트 대박물관 + 가이드','2027-01-20','2027-01-20','Grand Egyptian Museum','선택','입장권 및 공식 가이드 예약 검토')]
for n,b in enumerate(B,1):
 slug,title,start,end,place,priority,note=b
 add('booking-'+slug,'booking',n,title,start=start,end=end,place=place,priority=priority,note=note,status='미예약',vendor='',price=0,currency='KRW',url='',reference='',cancel_by='')
for n,(title,category) in enumerate([('국제선 항공권','항공'),('국내선·도시간 이동','이동'),('숙박','숙박'),('나일강 크루즈','크루즈'),('가이드·입장권','관광'),('식비·기타','기타')],1):
 add('budget-'+str(n),'budget',n,title,category=category,planned=0,spent=0,note='')
checks=[
('여권 유효기간 및 이집트 비자 확인','출국 전'),('국제선 항공권·수하물·환승 정보 확인','출국 전'),('여행자보험 가입','출국 전'),('국내선 및 크루즈 탑승 바우처 준비','예약'),('숙소 예약번호·체크인 시간 확인','예약'),('룩소르 → 후르가다 픽업 예약','예약'),('유심·eSIM 및 해외결제 카드 준비','준비물'),('상비약·충전기·멀티어댑터 준비','준비물'),('홍해용 래시가드·바람막이 준비','준비물'),('외교부 여행안전정보 확인','출국 전')]
for n,(title,cat) in enumerate(checks,1): add('todo-'+str(n),'todo',n,title,category=cat,done=False,note='')

(base/'seed.js').write_text('export const SEED = '+json.dumps(records,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(base/'seed.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
sql='''-- EGYPT 2027 · Supabase SQL Editor에서 실행
-- 1. 아래의 FIRST_EMAIL / SECOND_EMAIL 두 주소를 실제 동행자 이메일로 바꿔주세요.
-- 2. 두 사용자 계정은 Supabase > Authentication > Users 에서 각각 생성해주세요.
-- 3. 이 SQL을 한 번 실행하면 기본 일정/예약/예산/준비물이 입력됩니다.

create table if not exists public.allowed_editors (
 email text primary key,
 created_at timestamptz not null default now()
);
alter table public.allowed_editors enable row level security;
revoke all on public.allowed_editors from anon, authenticated;

-- 반드시 실사용 두 이메일로 바꿔주세요. 기본값으로는 누구도 접근할 수 없습니다.
insert into public.allowed_editors (email) values
 ('FIRST_EMAIL@example.com'),
 ('SECOND_EMAIL@example.com')
on conflict (email) do nothing;

create or replace function public.has_editor_access()
returns boolean language sql stable security definer set search_path = ''
as $$
 select auth.uid() is not null and exists (
  select 1 from public.allowed_editors e
  where lower(e.email) = lower(coalesce(auth.jwt()->>'email',''))
 );
$$;
revoke all on function public.has_editor_access() from public, anon;
grant execute on function public.has_editor_access() to authenticated;

create table if not exists public.travel_records (
 row_key text primary key,
 kind text not null check (kind in ('day','booking','budget','todo')),
 sort_order integer not null default 0,
 title text not null,
 data jsonb not null default '{}'::jsonb,
 version integer not null default 1,
 updated_by text,
 updated_at timestamptz not null default now()
);
create index if not exists idx_travel_records_kind_order on public.travel_records(kind, sort_order);
alter table public.travel_records enable row level security;
revoke all on public.travel_records from anon;
grant select, insert, update, delete on public.travel_records to authenticated;

drop policy if exists editor_read on public.travel_records;
drop policy if exists editor_insert on public.travel_records;
drop policy if exists editor_update on public.travel_records;
drop policy if exists editor_delete on public.travel_records;
create policy editor_read on public.travel_records for select to authenticated using ((select public.has_editor_access()));
create policy editor_insert on public.travel_records for insert to authenticated with check ((select public.has_editor_access()));
create policy editor_update on public.travel_records for update to authenticated using ((select public.has_editor_access())) with check ((select public.has_editor_access()));
create policy editor_delete on public.travel_records for delete to authenticated using ((select public.has_editor_access()));

create or replace function public.travel_record_write_stamp()
returns trigger language plpgsql set search_path = '' as $$
begin
 if tg_op = 'UPDATE' then
  new.version := old.version + 1;
 else
  new.version := 1;
 end if;
 new.updated_at := now();
 new.updated_by := coalesce(auth.jwt()->>'email', '초기 입력');
 return new;
end;
$$;
drop trigger if exists travel_record_write_stamp on public.travel_records;
create trigger travel_record_write_stamp before insert or update on public.travel_records
for each row execute function public.travel_record_write_stamp();

-- DB에서 변경될 때 상대방 화면에 동기화 알림 전달
-- Supabase 새 프로젝트의 supabase_realtime publication을 활용합니다.
do $$ begin
 if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
  and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'travel_records') then
  alter publication supabase_realtime add table public.travel_records;
 end if;
end $$;

-- 초기 자료: 이미 수정한 데이터는 덮어쓰지 않습니다 (ON CONFLICT DO NOTHING)
insert into public.travel_records (row_key,kind,sort_order,title,data) values
'''
for i,r in enumerate(records):
 v=(r['row_key'],r['kind'],r['sort_order'],r['title'],json.dumps(r['data'],ensure_ascii=False))
 esc=lambda t: t.replace("'","''")
 line=" ('{}','{}',{},'{}','{}'::jsonb)".format(esc(v[0]),esc(v[1]),v[2],esc(v[3]),esc(v[4]))
 sql+=line+(',' if i<len(records)-1 else '')+'\n'
sql+='on conflict (row_key) do nothing;\n'
(base/'supabase-setup.sql').write_text(sql,encoding='utf-8')
print('Wrote',len(records),'records')
