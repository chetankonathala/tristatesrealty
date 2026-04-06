# E-Sign & Electronic Offer Submission Research

**Project:** Tri States Realty — Schell Brothers brokerage (DE/MD/NJ/PA)
**Domain:** Real estate e-signature + offer submission + transaction management
**Researched:** 2026-04-06
**Overall Confidence:** MEDIUM-HIGH (API docs verified, form licensing confirmed via association sites, legal framework via official state statutes)

---

## 1. DocuSign API for Real Estate

### Architecture Overview

DocuSign's eSignature REST API supports two distinct signing modes relevant to this project:

**Remote Signing (email-driven)**
Buyer submits offer intent on site → server creates envelope via API → DocuSign emails buyer a signing link → buyer signs in DocuSign UI → webhook fires on completion.

**Embedded Signing (stay-on-site)**
Buyer stays inside the Tri States Realty site throughout. Server creates envelope with `clientUserId` on the recipient → API call to `createRecipientView` returns a time-limited signing URL (default 5 min) → site loads URL in iframe or redirect → on completion, DocuSign redirects back to `returnUrl` with event query param.

Recommendation: **Embedded signing** for best UX — buyers never leave the site, branding stays consistent, and completion rates are higher.

### Core API Flow (Embedded)

```
1. POST /v2.1/accounts/{accountId}/envelopes
   Body: {
     templateId: "<offer-template-guid>",
     templateRoles: [{ roleName: "Buyer", name, email, clientUserId }],
     status: "sent"
   }
   → returns envelopeId

2. POST /v2.1/accounts/{accountId}/envelopes/{envelopeId}/views/recipient
   Body: { userName, email, clientUserId, returnUrl, authMethod: "none" }
   → returns { url: "https://app.docusign.com/..." }  (valid ~5 min)

3. Embed or redirect to the signing URL

4. DocuSign Connect (webhook) POSTs to your HTTPS endpoint on:
   - envelope-sent
   - envelope-delivered
   - envelope-completed   ← primary trigger
   - envelope-declined
   - recipient-signed
```

### Templates

- Templates are configured in the DocuSign admin console with tagged fields (signature, date, initials, text).
- The API sends a template by `templateId` and injects signer data at runtime via `templateRoles`.
- **Document Generation** (add-on): Supports conditional clauses so a single template can vary by state or offer terms. Reduces the number of templates to manage across DE/MD/NJ/PA.
- Template gallery includes generic real estate forms; state-specific association forms require a qualifying plan (see pricing below).

### Webhook Events (DocuSign Connect)

- Configure Connect in DocuSign admin or via API (`POST /v2.1/accounts/{id}/connect`).
- Endpoint must be publicly reachable HTTPS with TLS 1.2+.
- Payload format: JSON (preferred) or XML.
- Key envelope events to subscribe: `envelope-sent`, `envelope-completed`, `envelope-declined`, `envelope-voided`.
- Key recipient events: `recipient-signed`, `recipient-declined`.
- Connect 2.0 (current): expands events to include template use, corrections, purges, delegated signing.
- **Note:** Recipient-level webhook known issue — only `envelope-completed` fires on first signer in some configurations; subscribe to both envelope and recipient events for safety.

### Pricing Tiers (2026)

| Plan | Monthly | Annual | Envelopes/mo | Notes |
|------|---------|--------|--------------|-------|
| Personal | ~$15 | ~$120/yr | 5 | No API |
| Standard | ~$45/user | ~$300/yr | Unlimited user sends | No API |
| Business Pro | ~$65/user | ~$480/yr | Unlimited | No API |
| **Real Estate Starter** | ~$10 | ~$120/yr | 5 sends | State assoc. forms access, no custom API |
| **Real Estate NAR** | ~$20/user | ~$240/yr | Unlimited | For NAR members only |
| **Developer API — Starter** | $50 | $600/yr | 40 via API | API access, webhooks |
| **Developer API — Intermediate** | $300 | $3,600/yr | 100 via API | Full API, Connect webhooks |
| **Developer API — Advanced** | $480 | $5,760/yr | 100 via API | Bulk send, advanced features |
| Enterprise | Custom | Custom | Custom | Volume pricing, SSO |

**Overages:** $0.10–$0.50 per envelope beyond quota depending on tier.

