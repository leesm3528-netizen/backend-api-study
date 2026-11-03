// ===== 학습 데이터 =====
const CATEGORIES = ["Endpoint", "HTTP Method", "Request", "Response", "보안"];

const LESSONS = [
  {
    id: "endpoint", cat: "Endpoint", title: "Endpoint (엔드포인트)",
    html: `
<p><b>Endpoint</b>는 <b>"자원(Resource)이 어디에 위치하는지 나타내는 URL 경로(주소)"</b>입니다.
클라이언트는 이 주소로 요청을 보내고, 서버는 주소를 보고 어떤 기능을 실행할지 결정합니다.</p>

<h3>예시</h3>
<pre class="code"><code>/api/users        → 사용자 목록을 가져오는 endpoint
/api/v1/users     → 버전(v1)이 붙은 사용자 endpoint
/api/v1/users/3   → 3번 사용자 한 명</code></pre>

<h3>URL 해부하기</h3>
<div class="url-anatomy">
  <span>https://shop.com</span><span class="p1">/api/v1</span><span class="p2">/users/3</span><span class="p3">?fields=name</span>
</div>
<div class="legend">
  <span><i style="background:var(--surface-2)"></i>도메인(서버 주소)</span>
  <span><i style="background:var(--primary-soft)"></i>API 구분 + 버전</span>
  <span><i style="background:var(--ok-soft)"></i>자원 경로(Endpoint)</span>
  <span><i style="background:var(--warn-soft)"></i>Query Parameter</span>
</div>

<h3>좋은 Endpoint 설계 규칙 (REST 스타일)</h3>
<div class="table-wrap"><table>
<tr><th>규칙</th><th>좋은 예 ✅</th><th>나쁜 예 ❌</th></tr>
<tr><td>자원은 <b>명사</b>로, 행동은 Method로</td><td><code>GET /users</code></td><td><code>/getUsers</code></td></tr>
<tr><td>컬렉션은 <b>복수형</b></td><td><code>/users</code></td><td><code>/user</code></td></tr>
<tr><td><b>소문자</b>, 단어 구분은 하이픈(-)</td><td><code>/order-items</code></td><td><code>/OrderItems</code></td></tr>
<tr><td>계층 관계는 <b>/</b>로 표현</td><td><code>/users/3/orders</code></td><td><code>/userOrders?id=3</code></td></tr>
<tr><td><b>버전</b>을 경로에 표시</td><td><code>/api/v1/users</code></td><td>버전 없이 기존 API를 바꿈</td></tr>
</table></div>

<div class="callout"><b>왜 v1 같은 버전을 붙일까?</b><br>
API를 크게 바꿔야 할 때 <code>/api/v2/users</code>를 새로 만들면, 기존 <code>v1</code>을 쓰는 앱이 갑자기 고장 나지 않아요.</div>

<div class="check"><b>핵심 체크</b><ul>
<li>Endpoint = 자원의 위치를 나타내는 URL 경로</li>
<li>명사 · 복수형 · 소문자 · 버전 표시</li>
<li>"무엇을 할지"는 URL이 아니라 HTTP Method가 결정</li>
</ul></div>`
  },
  {
    id: "method", cat: "HTTP Method", title: "HTTP Method (요청 방식)",
    html: `
<p><b>HTTP Method</b>는 <b>"이 자원에 무엇을 하고 싶은지"</b>를 나타내는 요청 방식입니다.
같은 <code>/api/users</code>라도 Method에 따라 의미가 완전히 달라집니다. 데이터베이스의 <b>CRUD</b>와 짝지어 외우면 쉬워요.</p>

<div class="table-wrap"><table>
<tr><th>Method</th><th>의미</th><th>CRUD</th><th>예시</th><th>Body</th></tr>
<tr><td><span class="m GET">GET</span></td><td>조회</td><td>Read</td><td><code>GET /api/users</code> 사용자 목록</td><td>보통 없음</td></tr>
<tr><td><span class="m POST">POST</span></td><td>생성</td><td>Create</td><td><code>POST /api/users</code> 새 사용자 등록</td><td>있음</td></tr>
<tr><td><span class="m PUT">PUT</span></td><td><b>전체</b> 수정(교체)</td><td>Update</td><td><code>PUT /api/users/3</code> 3번 정보를 통째로 교체</td><td>있음(전체)</td></tr>
<tr><td><span class="m PATCH">PATCH</span></td><td><b>일부</b> 수정</td><td>Update</td><td><code>PATCH /api/users/3</code> 3번의 음료만 변경</td><td>있음(일부)</td></tr>
<tr><td><span class="m DELETE">DELETE</span></td><td>삭제</td><td>Delete</td><td><code>DELETE /api/users/3</code> 3번 삭제</td><td>보통 없음</td></tr>
</table></div>

<h3>PUT vs PATCH — 가장 헷갈리는 부분</h3>
<pre class="code"><code>// 현재 3번 사용자
{ "name": "홍길동", "drinks": "김렛", "age": 30 }

// PUT /api/users/3   → 보낸 내용으로 "전체 교체"
{ "name": "홍길동", "drinks": "모히토" }
// 결과: { "name": "홍길동", "drinks": "모히토" }   ← age가 사라질 수 있음!

// PATCH /api/users/3 → 보낸 필드만 "부분 수정"
{ "drinks": "모히토" }
// 결과: { "name": "홍길동", "drinks": "모히토", "age": 30 }</code></pre>

<h3>멱등성 (Idempotent)</h3>
<p>같은 요청을 <b>여러 번 보내도 결과가 같은</b> 성질입니다.</p>
<ul>
<li><span class="m GET">GET</span> <span class="m PUT">PUT</span> <span class="m DELETE">DELETE</span> → 멱등 (3번을 10번 삭제해도 "3번이 없는 상태"는 같음)</li>
<li><span class="m POST">POST</span> → 멱등 아님 (10번 보내면 사용자 10명이 생김)</li>
</ul>

<div class="check"><b>핵심 체크</b><ul>
<li>GET 조회 · POST 생성 · PUT 전체수정 · PATCH 부분수정 · DELETE 삭제</li>
<li>PUT은 통째로 교체, PATCH는 일부만 변경</li>
<li>POST는 멱등하지 않다</li>
</ul></div>`
  },
  {
    id: "request", cat: "Request", title: "Request (요청)",
    html: `
<p>클라이언트가 서버에 보내는 메시지가 <b>Request</b>입니다. 서버에 값을 전달하는 방법은 크게 세 가지예요.</p>

<h3>① Path Variable (경로 변수)</h3>
<p>URL <b>경로 안에</b> 값을 넣어 <b>특정 자원 하나를 지정</b>할 때 씁니다.</p>
<pre class="code"><code>GET /users/3          → id가 3인 사용자
GET /users/3/orders   → 3번 사용자의 주문 목록

// 서버 쪽 정의 예시 (Express)
app.get("/users/:id", ...)   // :id 자리에 3이 들어옴</code></pre>

<h3>② Query Parameter (쿼리 파라미터)</h3>
<p>URL 끝의 <code>?</code> 뒤에 <code>키=값</code> 형태로 붙이고, 여러 개는 <code>&amp;</code>로 연결합니다. <b>검색 · 필터 · 정렬 · 페이지</b>에 주로 씁니다.</p>
<pre class="code"><code>GET /search?keyword=apple
GET /users?page=2&size=10&sort=name</code></pre>

<div class="callout"><b>구분 요령</b><br>
"<b>어떤 것</b>을 가리키나?" → Path Variable (<code>/users/3</code>)<br>
"<b>어떻게</b> 걸러서/정렬해서 보여줄까?" → Query Parameter (<code>?keyword=apple</code>)</div>

<h3>③ Request Body (요청 본문)</h3>
<p>URL이 아니라 <b>요청 본문</b>에 데이터를 담아 보냅니다. 주로 <span class="m POST">POST</span> <span class="m PUT">PUT</span> <span class="m PATCH">PATCH</span>에서 사용하고, 형식은 대부분 <b>JSON</b>입니다.</p>
<pre class="code"><code>POST /api/users
Content-Type: application/json

{"name": "홍길동", "drinks": "김렛"}</code></pre>

<h3>Header (헤더)</h3>
<p>요청에 대한 <b>부가 정보</b>를 담습니다. 데이터 형식, 인증 토큰 등이 여기 들어가요.</p>
<pre class="code"><code>Content-Type: application/json          ← 본문이 JSON이라는 뜻
Authorization: Bearer eyJhbGciOi...     ← 인증 토큰(JWT)
x-api-key: abc123                       ← API Key</code></pre>

<div class="table-wrap"><table>
<tr><th>위치</th><th>예시</th><th>주 용도</th></tr>
<tr><td>Path Variable</td><td><code>/users/3</code></td><td>특정 자원 식별</td></tr>
<tr><td>Query Parameter</td><td><code>/search?keyword=apple</code></td><td>검색·필터·정렬·페이징</td></tr>
<tr><td>Request Body</td><td><code>{"name":"홍길동"}</code></td><td>생성·수정할 데이터</td></tr>
<tr><td>Header</td><td><code>Authorization: Bearer ...</code></td><td>인증·형식 등 부가정보</td></tr>
</table></div>

<div class="check"><b>핵심 체크</b><ul>
<li>Path Variable과 Query Parameter는 URL에 붙는 값</li>
<li>Request Body는 본문에 담는 데이터 (보통 JSON)</li>
<li>비밀번호 같은 민감 정보는 URL이 아니라 Body로!</li>
</ul></div>`
  },
  {
    id: "response", cat: "Response", title: "Response (응답)",
    html: `
<p>서버가 요청을 처리한 뒤 돌려주는 메시지가 <b>Response</b>입니다.
<b>① 성공 여부(상태코드)</b>와 <b>② 데이터 본문(Body)</b>으로 이루어져 있어요.</p>

<pre class="code"><code>HTTP/1.1 201 Created              ← 상태코드 (성공 여부)
Content-Type: application/json    ← 헤더

{                                 ← 데이터 본문
  "id": 3,
  "name": "홍길동",
  "drinks": "김렛"
}</code></pre>

<h3>상태코드 그룹</h3>
<div class="table-wrap"><table>
<tr><th>범위</th><th>의미</th><th>기억법</th></tr>
<tr><td><b>2xx</b></td><td>성공</td><td>"잘 됐어요"</td></tr>
<tr><td><b>3xx</b></td><td>리다이렉션</td><td>"다른 곳으로 가세요"</td></tr>
<tr><td><b>4xx</b></td><td><b>클라이언트</b> 잘못</td><td>"요청이 이상해요"</td></tr>
<tr><td><b>5xx</b></td><td><b>서버</b> 잘못</td><td>"서버가 고장났어요"</td></tr>
</table></div>

<h3>꼭 외울 상태코드</h3>
<div class="table-wrap"><table>
<tr><th>코드</th><th>이름</th><th>언제?</th></tr>
<tr><td>200</td><td>OK</td><td>요청 성공 (조회, 수정 등)</td></tr>
<tr><td>201</td><td>Created</td><td>POST로 새 자원 생성 성공</td></tr>
<tr><td>204</td><td>No Content</td><td>성공했지만 돌려줄 본문 없음 (주로 DELETE)</td></tr>
<tr><td>400</td><td>Bad Request</td><td>요청 형식이 잘못됨 (필수 값 누락 등)</td></tr>
<tr><td>401</td><td>Unauthorized</td><td><b>인증 실패</b> — 누구인지 모름 (로그인 안 함, 토큰 없음/만료)</td></tr>
<tr><td>403</td><td>Forbidden</td><td><b>권한 없음</b> — 누구인지는 알지만 허락 안 됨</td></tr>
<tr><td>404</td><td>Not Found</td><td>자원이 없음 (<code>/users/999</code>)</td></tr>
<tr><td>409</td><td>Conflict</td><td>충돌 (이미 가입된 이메일 등)</td></tr>
<tr><td>500</td><td>Internal Server Error</td><td>서버 내부 오류</td></tr>
</table></div>

<h3>일관된 응답 형식 예시</h3>
<pre class="code"><code>// 성공
{ "success": true,  "data": { "id": 3, "name": "홍길동" } }

// 실패 (404)
{ "success": false, "error": { "code": "USER_NOT_FOUND", "message": "사용자를 찾을 수 없습니다." } }</code></pre>

<div class="check"><b>핵심 체크</b><ul>
<li>Response = 상태코드(성공 여부) + 데이터 본문</li>
<li>4xx는 클라이언트 탓, 5xx는 서버 탓</li>
<li>401은 "누구세요?", 403은 "알지만 안 돼요"</li>
</ul></div>`
  },
  {
    id: "security", cat: "보안", title: "API 보안 (JWT · API Key · CORS)",
    html: `
<p>API를 외부에 줄 때는 <b>"누가 요청했는지"</b>와 <b>"어디서 요청했는지"</b>를 확인해야 합니다.</p>

<h3>🔑 JWT (JSON Web Token)</h3>
<p>로그인한 <b>사용자</b>를 증명하는 토큰입니다. 로그인 성공 시 서버가 발급하고, 클라이언트는 이후 요청마다 헤더에 담아 보냅니다.</p>
<pre class="code"><code>1) POST /api/login  {"email": "...", "password": "..."}
2) 서버 → { "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjN9.abc..." }
3) GET /api/me
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...</code></pre>
<p>JWT는 점(.)으로 나뉜 <b>세 부분</b>으로 되어 있어요.</p>
<div class="table-wrap"><table>
<tr><th>부분</th><th>내용</th></tr>
<tr><td><b>Header</b></td><td>토큰 종류, 서명 알고리즘 (예: HS256)</td></tr>
<tr><td><b>Payload</b></td><td>사용자 정보(Claim) — userId, 만료시간(exp) 등</td></tr>
<tr><td><b>Signature</b></td><td>서버의 비밀키로 만든 서명 → <b>위조 여부 검증</b></td></tr>
</table></div>
<div class="callout warn"><b>주의!</b> Payload는 암호화가 아니라 <b>Base64 인코딩</b>일 뿐이라 누구나 읽을 수 있어요. 비밀번호 같은 민감 정보는 절대 넣지 마세요. 또한 <b>만료시간(exp)</b>을 짧게 두는 것이 안전합니다.</div>

<h3>🗝️ API Key</h3>
<p>API를 사용하는 <b>애플리케이션(프로젝트)</b>을 식별하는 고유 문자열입니다. 날씨·지도 같은 공개 API에서 많이 씁니다.</p>
<pre class="code"><code>GET /api/weather?city=seoul
x-api-key: sk_live_8f3a...</code></pre>
<ul>
<li>사용량 집계, 요청 수 제한(Rate Limit), 사용자 차단에 활용</li>
<li><b>절대</b> 프론트엔드 코드나 GitHub에 그대로 올리지 말 것 → 서버의 <b>환경변수(.env)</b>에 보관</li>
</ul>

<div class="table-wrap"><table>
<tr><th></th><th>JWT</th><th>API Key</th></tr>
<tr><td>누구를 식별?</td><td>로그인한 <b>사용자</b></td><td>호출하는 <b>앱/프로젝트</b></td></tr>
<tr><td>발급 시점</td><td>로그인할 때마다</td><td>개발자 콘솔에서 한 번</td></tr>
<tr><td>만료</td><td>보통 짧음 (분~시간)</td><td>보통 길거나 없음 (직접 폐기)</td></tr>
<tr><td>전달 위치</td><td><code>Authorization: Bearer ...</code></td><td><code>x-api-key</code> 헤더 등</td></tr>
</table></div>

<h3>🌐 CORS (Cross-Origin Resource Sharing)</h3>
<p>브라우저는 보안을 위해 <b>다른 출처(Origin)</b>로의 요청을 기본적으로 막습니다(<b>동일 출처 정책, SOP</b>).
<b>CORS</b>는 서버가 <b>"이 출처는 허용할게"</b>라고 응답 헤더로 알려주는 규칙이에요.</p>
<p><b>출처(Origin) = 프로토콜 + 도메인 + 포트</b>. 셋 중 하나라도 다르면 다른 출처입니다.</p>
<pre class="code"><code>프론트: http://localhost:3000
백엔드: http://localhost:8080     ← 포트가 달라서 "다른 출처"!

// 서버 응답 헤더
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization</code></pre>
<ul>
<li><b>Preflight</b>: 본 요청 전에 브라우저가 <span class="m" style="background:var(--muted)">OPTIONS</span> 요청으로 "보내도 되나요?"를 먼저 물어봄</li>
<li>CORS 에러는 <b>브라우저</b>가 막는 것 → Postman이나 서버끼리 요청에서는 생기지 않음</li>
<li>해결은 <b>서버(백엔드)</b>에서 허용 출처를 설정해서 함</li>
<li><code>Access-Control-Allow-Origin: *</code> (모두 허용)은 실서비스에선 위험</li>
</ul>

<div class="check"><b>핵심 체크</b><ul>
<li>JWT = 사용자 인증 토큰, Header.Payload.Signature, Bearer로 전달</li>
<li>API Key = 앱 식별용 키, 코드에 노출 금지</li>
<li>CORS = 다른 출처 요청 허용 규칙, 서버에서 설정, 브라우저가 검사</li>
</ul></div>`
  }
];

