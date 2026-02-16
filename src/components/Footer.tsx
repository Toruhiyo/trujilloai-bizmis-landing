import { getCurrentYear } from "../lib/utils/time";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-heading font-bold mb-4">Bizmis</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Your store's best salesperson, working 24/7 to boost sales,
              provide support, and understand your customers.
            </p>

            {/* Built for Shopify Section */}
            <div className="flex items-center space-x-3 bg-gray-800 rounded-lg p-4 max-w-fit">
              <p className="text-sm font-medium text-white">Built for</p>
              <img
                src="/images/shopify-full-logo-white.png"
                alt="Shopify logo"
                className="w-20 h-6 object-contain"
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a href="/faqs" className="hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {getCurrentYear()} Bizmis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
