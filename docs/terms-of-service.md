# Terms of Service

Last updated: April 28, 2026

---

## 1. Introduction & Acceptance

These Terms of Service ("Terms") govern your access to and use of the Bizmis service ("Service"), an AI-powered voice shopping assistant for Shopify stores operated by Bizmis ("Bizmis", "we", "our", "us"). By installing the Bizmis Shopify app, accessing our website, or interacting with the Bizmis voice widget on a merchant's storefront, you agree to be bound by these Terms.

These Terms apply to two distinct groups: (a) **merchants** who install the Bizmis app on their Shopify store, and (b) **store customers** (end shoppers) who interact with the Bizmis voice assistant on a merchant's storefront. Sections that apply only to one group are clearly labeled.

If you do not agree with any part of these Terms, do not install the app and do not interact with the Bizmis widget.

---

## 2. Definitions

- **"Service"** means the Bizmis voice assistant, Shopify embedded admin app, theme app extension, backend APIs, and related analytics dashboards.
- **"Merchant"** means a Shopify store owner or authorized operator who installs the Bizmis app on their store.
- **"Store Customer"** means an end shopper who interacts with the Bizmis voice assistant on a Merchant's storefront.
- **"Subscription"** means the recurring plan a Merchant selects through the Bizmis admin app, billed through Shopify's billing system.
- **"Minutes"** means the unit of voice usage consumed by Store Customer interactions, tracked per billing period.

---

## 3. Service Description

Bizmis provides an AI-powered voice shopping assistant embedded in Shopify storefronts. The Service includes:

- A voice widget that greets Store Customers, answers questions, helps them browse products, and guides them toward checkout.
- Multilingual conversation support powered by third-party speech-to-text, text-to-speech, and large language model providers.
- Merchant-facing analytics, including conversation transcripts, session replays, and aggregate usage metrics.
- Configuration tools (avatars, greetings, theme, sales and support guidelines) accessible through the embedded Shopify admin.

**The Service does not:** place orders, take payments, complete checkout, modify orders after they are placed, issue refunds, modify the contents of a Store Customer's cart on their behalf, or provide professional legal, medical, or financial advice. Checkout, payment, and order-modification flows are handled exclusively by Shopify and the Merchant's own storefront, not by the Bizmis assistant.

**Explicit confirmation for any write action.** Where the assistant performs an action that touches a Store Customer's data on a Merchant-controlled form (for example, pre-filling a newsletter signup or a contact form with the Store Customer's email and phone number), it does so only after explicit voice confirmation by the Store Customer of the values to be entered. The Store Customer always retains the final click to submit the form. If we re-introduce cart-related capabilities in the future, those will operate under the same explicit-voice-confirmation pattern: the assistant will read back the product, variant, and quantity, and only proceed after the Store Customer's affirmative response.

---

## 4. Eligibility & Account (Merchants)

To install and use the Service as a Merchant, you must:

- Be at least 18 years old (or the age of majority in your jurisdiction) and legally able to enter into binding contracts.
- Operate the Shopify store on which the Service is installed, or be expressly authorized to act on behalf of the store owner.
- Comply with Shopify's [Terms of Service](https://www.shopify.com/legal/terms), [Acceptable Use Policy](https://www.shopify.com/legal/aup), and [API License and Terms of Use](https://www.shopify.com/legal/api-terms).
- Provide accurate Merchant information and keep it up to date.

You are responsible for safeguarding any credentials used to access the embedded Bizmis admin and for all activity that occurs under your Shopify session.

---

## 5. Voice Recording & Data Processing Consent (Store Customers)

By interacting with the Bizmis voice assistant on a Merchant's storefront, you acknowledge and agree that:

- Your voice input is captured and streamed in real time to power the AI conversation.
- Audio recordings, conversation transcripts, and session metadata (e.g., language, timestamps, navigation events) are generated and stored on the Merchant's behalf for analytics and quality purposes.
- Voice and text data are processed by our sub-processors, including:
  - **ElevenLabs** — speech-to-text, text-to-speech, and orchestration of the conversational AI agent (including LLM inference). The agent is configured to use Anthropic's Claude family of large language models for response generation.
  - **Anthropic** — provider of the Claude family of large language models, used by ElevenLabs for live voice conversations and by our backend (through Amazon Bedrock) for background tasks such as policy search and session classification.
  - **Amazon Web Services (AWS)** — hosting, managed data storage, and model inference (Amazon Bedrock).

  A current list of sub-processors, the data they receive, retention windows, and regions of processing is published in our [Privacy Policy](/privacy).
