# Food Ordering Backend

Node.js, Express, MongoDB (Mongoose), JWT access + refresh tokens, bcryptjs, Joi.

## Run
```
npm install
npm run seed:admin        # creates the first admin
npm run dev
```

## Headers
- Protected routes: `Authorization: Bearer <accessToken>`
- Admin routes (and any request made with an admin token) also need: `x-secret-key: <ADMIN_SECRET_KEY>`

## Roles
`admin`, `restaurantOwner`, `user` (register accepts only `user` or `restaurantOwner`)

## API (base: /api)
| Method | Endpoint | Who | What |
|---|---|---|---|
| POST | /auth/register | public | register (name, email, password, role) |
| POST | /auth/login | public | login, returns accessToken + refreshToken |
| POST | /auth/refresh-token | public | new access + refresh token |
| POST | /auth/logout | logged in | logout (removes refresh token) |
| GET | /auth/me | logged in | own profile |
| GET | /categories | logged in | view categories |
| POST / PUT / DELETE | /categories, /categories/:id | admin | manage categories |
| GET | /restaurants?search=&status= | logged in | browse restaurants |
| GET | /restaurants/:id | logged in | restaurant details |
| POST | /restaurants | owner | create restaurant (one per owner) |
| GET / PUT | /restaurants/my | owner | view / update own restaurant |
| PATCH | /restaurants/my/status | owner | open / closed |
| GET | /foods?search=&category=&isVeg=&minPrice=&maxPrice=&restaurant=&sort=&page=&limit= | logged in | search + filter food |
| GET | /foods/:id | logged in | food details |
| GET | /foods/my | owner | all food of own restaurant |
| POST | /foods | owner | add food |
| PUT / DELETE | /foods/:id | owner | edit / delete own food |
| PATCH | /foods/:id/availability | owner | available / unavailable |
| GET | /cart | user | view cart with total price |
| POST | /cart/items | user | add food `{ foodId, quantity }` |
| PATCH | /cart/items/:foodId | user | `{ action: "increase" or "decrease" }` |
| DELETE | /cart/items/:foodId | user | remove item |
| DELETE | /cart | user | clear cart |
| POST | /orders | user | place order from cart `{ deliveryAddress, note }` |
| GET | /orders?status= | all roles | user: own, owner: own restaurant, admin: all |
| GET | /orders/:id | all roles | order details (ownership checked) |
| PATCH | /orders/:id/status | all roles | `{ status }` (rules below) |
| GET | /admin/stats | admin | users, restaurants, orders, revenue |
| GET | /admin/users?role=&isBlocked=&search= | admin | view users |
| PATCH | /admin/users/:id/block, /unblock | admin | block / unblock user |
| GET | /admin/restaurants | admin | view all restaurants |

## Order status rules
- user: can set `cancelled` only on own `pending` order
- restaurant owner (own restaurant orders only): `pending -> accepted / rejected`, `accepted -> preparing -> out_for_delivery -> delivered`
- admin: same flow as owner, and can cancel before `out_for_delivery`
