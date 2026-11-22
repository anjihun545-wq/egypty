# EGYPT 2027 · 우리 둘의 이집트 여행계획서

**2027년 1월 11일~21일 / 10박 11일 / 2인 공동편집 여행 사이트**

사이트를 GitHub Pages에 올릴 수 있는 **정적 HTML, CSS, JavaScript** 프로젝트입니다. **공동 저장은 Supabase**에 연결한 후 활성화됩니다.

## 한눈에 보기

- 날짜별 11일 여행 일정 (오전·오후·저녁·숙소·이동·메모 수정)
- 예약 10개 항목 (기자 피라미드, 크루즈, 카이로/후르가다 숙소, 카이로→아스완 항공 등)
- 예약 상태 `미예약 / 예약 중 / 예약 완료`, 업체명·예약번호·금액·링크 입력
- 지출 예산·실제 지출 자동 합산(원화)
- 여행 준비 체크리스트
- **각자 이메일/비밀번호 로그인**, 두 사람의 수정 데이터 동기화
- 데이터베이스 행 단위 저장 + 같은 항목 동시 수정 시 버전 충돌 차단
- 모바일 반응형 / JSON 백업 / 공유 링크

### 중요한 구분

- **Supabase 설정 전**: 체험 모드. 수정 내용은 **현재 브라우저(localStorage)에만 저장**되어 다른 사람과 공유되지 않습니다.
- **Supabase 설정 후**: 두 계정으로 로그인하며 수정 내용은 Supabase 데이터베이스에 저장되고 두 사람 화면에 실시간 반영됩니다. 인터넷 연결이 필요합니다.
- 계정 정보, 카드번호, 비밀번호, 여권번호를 공개 GitHub 저장소나 여행 메모에 넣지 마세요. 이 사이트에는 결제나 항공권 자동 예약 기능이 없습니다.
- 바우처는 파일 직접 업로드가 아니라 **본인이 접근 권한을 설정한 파일 링크**를 등록하는 방식입니다.

---

## 1. GitHub Pages 업로드하기