- **No training on Store Customer data.** Bizmis does not use Store Customer voice recordings, audio, or conversation transcripts to train any AI model. We require our AI sub-processors to refrain from using this data to train their general-purpose models: AWS Bedrock customer data is not used to train any model by default; Anthropic does not train its foundation models on API or Bedrock customer data by default; and the ElevenLabs integration is configured so that conversation audio is not used to improve ElevenLabs's models.
- **No voice biometrics.** Bizmis does not perform voice biometric identification and does not use voice recordings to uniquely identify a natural person within the meaning of GDPR Article 9. Voice recordings are processed solely to power the conversational assistant.
- **Not directed to children.** The voice assistant is not directed to children under 16 (or under 13 in jurisdictions where COPPA applies). Merchants must not deploy the assistant on stores or pages directed to children below those ages. If we become aware that voice or conversation data was collected from a child without appropriate consent, we will delete the data.

The voice assistant is opt-in: you start a conversation only by clicking the widget. You may stop a conversation at any time and decline to use the assistant. Cookie-based consent preferences are described in our Privacy Policy.

---

## 6. Acceptable Use

The Service is provided for lawful e-commerce use. You agree not to (and not to allow any third party to):

**Merchants:**

- Use the Service in any manner that violates Shopify's Acceptable Use Policy, applicable consumer-protection law, or advertising standards.
- Configure the assistant to make false, misleading, or deceptive product, pricing, or availability claims.
- Resell, sublicense, or build a competing product using responses returned by the Service.
- Scrape, mirror, or systematically extract data from the Service outside of the documented APIs and the embedded analytics dashboard.
- Use the Service to sell, market, or distribute prohibited goods or services (firearms, illegal drugs, deceptive financial schemes, content that violates intellectual-property rights, etc.).

**Store Customers:**

- Use the Service for any unlawful or harassing purpose.
- Attempt to disrupt, overload, probe, or interfere with the Service or the underlying infrastructure.
- Reverse-engineer, decompile, or extract source code from the Service.
- Use automated tools, bots, or scripts to interact with the voice assistant.
- Transmit abusive, threatening, hateful, or otherwise harmful content through the voice interface.

---

## 7. Merchant Responsibilities

As a Merchant, you are solely responsible for:

- The accuracy of your product catalog, pricing, inventory, shipping, returns, and store policies. The voice assistant surfaces and summarizes information that originates from your Shopify store; if that source data is wrong, the assistant's response will be wrong.
- Customizing the sales and support guidelines you provide to the assistant so that they comply with applicable advertising and consumer-protection law.
- Notifying Store Customers, in your own privacy notice and in any cookie banner you operate, that an AI voice assistant processes voice and conversation data on your store, naming Bizmis as a service provider/sub-processor where required by law.
- Responding to data-subject requests from your Store Customers under GDPR, CPRA, or any other applicable privacy law. Bizmis will assist in good faith but acts as your sub-processor for Store Customer data.
- Observing usage limits and billing caps you configure inside the Bizmis admin.

---

## 8. AI-Generated Content

The Service uses artificial intelligence (large language models and speech models) to generate responses in real time. AI output can be inaccurate, incomplete, or out of date.

- Information provided by the assistant should not be treated as professional advice (legal, medical, financial, or otherwise).
- Store Customers should verify product specifications, pricing, shipping, and return information directly on the Merchant's storefront before completing a purchase.
- Bizmis is not liable for decisions made or actions taken on the basis of AI-generated responses.
- Merchants are responsible for the accuracy of any product-specific information they configure in the assistant.

**AI transparency.** In compliance with the EU Artificial Intelligence Act (Article 50, transparency obligations for AI systems intended to interact directly with natural persons) and analogous laws in other jurisdictions, the Bizmis voice widget makes its AI nature clear at the start of every conversation through its greeting and on-screen labeling. Store Customers are informed that they are interacting with an AI assistant rather than a human.

---

## 9. Subscription Plans, Billing & Free Preview (Merchants)

