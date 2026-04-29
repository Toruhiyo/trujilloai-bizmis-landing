# Privacy Policy

Last updated: April 28, 2026

---

## 1. Introduction

Bizmis ("we", "our", "us") provides an AI-powered voice shopping assistant that is embedded in Shopify stores. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data.

This policy applies to merchants who install the Bizmis app on their Shopify store, and to their customers (end shoppers) who interact with the Bizmis voice assistant.

---

## 2. Data We Collect from Merchants

When a merchant installs and configures the Bizmis app, we collect and store:

- Store name, domain, and description
- Widget configuration preferences (appearance, language, avatar settings)
- Shopify access token and granted OAuth scopes (used solely to operate the app)
- App usage data (pages visited within the admin panel)

---

## 3. Data We Collect from Store Customers

When a customer interacts with the Bizmis voice assistant on a merchant's store, we collect:

- **Email address** — only if the customer is signed in to their account on the store (provided by Shopify's customer context)
- **Voice conversation audio** — the voice interaction is recorded to power the AI assistant
- **Conversation transcripts** — text transcriptions of the voice interactions
- **Browsing activity** — pages visited and navigation timestamps during the session
- **Session metadata** — language preference, session duration, and timestamps

---

## 4. How We Use the Data

We use the collected data to:

- Provide and operate the AI voice shopping assistant
- Process voice interactions in real time
- Generate conversation transcripts for the merchant's analytics dashboard
- Provide session analytics and metrics to the merchant
- Investigate abuse, debug failures, and maintain the security and integrity of the Service

**Lawful basis for processing (GDPR Article 6).** We rely on the following lawful bases under GDPR Article 6 (and equivalent provisions in other jurisdictions):

- **Performance of a contract (Art. 6(1)(b)).** For Merchant data, processing is necessary to deliver the Bizmis app under the Terms of Service. For Store Customer data, processing is carried out on behalf of the Merchant so that the Merchant can fulfill its own contract with the Store Customer.
- **Consent (Art. 6(1)(a)).** Voice recording and conversation transcription only begin after the Store Customer accepts the in-widget consent prompt. Consent can be withdrawn at any time by closing the assistant or contacting us.
- **Legitimate interests (Art. 6(1)(f)).** For security monitoring, abuse prevention, debugging, and aggregate analytics that do not identify individual Store Customers, balanced against the rights and freedoms of the affected individuals.
- **Legal obligation (Art. 6(1)(c)).** When we respond to lawful requests from authorities or honor Shopify's mandatory compliance webhooks.

Bizmis acts as a **data processor** on behalf of the Merchant (the controller) for Store Customer data, and as the **data controller** for Merchant account data and aggregated, non-identifying telemetry. Bizmis does not have a Data Protection Officer (DPO) because data processing is not its core activity within the meaning of GDPR Article 37; you can reach the privacy contact at the email at the end of this policy.

**No training on Store Customer data.** We do not use Store Customer voice recordings, audio, or conversation transcripts to train any AI model. We require our AI sub-processors to refrain from using this data to train their general-purpose models: AWS Bedrock customer data is not used to train any model by default; Anthropic does not train its foundation models on API or Bedrock customer data by default; and the ElevenLabs integration is configured so that conversation audio is not used to improve ElevenLabs's models.

We do not sell personal data to third parties. We do not use customer data for advertising purposes.

---

## 5. Sub-Processors and Third-Party Services

We rely on the following sub-processors and third-party services to operate Bizmis:

- **ElevenLabs** — speech-to-text, text-to-speech, and orchestration of the conversational AI agent (including LLM inference). The agent is configured to use Anthropic's Claude family of large language models for response generation. ElevenLabs stores conversation audio and transcripts so they can be replayed in the merchant analytics dashboard.
- **Anthropic** — provider of the Claude family of large language models. Anthropic processes prompts and outputs via ElevenLabs (for live voice conversations) and via Amazon Bedrock (for our backend tasks such as policy search and session classification).
- **Amazon Web Services (AWS)** — hosting, infrastructure, managed data storage, and model inference (Amazon Bedrock).
- **Shopify** — provides store and customer context data through its APIs and forwards data-subject requests to Bizmis through the mandatory compliance webhooks.

Each sub-processor processes data in accordance with its own privacy policy and the contractual safeguards we have in place with them. We recommend reviewing their policies for details on their data handling practices.

---

## 6. Data Retention

- **Session data** (managed AWS data store) — automatically deleted after 60 minutes of inactivity (TTL)
- **Conversation data** (ElevenLabs) — retained until a deletion request is made
- **Merchant configuration** (managed relational database) — retained while the app is installed; deleted when the merchant uninstalls the app
- **Shopify access tokens** (managed AWS data store) — deleted within 48 hours of app uninstallation

---

## 7. Cookies

The Bizmis widget uses a single cookie to remember whether a customer has accepted the Terms and Conditions:

- **bizmis_voicechat_terms_accepted** — stores consent status; expires after 1 year

We do not use cookies for tracking, analytics, or advertising purposes.

---

## 8. Data Rights

Under applicable privacy laws (including GDPR and CPRA), you have the right to:

- Request access to the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your data
- Restrict or object to certain processing activities
- Lodge a complaint with your local data protection authority

**Store customers:** please contact the merchant (store owner) to exercise your data rights. Merchants can forward data requests to Bizmis through Shopify's mandatory compliance webhooks (`customers/data_request`, `customers/redact`, and `shop/redact`) or by contacting us directly at the email below.

**Merchants:** you can contact us directly at [hello@bizmis.ai](mailto:hello@bizmis.ai) to exercise your data rights.

---

## 9. Data Security

We implement appropriate technical and organizational measures to protect personal data, including encryption in transit (TLS) and at rest, scoped access controls, separation of test and production environments, and regular security reviews. All data processing infrastructure is hosted on AWS with industry-standard security practices.

**Breach notification.** If we become aware of a personal-data breach affecting Merchants or their Store Customers, we will notify the affected Merchant without undue delay and, where feasible, no later than 72 hours after we become aware of it, providing the information required by GDPR Article 33.

---

## 10. Sensitive Data Safeguards

**No voice biometrics.** Bizmis does not perform voice biometric identification and does not use voice recordings to uniquely identify a natural person within the meaning of GDPR Article 9. Voice recordings are processed solely to power the conversational assistant.

**Not directed to children.** The voice assistant is not directed to children under 16 (or under 13 in jurisdictions where COPPA applies). Merchants must not deploy the assistant on stores or pages directed to children below those ages. If we become aware that voice or conversation data was collected from a child without appropriate consent, we will delete the data.

**AI transparency.** The Bizmis voice widget makes its AI nature clear at the start of every conversation through its greeting and on-screen labeling, in line with the EU AI Act (Article 50) and analogous transparency requirements.

---

## 11. International Data Transfers

Data may be processed and stored in the United States and the European Union through our infrastructure providers (AWS) and our other sub-processors (ElevenLabs and Anthropic). Where data is transferred outside the EEA or the UK, we rely on the European Commission's Standard Contractual Clauses (and the UK International Data Transfer Addendum where relevant) and on the equivalent safeguards published by the sub-processor.

---

## 12. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify merchants of material changes through the Bizmis app admin panel or via email. The "Last updated" date at the top of this page indicates when the policy was last revised.

---

## 13. Contact

For questions about this Privacy Policy or our data practices, contact us at: [hello@bizmis.ai](mailto:hello@bizmis.ai)
