import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const LAST_UPDATED = "February 16, 2026";
const CONTACT_EMAIL = "hello@bizmis.ai";

const PrivacyPolicy = () => {
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
              <li>App usage data (pages visited within the admin panel)</li>
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
                <strong>Voice conversation audio</strong> -- the voice
                interaction is recorded to power the AI assistant
              </li>
              <li>
                <strong>Conversation transcripts</strong> -- text transcriptions
                of the voice interactions
              </li>
              <li>
                <strong>Browsing activity</strong> -- pages visited and
                navigation timestamps during the session
              </li>
              <li>
                <strong>Session metadata</strong> -- language preference,
                session duration, and timestamps
              </li>
            </ul>
          </Section>

          <Section title="4. How We Use the Data">
            <p>We use the collected data to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and operate the AI voice shopping assistant</li>
              <li>Process voice interactions in real time</li>
              <li>Generate conversation transcripts for the merchant's analytics dashboard</li>
              <li>Improve the quality and accuracy of the AI assistant</li>
              <li>Provide session analytics and metrics to the merchant</li>
            </ul>
            <p>
              We do not sell personal data to third parties. We do not use
              customer data for advertising purposes.
            </p>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We use the following third-party services to operate Bizmis:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>ElevenLabs</strong> -- processes voice interactions,
                stores audio recordings and conversation transcripts
              </li>
              <li>
                <strong>Amazon Web Services (AWS)</strong> -- hosts session data
                in DynamoDB, provides infrastructure
              </li>
              <li>
                <strong>Shopify</strong> -- provides store and customer context
                data through its APIs
              </li>
            </ul>
            <p>
              Each third-party service processes data in accordance with their
              own privacy policies. We recommend reviewing their policies for
              details on their data handling practices.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Session data</strong> (DynamoDB) -- automatically
                deleted after 60 minutes of inactivity (TTL)
              </li>
              <li>
                <strong>Conversation data</strong> (ElevenLabs) -- retained
                until a deletion request is made
              </li>
              <li>
                <strong>Merchant configuration</strong> (PostgreSQL) -- retained
                while the app is installed; deleted when the merchant
                uninstalls the app
              </li>
              <li>
                <strong>Shopify access tokens</strong> (DynamoDB) -- deleted
                within 48 hours of app uninstallation
              </li>
            </ul>
          </Section>

          <Section title="7. Cookies">
            <p>
              The Bizmis widget uses a single cookie to remember whether a
              customer has accepted the Terms and Conditions:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>bizmis_voicechat_terms_accepted</strong> -- stores
                consent status; expires after 1 year
              </li>
            </ul>
            <p>
              We do not use cookies for tracking, analytics, or advertising
              purposes.
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
            </ul>
            <p>
              <strong>Store customers:</strong> please contact the merchant
              (store owner) to exercise your data rights. The merchant can
              submit data requests through Shopify, which are then processed by
              our GDPR compliance system.
            </p>
            <p>
              <strong>Merchants:</strong> you can contact us directly at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              to exercise your data rights.
            </p>
          </Section>

          <Section title="9. Data Security">
            <p>
              We implement appropriate technical and organizational measures to
              protect personal data, including encryption in transit (TLS),
              secure access controls, and regular security reviews. All data
              processing infrastructure is hosted on AWS with industry-standard
              security practices.
            </p>
          </Section>

          <Section title="10. International Data Transfers">
            <p>
              Data may be processed and stored in the United States and the
              European Union through our infrastructure providers (AWS) and
              third-party services (ElevenLabs). Where data is transferred
              outside the EEA, appropriate safeguards are in place in
              accordance with applicable data protection laws.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will
              notify merchants of material changes through the Bizmis app
              admin panel or via email. The "Last updated" date at the top of
              this page indicates when the policy was last revised.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              For questions about this Privacy Policy or our data practices,
              contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>
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

export default PrivacyPolicy;