**For this project:** Developer API Starter ($600/yr) is sufficient at launch (40 envelopes/mo = ~40 offers/mo). Scale to Intermediate ($3,600/yr) when volume exceeds 40/mo.

**Important:** The Real Estate plans with state association form access do NOT include API access. To both use the API and access state forms within DocuSign, you need a Developer API plan PLUS separately upload your own compliant forms as templates.

### Confidence: MEDIUM-HIGH
Sources: DocuSign developer docs, pricing pages, community forums.

---

## 2. Alternative E-Sign APIs: Comparison

### Quick Comparison Matrix

| Criterion | DocuSign API | Dropbox Sign (HelloSign) API | Adobe Acrobat Sign API | Dotloop |
|-----------|-------------|------------------------------|------------------------|---------|
| Real estate specific | Yes (Rooms, forms library) | Yes (dedicated RE solution page) | No specific RE focus | Yes — purpose-built RE |
| API maturity | Highest — industry standard | High — developer-friendly | High — Adobe ecosystem | Moderate — RE-focused |
| Embedded signing | Yes — `createRecipientView` | Yes — embedded request URL | Yes | No public embed API |
| Webhook support | Yes — Connect 2.0 | Yes | Yes | Yes (limited) |
| Template management | Yes | Yes | Yes | Yes (loops/loop templates) |
| State RE forms library | Yes (with RE plans) | No | No | Yes (via Transactions/zipForm) |
| Developer docs quality | Excellent | Good | Good | Fair |
| API pricing entry | $600/yr (40 env/mo) | $900/yr (50 req/mo) | ~$276/yr (Individual) | Not public |
| Per-envelope overage | $0.10–$0.50 | Volume-based | $0.10–$1.00 | N/A |
| Real estate brand trust | Very high | Medium | Medium | High (agents know it) |
| Custom branding (embedded) | Yes | Yes | Yes | Limited |
| Audit trail / certificate | Yes | Yes | Yes | Yes |

### Dropbox Sign (HelloSign) API

- **Pricing:** $75/mo (Essentials, 50 req/mo), $250/mo (Standard, 100 req/mo), Custom Premium.
- Free sandbox/test mode available.
- Advantages: Simpler API, cleaner developer experience, lower entry cost for low volume.
- Disadvantages: No state association RE forms; less recognized brand in real estate transactions; SharePoint add-in discontinued March 2026.
- **Verdict for this project:** Good fallback if DocuSign costs are prohibitive at launch. Missing state RE form library is a gap you'd have to fill with custom templates.

### Adobe Acrobat Sign API

- **Pricing:** Individual ~$9.99/mo, Standard ~$22.99/user/mo, Business ~$29.99/user/mo, Enterprise custom.
- No real estate-specific form library.
- Strength: Deep PDF tooling (buyers/agents comfortable with Adobe PDF workflows).
- Weakness: No RE industry focus, no state form library, less common in residential RE transactions.
- **Verdict for this project:** Not recommended. No RE advantage over DocuSign; higher per-envelope overages; no form library.

### Dotloop

- Purpose-built for real estate: loop-based workflow matches RE transaction lifecycle.
- Integrates with MLS, CRM (kvCORE), zipForm/Lone Wolf.
- Forms library includes many state RE association forms.
- Public API v2 exists (OAuth 2.0, 3-legged) but is NOT designed for buyer-facing embed on a custom website.
- Pricing: $31.99/mo per agent (single agent), team plans $149–$199/mo.
- **Verdict for this project:** Better as the backend transaction management platform (after offer is signed) than as the signing interface embedded in a buyer-facing site. Use DocuSign or Dropbox Sign for the front-end signing experience; push completed offers into Dotloop for transaction management.

### Recommendation

**Use DocuSign eSign API for the buyer-facing embedded signing experience.** It has the best brand trust with buyers and sellers in residential RE, has the strongest API and webhook system, and is the industry default. Pair it with Dotloop or SkySlope on the back end for the agent's transaction management workflow.

---

## 3. Standard Real Estate Purchase Agreement Forms (DE/MD/NJ/PA)

### Critical Finding: State Association Forms Are Member-Gated

All four states restrict their "official" standard purchase agreement forms to licensed REALTORS who are dues-paying members of their state association. This is a significant constraint for building a self-service offer submission tool.

