# Slooze — Demo Video Script

**Duration**: ~4-5 minutes
**Tool**: Loom / OBS / Screen Studio

---

## [0:00 – 0:20] Opening

> "Hey, I'm Santosh. This is Slooze — a full-stack, role-based food ordering web app
> I built as part of the Slooze take-home assignment. Let me walk you through the app."

Show the login page briefly. Point to the demo user panel.

---

## [0:20 – 1:00] Login as Admin — Nick Fury

- Click "Nick Fury" quick-login button
- Hit Sign In
- Land on Dashboard
- Point out: **Admin badge**, country shown, stat cards

> "Nick Fury is the Admin — he has full access to everything. You can see his
> permission panel at the bottom — all green."

- Show the Permissions card — all 5 actions checked

---

## [1:00 – 1:45] Browse Restaurants as Admin

- Click **Restaurants** in navbar
- Show all 6 restaurants (3 India, 3 America)

> "As Admin, Nick sees restaurants from both India and America — no country filter."

- Select **Spice Garden** — show menu grouped by category
- Add 2x Paneer Butter Masala, 1x Garlic Naan to cart
- Show cart total
- Click **Place Order**
- Show success message

---

## [1:45 – 2:30] Orders — Checkout as Admin

- Navigate to **Orders**
- Show the new CREATED order
- Click **Checkout & Pay**
- Select a payment method from the modal
- Click **Confirm Payment**
- Show order status change to PAID

> "Checkout is restricted to Admin and Manager roles only. Members can only create orders,
> not pay for them."

- Also demonstrate **Cancel Order** on a different CREATED order

---

## [2:30 – 3:10] Login as Captain Marvel — Manager India

- Log out, log back in as `captain_marvel`
- Go to Restaurants

> "Captain Marvel is a Manager assigned to India. Watch what happens to the restaurant list."

- Show only 3 Indian restaurants — no American ones visible
- Point out the country filter message at the top
- Try to navigate to `/restaurants` — only India shows
- Create an order from Biryani House
- Go to Orders — checkout the order
- Show that Checkout button IS available for Manager

---

## [3:10 – 3:40] Login as Thanos — Member India

- Log out, log in as `thanos`
- Go to Dashboard — show permissions (checkout ✗, cancel ✗)

> "Thanos is a Member. He can browse restaurants and create orders, but he cannot
> checkout or cancel. Those buttons are hidden entirely."

- Go to Restaurants — show only India restaurants (ReBAC)
- Add items to cart, place order
- Go to Orders — show the order, but NO checkout or cancel buttons
- Show the message: "Waiting for Manager/Admin to process this order."

---

## [3:40 – 4:10] Admin — Payment Methods

- Log back in as `nick_fury`
- Navigate to **Payments** (only visible in nav for Admin)
- Show existing payment methods
- Click **Add Card** — fill the form
- Submit — show new card appears

> "Payment management is strictly Admin-only. Managers and Members don't even see
> this page in the navigation."

---

## [4:10 – 4:40] Tech Stack Callout

Switch to VS Code or just mention verbally:

> "The backend is NestJS with GraphQL code-first approach, Prisma ORM connected to
> PostgreSQL on Railway. Access control uses JWT for auth, NestJS Guards for RBAC,
> and service-level Prisma query filtering for ReBAC country restrictions.
>
> The frontend is Next.js 14 with App Router, Tailwind CSS, and Apollo Client.
> Deployed on Vercel. The two repos are on my GitHub — links in the submission."

---

## [4:40 – 5:00] Closing

> "That covers the full feature set — role-based access, country-based data isolation,
> order lifecycle management, and payment method administration. Thanks for watching —
> feel free to reach out with any questions."

---

## Recording Tips

- Use 1080p minimum
- Disable notifications before recording
- Use browser zoom 110% for better visibility
- Narrate while you click — don't go too fast
- Upload to Loom (free) and share the link in submission
