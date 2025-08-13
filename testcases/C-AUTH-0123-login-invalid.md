---
id: "a3c7c8ce-1a4b-4ee9-9f8b-1a2b3c4d5e6f"
key: "C-AUTH-0123"
title: "ログイン失敗時のエラーメッセージ表示 / Error message on invalid login"
objective:
  ja: "無効な認証情報でログインした場合、汎用的で安全なエラーメッセージを表示する"
  en: "When login with invalid credentials, show a generic, safe error message"
type: "E2E"
priority: "P1"
status: "ready"
owner: "alice"
tags: ["auth", "error-handling", "regression"]
links:
  - type: "requirement"
    target: "../../docs/specs/auth.md#invalid-login"
  - type: "issue"
    target: "https://github.com/example/app/issues/123"
parameters:
  - name: "password_length"
    values: [0, 1, 63, 64, 65]
preconditions:
  - ja: "テストユーザー user@example.com が存在する"
  - en: "Test user user@example.com exists"
postconditions:
  - ja: "アカウントロックは発生しない（試行3回まで）"
  - en: "No account lockout occurs (<= 3 attempts)"
attachments:
  - path: "../assets/auth-error-banner.png"
    caption: "エラー表示例"
steps:
  - id: "S1"
    title: "無効パスワードでログイン"
    action: |
      ja: |
        1. ログイン画面を開く
        2. メールに `user@example.com`、パスワードに `wrong-pass` を入力
        3. 「ログイン」をクリック
      en: |
        1. Open login page
        2. Enter `user@example.com` and `wrong-pass`
        3. Click "Log in"
    expected: |
      ja: |
        ・赤色のアラートで「メールアドレスまたはパスワードが正しくありません」を表示
        ・パスワード欄はクリアされる
        ・HTTPレスポンスは200（画面遷移なし）
      en: |
        - Red alert shows "Email address or password is incorrect"
        - Password field is cleared
        - HTTP response is 200 (no navigation)
  - id: "S2"
    title: "試行回数制限の挙動"
    action: |
      ja: "失敗を3回繰り返す"
      en: "Repeat the failed login 3 times"
    expected: |
      ja: "3回目でCAPTCHA表示、4回目はブロック（仕様通りならNA）"
      en: "CAPTCHA appears at 3rd try; 4th is blocked (NA if not spec)"
createdAt: "2025-08-13T03:00:00Z"
updatedAt: "2025-08-13T03:00:00Z"
version: 1
---

> Notes:
> - UI文言は i18n ファイルに追従すること。
> - エラー内容は具体的にしない（セキュリティ指針）。