| State | Association | Form Access | Non-Member Path |
|-------|-------------|-------------|-----------------|
| Delaware | Delaware Association of REALTORS (DAR) | Members only via DAR portal | Requires DAR permission; no public non-member license |
| Maryland | Maryland REALTORS (MAR) | Members only; NAR ID required | Members-only; attorney-drafted forms require member involvement |
| New Jersey | New Jersey REALTORS (NJ REALTORS) | Members only | Contact NJ REALTORS for access — not publicly available |
| Pennsylvania | Pennsylvania Association of Realtors (PAR) | Free for PAR members via Lone Wolf/zipForm | Non-members: limited access pathways; contact PAR |

**Key implication:** The agent (Schell Brothers brokerage, licensed in all four states) is a REALTOR member and has access to forms in all four states through their brokerage membership. Forms cannot be pre-loaded as public templates on a buyer-facing website without association permission.

### Legal Work-Around Paths

1. **Attorney-drafted equivalents:** A real estate attorney in each state can draft a legally equivalent purchase agreement that doesn't rely on association forms. This is common in NJ (attorney review clauses are standard) and is legally valid everywhere.

2. **Generic RE purchase agreement templates (Third-party):** eForms, LawDepot, iPropertyManagement publish state-specific templates that are legally valid but not the "standard" association form agents typically use. These lack state-specific addenda and disclosure checklists.

3. **Agent provides the form, site captures intent:** The agent (or their brokerage) uploads the official form as a DocuSign template within their brokerage account. Buyers fill out property details + terms on the site, the site creates a DocuSign envelope using that private template, and buyer signs. This is the most compliant path.

4. **Dotloop/Lone Wolf integration:** Since Schell Brothers likely uses Lone Wolf/zipForm as a PAR member, forms can be pulled from zipForm into a DocuSign or Dotloop loop programmatically.

### State-Specific Notes

**Delaware**
- Delaware Real Estate Commission (DPRE) publishes some regulatory forms publicly at dpr.delaware.gov.
- DAR member forms (including Residential Agreement of Sale) are members-only.
- Delaware adopted URPERA — electronic recording of deeds and agreements is fully supported by county recorders.

**Maryland**
- MAR Residential Contract of Sale is the dominant form; attorney-prepared; strictly members-only.
- GCAAR (Greater Capital Area Association) covers DC metro Maryland; also members-only.
- NJ has a mandatory 3-business-day attorney review period built into the standard contract — buyers and sellers can void during this window. This must be reflected in the offer flow.

**New Jersey**
- NJ REALTORS Standard Form 118 is the primary residential purchase agreement.
- **Attorney review clause is mandatory by law** (not just standard practice) — any residential purchase contract signed by buyer and seller must contain a 3-day attorney review provision. This is a legal requirement, not just an association convention.
- Cannot waive or omit this clause regardless of e-signature platform used.

**Pennsylvania**
- PAR Standard Agreement for the Sale of Real Estate (ASR) is the form.
- Available free to PAR members via Lone Wolf Transactions (zipForm edition).
- Non-member access is not clearly available — contact PAR directly.
- PA UETA adopted 1999 — one of the first states; e-signatures fully valid on RE purchase agreements.

### Confidence: HIGH for legal requirements, MEDIUM for non-member access paths
Sources: DAR, PAR, MAR official websites; DE state code; NJ UETA statute.

---

## 4. How Other Platforms Handle Offer Submission

### Compass

- Compass does not offer buyer-driven self-service offer submission from the website.
- Compass agents use the internal Compass platform (built on their proprietary tech stack) to prepare and send offers using their transaction management tools.
- Buyers interact with Compass agents directly; the website is primarily a search/browse/lead-gen tool.
- Compass uses DocuSign as its primary e-signature platform for agent-prepared offers.
- **Takeaway:** No self-service buyer offer submission. Agent-initiated only.

### kvCORE (now BoldTrail)

- kvCORE is a CRM/IDX/website platform for brokerages and agents.
- Native integration with Dotloop for e-signatures and transaction management.
- No built-in buyer self-service offer submission — the platform is lead-gen + CRM focused.
- Buyers can submit "offer interest" via lead capture forms, which then trigger agent workflow in kvCORE/Dotloop.
- **Takeaway:** Offer submission is agent-mediated, not buyer self-service. Lead form → agent prepares offer in Dotloop → buyer signs via Dotloop.

