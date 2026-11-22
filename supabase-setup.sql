-- EGYPT 2027 · Supabase SQL Editor에서 실행
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
  execute 'alter publication supabase_realtime add table public.travel_records';
 end if;
end $$;

-- 초기 자료: 이미 수정한 데이터는 덮어쓰지 않습니다 (ON CONFLICT DO NOTHING)
insert into public.travel_records (row_key,kind,sort_order,title,data) values
 ('day-01','day',1,'이집트에 도착한 첫날','{"date": "2027-01-11", "city": "카이로", "subtitle": "여행의 속도를 천천히 올리는 날", "tag": "도착", "morning": "12:30 카이로 공항 도착 및 입국수속", "afternoon": "호텔 체크인, 점심 및 휴식", "evening": "나일강 산책, 이집트 첫 저녁 식사", "stay": "카이로 1박", "move": "공항 → 카이로 숙소", "note": "공항 이동시간과 입국수속을 넉넉히 잡기"}'::jsonb),
 ('day-02','day',2,'피라미드와 첫 번째 대모험','{"date": "2027-01-12", "city": "기자 · 아스완", "subtitle": "기자 유적지 관광 후 아스완으로 이동", "tag": "관광 + 항공", "morning": "기자 피라미드·스핑크스 투어", "afternoon": "파노라마 포인트, 점심 및 투어 마무리", "evening": "카이로→아스완 국내선 이동, 체크인", "stay": "아스완 1박", "move": "카이로 → 기자 → 카이로 공항 → 아스완", "note": "국내선 출발시간에 맞춰 가이드 투어 종료시간 확정"}'::jsonb),
 ('day-03','day',3,'나일강 크루즈 출항','{"date": "2027-01-13", "city": "아스완", "subtitle": "아스완에서 3박 4일 크루즈 탑승", "tag": "크루즈 D1", "morning": "호텔 체크아웃 및 크루즈 승선 준비", "afternoon": "크루즈 체크인·점심, 필레 신전 등 포함 관광", "evening": "선상 저녁 및 휴식", "stay": "나일강 크루즈 1박", "move": "아스완 선착장 → 크루즈", "note": "필레 신전 및 펠루카 포함 여부는 예약 상품 확인"}'::jsonb),
 ('day-04','day',4,'신전 사이로 흐르는 나일강','{"date": "2027-01-14", "city": "콤옴보 · 에드푸", "subtitle": "강을 따라 고대 이집트의 흔적을 만나는 하루", "tag": "크루즈 D2", "morning": "선상 조식 및 콤옴보 신전", "afternoon": "에드푸 호루스 신전 및 항해", "evening": "선상 식사, 휴식 및 프로그램", "stay": "나일강 크루즈 2박", "move": "나일강 크루즈", "note": "콤옴보·에드푸 방문 순서는 선박 일정에 따름"}'::jsonb),
 ('day-05','day',5,'신전의 도시 룩소르','{"date": "2027-01-15", "city": "룩소르", "subtitle": "웅장한 기둥과 신전이 기다리는 날", "tag": "크루즈 D3", "morning": "나일강 항해 및 에스나 수문", "afternoon": "카르나크 신전 관광(상품 일정 확인)", "evening": "룩소르 신전 및 선상 마지막 밤", "stay": "나일강 크루즈 3박", "move": "에드푸 → 룩소르 (크루즈)", "note": "실제 신전 방문 시간은 선박 확정 일정표 반영"}'::jsonb),
 ('day-06','day',6,'왕들의 도시에서 홍해로','{"date": "2027-01-16", "city": "룩소르 · 후르가다", "subtitle": "유적지 관람을 마치고 리조트에 도착", "tag": "이동", "morning": "크루즈 하선, 왕가의 계곡 등 포함 관광", "afternoon": "전용 차량으로 후르가다 이동", "evening": "후르가다 리조트 체크인 및 휴식", "stay": "후르가다 1박", "move": "룩소르 → 후르가다 (육로 약 4~5시간)", "note": "하선·왕가의 계곡 투어 종료시간에 맞춰 픽업 예약"}'::jsonb),
 ('day-07','day',7,'홍해에서 보내는 느린 하루','{"date": "2027-01-17", "city": "후르가다", "subtitle": "여행 중 마음껏 쉬기 위해 비워둔 하루", "tag": "휴양", "morning": "느긋한 조식", "afternoon": "해변·온수풀·리조트 휴식", "evening": "선셋 및 저녁 식사", "stay": "후르가다 2박", "move": "리조트 내 자유시간", "note": "1월에는 해풍이 있어 온수풀과 방풍 좋은 해변 추천"}'::jsonb),
 ('day-08','day',8,'바다가 허락하면 스노클링','{"date": "2027-01-18", "city": "후르가다", "subtitle": "날씨에 따라 선택하는 액티비티 데이", "tag": "선택 투어", "morning": "현지 해상 날씨 확인", "afternoon": "기프툰섬 보트투어 / 스노클링 (선택)", "evening": "리조트 자유시간 및 스파", "stay": "후르가다 3박", "move": "기프툰섬 또는 리조트", "note": "바다 수온이 낮고 바람 강하면 실내·리조트 일정으로 교체"}'::jsonb),
 ('day-09','day',9,'카이로로 돌아오는 길','{"date": "2027-01-19", "city": "후르가다 · 카이로", "subtitle": "후르가다에서 카이로로 이동하는 날", "tag": "장거리 이동", "morning": "후르가다 리조트 체크아웃", "afternoon": "버스·전용차량·항공편으로 카이로 이동", "evening": "호텔 체크인 및 근처 저녁 식사", "stay": "카이로 1박 (두 번째 숙소)", "move": "후르가다 → 카이로", "note": "버스·차량은 교통상황에 따라 장거리 소요"}'::jsonb),
 ('day-10','day',10,'이집트 대박물관 완전 정복','{"date": "2027-01-20", "city": "기자 · 카이로", "subtitle": "여행의 마지막 하이라이트, GEM 관람", "tag": "박물관", "morning": "대박물관 입장 및 주요 전시 관람", "afternoon": "투탕카멘 전시·메인 갤러리, 선택 가이드", "evening": "자유 관람·기념품 쇼핑·저녁", "stay": "카이로 2박 (두 번째 숙소)", "move": "호텔 ↔ 이집트 대박물관", "note": "공식 웹사이트에서 날짜별 입장시간과 관람권 확인"}'::jsonb),
 ('day-11','day',11,'이집트를 뒤로하고 집으로','{"date": "2027-01-21", "city": "카이로", "subtitle": "마지막 하루는 여유 있게", "tag": "귀국", "morning": "조식 및 짐 정리", "afternoon": "근거리 자유시간 및 점심", "evening": "공항 이동 → 19:00 항공편 출발", "stay": "귀국 비행", "move": "카이로 호텔 → 국제공항", "note": "국제선 약 3시간 전 공항 도착을 목표로 이동"}'::jsonb),
 ('booking-cruise','booking',1,'나일강 크루즈 3박 4일','{"start": "2027-01-13", "end": "2027-01-16", "place": "아스완 → 룩소르", "priority": "필수", "note": "크루즈 시작 및 종료 항구, 포함 신전, 가이드, 왕가의 계곡 확인", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-flight','booking',2,'카이로 → 아스완 국내선','{"start": "2027-01-12", "end": "2027-01-12", "place": "카이로 공항 → 아스완 공항", "priority": "필수", "note": "12일 저녁 출발 권장. 13일 승선 지연 위험 대비", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-giza','booking',3,'기자 피라미드 투어','{"start": "2027-01-12", "end": "2027-01-12", "place": "기자 피라미드·스핑크스", "priority": "필수", "note": "아스완 국내선 출발과 투어 종료시간 충돌 주의", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-cairo-first','booking',4,'카이로 숙소 · 첫날','{"start": "2027-01-11", "end": "2027-01-12", "place": "카이로 · 1박", "priority": "필수", "note": "첫날 공항 및 12일 기자 투어 접근성 우선", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-hurghada','booking',5,'후르가다 리조트','{"start": "2027-01-16", "end": "2027-01-19", "place": "후르가다 · 3박", "priority": "필수", "note": "온수풀/바람 피하는 해변/식사 포함 여부 확인", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-cairo-last','booking',6,'카이로 숙소 · 마지막','{"start": "2027-01-19", "end": "2027-01-21", "place": "카이로 · 2박", "priority": "중요", "note": "GEM 및 귀국 공항 이동 동선 고려", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-aswan','booking',7,'아스완 숙소','{"start": "2027-01-12", "end": "2027-01-13", "place": "아스완 · 1박", "priority": "중요", "note": "크루즈 선착장 접근성 및 늦은 체크인 가능 여부", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-luxor-transfer','booking',8,'룩소르 → 후르가다 이동','{"start": "2027-01-16", "end": "2027-01-16", "place": "룩소르 → 후르가다", "priority": "중요", "note": "크루즈 하선·관광 종료시간에 맞춰 픽업 예약", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-cairo-transfer','booking',9,'후르가다 → 카이로 이동','{"start": "2027-01-19", "end": "2027-01-19", "place": "후르가다 → 카이로", "priority": "중요", "note": "차량·버스·항공편 비교", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('booking-gem','booking',10,'이집트 대박물관 + 가이드','{"start": "2027-01-20", "end": "2027-01-20", "place": "Grand Egyptian Museum", "priority": "선택", "note": "입장권 및 공식 가이드 예약 검토", "status": "미예약", "vendor": "", "price": 0, "currency": "KRW", "url": "", "reference": "", "cancel_by": ""}'::jsonb),
 ('budget-1','budget',1,'국제선 항공권','{"category": "항공", "planned": 0, "spent": 0, "note": ""}'::jsonb),
 ('budget-2','budget',2,'국내선·도시간 이동','{"category": "이동", "planned": 0, "spent": 0, "note": ""}'::jsonb),
 ('budget-3','budget',3,'숙박','{"category": "숙박", "planned": 0, "spent": 0, "note": ""}'::jsonb),
 ('budget-4','budget',4,'나일강 크루즈','{"category": "크루즈", "planned": 0, "spent": 0, "note": ""}'::jsonb),
 ('budget-5','budget',5,'가이드·입장권','{"category": "관광", "planned": 0, "spent": 0, "note": ""}'::jsonb),
 ('budget-6','budget',6,'식비·기타','{"category": "기타", "planned": 0, "spent": 0, "note": ""}'::jsonb),
 ('todo-1','todo',1,'여권 유효기간 및 이집트 비자 확인','{"category": "출국 전", "done": false, "note": ""}'::jsonb),
 ('todo-2','todo',2,'국제선 항공권·수하물·환승 정보 확인','{"category": "출국 전", "done": false, "note": ""}'::jsonb),
 ('todo-3','todo',3,'여행자보험 가입','{"category": "출국 전", "done": false, "note": ""}'::jsonb),
 ('todo-4','todo',4,'국내선 및 크루즈 탑승 바우처 준비','{"category": "예약", "done": false, "note": ""}'::jsonb),
 ('todo-5','todo',5,'숙소 예약번호·체크인 시간 확인','{"category": "예약", "done": false, "note": ""}'::jsonb),
 ('todo-6','todo',6,'룩소르 → 후르가다 픽업 예약','{"category": "예약", "done": false, "note": ""}'::jsonb),
 ('todo-7','todo',7,'유심·eSIM 및 해외결제 카드 준비','{"category": "준비물", "done": false, "note": ""}'::jsonb),
 ('todo-8','todo',8,'상비약·충전기·멀티어댑터 준비','{"category": "준비물", "done": false, "note": ""}'::jsonb),
 ('todo-9','todo',9,'홍해용 래시가드·바람막이 준비','{"category": "준비물", "done": false, "note": ""}'::jsonb),
 ('todo-10','todo',10,'외교부 여행안전정보 확인','{"category": "출국 전", "done": false, "note": ""}'::jsonb)
on conflict (row_key) do nothing;