The Service is offered to Merchants on tiered Subscription plans. Current plan names, pricing, included Minutes, and overage rates are published on our [Pricing page](/pricing) and inside the embedded Subscription page in the Bizmis admin. By subscribing you authorize the recurring charges shown on the Shopify confirmation screen.

- **Billing through Shopify.** All payments are handled exclusively by Shopify Billing. Bizmis does not store payment-card details and does not invoice Merchants directly.
- **Billing periods.** Monthly plans bill upfront every 30 days. Yearly plans bill upfront for the full year.
- **Included Minutes.** Each plan includes a fixed pool of Minutes that resets at the start of every billing period. Unused Minutes do not roll over.
- **Overage (monthly plans only).** Voice usage beyond the included pool is billed as overage at the per-minute rate published for your plan, capped at the overage limit you set inside the Bizmis admin (and at Shopify's per-app capped amount). When the cap is reached, voice usage is paused until the next billing period or until you raise the cap. Yearly plans do not include overage; voice usage is paused once included Minutes are exhausted.
- **Free preview.** New stores receive a limited pool of preview Minutes so the Merchant can evaluate the Service before subscribing. While preview Minutes remain, the voice widget is fully functional on the Merchant's storefront. Once preview Minutes are exhausted (or the trial window ends), the widget is hidden from Store Customers and a paid Subscription is required to make it visible again. The embedded Bizmis admin remains accessible to the Merchant throughout, so they can subscribe at any time.
- **Plan changes.** Upgrades (higher tier or monthly to yearly) take effect immediately and are charged a prorated difference for the remaining billing period; usage counters are not reset. Downgrades (lower tier or yearly to monthly) take effect at the next renewal; you keep the higher entitlements until then.
- **Discount codes.** Promotional codes may be offered from time to time and are applied through Shopify's billing flow. Discounts apply to commitment fees only and not to overage usage.
- **Taxes.** Prices are exclusive of any applicable taxes, which are added by Shopify Billing where required.

---

## 10. Cancellation & Refunds (Merchants)

You may cancel your Subscription at any time from the embedded Subscription page in the Bizmis admin (or by uninstalling the app from your Shopify store).

- **Effective date of cancellation.** Cancellation takes effect immediately. The Bizmis voice widget stops serving Store Customers on your storefront as soon as the cancellation is confirmed; in-flight conversations are interrupted.
- **Monthly plans — no refunds.** Charges already billed for the current monthly period are non-refundable, and unused Minutes in the current period are forfeited. You will not be billed again going forward.
- **Yearly plans — 30-day money-back guarantee.** If you cancel a yearly plan within 30 days of the initial yearly charge, we will refund the commitment fee for that yearly period, no questions asked. The 30-day guarantee does not apply to renewal years (only the first yearly charge) or to overage usage.
- **Reactivation.** You may resubscribe at any time. Pricing in effect at the time of resubscription applies; we cannot guarantee that previously available promotional rates will still be honored.

We may, in our sole discretion, grant additional refunds or service credits beyond what is required by these Terms. Doing so in one instance does not waive our right to enforce this policy in any other instance.

---

## 11. Suspension & Termination by Bizmis

We may suspend or terminate your access to the Service, in whole or in part, on the following grounds:

- Material breach of these Terms or the Acceptable Use section.
- Use of the Service that exposes Bizmis or our sub-processors to legal, security, or reputational risk.
- Compliance with law, court order, Shopify, or a sub-processor.
- Failure to pay amounts due (as collected through Shopify Billing).

**Notice and cure.** We will give you reasonable advance notice and an opportunity to cure the issue before suspending or terminating your access. Suspension or termination *without prior notice* is limited to circumstances where (a) prompt action is required by law, court order, Shopify, or a sub-processor; (b) it is reasonably necessary to protect the security or integrity of the Service, our users, or our sub-processors; or (c) you remain in material breach after a reasonable opportunity to cure.

**Service discontinuation.** We may also discontinue the Service in its entirety on at least 30 days' notice; if we do, we will offer a prorated refund of any unused prepaid yearly fees.

---

## 12. Data, Privacy, Sub-Processors & Security

Our collection, use, retention, and deletion of Merchant and Store Customer data are described in our [Privacy Policy](/privacy), which is incorporated into these Terms by reference.

- **Merchant data.** Merchants own their store data (catalog, customer, order, and configuration data). Bizmis receives that data only to operate the Service and acts as a processor / service provider on the Merchant's behalf.
- **Store Customer data.** Bizmis processes Store Customer voice and conversation data as a sub-processor to the Merchant. Data-subject requests are honored through Shopify's mandatory compliance webhooks (`customers/data_request`, `customers/redact`, and `shop/redact`) and through direct contact at [hello@bizmis.ai](mailto:hello@bizmis.ai).
- **Uninstallation.** When a Merchant uninstalls the app, we delete or anonymize Merchant configuration data within the windows described in the Privacy Policy. Shopify access tokens are revoked and removed promptly.
- **Protected customer data scopes.** The Service requests only the Shopify access scopes needed to operate its features. Where a feature requires Shopify "protected customer data" scopes (such as `read_customers` or `read_orders`), Bizmis applies additional safeguards consistent with Shopify's Protected Customer Data Requirements: encryption in transit and at rest, separation of test and production environments, least-privilege access controls, and explicit retention limits described in the Privacy Policy. The Service does not sell or share protected customer data with third parties for advertising.

**Data Processing Addendum (GDPR Article 28).** Where Bizmis processes Personal Data of Store Customers on behalf of a Merchant, this Section 12, together with the Privacy Policy, constitutes a Data Processing Addendum between the Merchant (controller) and Bizmis (processor) for the purposes of GDPR Article 28. It describes the subject-matter and duration of processing (provision of the Service for the term of the Subscription), the nature and purpose (operating the AI voice assistant and related analytics), the types of Personal Data and categories of data subjects (Store Customer voice, conversation, and session metadata), and the obligations and rights of the Merchant. Merchants requiring a separately signed DPA — including with the EU Standard Contractual Clauses for international transfers — may request one at [hello@bizmis.ai](mailto:hello@bizmis.ai); we will execute one in good faith.

**Security.** Bizmis maintains commercially reasonable technical and organizational measures designed to protect Merchant and Store Customer data, including encryption in transit (TLS), encryption at rest, access controls based on least privilege, separation of test and production data, audit logging of administrative actions, and regular security reviews of our sub-processors.

**Breach notification.** We will notify affected Merchants without undue delay, and in any event within 72 hours of becoming aware of a confirmed Personal Data Breach affecting their data, with the information required under applicable law (including a description of the nature of the breach, categories of data affected, likely consequences, and measures taken or proposed to address the breach).

---

## 13. Service Availability & Changes

We aim to make the Service continuously available but do not guarantee uninterrupted operation. The Service may be temporarily unavailable due to maintenance, updates, third-party outages (Shopify, ElevenLabs, AWS, etc.), or circumstances beyond our reasonable control.

We may add, modify, or remove features at any time. Material changes that reduce Service functionality you were paying for will be announced through the embedded Bizmis admin or by email with reasonable notice.

---

## 14. Intellectual Property

All intellectual-property rights in the Service, including software, trained models, design, audio assets, and Bizmis branding, are owned by Bizmis or our licensors. Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for the duration of your Subscription.

You retain all rights in your Merchant content (product data, guidelines, configuration). You grant us a worldwide, royalty-free license to host, store, transmit, transform, and display that content solely as needed to provide the Service.

Nothing in these Terms grants you rights to use the Bizmis trademarks, logos, or trade dress, except as strictly necessary to identify the Service inside your Shopify admin.

---

## 15. Disclaimers

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE". TO THE MAXIMUM EXTENT PERMITTED BY LAW, BIZMIS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTY ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT AI RESPONSES WILL BE ACCURATE.

---

## 16. Limitation of Liability

To the maximum extent permitted by applicable law, Bizmis shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost revenue, lost data, lost goodwill, lost sales, or business interruption, arising out of or related to the Service, even if advised of the possibility of such damages and regardless of the legal theory (contract, tort, statute, or otherwise).

Our total aggregate liability for all claims arising out of or related to these Terms or the Service shall not exceed the **lesser** of (a) the fees actually paid by the Merchant to Bizmis for the Service in the six (6) months preceding the event giving rise to the claim and (b) one hundred US dollars (USD 100). For Store Customers, who pay no fee directly to Bizmis, the cap is one hundred US dollars (USD 100). This cap applies on an aggregate basis across all claims and all events.

**Statutory exceptions.** Nothing in these Terms excludes or limits liability for (a) gross negligence, willful misconduct, or fraud (Spanish Civil Code Article 1102 and equivalent rules in other jurisdictions render any waiver automatically void); (b) statutory liability under the GDPR (Article 82) and equivalent data-protection laws; or (c) any other liability that cannot be limited or excluded under applicable law. These exceptions are listed solely because the law does not allow us to waive them; they are not granted as additional rights and Bizmis denies that any of them is engaged by the Service.

---

## 17. Indemnification

**Merchant indemnification of Bizmis.** Merchants agree to defend, indemnify, and hold harmless Bizmis and its officers, directors, employees, contractors, and agents from and against any and all claims, demands, damages, losses, liabilities, fines, penalties, costs, and expenses (including reasonable attorneys' fees and the cost of regulatory inquiries) arising out of or related to:

- your breach of these Terms or of the Privacy Policy;
- your products, listings, store content, prices, refund and shipping policies, or sales and support guidelines;
- any output the Service generates based on the content, guidelines, or instructions you provide;
- your violation of any applicable law (including consumer protection, advertising, tax, and data-protection laws) or of any third-party right (including intellectual-property, privacy, and publicity rights);
- your relationship with your Store Customers, including their purchases, returns, complaints, and data-subject requests;
- your use of the Service in combination with products, services, or data not authorized by Bizmis, or your modification of the Service.

Bizmis may, at its option, control the defense and settlement of any indemnified claim, in which case the Merchant will cooperate at the Merchant's expense. The Merchant may not settle any claim that imposes any obligation on Bizmis without Bizmis's prior written consent.

**No reciprocal indemnification by Bizmis.** The Service is provided AS IS under Section 15. Bizmis does not indemnify, defend, or hold harmless Merchants, Store Customers, or any third party in respect of the Service or any claim arising out of or related to it. This is a deliberate allocation of risk reflected in the pricing of the Service.

---

## 18. Force Majeure

Neither party will be liable for any delay or failure to perform its obligations under these Terms (other than a payment obligation) caused by events beyond its reasonable control, including acts of god, war, terrorism, civil unrest, governmental action, labor disputes, internet or telecommunications outages, denial-of-service attacks, or failures of third-party providers (including Shopify, ElevenLabs, and AWS).

---

## 19. Changes to These Terms

We may update these Terms from time to time. We will notify Merchants of material changes through the Bizmis admin app or by email at least fourteen (14) days before the changes take effect, where reasonably practicable. Your continued use of the Service after the changes take effect constitutes acceptance of the updated Terms. If you do not agree, you must stop using the Service and may cancel your Subscription as described in Section 10.

---

## 20. Governing Law & Dispute Resolution

These Terms are governed by and construed in accordance with the laws of Spain, without regard to its conflict of laws principles. The parties submit to the exclusive jurisdiction of the courts of Barcelona, Spain for any dispute arising out of or related to these Terms or the Service, except that either party may seek injunctive relief in any court of competent jurisdiction to protect its intellectual-property rights.

Nothing in this Section limits any non-waivable rights you may have as a consumer under the laws of your country of residence.

---

## 21. General

- **Entire agreement.** These Terms, together with the Privacy Policy and any plan-specific terms shown at checkout, constitute the entire agreement between you and Bizmis regarding the Service and supersede any prior agreement on the same subject.
- **Severability.** If any provision of these Terms is held unenforceable, that provision will be modified only to the extent necessary to make it enforceable, and the remaining provisions will remain in full force.
- **No waiver.** Our failure to enforce any right or provision under these Terms is not a waiver of that right or provision.
- **Assignment.** You may not assign or transfer these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of substantially all our assets.
- **Notices.** We may give notice through the Bizmis admin app, by email to the address associated with your Shopify account, or by posting on our website. You may give notice to us at [hello@bizmis.ai](mailto:hello@bizmis.ai).
- **Survival.** Sections 8 (AI-Generated Content), 10 (Cancellation & Refunds), 12 (Data, Privacy, Sub-Processors & Security), 14 (Intellectual Property), 15 (Disclaimers), 16 (Limitation of Liability), 17 (Indemnification), 20 (Governing Law), and 21 (General) survive termination of these Terms.

---

## 22. Contact

For questions about these Terms or for Service support, contact Bizmis at: [hello@bizmis.ai](mailto:hello@bizmis.ai). If you require a postal address (for example, to exercise a right under applicable law), please write to us at the address above and we will provide it on request.
