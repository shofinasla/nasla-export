# Architecture

Browser
  |
  v
Next.js App Router
  |-- Public storefront
  |-- Customer account
  |-- Admin CMS
  |-- API routes
  |
  +--> Supabase Auth
  +--> Supabase PostgreSQL + RLS
  +--> Supabase Storage (private assets)
  |
  +--> Registrar API (future)
  +--> Payment Gateway (future)
  +--> Email provider (future)
  +--> WhatsApp / CRM (future)

## Roles
customer:
- own profile
- own orders
- own order items
- own inquiries

admin:
- CMS
- customers
- orders
- inquiries
- settings
- content
- domain/template catalog

## Principle
The UI never receives a service-role key. Authorization is enforced server-side and with Supabase RLS.
