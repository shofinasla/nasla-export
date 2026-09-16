# Production Checklist

## Security
- [ ] Rotate all development secrets before launch.
- [ ] Service-role key only on server.
- [ ] Review every RLS policy.
- [ ] Add rate limits.
- [ ] Validate uploads.
- [ ] Use private Storage for paid assets.
- [ ] Verify payment webhook signatures.

## Commerce
- [ ] Registrar integration tested in sandbox.
- [ ] Payment integration tested in sandbox.
- [ ] Order state machine defined.
- [ ] Idempotent webhook handling.
- [ ] Invoice/receipt generation.
- [ ] Refund/cancellation policy.

## SEO
- [ ] Metadata per page.
- [ ] Canonical URLs.
- [ ] robots.txt.
- [ ] sitemap.xml.
- [ ] Open Graph.
- [ ] Organization/Website/Product/Article schema as applicable.
- [ ] International hreflang when locale pages are implemented.

## Operations
- [ ] Error monitoring.
- [ ] Database backups.
- [ ] Deployment environment separation.
- [ ] Admin account recovery.
- [ ] Transactional email.
- [ ] Customer support workflow.
