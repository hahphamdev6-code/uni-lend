# Uni-Lend API guide for frontend

This document is the frontend-facing API inventory. Update the availability
column and endpoint details after each backend branch is merged into `dev`.

## API base and response format

- Local base URL: `http://localhost:8080`
- API paths include the `/api` prefix.
- Successful responses use an `ApiResponse` envelope:

  ```json
  {
    "success": true,
    "message": "Success",
    "data": {},
    "timestamp": "2026-10-20T00:00:00Z"
  }
  ```

- Error responses include `success: false`, `errorCode`, and `message`;
  validation errors may also include `errors`.
- Paginated endpoints return `data` with this shape:

  ```json
  {
    "content": [],
    "page": 0,
    "size": 10,
    "totalElements": 0,
    "totalPages": 0,
    "last": true
  }
  ```

- For authenticated requests, use the Bearer scheme in the `Authorization`
  header with the `accessToken` returned by login.
- Unless marked public below, an endpoint requires authentication.

## Available on `dev`

These APIs are present on `dev` as of merge commit `5359d80`.

### Authentication

| Method | Path | Access | Request |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | JSON: `{ "email": "user@example.com", "password": "..." }` |

Success data contains `accessToken`, `tokenType` (`Bearer`), and `expiresAt`.
There is currently no registration endpoint.

### Categories

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/categories?page=0&size=10` | Public | Paginated category list |
| `GET` | `/api/categories/{id}` | Public | Category details |
| `POST` | `/api/categories` | Admin | JSON: `{ "name": "...", "description": "..." }` |
| `PUT` | `/api/categories/{id}` | Admin | Same body as create |
| `DELETE` | `/api/categories/{id}` | Admin | Deletes a category |

### Items and item images

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/items?keyword=&categoryId=&status=&page=0&size=10` | Public | Search and paginate items |
| `GET` | `/api/items/{id}` | Public | Item details, including `imageUrls` and `images` |
| `GET` | `/api/items/me?page=0&size=10` | Authenticated | Current user's items |
| `POST` | `/api/items` | Authenticated | JSON item body: `title`, `description`, optional `categoryId`, optional `status` |
| `PUT` | `/api/items/{id}` | Owner | Same JSON body; cannot manually set `LENT_OUT` |
| `DELETE` | `/api/items/{id}` | Owner | Fails if the item has loan requests |
| `POST` | `/api/items/{id}/images` | Owner | `multipart/form-data`; send image parts named `files` or `images` |
| `DELETE` | `/api/items/{id}/images/{imageId}` | Owner | Deletes one image |
| `GET` | `/uploads/**` | Public | Loads a stored image using its URL |

Image uploads allow at most five images per item and 5 MB per image.
Accepted image types are JPG, PNG, and WEBP.

### User profiles

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/users/me` | Authenticated | Current user's profile |
| `GET` | `/api/users/{id}` | Authenticated | View another user's profile |
| `PUT` | `/api/users/me` | Authenticated | JSON: `fullName`, `phone`, `university`, `avatarUrl` |
| `PATCH` | `/api/users/me/password` | Authenticated | JSON: `oldPassword`, `newPassword` |

### Loan requests

Loan status values are `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, and
`RETURNED`.

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `POST` | `/api/loan-requests` | Authenticated | JSON: `itemId`, `borrowFrom`, `dueDate`, optional `note` |
| `GET` | `/api/loan-requests/mine?status=&page=0&size=10` | Authenticated | Current user's outgoing requests |
| `GET` | `/api/loan-requests/incoming?status=&page=0&size=10` | Authenticated | Requests for items owned by current user |
| `GET` | `/api/loan-requests/{id}` | Participant or admin | Request details |
| `PATCH` | `/api/loan-requests/{id}/approve` | Item owner | Approve a pending request |
| `PATCH` | `/api/loan-requests/{id}/reject` | Item owner | Reject a pending request |
| `PATCH` | `/api/loan-requests/{id}/cancel` | Request borrower | Cancel a pending request |
| `GET` | `/api/loan-requests/overdue?page=0&size=10` | Admin | Paginated overdue requests |
| `PATCH` | `/api/loan-requests/{id}/return` | Item owner | Confirm return of an approved loan |

## Implemented but not yet available on `dev`

The following endpoints are implemented on `feature/be-admin-users` at commit
`0d3b455`. They are not part of the `dev` API until that branch is merged.

| Method | Path | Access | Request / notes |
|---|---|---|---|
| `GET` | `/api/admin/users?keyword=&enabled=&page=0&size=10` | Admin | Search/filter users; `enabled` accepts `true` or `false` |
| `PATCH` | `/api/admin/users/{id}/lock` | Admin | Disable a user; admins cannot lock their own account |
| `PATCH` | `/api/admin/users/{id}/unlock` | Admin | Enable a user |

Admin user changes are committed and pushed, but the frontend should treat
these routes as pending until the planned merge to `dev`.

## Updating this inventory after a branch merge

1. Confirm the backend branch has been merged into `dev`.
2. Review its controller mappings, request/response DTOs, validation, and access
   rules against the code now on `dev`.
3. Move the branch's endpoints from the pending section to the available
   section and update the `dev` merge commit reference.
4. Share this document with the frontend team alongside the merge/PR link.