### Side.com

- Side is a brokerage-as-a-service platform for independent agents/teams.
- Agents get a branded website + back-office support.
- No public-facing buyer e-offer submission built in.
- Transaction management handled via SkySlope (Side's preferred TMS).
- **Takeaway:** Same pattern — agent-initiated transactions, not buyer self-service portals.

### Broader Industry Pattern

The industry standard for residential real estate is **agent-initiated, not buyer self-service.** No major platform currently offers a fully buyer-driven, legally-binding offer submission without agent involvement. This is intentional:
- Forms are agent/member-gated (see Section 3).
- State laws (especially NJ attorney review) require agent/attorney involvement.
- Lender pre-approval and earnest money logistics require human coordination.

**Implication for Tri States Realty:** The site should position offer submission as "Buyer expresses intent and pre-fills offer terms → Agent finalizes and sends binding offer form for e-signature." Not "Buyer submits binding contract unilaterally." This keeps the workflow legally compliant and within brokerage norms.

### Confidence: MEDIUM
Sources: kvCORE review sites, Compass documentation, Side.com marketing materials, industry knowledge.

---

## 5. Transaction Management Platform Integration

### Dotloop

- **Best for:** Agents who want a single platform for document collaboration, e-signing, and compliance.
- Public API v2 with OAuth 2.0; supports creating loops, adding participants, uploading documents, triggering signatures.
- Facade API: single call to create a loop with property info, contacts, and template — useful for server-side automation.
- Webhook support for loop events.
- Pricing: $31.99/mo single agent, $149–$199/mo team.
- Integrates with: kvCORE, Realvolve, MLS feeds, zipForm/Lone Wolf.
- **Integration path:** After DocuSign offer is completed, server calls Dotloop API to create a new loop, uploads the signed PDF, adds agent and buyer as participants. Agent manages transaction in Dotloop from there.

### SkySlope

- **Best for:** Brokerages that want compliance-first transaction management with AI-powered document routing.
- AI features: Auto-Split and Assign (scans, splits, and routes documents to checklist items automatically).
- API: Beta/BETA — available via ClientID/ClientSecret or user-level Access Keys. Swagger spec downloadable.
- **Webhooks: Not currently offered** (as of 2025/2026 — confirmed by API docs). This is a material limitation.
- Integration via API Nation for custom integrations.
- 24/7 customer support included.
- Integrates with BrokerSumo for commission tracking, Sisu for performance analytics.
- **Integration path:** SkySlope is harder to drive programmatically from a custom site due to no webhooks. Better used as a manual agent tool post-offer.

### TransactionDesk (Lone Wolf Transactions)

- Lone Wolf is the parent company; TransactionDesk is their transaction management product.
- Deeply integrated with zipForm (PAR, and other state association forms).
- Most PAR members (PA) and many MAR/DAR members already have access through their association membership.
- Less developer-friendly API surface than Dotloop.
- **Integration path:** Agent already has access as a PAR member. Forms from zipForm/TransactionDesk can be pulled into DocuSign via existing Lone Wolf + DocuSign integration (pre-built connector exists).

### Recommendation

**Dotloop for transaction management backend.** It has the most robust public API for programmatic integration, is the market leader (~50% of US RE transactions), has state forms library access for agents, and integrates with the MLS tools the agent already uses. After a DocuSign envelope completes, the site auto-creates a Dotloop loop via API and attaches the signed PDF.

SkySlope is technically superior (AI, compliance), but the lack of webhooks makes programmatic integration from a custom site impractical at this time.

---

## 6. Commission Pipeline Automation

### How Commissions Flow in a Residential RE Transaction

```
Offer Accepted
  → Executed contract → Title/escrow opened
  → Inspection/contingency period
  → Clear to close
  → Closing (title company or attorney)
  → Title company/attorney issues Commission Disbursement Authorization (CDA)
  → Wire to Schell Brothers brokerage
  → Brokerage splits commission per agent agreement
```

### Commission Disbursement Authorization (CDA)

- A CDA is the document sent from the brokerage to the title/escrow/attorney specifying how commission funds should be disbursed.
- CDAs are generated in the transaction management system (Dotloop, SkySlope, Paperless Pipeline).
- The closing entity (title company, settlement attorney) follows the CDA to wire funds.
- **Automation:** Dotloop and SkySlope can auto-generate CDAs when a transaction status reaches "clear to close" or a broker approves the file.

### Broker Notification Triggers

Key events that should trigger broker notification:

| Event | Trigger | Channel |
|-------|---------|---------|
| Offer submitted on site | Buyer submits offer form | Email + platform notification |
| Offer signed (DocuSign webhook: `envelope-completed`) | Both parties signed | Email to agent + auto-create transaction |
| Offer accepted (status update in TMS) | Agent marks accepted | Broker dashboard update |
| Contract executed | All signatures complete | TMS compliance checklist starts |
| Under contract | Transaction status change | Broker pipeline view |
| CDA ready | Compliance approved | Title company email |
| Closed | Title company confirms | Commission tracking (BrokerSumo, Loft47, Paperless Pipeline) |

### Commission Tracking Software

- **Brokerage Engine:** Centralized commission tracking, deal status from under contract to closed, income forecasting.
- **Loft47:** REST API + webhook notifications for deal/commission events; automated commission deposits/payouts tied to closings.
- **Paperless Pipeline:** Transaction management + commission tracking; CDA generation.
- **BrokerSumo:** Integrates with SkySlope; handles agent splits, CDA, and disbursement.

**Schell Brothers context:** As a Schell Brothers agent, commission splits and disbursement rules are governed by the brokerage agreement. The agent does not control the commission disbursement system — the brokerage does. The site's responsibility is:
1. Trigger notification to agent on offer submission/completion.
2. Push completed transaction data to whatever TMS the brokerage uses.
3. Track offer status for the agent's pipeline view on the site.

### NAR 2024 Settlement Impact (2026 Enforcement)

The NAR 2024 commission transparency settlement changes:
- Buyer-agent compensation can no longer be offered via MLS.
- Buyers must sign a written buyer representation agreement (BRA) before touring properties.
- Buyer agent compensation must be negotiated separately and disclosed in the purchase contract.
- **Impact on offer form:** The purchase offer template must include a field for buyer agent compensation terms. This is now a required disclosure in all four states.

### Confidence: MEDIUM
Sources: Brokerage Engine, Paperless Pipeline, Loft47 websites; NAR settlement news.

---

## 7. Legal Requirements for E-Signatures on Real Estate Contracts (DE/MD/NJ/PA)

### Federal Baseline

**ESIGN Act (2000):** Federal law establishing that electronic signatures and records are legally equivalent to paper/handwritten signatures for interstate and foreign commerce. Applies to all four states.

**UETA (Uniform Electronic Transactions Act):** Model state law adopted by nearly all states. All four target states have adopted UETA.

### State-by-State Analysis

#### Delaware
- **UETA:** Adopted under Title 6, Chapter 12A of Delaware Code.
- **URPERA:** Adopted — Delaware county recorders may accept electronically signed and recorded documents. County recorders must have the technology to support the specific signature type used.
- **Purchase agreements:** E-signatures valid and enforceable.
- **Recording:** Deeds (which require notarization) require additional steps for e-recording; purchase agreements between parties do not need to be recorded.
- **Confidence:** HIGH (verified via Delaware Code Title 6 Ch 12A and Title 25 recording statutes)

#### Maryland
- **UETA:** Adopted. Electronic signatures valid.
- **Recording:** Maryland adopted URPERA; electronic recording available for deeds.
- **Purchase agreements:** E-signatures valid. MAR Contract of Sale is commonly used; e-signed versions are enforceable.
- **Notarization:** Required for deeds but NOT for purchase agreements — buyer/seller signature on a purchase agreement does not require notarization.
- **Confidence:** HIGH

#### New Jersey
- **UETA:** Adopted June 26, 2001.
- **Purchase agreements:** E-signatures valid and enforceable.
- **CRITICAL — Mandatory Attorney Review Clause:** Under NJ law, every residential real estate purchase contract must include a provision giving both parties a 3-business-day attorney review period after execution. During this window, either party's attorney can disapprove the contract, making it void. This clause cannot be waived or omitted. **Any offer submission flow must account for this.**
  - Practical implication: "Signed" does not mean "binding" in NJ until the attorney review period passes without cancellation.
  - The site should display a clear disclosure: "This offer is subject to a mandatory 3-business-day attorney review period under New Jersey law."
- **Notarization:** Not required for purchase agreements.
- **Confidence:** HIGH (verified via NJ UETA statute and NJ case law re: attorney review)

#### Pennsylvania
- **UETA:** Adopted 1999 — one of the first states; Electronic Transactions Act (Act 69 of 1999).
- **Purchase agreements:** E-signatures valid and enforceable.
- **Requirements for validity:**
  - Mutual agreement to transact electronically.
  - Clear intent to sign (affirmative action — click, type name, draw signature).
  - Record retention capability.
  - Document integrity (no alteration post-signing).
- **Exclusions:** Wills, codicils, testamentary trusts (not relevant here).
- **Recording:** PA deeds require notarization for recording; purchase agreements do not.
- **Confidence:** HIGH (verified via PA Act 69 of 1999 and legal analysis sources)

### What the E-Signature Platform Must Provide

For all four states, the e-signature solution must produce:

| Requirement | DocuSign | Dropbox Sign | Adobe Sign |
|-------------|---------|--------------|------------|
| Audit trail (IP, timestamp, email verification) | Yes | Yes | Yes |
| Certificate of completion | Yes | Yes | Yes |
| Tamper-evident document seal | Yes | Yes | Yes |
| Record retention | Yes (cloud) | Yes (cloud) | Yes (cloud) |
| Consumer consent to e-sign | Yes (shown before signing) | Yes | Yes |

### Excluded Document Types (Do Not E-Sign)

- Deeds (require notarization; use RON — Remote Online Notarization — if going fully electronic)
- Mortgage/deed of trust documents (lender requirements vary)
- These are closing documents, not offer documents. The offer submission flow only covers purchase agreements, which are e-signable in all four states.

### Remote Online Notarization (RON) — Not Required Here

- RON laws are enacted in DE, MD, NJ, PA.
- RON would be relevant for deed signing, power of attorney, etc.
- **Not required for purchase agreements.** Out of scope for the offer submission feature.

---

## 8. Recommended Implementation Architecture

### Recommended Stack for E-Offer Feature

```
Buyer-facing site (Next.js)
  → Offer form (property address, price, terms, contingencies, closing date)
  → On submit: server action calls DocuSign API
      → Creates envelope from brokerage-uploaded template
      → Returns embedded signing URL
  → iframe/redirect to DocuSign focused view
  → On completion: DocuSign Connect webhook fires → envelope-completed
  → Webhook handler:
      → Stores signed PDF in cloud storage
      → Sends email notifications (buyer + agent)
      → Creates Dotloop loop via Dotloop API
      → Updates offer status in site database
  → Agent views offer pipeline on site dashboard
```

### Key Decision Points

1. **Form source:** Agent/brokerage uploads official state forms as private DocuSign templates. Site does not independently host association forms.

2. **Buyer identity verification:** At minimum, collect buyer's legal name + email + phone. For higher assurance, consider ID verification (DocuSign ID Verification add-on or Persona API). Not legally required but recommended for disputed-signature protection.

3. **NJ attorney review disclosure:** Display mandatory disclosure before NJ buyers sign. Store acceptance timestamp.

4. **Buyer representation agreement:** Due to NAR 2024 settlement, buyer must sign a BRA before or at the time of offer. This could be a separate DocuSign envelope or a combined multi-document envelope.

5. **Lender pre-approval:** Standard practice is to attach pre-approval letter with offer. Site should offer a file upload step before the signing flow.

---

## 9. Pitfalls and Risks

### Critical

1. **Using association forms without authorization.** DAR, MAR, PAR, NJ REALTORS forms are member-gated. Hosting them publicly or using them as templates without brokerage authorization violates association rules. Solution: Agent/brokerage uploads forms to their private DocuSign account; site uses templateId to invoke them programmatically.

2. **Omitting NJ mandatory attorney review clause.** Legally required. Omitting it makes the contract void under NJ law. Every NJ offer form must contain it, and buyers must be disclosed.

3. **DocuSign signing URL expiration.** Embedded signing URL expires in 5 minutes by default. If a buyer navigates away and comes back, the URL is stale. Must implement a re-generation flow (re-call `createRecipientView`) on page reload.

4. **Treating NJ "signed" as "binding."** The 3-day attorney review window means a signed NJ contract is not yet binding. Site logic, notifications, and status labels must reflect this.

### Moderate

5. **DocuSign API overage costs.** At Developer Starter plan (40 envelopes/mo), exceeding volume triggers $0.10–$0.50/envelope overages. Monitor usage and upgrade plan proactively.

6. **NAR 2024 settlement buyer agent compensation field.** The purchase contract must include buyer agent compensation terms. If using a form that predates the settlement (pre-August 2024), it may be missing this required field. Verify current form versions with the agent.

7. **No SkySlope webhooks.** If Schell Brothers uses SkySlope as their TMS, programmatic push of completed transactions is limited to polling or manual import. Plan for this before building Dotloop integration.

8. **Multi-state form differences.** A single template won't cover DE/MD/NJ/PA. Need at minimum 4 templates (one per state), potentially more for different property types (condo vs. single family) or transaction types. Factor this into DocuSign plan limits.

### Minor

9. **DocuSign developer plan without state forms.** The API plans don't include state association form access (that's on the Real Estate consumer plans). Template management is entirely up to the agent to upload their authorized forms.

