import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const LAST_UPDATED = "February 16, 2026";
const CONTACT_EMAIL = "hello@bizmis.ai";

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
          <Section title="1. Service Description">
            <p>
              Bizmis ("we", "our", "us") provides an AI-powered voice shopping
              assistant that can be embedded in Shopify stores. The service
              enables store customers to interact with an AI assistant through
              voice conversations to browse products, get recommendations, and
              receive support.
            </p>
            <p>
              These Terms of Service govern the use of the Bizmis voice
              assistant by both merchants who install the app and their
              customers who interact with it.
            </p>
          </Section>

          <Section title="2. Voice Recording Consent">
            <p>
              By using the Bizmis voice assistant, you acknowledge and agree
              that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Your voice interactions will be recorded and processed to
                provide the AI assistant functionality
              </li>
              <li>
                Conversation transcripts will be generated and stored for the
                merchant's analytics purposes
              </li>
              <li>
                Audio recordings are processed by our third-party AI provider
                (ElevenLabs) to deliver the voice interaction experience
              </li>
            </ul>
            <p>
              You may decline to use the voice assistant at any time. If you do
              not accept these terms, please do not interact with the Bizmis
              widget.
            </p>
          </Section>

          <Section title="3. Data Processing">
            <p>
              All data collected through the Bizmis voice assistant is processed
              in accordance with our{" "}
              <a href="/privacy" className="text-primary hover:text-primary-dark hover:underline">
                Privacy Policy
              </a>
              . By using the service, you consent to the data practices
              described therein.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>When using the Bizmis voice assistant, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to disrupt, overload, or interfere with the service</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the service</li>
              <li>Use automated tools or scripts to interact with the voice assistant</li>
              <li>Transmit abusive, threatening, or harmful content through the voice interface</li>
            </ul>
          </Section>

          <Section title="5. AI-Generated Content">
            <p>
              The Bizmis voice assistant uses artificial intelligence to generate
              responses. While we strive for accuracy, AI-generated responses
              may occasionally contain errors or inaccuracies. The information
              provided by the assistant should not be considered professional
              advice, and product details should be verified on the merchant's
              store.
            </p>
            <p>
              We are not responsible for decisions made based on AI-generated
              responses.
            </p>
          </Section>

          <Section title="6. Service Availability">
            <p>
              We aim to provide the Bizmis service on a continuous basis but do
              not guarantee uninterrupted availability. The service may be
              temporarily unavailable due to maintenance, updates, or
              circumstances beyond our control.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All intellectual property rights in the Bizmis service, including
              software, design, and branding, remain the property of Bizmis.
              Nothing in these terms grants you rights to use our trademarks,
              logos, or other intellectual property beyond what is necessary to
              use the service.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Bizmis shall
              not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from or related to your
              use of the service. Our total liability for any claim arising from
              these terms shall not exceed the fees paid by the merchant for
              the Bizmis service in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="9. Indemnification">
            <p>
              You agree to indemnify and hold harmless Bizmis and its officers,
              directors, employees, and agents from any claims, damages, losses,
              or expenses arising from your use of the service or violation of
              these terms.
            </p>
          </Section>

          <Section title="10. Plan Changes &amp; Billing Adjustments">
            <p>
              <strong>Upgrades</strong> (moving to a higher-tier plan or from
              monthly to yearly billing) take effect immediately. You are charged
              the prorated difference for the remaining time in your current
              billing period. Your billing date does not change.
            </p>
            <p>
              <strong>Downgrades</strong> (moving to a lower-tier plan or from
              yearly to monthly billing) take effect at your next renewal date.
              You retain full access to your current plan until then.
            </p>
            <p>
              Plan changes do not reset your billing cycle or usage counters.
              Entitlements (features, assistant limits, analytics) update
              immediately on upgrade. Overage rates remain at the standard rate
              for the active plan.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              Merchants may terminate their use of Bizmis at any time by
              uninstalling the app from their Shopify store. Upon termination,
              all associated data will be deleted in accordance with our
              Privacy Policy and Shopify's requirements.
            </p>
          </Section>

          <Section title="12. Changes to These Terms">
            <p>
              We may update these Terms of Service from time to time. We will
              notify merchants of material changes through the Bizmis app admin
              panel or via email. Continued use of the service after changes
              constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These terms shall be governed by and construed in accordance with
              the laws of Spain. Any disputes arising from these terms shall be
              subject to the exclusive jurisdiction of the courts of Barcelona,
              Spain.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For questions about these Terms of Service, contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:text-primary-dark hover:underline">
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

export default Terms;