// ===== 단어 카드 =====
const CARDS = [
  { cat: "Endpoint", term: "Endpoint", def: "자원(Resource)이 어디에 위치하는지 나타내는 URL 경로(주소)", ex: "/api/v1/users" },
  { cat: "Endpoint", term: "Resource (자원)", def: "API가 다루는 대상 데이터. 사용자, 주문, 상품 등. URL에서는 명사·복수형으로 표현", ex: "/users, /orders, /products" },
  { cat: "Endpoint", term: "API 버전 (v1)", def: "API를 크게 바꿀 때 기존 사용자가 깨지지 않도록 경로에 버전을 표시하는 것", ex: "/api/v1/users → /api/v2/users" },
  { cat: "Endpoint", term: "REST API", def: "자원은 URL(명사)로, 행위는 HTTP Method로 표현하는 API 설계 방식", ex: "GET /users  (O)\n/getUsers   (X)" },
  { cat: "Endpoint", term: "API", def: "Application Programming Interface. 프로그램끼리 정해진 규칙으로 데이터를 주고받는 창구", ex: "" },
  { cat: "HTTP Method", term: "GET", def: "자원을 조회(Read)하는 요청. 보통 Body가 없음", ex: "GET /api/users" },
  { cat: "HTTP Method", term: "POST", def: "새 자원을 생성(Create)하는 요청. Body에 데이터를 담음. 멱등하지 않음", ex: "POST /api/users\n{\"name\":\"홍길동\",\"drinks\":\"김렛\"}" },
  { cat: "HTTP Method", term: "PUT", def: "자원 전체를 교체(Update)하는 요청. 보내지 않은 필드는 사라질 수 있음", ex: "PUT /api/users/3" },
  { cat: "HTTP Method", term: "PATCH", def: "자원의 일부만 수정(Update)하는 요청. 보낸 필드만 바뀜", ex: "PATCH /api/users/3\n{\"drinks\":\"모히토\"}" },
  { cat: "HTTP Method", term: "DELETE", def: "자원을 삭제(Delete)하는 요청", ex: "DELETE /api/users/3" },
  { cat: "HTTP Method", term: "CRUD", def: "Create·Read·Update·Delete. 데이터의 기본 4가지 조작 → POST·GET·PUT/PATCH·DELETE", ex: "" },
  { cat: "HTTP Method", term: "멱등성 (Idempotent)", def: "같은 요청을 여러 번 보내도 결과가 같은 성질. GET·PUT·DELETE는 멱등, POST는 아님", ex: "" },
  { cat: "Request", term: "Path Variable", def: "URL 경로 안에 넣는 값. 특정 자원 하나를 식별할 때 사용", ex: "/users/3   (3이 path variable)" },
  { cat: "Request", term: "Query Parameter", def: "URL의 ? 뒤에 키=값으로 붙는 값. 검색·필터·정렬·페이징에 사용, &로 여러 개 연결", ex: "/search?keyword=apple&page=2" },
  { cat: "Request", term: "Request Body", def: "요청 본문에 담아 보내는 데이터. 주로 POST·PUT·PATCH에서 JSON 형식으로 사용", ex: "{\"name\": \"홍길동\", \"drinks\": \"김렛\"}" },
  { cat: "Request", term: "Header", def: "요청/응답의 부가 정보. 데이터 형식, 인증 토큰 등을 담음", ex: "Content-Type: application/json\nAuthorization: Bearer ..." },
  { cat: "Request", term: "Content-Type", def: "본문 데이터의 형식을 알려주는 헤더", ex: "Content-Type: application/json" },
  { cat: "Request", term: "JSON", def: "JavaScript Object Notation. {\"키\": 값} 형태의 가벼운 데이터 형식. API에서 가장 많이 사용", ex: "{\"id\": 3, \"name\": \"홍길동\"}" },
  { cat: "Response", term: "Status Code (상태코드)", def: "요청의 성공/실패 여부를 나타내는 세 자리 숫자. 2xx 성공, 4xx 클라이언트 오류, 5xx 서버 오류", ex: "" },
  { cat: "Response", term: "200 OK", def: "요청 성공", ex: "GET /api/users → 200" },
  { cat: "Response", term: "201 Created", def: "새 자원 생성 성공 (주로 POST의 응답)", ex: "POST /api/users → 201" },
  { cat: "Response", term: "204 No Content", def: "성공했지만 돌려줄 본문이 없음 (주로 DELETE)", ex: "DELETE /api/users/3 → 204" },
  { cat: "Response", term: "400 Bad Request", def: "요청 형식이 잘못됨. 필수 값 누락, 타입 오류 등", ex: "" },
  { cat: "Response", term: "401 Unauthorized", def: "인증 실패. 로그인하지 않았거나 토큰이 없음/만료됨 (\"누구세요?\")", ex: "" },
  { cat: "Response", term: "403 Forbidden", def: "인가 실패. 누구인지는 알지만 권한이 없음 (\"알지만 안 돼요\")", ex: "일반 회원이 관리자 API 호출" },
  { cat: "Response", term: "404 Not Found", def: "요청한 자원이 존재하지 않음", ex: "GET /api/users/999" },
  { cat: "Response", term: "500 Internal Server Error", def: "서버 내부에서 오류가 발생함 (서버 코드 버그 등)", ex: "" },
  { cat: "Response", term: "Response Body", def: "응답 본문. 서버가 돌려주는 실제 데이터 (보통 JSON)", ex: "{\"id\":3,\"name\":\"홍길동\",\"drinks\":\"김렛\"}" },
  { cat: "보안", term: "인증 (Authentication)", def: "\"당신이 누구인지\" 확인하는 것. 실패하면 401", ex: "로그인, JWT 검증" },
  { cat: "보안", term: "인가 (Authorization)", def: "\"당신이 이걸 해도 되는지\" 권한을 확인하는 것. 실패하면 403", ex: "관리자만 삭제 가능" },
  { cat: "보안", term: "JWT", def: "JSON Web Token. 로그인한 사용자를 증명하는 토큰. Header.Payload.Signature 세 부분으로 구성", ex: "Authorization: Bearer eyJhbGci..." },
  { cat: "보안", term: "Bearer 토큰", def: "\"이 토큰을 가진 사람\"을 인증하는 방식. Authorization 헤더에 Bearer + 토큰 형태로 전달", ex: "Authorization: Bearer <token>" },
  { cat: "보안", term: "JWT Payload", def: "JWT의 두 번째 부분. 사용자 정보(Claim)와 만료시간(exp)을 담음. 암호화가 아니라 누구나 읽을 수 있음", ex: "{\"userId\": 3, \"exp\": 1730000000}" },
  { cat: "보안", term: "JWT Signature", def: "JWT의 세 번째 부분. 서버의 비밀키로 만든 서명으로 토큰 위조 여부를 검증", ex: "" },
  { cat: "보안", term: "API Key", def: "API를 호출하는 앱/프로젝트를 식별하는 고유 문자열. 사용량 제한·추적에 사용, 코드에 노출 금지", ex: "x-api-key: sk_live_8f3a..." },
  { cat: "보안", term: "환경변수 (.env)", def: "API Key·비밀키 같은 민감 정보를 코드 밖에 보관하는 방법. GitHub에 올리지 않음", ex: "API_KEY=sk_live_8f3a...\nJWT_SECRET=..." },
  { cat: "보안", term: "CORS", def: "Cross-Origin Resource Sharing. 다른 출처의 요청을 서버가 허용해 주는 규칙. 브라우저가 검사하고 서버에서 설정", ex: "Access-Control-Allow-Origin: http://localhost:3000" },
  { cat: "보안", term: "Origin (출처)", def: "프로토콜 + 도메인 + 포트의 조합. 하나라도 다르면 다른 출처", ex: "http://localhost:3000 ≠ http://localhost:8080" },
  { cat: "보안", term: "SOP (동일 출처 정책)", def: "Same-Origin Policy. 브라우저가 다른 출처로의 요청 결과를 기본적으로 막는 보안 정책", ex: "" },
  { cat: "보안", term: "Preflight 요청", def: "본 요청 전에 브라우저가 OPTIONS 메서드로 서버에 허용 여부를 먼저 묻는 요청", ex: "OPTIONS /api/users" },
  { cat: "보안", term: "Rate Limit", def: "일정 시간 동안 보낼 수 있는 요청 수를 제한하는 것. 초과 시 429 Too Many Requests", ex: "1분에 60회" }
];

