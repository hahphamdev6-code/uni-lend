# Uni-Lend API guide for frontend

This inventory describes the backend API in the current workspace branch,
`feature/be-session-after-reset`. The branch has not been merged into `dev` yet.
Recheck the merged code and update the availability status after each backend
branch merge.

## API base and response format

- Local base URL: `http://localhost:8080`
- Prefer paths with the `/api` prefix.
- Successful responses use an `ApiResponse` envelope:

  ```json
  {
    "success": true,
    "message": "Success",
    "data": {},
    "timestamp": "2026-10-22T00:00:00Z"
  }
  ```

- Error responses include `success: false`, `errorCode`, and `message`;
  validation errors may also include `errors`.
- Paginated endpoints return `data` with `content`, `page`, `size`,
  `totalElements`, `totalPages`, and `last`.
- Send authenticated requests with `Authorization: Bearer <token>`.
- A disabled account cannot log in or use authenticated endpoints.
- A `429 TOO_MANY_REQUESTS` response means the login or email-request rate
  limit was reached. Limits are configurable by the backend.

## Authentication and account security

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | JSON: `email`, `password`, `fullName`; returns account data and a bearer token |
| `POST` | `/api/auth/login` | Public | JSON: `email`, `password`; returns account data and a bearer token |
| `POST` | `/api/auth/verify-email` | Public | JSON: `token` |
| `POST` | `/api/auth/resend-verification` | Public | JSON: `email`; response does not disclose whether the account exists |
| `POST` | `/api/auth/forgot-password` | Public | JSON: `email`; response does not disclose whether the account exists |
| `POST` | `/api/auth/reset-password` | Public | JSON: `token`, `newPassword` |
| `GET` | `/api/v1/users/me` | Authenticated | Current account summary |

Authentication responses include `tokenType: "Bearer"` and `token`. Email
verification tokens are valid for 24 hours by default; password-reset tokens
are valid for 15 minutes by default. Both are single-use.

### Session behavior relevant to frontend

- After a successful password reset or `PATCH /api/users/me/password`, discard
  the current bearer token and require the user to log in again. The backend
  increments the account token version, so existing tokens stop working.
- Admin lock and unlock actions also invalidate existing tokens. After an
  account is unlocked, the user must log in again to get a fresh token.
- There is no logout endpoint. For logout, remove the token from frontend
  storage; the token otherwise remains valid until expiry or version
  invalidation.
- If an authenticated request returns `401`, clear the stored token and send
  the user to sign in. A `403` can indicate a disabled account or insufficient
  role; show the backend message.

## User profiles

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/users/me` | Authenticated | Current user's profile |
| `GET` | `/api/users/{id}` | Authenticated | View another user's profile |
| `PUT` | `/api/users/me` | Authenticated | JSON: `fullName`, `phone`, `university`, `avatarUrl` |
| `PATCH` | `/api/users/me/password` | Authenticated | JSON: `oldPassword`, `newPassword`; requires current password and invalidates existing tokens |
| `GET` | `/api/users/{id}/reviews?page=0&size=10` | Public | Paginated reviews for a user |

## Admin APIs

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Dashboard statistics |
| `GET` | `/api/admin/users?keyword=&enabled=&page=0&size=10` | Admin | Search/filter users; `enabled` accepts `true` or `false` |
| `PATCH` | `/api/admin/users/{id}/lock` | Admin | Locks a user and invalidates existing tokens |
| `PATCH` | `/api/admin/users/{id}/unlock` | Admin | Unlocks a user; previous tokens remain invalid |

## Categories

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/categories?page=0&size=10` | Public | Paginated category list |
| `GET` | `/api/categories/{id}` | Public | Category details |
| `POST` | `/api/categories` | Admin | JSON: `name`, `description` |
| `PUT` | `/api/categories/{id}` | Admin | Same body as create |
| `DELETE` | `/api/categories/{id}` | Admin | Deletes a category |

## Items and item images

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/items?keyword=&categoryId=&status=&page=0&size=10` | Public | Search and paginate items |
| `GET` | `/api/items/{id}` | Public | Item details, including image data |
| `GET` | `/api/items/me?page=0&size=10` | Authenticated | Current user's items |
| `POST` | `/api/items` | Authenticated | JSON item body: `title`, `description`, optional `categoryId`, optional `status` |
| `PUT` | `/api/items/{id}` | Owner | Same JSON body; cannot manually set `LENT_OUT` |
| `DELETE` | `/api/items/{id}` | Owner | Fails if the item has loan requests |
| `POST` | `/api/items/{id}/images` | Owner | `multipart/form-data`; image parts named `files` or `images` |
| `DELETE` | `/api/items/{id}/images/{imageId}` | Owner | Deletes one image |
| `GET` | `/uploads/**` | Public | Loads a stored image |

## Loan requests and reviews

Loan status values are `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`,
`OVERDUE`, and `RETURNED`.

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `POST` | `/api/loan-requests` | Authenticated | JSON: `itemId`, `borrowFrom`, `dueDate`, optional `note` |
| `GET` | `/api/loan-requests/mine?status=&page=0&size=10` | Authenticated | Current user's outgoing requests |
| `GET` | `/api/loan-requests/incoming?status=&page=0&size=10` | Authenticated | Requests for items owned by current user |
| `GET` | `/api/loan-requests/overdue?page=0&size=10` | Admin | Paginated overdue requests |
| `GET` | `/api/loan-requests/{id}` | Participant or admin | Request details |
| `PATCH` | `/api/loan-requests/{id}/approve` | Item owner | Approve a pending request |
| `PATCH` | `/api/loan-requests/{id}/reject` | Item owner | Reject a pending request |
| `PATCH` | `/api/loan-requests/{id}/cancel` | Request borrower | Cancel a pending request |
| `PATCH` | `/api/loan-requests/{id}/return` | Item owner | Confirm return of an approved loan |
| `POST` | `/api/loans/{id}/reviews` | Authenticated participant | JSON review body |
| `GET` | `/api/loans/{id}/reviews` | Public | Reviews for a loan |

The loan and review controllers also accept the `/api/loans` or
`/api/loan-requests` route aliases where applicable.

## Notifications

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/notifications?page=0&size=10` | Authenticated | Current user's notifications |
| `GET` | `/api/notifications/unread-count` | Authenticated | Returns the unread count |
| `PATCH` | `/api/notifications/{id}/read` | Authenticated | Marks one notification as read |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Marks all notifications as read |

## Email delivery note

Verification and password-reset email delivery is controlled by backend
environment configuration. If `MAIL_ENABLED=false` (the default), the backend
does not send email; configure SMTP and enable mail in the backend environment
for those flows to deliver messages.
