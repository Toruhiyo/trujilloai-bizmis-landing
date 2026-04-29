import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const LAST_UPDATED = "April 28, 2026";
const CONTACT_EMAIL = "hello@bizmis.ai";
const COMPANY_LEGAL_NAME = "Bizmis";
const COMPANY_JURISDICTION = "Spain";
const COMPANY_VENUE = "Barcelona, Spain";
// TODO(legal): once a virtual mailbox / professional address is in place,
// reintroduce a postal address in §22 to satisfy Spanish LSSI-CE Article 10.
// Operator is currently a sole trader (autónomo); we deliberately omit the
// home address to avoid personal exposure.

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <a
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </a>

        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-gray-500 mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <Section title="1. Introduction & Acceptance">
            <p>
              These Terms of Service ("Terms") govern your access to and use of
              the Bizmis service ("Service"), an AI-powered voice shopping
              assistant for Shopify stores operated by {COMPANY_LEGAL_NAME}{" "}
              ("Bizmis", "we", "our", "us"). By installing the Bizmis Shopify
              app, accessing our website, or interacting with the Bizmis voice
              widget on a merchant's storefront, you agree to be bound by these
              Terms.
            </p>
            <p>
              These Terms apply to two distinct groups: (a) <strong>merchants</strong>{" "}
              who install the Bizmis app on their Shopify store, and (b){" "}
              <strong>store customers</strong> (end shoppers) who interact with
              the Bizmis voice assistant on a merchant's storefront. Sections
              that apply only to one group are clearly labeled.
            </p>
            <p>
              If you do not agree with any part of these Terms, do not install
              the app and do not interact with the Bizmis widget.
            </p>
          </Section>

          <Section title="2. Definitions">
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>"Service"</strong> means the Bizmis voice assistant,
                Shopify embedded admin app, theme app extension, backend APIs,
                and related analytics dashboards.
              </li>
              <li>
                <strong>"Merchant"</strong> means a Shopify store owner or
                authorized operator who installs the Bizmis app on their store.
              </li>
              <li>
                <strong>"Store Customer"</strong> means an end shopper who
                interacts with the Bizmis voice assistant on a Merchant's
                storefront.
              </li>
              <li>
                <strong>"Subscription"</strong> means the recurring plan a
                Merchant selects through the Bizmis admin app, billed through
                Shopify's billing system.
              </li>
              <li>
                <strong>"Minutes"</strong> means the unit of voice usage
                consumed by Store Customer interactions, tracked per billing
                period.
              </li>
            </ul>
          </Section>

          <Section title="3. Service Description">
            <p>
              Bizmis provides an AI-powered voice shopping assistant embedded
              in Shopify storefronts. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                A voice widget that greets Store Customers, answers questions,
                helps them browse products, and guides them toward checkout.
              </li>
              <li>
                Multilingual conversation support powered by third-party
                speech-to-text, text-to-speech, and large language model
                providers.
              </li>
              <li>
                Merchant-facing analytics, including conversation transcripts,
                session replays, and aggregate usage metrics.
              </li>
              <li>
                Configuration tools (avatars, greetings, theme, sales and
                support guidelines) accessible through the embedded Shopify
                admin.
              </li>
            </ul>
            <p>
              <strong>The Service does not:</strong> place orders, take
              payments, complete checkout, modify orders after they are
              placed, issue refunds, modify the contents of a Store Customer's
              cart on their behalf, or provide professional legal, medical, or
              financial advice. Checkout, payment, and order-modification
              flows are handled exclusively by Shopify and the Merchant's own
              storefront, not by the Bizmis assistant.
            </p>
            <p>
              <strong>Explicit confirmation for any write action.</strong>{" "}
              Where the assistant performs an action that touches a Store
              Customer's data on a Merchant-controlled form (for example,
              pre-filling a newsletter signup or a contact form with the Store
              Customer's email and phone number), it does so only after
              explicit voice confirmation by the Store Customer of the values
              to be entered. The Store Customer always retains the final click
              to submit the form. If we re-introduce cart-related capabilities
              in the future, those will operate under the same explicit-voice-
              confirmation pattern: the assistant will read back the product,
              variant, and quantity, and only proceed after the Store
              Customer's affirmative response.
            </p>
          </Section>

          <Section title="4. Eligibility & Account (Merchants)">
            <p>To install and use the Service as a Merchant, you must:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Be at least 18 years old (or the age of majority in your
                jurisdiction) and legally able to enter into binding contracts.
              </li>
              <li>
                Operate the Shopify store on which the Service is installed,
                or be expressly authorized to act on behalf of the store
                owner.
              </li>
              <li>
                Comply with Shopify's{" "}
                <a
                  href="https://www.shopify.com/legal/terms"
                  className="text-primary hover:text-primary-dark hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>
                ,{" "}
                <a
                  href="https://www.shopify.com/legal/aup"
                  className="text-primary hover:text-primary-dark hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Acceptable Use Policy
                </a>
                , and{" "}
                <a
                  href="https://www.shopify.com/legal/api-terms"
                  className="text-primary hover:text-primary-dark hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  API License and Terms of Use
                </a>
                .
              </li>
              <li>
                Provide accurate Merchant information and keep it up to date.
              </li>
            </ul>
            <p>
              You are responsible for safeguarding any credentials used to
              access the embedded Bizmis admin and for all activity that
              occurs under your Shopify session.
            </p>
          </Section>

          <Section title="5. Voice Recording & Data Processing Consent (Store Customers)">
            <p>
              By interacting with the Bizmis voice assistant on a Merchant's
              storefront, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Your voice input is captured and streamed in real time to power
                the AI conversation.
              </li>
              <li>
                Audio recordings, conversation transcripts, and session
                metadata (e.g., language, timestamps, navigation events) are
                generated and stored on the Merchant's behalf for analytics
                and quality purposes.
              </li>
              <li>
                Voice and text data are processed by our sub-processors,
                including:
                <ul className="list-[circle] pl-6 space-y-1 mt-2">
                  <li>
                    <strong>ElevenLabs</strong> — speech-to-text,
                    text-to-speech, and orchestration of the conversational AI
                    agent (including LLM inference). The agent is configured
                    to use Anthropic's Claude family of large language models
                    for response generation.
                  </li>
                  <li>
                    <strong>Anthropic</strong> — provider of the Claude family
                    of large language models, used by ElevenLabs for live
                    voice conversations and by our backend (through Amazon
                    Bedrock) for background tasks such as policy search and
                    session classification.
                  </li>
                  <li>
                    <strong>Amazon Web Services (AWS)</strong> — hosting,
                    managed data storage, and model inference (Amazon
                    Bedrock).
                  </li>
                </ul>
                A current list of sub-processors, the data they receive,
                retention windows, and regions of processing is published in
                our{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:text-primary-dark hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>No training on Store Customer data.</strong> Bizmis
                does not use Store Customer voice recordings, audio, or
                conversation transcripts to train any AI model. We require
                our AI sub-processors to refrain from using this data to
                train their general-purpose models: AWS Bedrock customer data
                is not used to train any model by default; Anthropic does not
                train its foundation models on API or Bedrock customer data
                by default; and the ElevenLabs integration is configured so
                that conversation audio is not used to improve ElevenLabs's
                models.
              </li>
              <li>
                <strong>No voice biometrics.</strong> Bizmis does not perform
                voice biometric identification and does not use voice
                recordings to uniquely identify a natural person within the
                meaning of GDPR Article 9. Voice recordings are processed
                solely to power the conversational assistant.
              </li>
              <li>
                <strong>Not directed to children.</strong> The voice assistant
                is not directed to children under 16 (or under 13 in
                jurisdictions where COPPA applies). Merchants must not deploy
                the assistant on stores or pages directed to children below
                those ages. If we become aware that voice or conversation
                data was collected from a child without appropriate consent,
                we will delete the data.
              </li>
            </ul>
            <p>
              The voice assistant is opt-in: you start a conversation only by
              clicking the widget. You may stop a conversation at any time and
              decline to use the assistant. Cookie-based consent preferences
              are described in our Privacy Policy.
            </p>
          </Section>

          <Section title="6. Acceptable Use">
            <p>
              The Service is provided for lawful e-commerce use. You agree not
              to (and not to allow any third party to):
            </p>
            <p>
              <strong>Merchants:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Use the Service in any manner that violates Shopify's
                Acceptable Use Policy, applicable consumer-protection law, or
                advertising standards.
              </li>
              <li>
                Configure the assistant to make false, misleading, or
                deceptive product, pricing, or availability claims.
              </li>
              <li>
                Resell, sublicense, or build a competing product using
                responses returned by the Service.
              </li>
              <li>
                Scrape, mirror, or systematically extract data from the
                Service outside of the documented APIs and the embedded
                analytics dashboard.
              </li>
              <li>
                Use the Service to sell, market, or distribute prohibited
                goods or services (firearms, illegal drugs, deceptive
                financial schemes, content that violates intellectual-property
                rights, etc.).
              </li>
            </ul>
            <p>
              <strong>Store Customers:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Use the Service for any unlawful or harassing purpose.
              </li>
              <li>
                Attempt to disrupt, overload, probe, or interfere with the
                Service or the underlying infrastructure.
              </li>
              <li>
                Reverse-engineer, decompile, or extract source code from the
                Service.
              </li>
              <li>
                Use automated tools, bots, or scripts to interact with the
                voice assistant.
              </li>
              <li>
                Transmit abusive, threatening, hateful, or otherwise harmful
                content through the voice interface.
              </li>
            </ul>
          </Section>

          <Section title="7. Merchant Responsibilities">
            <p>As a Merchant, you are solely responsible for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                The accuracy of your product catalog, pricing, inventory,
                shipping, returns, and store policies. The voice assistant
                surfaces and summarizes information that originates from your
                Shopify store; if that source data is wrong, the assistant's
                response will be wrong.
              </li>
              <li>
                Customizing the sales and support guidelines you provide to
                the assistant so that they comply with applicable advertising
                and consumer-protection law.
              </li>
              <li>
                Notifying Store Customers, in your own privacy notice and in
                any cookie banner you operate, that an AI voice assistant
                processes voice and conversation data on your store, naming
                Bizmis as a service provider/sub-processor where required by
                law.
              </li>
              <li>
                Responding to data-subject requests from your Store Customers
                under GDPR, CPRA, or any other applicable privacy law. Bizmis
                will assist in good faith but acts as your sub-processor for
                Store Customer data.
              </li>
              <li>
                Observing usage limits and billing caps you configure inside
                the Bizmis admin.
              </li>
            </ul>
          </Section>

          <Section title="8. AI-Generated Content">
            <p>
              The Service uses artificial intelligence (large language models
              and speech models) to generate responses in real time. AI output
              can be inaccurate, incomplete, or out of date.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Information provided by the assistant should not be treated as
                professional advice (legal, medical, financial, or otherwise).
              </li>
              <li>
                Store Customers should verify product specifications, pricing,
                shipping, and return information directly on the Merchant's
                storefront before completing a purchase.
              </li>
              <li>
                Bizmis is not liable for decisions made or actions taken on
                the basis of AI-generated responses.
              </li>
              <li>
                Merchants are responsible for the accuracy of any
                product-specific information they configure in the assistant.
              </li>
            </ul>
            <p>
              <strong>AI transparency.</strong> In compliance with the EU
              Artificial Intelligence Act (Article 50, transparency obligations
              for AI systems intended to interact directly with natural
              persons) and analogous laws in other jurisdictions, the Bizmis
              voice widget makes its AI nature clear at the start of every
              conversation through its greeting and on-screen labeling. Store
              Customers are informed that they are interacting with an AI
              assistant rather than a human.
            </p>
          </Section>

          <Section title="9. Subscription Plans, Billing & Free Preview (Merchants)">
            <p>
              The Service is offered to Merchants on tiered Subscription plans.
              Current plan names, pricing, included Minutes, and overage rates
              are published on our{" "}
              <a
                href="/pricing"
                className="text-primary hover:text-primary-dark hover:underline"
              >
                Pricing page
              </a>{" "}
              and inside the embedded Subscription page in the Bizmis admin.
              By subscribing you authorize the recurring charges shown on the
              Shopify confirmation screen.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Billing through Shopify.</strong> All payments are
                handled exclusively by Shopify Billing. Bizmis does not store
                payment-card details and does not invoice Merchants directly.
              </li>
              <li>
                <strong>Billing periods.</strong> Monthly plans bill upfront
                every 30 days. Yearly plans bill upfront for the full year.
              </li>
              <li>
                <strong>Included Minutes.</strong> Each plan includes a fixed
                pool of Minutes that resets at the start of every billing
                period. Unused Minutes do not roll over.
              </li>
              <li>
                <strong>Overage (monthly plans only).</strong> Voice usage
                beyond the included pool is billed as overage at the per-minute
                rate published for your plan, capped at the overage limit you
                set inside the Bizmis admin (and at Shopify's per-app capped
                amount). When the cap is reached, voice usage is paused until
                the next billing period or until you raise the cap. Yearly
                plans do not include overage; voice usage is paused once
                included Minutes are exhausted.
              </li>
              <li>
                <strong>Free preview.</strong> New stores receive a limited
                pool of preview Minutes so the Merchant can evaluate the
                Service before subscribing. While preview Minutes remain, the
                voice widget is fully functional on the Merchant's storefront.
                Once preview Minutes are exhausted (or the trial window ends),
                the widget is hidden from Store Customers and a paid
                Subscription is required to make it visible again. The
                embedded Bizmis admin remains accessible to the Merchant
                throughout, so they can subscribe at any time.
              </li>
              <li>
                <strong>Plan changes.</strong> Upgrades (higher tier or monthly
                to yearly) take effect immediately and are charged a prorated
                difference for the remaining billing period; usage counters
                are not reset. Downgrades (lower tier or yearly to monthly)
                take effect at the next renewal; you keep the higher
                entitlements until then.
              </li>
              <li>
                <strong>Discount codes.</strong> Promotional codes may be
                offered from time to time and are applied through Shopify's
                billing flow. Discounts apply to commitment fees only and not
                to overage usage.
              </li>
              <li>
                <strong>Taxes.</strong> Prices are exclusive of any applicable
                taxes, which are added by Shopify Billing where required.
              </li>
            </ul>
          </Section>

          <Section title="10. Cancellation & Refunds (Merchants)">
            <p>
              You may cancel your Subscription at any time from the embedded
              Subscription page in the Bizmis admin (or by uninstalling the
              app from your Shopify store).
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Effective date of cancellation.</strong> Cancellation
                takes effect immediately. The Bizmis voice widget stops
                serving Store Customers on your storefront as soon as the
                cancellation is confirmed; in-flight conversations are
                interrupted.
              </li>
              <li>
                <strong>Monthly plans — no refunds.</strong> Charges already
                billed for the current monthly period are non-refundable, and
                unused Minutes in the current period are forfeited. You will
                not be billed again going forward.
              </li>
              <li>
                <strong>Yearly plans — 30-day money-back guarantee.</strong>{" "}
                If you cancel a yearly plan within 30 days of the initial
                yearly charge, we will refund the commitment fee for that
                yearly period, no questions asked. The 30-day guarantee does
                not apply to renewal years (only the first yearly charge) or
                to overage usage.
              </li>
              <li>
                <strong>Reactivation.</strong> You may resubscribe at any
                time. Pricing in effect at the time of resubscription applies;
                we cannot guarantee that previously available promotional
                rates will still be honored.
              </li>
            </ul>
            <p>
              We may, in our sole discretion, grant additional refunds or
              service credits beyond what is required by these Terms. Doing so
              in one instance does not waive our right to enforce this policy
              in any other instance.
            </p>
          </Section>

          <Section title="11. Suspension & Termination by Bizmis">
            <p>
              We may suspend or terminate your access to the Service, in whole
              or in part, on the following grounds:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Material breach of these Terms or the Acceptable Use section.
              </li>
              <li>
                Use of the Service that exposes Bizmis or our sub-processors
                to legal, security, or reputational risk.
              </li>
              <li>
                Compliance with law, court order, Shopify, or a sub-processor.
              </li>
              <li>
                Failure to pay amounts due (as collected through Shopify
                Billing).
              </li>
            </ul>
            <p>
              <strong>Notice and cure.</strong> We will give you reasonable
              advance notice and an opportunity to cure the issue before
              suspending or terminating your access. Suspension or termination{" "}
              <em>without prior notice</em> is limited to circumstances where
              (a) prompt action is required by law, court order, Shopify, or
              a sub-processor; (b) it is reasonably necessary to protect the
              security or integrity of the Service, our users, or our
              sub-processors; or (c) you remain in material breach after a
              reasonable opportunity to cure.
            </p>
            <p>
              <strong>Service discontinuation.</strong> We may also discontinue
              the Service in its entirety on at least 30 days' notice; if we
              do, we will offer a prorated refund of any unused prepaid
              yearly fees.
            </p>
          </Section>

          <Section title="12. Data, Privacy, Sub-Processors & Security">
            <p>
              Our collection, use, retention, and deletion of Merchant and
              Store Customer data are described in our{" "}
              <a
                href="/privacy"
                className="text-primary hover:text-primary-dark hover:underline"
              >
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Merchant data.</strong> Merchants own their store data
                (catalog, customer, order, and configuration data). Bizmis
                receives that data only to operate the Service and acts as a
                processor / service provider on the Merchant's behalf.
              </li>
              <li>
                <strong>Store Customer data.</strong> Bizmis processes Store
                Customer voice and conversation data as a sub-processor to the
                Merchant. Data-subject requests are honored through Shopify's
                mandatory compliance webhooks (
                <code>customers/data_request</code>,{" "}
                <code>customers/redact</code>, and{" "}
                <code>shop/redact</code>) and through direct contact at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary hover:text-primary-dark hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </li>
              <li>
                <strong>Uninstallation.</strong> When a Merchant uninstalls
                the app, we delete or anonymize Merchant configuration data
                within the windows described in the Privacy Policy. Shopify
                access tokens are revoked and removed promptly.
              </li>
              <li>
                <strong>Protected customer data scopes.</strong> The Service
                requests only the Shopify access scopes needed to operate
                its features. Where a feature requires Shopify "protected
                customer data" scopes (such as{" "}
                <code>read_customers</code> or <code>read_orders</code>),
                Bizmis applies additional safeguards consistent with
                Shopify's Protected Customer Data Requirements: encryption
                in transit and at rest, separation of test and production
                environments, least-privilege access controls, and explicit
                retention limits described in the Privacy Policy. The
                Service does not sell or share protected customer data with
                third parties for advertising.
              </li>
            </ul>
            <p>
              <strong>Data Processing Addendum (GDPR Article 28).</strong>{" "}
              Where Bizmis processes Personal Data of Store Customers on
              behalf of a Merchant, this Section 12, together with the
              Privacy Policy, constitutes a Data Processing Addendum between
              the Merchant (controller) and Bizmis (processor) for the
              purposes of GDPR Article 28. It describes the subject-matter
              and duration of processing (provision of the Service for the
              term of the Subscription), the nature and purpose (operating
              the AI voice assistant and related analytics), the types of
              Personal Data and categories of data subjects (Store Customer
              voice, conversation, and session metadata), and the
              obligations and rights of the Merchant. Merchants requiring a
              separately signed DPA — including with the EU Standard
              Contractual Clauses for international transfers — may request
              one at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary hover:text-primary-dark hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              ; we will execute one in good faith.
            </p>
            <p>
              <strong>Security.</strong> Bizmis maintains commercially
              reasonable technical and organizational measures designed to
              protect Merchant and Store Customer data, including encryption
              in transit (TLS), encryption at rest, access controls based on
              least privilege, separation of test and production data, audit
              logging of administrative actions, and regular security
              reviews of our sub-processors.
            </p>
            <p>
              <strong>Breach notification.</strong> We will notify affected
              Merchants without undue delay, and in any event within 72
              hours of becoming aware of a confirmed Personal Data Breach
              affecting their data, with the information required under
              applicable law (including a description of the nature of the
              breach, categories of data affected, likely consequences, and
              measures taken or proposed to address the breach).
            </p>
          </Section>

          <Section title="13. Service Availability & Changes">
            <p>
              We aim to make the Service continuously available but do not
              guarantee uninterrupted operation. The Service may be
              temporarily unavailable due to maintenance, updates, third-party
              outages (Shopify, ElevenLabs, AWS, etc.), or circumstances
              beyond our reasonable control.
            </p>
            <p>
              We may add, modify, or remove features at any time. Material
              changes that reduce Service functionality you were paying for
              will be announced through the embedded Bizmis admin or by email
              with reasonable notice.
            </p>
          </Section>

          <Section title="14. Intellectual Property">
            <p>
              All intellectual-property rights in the Service, including
              software, trained models, design, audio assets, and Bizmis
              branding, are owned by {COMPANY_LEGAL_NAME} or our licensors.
              Subject to your compliance with these Terms, we grant you a
              limited, non-exclusive, non-transferable, revocable license to
              use the Service for the duration of your Subscription.
            </p>
            <p>
              You retain all rights in your Merchant content (product data,
              guidelines, configuration). You grant us a worldwide,
              royalty-free license to host, store, transmit, transform, and
              display that content solely as needed to provide the Service.
            </p>
            <p>
              Nothing in these Terms grants you rights to use the Bizmis
              trademarks, logos, or trade dress, except as strictly necessary
              to identify the Service inside your Shopify admin.
            </p>
          </Section>

          <Section title="15. Disclaimers">
            <p className="uppercase text-sm">
              The Service is provided "as is" and "as available". To the
              maximum extent permitted by law, Bizmis disclaims all warranties,
              express or implied, including merchantability, fitness for a
              particular purpose, non-infringement, and any warranty arising
              out of course of dealing or usage of trade. We do not warrant
              that the Service will be uninterrupted, error-free, or that AI
              responses will be accurate.
            </p>
          </Section>

          <Section title="16. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law,
              {" "}{COMPANY_LEGAL_NAME} shall not be liable for any indirect,
              incidental, special, consequential, exemplary, or punitive
              damages, or for lost profits, lost revenue, lost data, lost
              goodwill, lost sales, or business interruption, arising out of
              or related to the Service, even if advised of the possibility
              of such damages and regardless of the legal theory (contract,
              tort, statute, or otherwise).
            </p>
            <p>
              Our total aggregate liability for all claims arising out of or
              related to these Terms or the Service shall not exceed the{" "}
              <strong>lesser</strong> of (a) the fees actually paid by the
              Merchant to Bizmis for the Service in the six (6) months
              preceding the event giving rise to the claim and (b) one
              hundred US dollars (USD 100). For Store Customers, who pay no
              fee directly to Bizmis, the cap is one hundred US dollars (USD
              100). This cap applies on an aggregate basis across all claims
              and all events.
            </p>
            <p>
              <strong>Statutory exceptions.</strong> Nothing in these Terms
              excludes or limits liability for (a) gross negligence, willful
              misconduct, or fraud (Spanish Civil Code Article 1102 and
              equivalent rules in other jurisdictions render any waiver
              automatically void); (b) statutory liability under the GDPR
              (Article 82) and equivalent data-protection laws; or (c) any
              other liability that cannot be limited or excluded under
              applicable law. These exceptions are listed solely because the
              law does not allow us to waive them; they are not granted as
              additional rights and Bizmis denies that any of them is engaged
              by the Service.
            </p>
          </Section>

          <Section title="17. Indemnification">
            <p>
              <strong>Merchant indemnification of Bizmis.</strong> Merchants
              agree to defend, indemnify, and hold harmless
              {" "}{COMPANY_LEGAL_NAME} and its officers, directors, employees,
              contractors, and agents from and against any and all claims,
              demands, damages, losses, liabilities, fines, penalties, costs,
              and expenses (including reasonable attorneys' fees and the cost
              of regulatory inquiries) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>your breach of these Terms or of the Privacy Policy;</li>
              <li>
                your products, listings, store content, prices, refund and
                shipping policies, or sales and support guidelines;
              </li>
              <li>
                any output the Service generates based on the content,
                guidelines, or instructions you provide;
              </li>
              <li>
                your violation of any applicable law (including consumer
                protection, advertising, tax, and data-protection laws) or of
                any third-party right (including intellectual-property,
                privacy, and publicity rights);
              </li>
              <li>
                your relationship with your Store Customers, including their
                purchases, returns, complaints, and data-subject requests;
              </li>
              <li>
                your use of the Service in combination with products,
                services, or data not authorized by Bizmis, or your
                modification of the Service.
              </li>
            </ul>
            <p>
              Bizmis may, at its option, control the defense and settlement
              of any indemnified claim, in which case the Merchant will
              cooperate at the Merchant's expense. The Merchant may not
              settle any claim that imposes any obligation on Bizmis without
              Bizmis's prior written consent.
            </p>
            <p>
              <strong>No reciprocal indemnification by Bizmis.</strong> The
              Service is provided AS IS under Section 15. Bizmis does not
              indemnify, defend, or hold harmless Merchants, Store Customers,
              or any third party in respect of the Service or any claim
              arising out of or related to it. This is a deliberate
              allocation of risk reflected in the pricing of the Service.
            </p>
          </Section>

          <Section title="18. Force Majeure">
            <p>
              Neither party will be liable for any delay or failure to perform
              its obligations under these Terms (other than a payment
              obligation) caused by events beyond its reasonable control,
              including acts of god, war, terrorism, civil unrest,
              governmental action, labor disputes, internet or
              telecommunications outages, denial-of-service attacks, or
              failures of third-party providers (including Shopify,
              ElevenLabs, and AWS).
            </p>
          </Section>

          <Section title="19. Changes to These Terms">
            <p>
              We may update these Terms from time to time. We will notify
              Merchants of material changes through the Bizmis admin app or by
              email at least fourteen (14) days before the changes take
              effect, where reasonably practicable. Your continued use of the
              Service after the changes take effect constitutes acceptance of
              the updated Terms. If you do not agree, you must stop using the
              Service and may cancel your Subscription as described in
              Section 10.
            </p>
          </Section>

          <Section title="20. Governing Law & Dispute Resolution">
            <p>
              These Terms are governed by and construed in accordance with the
              laws of {COMPANY_JURISDICTION}, without regard to its conflict
              of laws principles. The parties submit to the exclusive
              jurisdiction of the courts of {COMPANY_VENUE} for any dispute
              arising out of or related to these Terms or the Service, except
              that either party may seek injunctive relief in any court of
              competent jurisdiction to protect its intellectual-property
              rights.
            </p>
            <p>
              Nothing in this Section limits any non-waivable rights you may
              have as a consumer under the laws of your country of residence.
            </p>
          </Section>

          <Section title="21. General">
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Entire agreement.</strong> These Terms, together with
                the Privacy Policy and any plan-specific terms shown at
                checkout, constitute the entire agreement between you and
                Bizmis regarding the Service and supersede any prior
                agreement on the same subject.
              </li>
              <li>
                <strong>Severability.</strong> If any provision of these
                Terms is held unenforceable, that provision will be modified
                only to the extent necessary to make it enforceable, and the
                remaining provisions will remain in full force.
              </li>
              <li>
                <strong>No waiver.</strong> Our failure to enforce any right
                or provision under these Terms is not a waiver of that right
                or provision.
              </li>
              <li>
                <strong>Assignment.</strong> You may not assign or transfer
                these Terms without our prior written consent. We may assign
                these Terms in connection with a merger, acquisition, or sale
                of substantially all our assets.
              </li>
              <li>
                <strong>Notices.</strong> We may give notice through the
                Bizmis admin app, by email to the address associated with
                your Shopify account, or by posting on our website. You may
                give notice to us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary hover:text-primary-dark hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </li>
              <li>
                <strong>Survival.</strong> Sections 8 (AI-Generated Content),
                10 (Cancellation & Refunds), 12 (Data, Privacy &
                Sub-Processors), 14 (Intellectual Property), 15 (Disclaimers),
                16 (Limitation of Liability), 17 (Indemnification), 20
                (Governing Law), and 21 (General) survive termination of
                these Terms.
              </li>
            </ul>
          </Section>

          <Section title="22. Contact">
            <p>
              For questions about these Terms or for Service support, contact{" "}
              {COMPANY_LEGAL_NAME} at:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary hover:text-primary-dark hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . If you require a postal address (for example, to exercise a
              right under applicable law), please write to us at the address
              above and we will provide it on request.
            </p>
          </Section>
        </div>
      </div>

      <Footer />
    </div>
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

export default Terms;
