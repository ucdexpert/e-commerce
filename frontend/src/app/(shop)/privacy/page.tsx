export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-lg text-gray-600">Last updated: March 17, 2026</p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to E-Shop ("we," "our," or "us"). We are committed to protecting your privacy and ensuring 
            you have a positive experience when using our website and services. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you visit our website or make 
            purchases.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            We may collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Register for an account</li>
            <li>Place an order or make a purchase</li>
            <li>Subscribe to our newsletter</li>
            <li>Contact customer support</li>
            <li>Participate in promotions or surveys</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            This information may include your name, email address, phone number, shipping address, 
            billing information, and payment details.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Automatically Collected Information</h3>
          <p className="text-gray-600 leading-relaxed">
            When you visit our website, we may automatically collect certain information about your device 
            and browsing activity, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>IP address and browser type</li>
            <li>Device information and operating system</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your purchases and account</li>
            <li>Send promotional emails and newsletters (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
            <li>Analyze website usage and trends</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Usage</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to enhance your browsing experience. Cookies are 
            small data files stored on your device that help us:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Remember your preferences and settings</li>
            <li>Keep you logged in</li>
            <li>Maintain your shopping cart</li>
            <li>Analyze website traffic and usage</li>
            <li>Personalize content and advertisements</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            You can control cookie settings through your browser. However, disabling cookies may limit 
            your ability to use certain features of our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your 
            information with:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li><strong>Service Providers:</strong> Payment processors, shipping companies, and IT services</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
            <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. However, no method of 
            transmission over the internet or electronic storage is 100% secure, and we cannot guarantee 
            absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Restrict or object to data processing</li>
            <li>Data portability</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            To exercise these rights, please contact us at{' '}
            <a href="mailto:support@eshop.com" className="text-primary hover:underline">
              support@eshop.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Links</h2>
          <p className="text-gray-600 leading-relaxed">
            Our website may contain links to third-party websites. We are not responsible for the privacy 
            practices or content of these sites. We encourage you to review their privacy policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            Our services are not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If we become aware that we have collected such 
            information, we will take steps to delete it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new policy on this page and updating the "Last updated" date. You are advised to 
            review this policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <div className="bg-gray-50 rounded-xl p-6 space-y-2">
            <p className="text-gray-700">
              <strong>Email:</strong>{' '}
              <a href="mailto:support@eshop.com" className="text-primary hover:underline">
                support@eshop.com
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
            <p className="text-gray-700">
              <strong>Address:</strong> 123 Commerce Street, New York, NY 10001
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