1. GitHub (https://github.com)에 로그인합니다.
2. 오른쪽 위 `+` → `New repository`로 새 저장소(예: `egypt-trip-2027`)를 만듭니다.
3. `Add file` → `Upload files`로 **이 ZIP을 풀어 나온 폴더 안의 파일들**을 업로드합니다. `index.html` 파일이 저장소 최상위에 있어야 합니다. ZIP **자체를 올리면 사이트가 뜨지 않습니다.**
4. `Settings` → `Pages` → `Build and deployment` → `Deploy from a branch`를 선택합니다.
5. `Branch: main`, `Folder: /(root)` → `Save`를 누릅니다.
6. `https://깃허브아이디.github.io/egypt-trip-2027/` 형태의 주소가 만들어집니다.

여기까지만 하면 **데모 버전**입니다. 다른 사람과 함께 저장하는 기능은 아래 2~5단계를 마쳐야 합니다.

> 참고: 무료 GitHub Pages는 일반적으로 공개 저장소에서 쓸 수 있습니다. 여행 정보의 DB 접근은 뒤에서 설정할 Supabase 로그인과 RLS가 차단하지만, 기본 파일(seed.js)에 들어 있는 여행 예시 일정은 웹사이트 소스에도 공개됩니다.

## 2. Supabase 프로젝트 만들기

1. https://supabase.com 에서 로그인합니다.
2. `New project`를 눌러 `egypt-2027` 같은 이름으로 프로젝트를 만듭니다.
3. 프로젝트 생성 후 `SQL Editor` → `New query`를 엽니다.
4. 이 프로젝트의 **`supabase-setup.sql` 파일 전체**를 복사해 붙여넣습니다.
5. 아래의 두 이메일을 **실제로 로그인할 두 사람의 이메일로 바꾸고** `Run`을 누릅니다.

```sql
insert into public.allowed_editors (email) values
 ('FIRST_EMAIL@example.com'),
 ('SECOND_EMAIL@example.com')
on conflict (email) do nothing;
```

주의: 이 이메일은 **SQL Editor에서만** 수정하세요. 개인 이메일을 공개 GitHub 저장소 코드에 올리지 않아도 됩니다. 이미 SQL을 실행한 뒤 이메일을 바꾸려면 다음 쿼리로 기존 예시 주소를 지우고 실제 이메일을 추가하세요.

```sql
delete from public.allowed_editors where email in ('FIRST_EMAIL@example.com','SECOND_EMAIL@example.com');
insert into public.allowed_editors(email) values
 ('본인이메일@example.com'),('동행인이메일@example.com')
on conflict do nothing;
```

스크립트를 실행하면 날짜별 일정, 예약, 예산, 체크리스트가 데이터베이스에 자동 생성됩니다. **다시 실행해도 기존에 편집한 일정은 덮어쓰지 않습니다.**

## 3. 두 사람의 로그인 계정 만들기

1. Supabase 대시보드에서 `Authentication` → `Users`로 이동합니다.
2. `Add user` → `Create new user`(현재 대시보드의 명칭은 달라질 수 있음)를 눌러 본인 이메일/개별 비밀번호를 설정합니다.
3. 동행인의 이메일/개별 비밀번호로 두 번째 사용자를 만듭니다.
4. 이메일 인증(확인) 상태가 필요한 경우 계정을 확정합니다.
5. `Authentication` → `Providers` → `Email`에서 **일반 사용자가 스스로 회원가입할 수 있는 옵션을 끄는 것을 권장**합니다. 본 사이트에는 회원가입 버튼이 없습니다.

각자 다른 이메일과 비밀번호로 로그인합니다. **하나의 비밀번호를 서로 공유할 필요가 없습니다.**

## 4. 공개 가능한 Supabase 연결 키 복사

Supabase 대시보드 → `Project Settings` 또는 `Connect` → `API Keys`에서 아래 2개를 찾습니다.

- **Project URL** (예: `https://xxxxx.supabase.co`)
- **Publishable key** (예: `sb_publishable_...`)

`config.js` 파일을 열어 다음을 채웁니다.

```javascript
window.EGYPT_CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabasePublishableKey: 'sb_publishable_여기에_공개키'
};
```

**절대로 `secret` / `service_role` 키, 데이터베이스 비밀번호를 붙여넣지 마세요.** Publishable key는 브라우저 공개용으로 설계되어 있으며 실제 데이터 접근 권한은 `supabase-setup.sql`의 RLS 정책으로 제한됩니다.

저장한 `config.js`를 GitHub 저장소에 다시 업로드(교체)합니다. 잠시 후 웹사이트에서 로그인 화면이 나타납니다.

## 5. 2인 동기화 테스트

1. 첫 번째 컴퓨터(또는 브라우저)에서 사이트를 열고 본인 계정으로 로그인합니다.
2. 동행인도 다른 컴퓨터/휴대전화에서 같은 주소를 열고 본인 계정으로 로그인합니다.
3. 첫 번째 사람이 `예약 관리 → 나일강 크루즈 → 상태: 예약 중`으로 바꿉니다.
4. 두 번째 사람에게도 상태가 나타나는지 확인합니다. 새로고침 후에도 유지되는지 확인합니다.
5. 둘이 서로 다른 날짜의 메모를 수정한 후 정상적으로 저장되는지 확인합니다.
6. **같은 날짜의 같은 내용을 동시에 편집한 경우** 늦게 저장한 사람에게 충돌 안내가 나타나고, 앞서 저장한 내용을 덮어쓰지 않아야 합니다.

### 상대방 수정이 즉시 보이지 않는다면

- Supabase `Database → Publications`에서 `supabase_realtime`에 `public.travel_records`가 등록되어 있는지 확인합니다 (SQL에서 기본 등록).
- 사용자 둘 다 `Authentication > Users`에 있는지, SQL `allowed_editors`에 이메일이 정확히 일치하는지 확인합니다.
- 브라우저에서 새로고침 후 수정 여부를 확인합니다. 실시간 연결이 끊겨도 서버 저장에 성공한 데이터는 새로고침하면 반영됩니다.

## 파일 설명

| 파일 | 역할 |
| --- | --- |
| `index.html` | 사이트 시작 화면 |
| `styles.css` | 데스크톱/모바일 디자인 |
| `app.js` | 일정 편집, 예약 변경, 데이터 저장, 로그인, 동기화 |
| `seed.js` | Supabase 미연결 데모 초기 데이터 |
| `config.js` | 본인의 Supabase URL/Publishable key 입력 |
| `supabase-setup.sql` | 공동 편집자 접근 제한(RLS), DB 구조 및 초기 데이터 |
| `assets/` | 사이트 이미지·아이콘 |
| `.nojekyll` | GitHub Pages 정적 배포 지원 |
| `generate_seed.py`·`seed.json` | 초기 데이터 관리 보조 자료 (웹사이트 실행에는 불필요) |

## 자주 묻는 질문

**Q. 지금 ZIP만 GitHub에 올리면 둘이 바로 편집할 수 있나요?**

아니요. ZIP만 올리면 데모 모드이며 한 사람의 브라우저에만 저장됩니다. **Supabase 2~4단계가 필수**입니다.

**Q. 로그인 없이 링크만 알면 편집할 수 있나요?**

아니요. Supabase 연결 후에는 미등록 이메일이 DB를 열 수 없도록 RLS로 접근을 제한했습니다.

**Q. 무료로 가능한가요?**

소규모 사용은 GitHub Pages, Supabase 무료 플랜 범위에서 시작할 수 있습니다. 다만 무료 플랜의 사용량 제한이나 프로젝트 비활성화 정책은 서비스 제공자에 따라 바뀔 수 있습니다.

**Q. 다른 두 장소를 동시에 수정하면 덮어써지나요?**

서로 다른 날짜나 예약 항목은 DB에서 별도 행으로 저장됩니다. 같은 항목에 거의 동시에 저장하면 버전을 비교해 뒤에 저장한 내용을 거절하도록 구현했습니다. 다만 온라인 협업 문서처럼 글자 하나씩 병합하는 실시간 공동 타이핑은 아닙니다.

**Q. 관광지 가격이나 항공편이 자동으로 갱신되나요?**

아니요. 여행계획서의 내용은 초기 조사에 기반한 계획이며 예약금액·항공편·운영시간은 직접 확인하여 업데이트해야 합니다.

---

공식 참고자료: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [Supabase Auth](https://supabase.com/docs/guides/auth), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase Realtime](https://supabase.com/docs/guides/realtime/postgres-changes)