10. **Buyer consent to transact electronically.** UETA requires consent. DocuSign's standard signing flow presents a consent screen before signing — do not bypass this screen. If using embedded signing, ensure the consent prompt is not disabled.

---

## 10. Sources

- [DocuSign eSignature Plans & Pricing for Real Estate](https://ecom.docusign.com/plans-and-pricing/real-estate)
- [DocuSign Developer API Pricing](https://ecom.docusign.com/plans-and-pricing/developer)
- [DocuSign Webhooks Documentation](https://developers.docusign.com/platform/webhooks/)
- [DocuSign Connect (Webhooks)](https://developers.docusign.com/platform/webhooks/connect/)
- [DocuSign Embedded Signing Concepts](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/embedding/embedded-signing/)
- [DocuSign REST API createEnvelope Reference](https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/envelopes/create/)
- [Dropbox Sign API Pricing](https://sign.dropbox.com/products/dropbox-sign-api/pricing)
- [Dropbox Sign for Real Estate Tech](https://sign.dropbox.com/solutions/real-estate-tech)
- [Adobe Acrobat Sign Business Pricing](https://www.adobe.com/acrobat/business/pricing-plans.html)
- [Dotloop Developer Center / Public API v2](https://dotloop.github.io/public-api/)
- [Dotloop Custom Integration](https://www.dotloop.com/integrations/custom-integration/)
- [SkySlope API (Beta)](https://api.skyslope.com/api/docs/openid/SkySlopeApi.html)
- [SkySlope Integrations](https://skyslope.com/integrations/)
- [Delaware Association of REALTORS Member Forms](https://delawarerealtor.com/member-forms/)
- [Delaware Code Title 6 Chapter 12A — UETA](https://delcode.delaware.gov/title6/c012a/index.html)
- [Delaware URPERA](https://www.newcastlede.gov/DocumentCenter/View/3784/DURPERA-PDF)
- [Maryland REALTORS Forms](https://www.mdrealtor.org/Legal-Resources/Forms)
- [PAR Standard Forms](https://www.parealtors.org/standard-forms/)
- [NJ UETA — Chapter 116 Act](https://pub.njleg.gov/bills/2000/PL01/116_.PDF)
- [Electronic Signatures in NJ, NY, PA — Flaster Greenberg](https://www.flastergreenberg.com/newsroom-alerts-Electronic_Signatures_in_NJ_NY_PA_and_FL.html)
- [Pennsylvania UETA Act 69 of 1999](https://www.legis.state.pa.us/cfdocs/legis/li/uconsCheck.cfm?yr=1999&sessInd=0&act=69)
- [DocuSign vs. Dropbox Sign API Rate Limits and Pricing](https://www.esignglobal.com/blog/docusign-vs-dropbox-sign-api-rate-limits-pricing-tier-review-2026)
- [Paperless Pipeline — Commission Software](https://www.paperlesspipeline.com/commission-software-features/)
- [Brokerage Engine — Commission Automation](https://brokerageengine.com/commissions/)
- [Loft47 — Commission Disbursement](https://loft47.com/)
- [Adobe Sign vs DocuSign vs Dropbox Sign — Qwilr](https://qwilr.com/blog/adobe-sign-vs-docusign-vs-dropbox-sign/)
- [DocuSign for Real Estate — Signaturely overview](https://signaturely.com/docusign-for-real-estate/)
