import Footer from "@/components/Footer";
import PublicPageLayout from "@/components/PublicPageLayout";
import Seo from "@/components/Seo";

const LAST_UPDATED = "September 7, 2026";
const CONTACT_EMAIL = "hello@bizmis.ai";

const PrivacyPolicy = () => {
  return (
    <PublicPageLayout className="bg-white">
      <Seo
        title="Privacy Policy — Bizmis"
        description="How Bizmis collects, uses, and protects shopper and merchant data inside Shopify storefronts."
        path="/privacy"
      />
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-500 mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <Section title="1. Introduction">
            <p>
              Bizmis ("we", "our", "us") provides an AI-powered voice shopping
              assistant that is embedded in Shopify stores. This Privacy Policy
              explains what data we collect, how we use it, and your rights
              regarding that data.
            </p>
            <p>
              This policy applies to merchants who install the Bizmis app on
              their Shopify store, and to their customers (end shoppers) who
              interact with the Bizmis voice assistant.
            </p>
          </Section>

          <Section title="2. Data We Collect from Merchants">
            <p>
              When a merchant installs and configures the Bizmis app, we collect
              and store:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Store name, domain, and description</li>
              <li>Widget configuration preferences (appearance, language, avatar settings)</li>
              <li>Shopify access token and granted OAuth scopes (used solely to operate the app)</li>
              <li>
                Product catalog and collection data (titles, descriptions,
                prices, images, availability), indexed so the assistant can
                search and recommend the store's products
              </li>
              <li>
                Store policies and support pages (shipping, returns, privacy,
                FAQ), read so the assistant can answer support questions from
                the merchant's own content
              </li>
            </ul>
          </Section>

          <Section title="3. Data We Collect from Store Customers">
            <p>
              When a customer interacts with the Bizmis voice assistant on a
              merchant's store, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Email address</strong> -- only if the customer is signed
                in to their account on the store (provided by Shopify's customer
                context)
              </li>
              <li>
                <strong>Name</strong> -- the customer's first name, only if the
                customer is signed in, used to address the customer naturally
                during the conversation
              </li>
              <li>
                <strong>Order history</strong> -- only if the customer is signed
                in, the customer's recent orders (order numbers, dates, items,
                totals, and financial and fulfillment status), used so the
                assistant can answer order and support questions
              </li>
              <li>
                <strong>Shipping and fulfillment details</strong> -- only if the
                customer is signed in, the shipping destination (city, region,
                country) and the fulfillment and tracking status of recent
                orders, used to answer delivery and "where is my order" questions
              </li>
              <li>
                <strong>Details the customer chooses to share</strong> -- any
                information the customer volunteers during the conversation,
                whether signed in or not (for example an email address or
                phone number dictated so the assistant can fill in the store's
                contact form)
              </li>
              <li>
                <strong>Voice conversation audio</strong> -- the voice
                interaction is recorded to power the AI assistant
              </li>
              <li>
                <strong>Conversation transcripts</strong> -- text transcriptions
                of voice interactions and the messages exchanged in text chat
              </li>
              <li>
                <strong>Browsing activity</strong> -- pages visited and
                navigation timestamps during the session
              </li>
              <li>
                <strong>Session metadata</strong> -- language preference,
                session duration, timestamps, and the outcome of the
                microphone permission request
              </li>
              <li>
                <strong>Widget session replay</strong> -- once a customer
                starts interacting with the assistant, a visual replay of the
                customer's browser session on the store (page structure,
                scrolling, clicks, and the assistant's on-screen state) is
                recorded through PostHog so we can debug and improve the
                widget. Form fields and other text inputs are masked before
                recording; the replay does not contain audio. Sessions where
                the customer never interacts with the assistant are not sent.
              </li>
            </ul>
            <p>
              Order history, name, and shipping details are retrieved from
              Shopify on demand during the conversation to answer the shopper's
              questions. They are provided to the AI assistant as temporary
              session context and the raw Shopify records are not stored in
              our databases beyond the live session. Note that whatever the
              assistant says about an order (for example an order number or a
              delivery status) becomes part of the conversation transcript and
              is retained with it.
            </p>
          </Section>

          <Section title="4. How We Use the Data">
            <p>We use the collected data to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and operate the AI voice shopping assistant</li>
              <li>Process voice interactions in real time</li>
              <li>Generate conversation transcripts for the merchant's analytics dashboard</li>
              <li>Provide session analytics and metrics to the merchant</li>
              <li>
                Review widget session replays to debug failures and improve
                the assistant's usability
              </li>
              <li>
                Investigate abuse, debug failures, and maintain the security
                and integrity of the Service
              </li>
            </ul>
            <p>
              <strong>Lawful basis for processing (GDPR Article 6).</strong>{" "}
              We rely on the following lawful bases under GDPR Article 6
              (and equivalent provisions in other jurisdictions):
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Performance of a contract (Art. 6(1)(b)).</strong>{" "}
                For Merchant data, processing is necessary to deliver the
                Bizmis app under the Terms of Service. For Store Customer
                data, processing is carried out on behalf of the Merchant so
                that the Merchant can fulfill its own contract with the
                Store Customer.
              </li>
              <li>
                <strong>Consent (Art. 6(1)(a)).</strong> Voice recording and
                conversation transcription only begin after the Store
                Customer accepts the in-widget consent prompt. Consent can
                be withdrawn at any time by closing the assistant or
                contacting us.
              </li>
              <li>
                <strong>Legitimate interests (Art. 6(1)(f)).</strong> For
                security monitoring, abuse prevention, debugging, and
                aggregate analytics that do not identify individual Store
                Customers, balanced against the rights and freedoms of the
                affected individuals.
              </li>
              <li>
                <strong>Legal obligation (Art. 6(1)(c)).</strong> When we
                respond to lawful requests from authorities or honor
                Shopify's mandatory compliance webhooks.
              </li>
            </ul>
            <p>
              Bizmis acts as a <strong>data processor</strong> on behalf of
              the Merchant (the controller) for Store Customer data, and as
              the <strong>data controller</strong> for Merchant account data
              and aggregated, non-identifying telemetry. Bizmis does not have
              a Data Protection Officer (DPO) because data processing is not
              its core activity within the meaning of GDPR Article 37; you
              can reach the privacy contact at the email at the end of this
              policy.
            </p>
            <p>
              <strong>No training on Store Customer data.</strong> We do not
              use Store Customer voice recordings, audio, or conversation
              transcripts to train any AI model. We require our AI
              sub-processors to refrain from using this data to train their
              general-purpose models: the large language model that powers the
              live conversation is hosted and operated by ElevenLabs on its
              own infrastructure, so the model's original developer never
              receives conversation inputs or outputs, and ElevenLabs
              contractually prohibits the LLM providers it works with from
              training on customer content; AWS Bedrock customer data is not
              used to train any model by default; Anthropic does not train
              its foundation models on API or Bedrock customer data by
              default; and the ElevenLabs integration is configured so that
              conversation audio is not used to improve ElevenLabs's models.
            </p>
            <p>
              We do not sell personal data to third parties. We do not use
              customer data for advertising purposes.
            </p>
          </Section>

          <Section title="5. Sub-Processors and Third-Party Services">
            <p>
              We rely on the following sub-processors and third-party services
              to operate Bizmis:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>ElevenLabs</strong> -- speech-to-text, text-to-speech,
                and orchestration of the conversational AI agent (including
                LLM inference). The agent's responses are generated by a Qwen
                large language model that ElevenLabs hosts and operates on its
                own infrastructure, so the model's original developer does
                not receive or process any conversation data. ElevenLabs stores conversation audio and
                transcripts so they can be replayed in the merchant analytics
                dashboard.
              </li>
              <li>
                <strong>Amazon Web Services (AWS)</strong> -- hosting of the
                Bizmis backend API, managed data storage for session data and
                store records (Amazon DynamoDB), and model inference through
                Amazon Bedrock for background tasks: product search,
                extraction of answers from the merchant's support pages, and
                session classification, using Anthropic Claude models and
                Cohere embedding models served by Bedrock.
              </li>
              <li>
                <strong>Anthropic</strong> -- developer of the Claude family of
                large language models used for the Bedrock background tasks
                above. Prompts and outputs are processed inside Amazon Bedrock;
                Anthropic itself does not receive them.
              </li>
              <li>
                <strong>Render</strong> -- hosting of the Bizmis merchant admin
                app (the Shopify embedded app) and its managed PostgreSQL
                database, which stores the merchant configuration, avatar
                settings, billing plan, and Shopify session tokens.
              </li>
              <li>
                <strong>Typesense Cloud</strong> -- managed search index that
                holds the merchant's product catalog and collection data so the
                assistant can search the store. It receives no Store Customer
                data.
              </li>
              <li>
                <strong>PostHog (EU Cloud)</strong> -- product analytics and
                widget session replay, as described in Section 3. Hosted in
                the European Union.
              </li>
              <li>
                <strong>Shopify</strong> -- provides store and customer context
                data through its APIs and forwards data-subject requests to
                Bizmis through the mandatory compliance webhooks.
              </li>
            </ul>
            <p>
              Each sub-processor processes data in accordance with its own
              privacy policy and the contractual safeguards we have in place
              with them. We recommend reviewing their policies for details on
              their data handling practices.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Session data</strong> (Amazon DynamoDB) -- retained
                while the merchant's app remains installed so that
                conversation history and analytics stay available in the
                merchant dashboard. Deleted on demand when Shopify dispatches
                its <code>customers/redact</code> webhook, and deleted when we
                receive the <code>shop/redact</code> webhook after
                uninstallation.
              </li>
              <li>
                <strong>Conversation data</strong> (ElevenLabs) -- retained
                for the lifetime of the merchant's installation, capped at
                730 days per conversation: audio and transcripts older than
                that are automatically deleted even while the app stays
                installed. After uninstallation, retained during Shopify's
                48-hour reinstall window, then deleted when we receive
                Shopify's <code>shop/redact</code> webhook. Individual
                conversations are also deleted on demand via Shopify's{" "}
                <code>customers/redact</code> webhook or by direct request
                to the contact email at the end of this policy.
              </li>
              <li>
                <strong>Merchant configuration and Shopify session tokens</strong>{" "}
                (Render PostgreSQL) -- retained while the app is installed and
                during Shopify's 48-hour reinstall window after uninstallation.
                After 48 hours, Shopify dispatches its{" "}
                <code>shop/redact</code> webhook and Bizmis deletes the
                configuration, avatar, billing, and session records.
              </li>
              <li>
                <strong>Store record and access token</strong> (Amazon
                DynamoDB) -- the token is invalidated immediately on uninstall
                via Shopify's <code>app/uninstalled</code> webhook; the record
                is deleted when we receive the subsequent{" "}
                <code>shop/redact</code> webhook.
              </li>
              <li>
                <strong>Catalog index</strong> (Typesense Cloud) -- kept in
                sync with the store's products and collections while the app
                is installed; the store's collection is dropped when we
                receive the <code>shop/redact</code> webhook.
              </li>
              <li>
                <strong>Widget session replays and analytics events</strong>{" "}
                (PostHog) -- retained according to PostHog's plan retention
                for session replays, and deleted on request to the contact
                email at the end of this policy.
              </li>
            </ul>
            <p>
              Deletion triggered by the <code>shop/redact</code> and{" "}
              <code>customers/redact</code> webhooks runs as soon as the
              webhook is received, and in all cases completes within 30 days.
              If the merchant reinstalls Bizmis within Shopify's 48-hour
              reinstall window, Shopify cancels the <code>shop/redact</code>{" "}
              webhook and the merchant's configuration and historical
              conversation data remain intact, by Shopify's design.
            </p>
          </Section>

          <Section title="7. Cookies and Local Storage">
            <p>
              The Bizmis widget stores the following in the customer's
              browser:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>bizmis_voicechat_terms_accepted</strong> (cookie) --
                stores consent status; expires after 1 year
              </li>
              <li>
                <strong>bizmis-session</strong> (local storage) -- the current
                conversation state (session identifier, message history,
                products discussed) so a conversation survives page navigation
                within the store
              </li>
              <li>
                <strong>bizmis-posthog-link</strong> (local storage) -- links
                the current conversation to its PostHog session replay
              </li>
              <li>
                <strong>ph_* / PostHog</strong> (cookie and local storage) --
                PostHog's own identifiers used to group analytics events and
                the session replay described in Section 3
              </li>
            </ul>
            <p>
              We do not use cookies or local storage for advertising, and we
              do not track customers across other websites.
            </p>
          </Section>

          <Section title="8. Data Rights">
            <p>
              Under applicable privacy laws (including GDPR and CPRA), you have
              the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Restrict or object to certain processing activities</li>
              <li>
                Lodge a complaint with your local data protection authority
              </li>
            </ul>
            <p>
              <strong>Store customers:</strong> please contact the merchant
              (store owner) to exercise your data rights. Merchants can
              forward data requests to Bizmis through Shopify's mandatory
              compliance webhooks (<code>customers/data_request</code>,{" "}
              <code>customers/redact</code>, and <code>shop/redact</code>) or
              by contacting us directly at the email below.
            </p>
            <p>
              <strong>Merchants:</strong> you can contact us directly at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:text-primary-dark hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              to exercise your data rights.
            </p>
          </Section>

          <Section title="9. Data Security">
            <p>
              We implement appropriate technical and organizational measures to
              protect personal data, including encryption in transit (TLS) and
              at rest, scoped access controls, separation of test and
              production environments, and regular security reviews. Our
              infrastructure is hosted on AWS (backend API and data stores)
              and Render (merchant admin app and its database), both operated
              with industry-standard security practices.
            </p>
            <p>
              <strong>Breach notification.</strong> If we become aware of a
              personal-data breach affecting Merchants or their Store
              Customers, we will notify the affected Merchant without undue
              delay and, where feasible, no later than 72 hours after we
              become aware of it, providing the information required by GDPR
              Article 33.
            </p>
          </Section>

          <Section title="10. Sensitive Data Safeguards">
            <p>
              <strong>No voice biometrics.</strong> Bizmis does not perform
              voice biometric identification and does not use voice recordings
              to uniquely identify a natural person within the meaning of GDPR
              Article 9. Voice recordings are processed solely to power the
              conversational assistant.
            </p>
            <p>
              <strong>Not directed to children.</strong> The voice assistant
              is not directed to children under 16 (or under 13 in
              jurisdictions where COPPA applies). Merchants must not deploy
              the assistant on stores or pages directed to children below
              those ages. If we become aware that voice or conversation data
              was collected from a child without appropriate consent, we will
              delete the data.
            </p>
            <p>
              <strong>AI transparency.</strong> The Bizmis voice widget makes
              its AI nature clear at the start of every conversation through
              its greeting and on-screen labeling, in line with the EU AI Act
              (Article 50) and analogous transparency requirements.
            </p>
          </Section>

          <Section title="11. International Data Transfers">
            <p>
              Data is processed and stored primarily in the United States
              through our infrastructure providers (AWS, Render, Typesense
              Cloud) and ElevenLabs, including the ElevenLabs-hosted language
              model. PostHog analytics and session replays are stored in the
              European Union. Where data is transferred outside the EEA or
              the UK, we rely on the
              European Commission's Standard Contractual Clauses (and the UK
              International Data Transfer Addendum where relevant) and on the
              equivalent safeguards published by the sub-processor.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will
              notify merchants of material changes through the Bizmis app
              admin panel or via email. The "Last updated" date at the top of
              this page indicates when the policy was last revised.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              For questions about this Privacy Policy or our data practices,
              contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:text-primary-dark hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>
        </div>
      </div>

      <Footer />
    </PublicPageLayout>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section>
    <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 space-y-3">{children}</div>
  </section>
);

export default PrivacyPolicy;
