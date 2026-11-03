# 백엔드 API 기초 공부 사이트

Endpoint · HTTP Method · Request · Response · 보안(JWT, API Key, CORS) 개념을 공부하는 사이트입니다.

🔗 **사이트 바로가기: https://leesm3528-netizen.github.io/backend-api-study/**

## 기능

| 탭 | 내용 |
|---|---|
| 📘 개념 학습 | Endpoint / HTTP Method / Request / Response / API 보안 — 5개 단원 |
| 🃏 단어 카드 | 핵심 용어 41개 플래시카드, 외움 표시 · 섞기 · 범위 선택 |
| 📝 퀴즈 | 36문제 객관식, 즉시 정답·해설, 최고 점수 기록 |
| ❌ 오답노트 | 틀린 문제 자동 저장, 틀린 문제만 다시 풀기 |

## 다루는 개념

- **Endpoint**: 자원이 어디에 위치하는지 나타내는 URL 경로 (`/api/v1/users`)
- **HTTP Method**: GET · POST · PUT · PATCH · DELETE
- **Request**: Path Variable(`/users/3`), Query Parameter(`/search?keyword=apple`), Request Body(`{"name": "홍길동", "drinks": "김렛"}`)
- **Response**: 상태코드(성공 여부) + 데이터 본문
- **보안**: JWT, API Key, CORS

## 파일 구성

```
├── index.html   # 화면 구조
├── style.css    # 디자인 (라이트/다크 모드)
├── data.js      # 개념 · 단어 · 퀴즈 데이터
├── app.js       # 동작 (카드, 퀴즈, 오답노트)
└── TIL/         # 학습 일지
```

학습 기록(외운 카드, 오답노트)은 브라우저 `localStorage`에 저장됩니다.

## 📚 학습 일지 (TIL)

- [2026-11-03 — 백엔드 API 필수 개념 & 공부 사이트 배포](TIL/2026-11-03.md)