// ===== 퀴즈 =====
// a: 정답 인덱스 (0부터)
const QUIZ = [
  { cat: "Endpoint", q: "Endpoint의 뜻으로 가장 알맞은 것은?", o: ["서버의 프로그래밍 언어", "자원이 어디에 위치하는지 나타내는 URL 경로", "데이터베이스 테이블 이름", "응답 데이터의 형식"], a: 1, e: "Endpoint는 자원(Resource)의 위치를 나타내는 URL 경로입니다. 예: /api/v1/users" },
  { cat: "Endpoint", q: "REST 규칙에 가장 잘 맞는 '사용자 목록 조회' API는?", o: ["GET /getUserList", "POST /users/list", "GET /api/users", "GET /api/User"], a: 2, e: "자원은 명사·복수형·소문자로, 행위(조회)는 GET 메서드로 표현합니다." },
  { cat: "Endpoint", q: "/api/v1/users 에서 'v1'을 붙이는 주된 이유는?", o: ["보안을 강화하려고", "API가 바뀌어도 기존 사용자가 깨지지 않도록 버전을 구분하려고", "속도를 빠르게 하려고", "사용자 수를 세려고"], a: 1, e: "버전을 붙이면 v2를 새로 만들어도 v1을 쓰던 클라이언트는 그대로 동작합니다." },
  { cat: "Endpoint", q: "다음 중 REST 설계 원칙에 어긋나는 Endpoint는?", o: ["/users/3/orders", "/order-items", "/deleteUser?id=3", "/api/v2/products"], a: 2, e: "'삭제'라는 행위는 URL이 아니라 DELETE 메서드로 표현해야 합니다 → DELETE /users/3" },
  { cat: "HTTP Method", q: "새로운 사용자를 '생성'할 때 사용하는 HTTP Method는?", o: ["GET", "POST", "PATCH", "DELETE"], a: 1, e: "POST는 새 자원을 생성(Create)할 때 사용합니다." },
  { cat: "HTTP Method", q: "3번 사용자의 '음료(drinks)만' 바꾸고 싶다. 가장 알맞은 요청은?", o: ["PUT /users/3", "PATCH /users/3", "POST /users/3", "GET /users/3?drinks=모히토"], a: 1, e: "일부 필드만 수정할 때는 PATCH, 전체를 교체할 때는 PUT을 씁니다." },
  { cat: "HTTP Method", q: "PUT과 PATCH의 차이로 옳은 것은?", o: ["PUT은 조회, PATCH는 삭제", "PUT은 전체 교체, PATCH는 일부 수정", "PUT은 생성만, PATCH는 수정만", "둘은 완전히 같다"], a: 1, e: "PUT은 자원 전체를 교체하고, PATCH는 보낸 필드만 부분 수정합니다." },
  { cat: "HTTP Method", q: "같은 요청을 여러 번 보내면 결과가 달라지는(멱등하지 않은) Method는?", o: ["GET", "PUT", "DELETE", "POST"], a: 3, e: "POST를 10번 보내면 자원이 10개 생깁니다. 그래서 멱등하지 않아요." },
  { cat: "HTTP Method", q: "CRUD와 HTTP Method의 연결이 틀린 것은?", o: ["Create - POST", "Read - GET", "Update - DELETE", "Delete - DELETE"], a: 2, e: "Update는 PUT 또는 PATCH입니다." },
  { cat: "HTTP Method", q: "GET /api/users 와 POST /api/users 의 관계로 옳은 것은?", o: ["URL이 같으니 같은 기능이다", "URL은 같지만 Method가 달라 서로 다른 기능이다", "POST는 GET의 오타다", "둘 다 사용자를 삭제한다"], a: 1, e: "같은 Endpoint라도 Method에 따라 조회(GET)와 생성(POST)으로 의미가 달라집니다." },
  { cat: "Request", q: "/users/3 에서 '3'은 무엇인가?", o: ["Query Parameter", "Request Body", "Path Variable", "Header"], a: 2, e: "URL 경로 안에 들어가 특정 자원을 식별하는 값은 Path Variable입니다." },
  { cat: "Request", q: "/search?keyword=apple 에서 keyword=apple 은 무엇인가?", o: ["Path Variable", "Query Parameter", "Status Code", "Request Body"], a: 1, e: "? 뒤에 키=값 형태로 붙는 값은 Query Parameter입니다." },
  { cat: "Request", q: "검색어, 정렬 기준, 페이지 번호를 전달할 때 가장 적합한 방법은?", o: ["Query Parameter", "Path Variable", "응답 상태코드", "CORS 헤더"], a: 0, e: "검색·필터·정렬·페이징처럼 '어떻게 보여줄지'는 Query Parameter가 적합합니다. 예: ?keyword=apple&page=2" },
  { cat: "Request", q: "아래 요청에서 {\"name\": \"홍길동\", \"drinks\": \"김렛\"} 부분은?", code: "POST /api/users\nContent-Type: application/json\n\n{\"name\": \"홍길동\", \"drinks\": \"김렛\"}", o: ["Request Body", "Query Parameter", "Path Variable", "Response Body"], a: 0, e: "요청 본문에 담아 보내는 데이터는 Request Body입니다. 주로 POST·PUT·PATCH에서 사용합니다." },
  { cat: "Request", q: "Request Body가 JSON 형식임을 서버에 알려주는 헤더는?", o: ["Authorization", "Content-Type: application/json", "Access-Control-Allow-Origin", "x-api-key"], a: 1, e: "Content-Type 헤더는 본문의 데이터 형식을 알려줍니다." },
  { cat: "Request", q: "로그인 시 비밀번호를 보내는 방법으로 가장 안전한 것은?", o: ["/login?password=1234", "/login/1234", "POST 요청의 Body에 담아 HTTPS로 전송", "응답 헤더에 담기"], a: 2, e: "URL(Path/Query)은 브라우저 기록·서버 로그에 남을 수 있어 민감 정보는 Body로 보냅니다." },
  { cat: "Request", q: "Query Parameter를 여러 개 연결할 때 사용하는 기호는?", o: ["/", "#", "&", ","], a: 2, e: "예: /users?page=2&size=10&sort=name" },
  { cat: "Response", q: "Response를 구성하는 두 가지 핵심 요소는?", o: ["Endpoint와 Method", "상태코드(성공 여부)와 데이터 본문", "JWT와 API Key", "Path와 Query"], a: 1, e: "응답은 상태코드로 성공 여부를 알리고, 본문에 데이터를 담아 돌려줍니다." },
  { cat: "Response", q: "POST로 새 사용자를 성공적으로 만들었을 때 가장 알맞은 상태코드는?", o: ["200 OK", "201 Created", "204 No Content", "404 Not Found"], a: 1, e: "새 자원 생성 성공은 201 Created가 가장 정확합니다." },
  { cat: "Response", q: "존재하지 않는 /users/999 를 조회했을 때의 상태코드는?", o: ["400", "401", "404", "500"], a: 2, e: "요청한 자원이 없으면 404 Not Found." },
  { cat: "Response", q: "로그인하지 않은(토큰 없는) 사용자가 내 정보 API를 호출했다. 상태코드는?", o: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "500 Internal Server Error"], a: 0, e: "인증(누구인지) 자체가 안 됐으면 401입니다." },
  { cat: "Response", q: "로그인한 일반 회원이 관리자 전용 API를 호출했다. 상태코드는?", o: ["401 Unauthorized", "403 Forbidden", "201 Created", "204 No Content"], a: 1, e: "누구인지는 알지만 권한이 없으면 403 Forbidden입니다." },
  { cat: "Response", q: "5xx 상태코드가 의미하는 것은?", o: ["요청 성공", "클라이언트의 잘못된 요청", "서버 내부의 오류", "리다이렉션"], a: 2, e: "4xx는 클라이언트 잘못, 5xx는 서버 잘못입니다." },
  { cat: "Response", q: "필수 값(name)을 빼고 사용자 생성 요청을 보냈다. 가장 알맞은 상태코드는?", o: ["200 OK", "400 Bad Request", "403 Forbidden", "500 Internal Server Error"], a: 1, e: "요청 형식/값이 잘못된 경우는 400 Bad Request입니다." },
  { cat: "Response", q: "DELETE 성공 후 돌려줄 본문이 없을 때 자주 쓰는 상태코드는?", o: ["201", "204", "301", "409"], a: 1, e: "204 No Content: 성공했지만 본문이 없음." },
  { cat: "보안", q: "JWT를 요청에 담아 보내는 일반적인 방법은?", o: ["URL 경로에 넣는다", "Authorization: Bearer <토큰> 헤더", "Query Parameter ?jwt=", "응답 본문"], a: 1, e: "JWT는 보통 Authorization 헤더에 Bearer 방식으로 담아 보냅니다." },
  { cat: "보안", q: "JWT의 세 부분을 순서대로 바르게 나열한 것은?", o: ["Header.Payload.Signature", "Payload.Header.Signature", "Key.Value.Secret", "Header.Body.Footer"], a: 0, e: "JWT = Header.Payload.Signature (점으로 구분)" },
  { cat: "보안", q: "JWT Payload에 넣으면 안 되는 정보는?", o: ["userId", "만료시간(exp)", "비밀번호", "권한(role)"], a: 2, e: "Payload는 암호화가 아니라 Base64 인코딩이라 누구나 읽을 수 있으므로 비밀번호를 넣으면 안 됩니다." },
  { cat: "보안", q: "JWT의 Signature(서명)의 역할은?", o: ["토큰을 압축한다", "토큰이 위조·변조되지 않았는지 검증한다", "사용자 이름을 숨긴다", "CORS를 허용한다"], a: 1, e: "서버의 비밀키로 만든 서명을 검증해 위조 여부를 확인합니다." },
  { cat: "보안", q: "API Key에 대한 설명으로 틀린 것은?", o: ["API를 호출하는 앱/프로젝트를 식별한다", "사용량 제한(Rate Limit)에 활용된다", "편의를 위해 프론트엔드 코드와 GitHub에 그대로 올려도 된다", "서버의 환경변수(.env)에 보관하는 것이 좋다"], a: 2, e: "API Key가 노출되면 다른 사람이 무단으로 사용할 수 있으니 코드에 직접 넣거나 공개 저장소에 올리면 안 됩니다." },
  { cat: "보안", q: "JWT와 API Key를 비교한 것 중 옳은 것은?", o: ["JWT는 앱 식별, API Key는 사용자 식별", "JWT는 주로 로그인한 사용자 식별, API Key는 주로 앱/프로젝트 식별", "둘 다 브라우저 출처를 검사한다", "둘 다 만료가 없다"], a: 1, e: "JWT는 '어떤 사용자인가', API Key는 '어떤 앱/프로젝트인가'를 주로 식별합니다." },
  { cat: "보안", q: "CORS가 필요한 상황은?", o: ["같은 출처끼리 요청할 때", "프론트(localhost:3000)가 백엔드(localhost:8080)에 요청할 때", "서버끼리 통신할 때", "Postman으로 테스트할 때"], a: 1, e: "포트가 다르면 다른 출처입니다. 브라우저가 막기 때문에 서버에서 CORS를 허용해야 합니다." },
  { cat: "보안", q: "Origin(출처)을 결정하는 요소의 조합은?", o: ["도메인 + 경로", "프로토콜 + 도메인 + 포트", "IP + 쿠키", "Method + URL"], a: 1, e: "프로토콜·도메인·포트 중 하나라도 다르면 다른 출처입니다." },
  { cat: "보안", q: "CORS 에러를 해결하는 올바른 방법은?", o: ["프론트엔드에서 에러를 무시한다", "서버에서 Access-Control-Allow-Origin 등으로 허용할 출처를 설정한다", "Method를 모두 GET으로 바꾼다", "JWT를 삭제한다"], a: 1, e: "CORS는 서버가 응답 헤더로 허용 출처를 알려줘야 해결됩니다." },
  { cat: "보안", q: "본 요청 전에 브라우저가 OPTIONS 메서드로 허용 여부를 먼저 묻는 것을 무엇이라 하나?", o: ["Preflight 요청", "Redirect", "Rate Limit", "Handshake Token"], a: 0, e: "Preflight 요청으로 허용된 Method·Header인지 먼저 확인합니다." },
  { cat: "보안", q: "'인증(Authentication)'과 '인가(Authorization)'의 설명으로 옳은 것은?", o: ["인증=권한 확인, 인가=신원 확인", "인증=신원 확인(누구?), 인가=권한 확인(해도 되나?)", "둘은 같은 말이다", "인증은 CORS, 인가는 API Key"], a: 1, e: "인증 실패는 401, 인가 실패는 403과 연결해서 기억하세요." }
];
