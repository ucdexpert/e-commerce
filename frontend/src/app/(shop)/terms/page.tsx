export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-lg text-gray-600">Last updated: March 17, 2026</p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using the E-Shop website ("the Site"), you agree to be bound by these Terms 
            of Service ("Terms") and all applicable laws and regulations. If you do not agree with any 
            of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Permission is granted to temporarily access the materials (information or software) on E-Shop's 
            website for personal, non-commercial transitory viewing only. This is the grant of a license, 
            not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software</li>
            <li>Remove any copyright or proprietary notations</li>
            <li>Transfer the materials to another person</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Purchase Terms</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Order Acceptance</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Your placement of an order represents an offer to buy. All orders are subject to acceptance 
            and availability. We reserve the right to refuse or cancel any order for any reason, including 
            but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Product unavailability</li>
            <li>Pricing errors</li>
            <li>Suspected fraud</li>
            <li>Violation of our terms</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Pricing</h3>
          <p className="text-gray-600 leading-relaxed">
            All prices are listed in USD and are subject to change without notice. We reserve the right 
            to correct any pricing errors that may occur. If we discover an error after you've placed 
            an order, we will contact you before processing your order.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Payment</h3>
          <p className="text-gray-600 leading-relaxed">
            We accept major credit cards, debit cards, and cash on delivery. By providing a payment 
            method, you represent that you are authorized to use that payment method. Payment must be 
            received in full before shipment of products.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Shipping and Delivery</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>We ship to addresses within our service areas only</li>
            <li>Shipping times are estimates and not guaranteed</li>
            <li>You are responsible for providing accurate shipping information</li>
            <li>Risk of loss passes to you upon delivery to the carrier</li>
            <li>Shipping costs are calculated at checkout</li>
            <li>Free shipping is available on orders over $100</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Return and Refund Policy</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Return Eligibility</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            We accept returns within 30 days of delivery under the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Items must be unused and in original packaging</li>
            <li>All tags and labels must be attached</li>
            <li>Proof of purchase is required</li>
            <li>Certain items are non-returnable (see below)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Non-Returnable Items</h3>
          <p className="text-gray-600 leading-relaxed">
            The following items cannot be returned:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Gift cards</li>
            <li>Downloadable software</li>
            <li>Personalized or custom-made items</li>
            <li>Perishable goods</li>
            <li>Items marked as "Final Sale"</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Refund Process</h3>
          <p className="text-gray-600 leading-relaxed">
            Once we receive and inspect your return, we will notify you of the approval or rejection 
            of your refund. If approved, refunds will be processed to your original payment method 
            within 5-7 business days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>You must be at least 18 years old to create an account</li>
            <li>You are responsible for maintaining account confidentiality</li>
            <li>You must notify us immediately of unauthorized access</li>
            <li>We reserve the right to terminate accounts at our discretion</li>
            <li>You agree to provide accurate and complete information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Uses</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            You may not use our website:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>In any way that violates applicable laws</li>
            <li>To engage in fraudulent activities</li>
            <li>To transmit malware or malicious code</li>
            <li>To interfere with website security features</li>
            <li>To harvest user information without consent</li>
            <li>To impersonate any person or entity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            All content on this website, including text, graphics, logos, images, and software, is the 
            property of E-Shop or its content suppliers and is protected by copyright and intellectual 
            property laws. You may not use, reproduce, or distribute any content without our express 
            written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
          <p className="text-gray-600 leading-relaxed">
            This website and all content are provided "as is" and "as available" without warranties of 
            any kind, either express or implied. We do not warrant that the website will be uninterrupted, 
            error-free, or secure. We disclaim all warranties, including but not limited to implied 
            warranties of merchantability and fitness for a particular purpose.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            E-Shop shall not be liable for any indirect, incidental, special, consequential, or punitive 
            damages, including but not limited to loss of profits, data, or use, arising out of or in 
            connection with your use of the website or any products purchased, even if advised of the 
            possibility of such damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
          <p className="text-gray-600 leading-relaxed">
            You agree to indemnify, defend, and hold harmless E-Shop and its officers, directors, 
            employees, and agents from any claims, liabilities, damages, losses, or expenses arising 
            out of your use of the website, your violation of these terms, or your infringement of any 
            third-party rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of 
            New York, without regard to its conflict of law provisions. Any disputes arising under these 
            Terms shall be subject to the exclusive jurisdiction of the courts located in New York.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to modify these terms at any time. Changes will be effective immediately 
            upon posting to the website. Your continued use of the website after changes constitutes 
            acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            For questions about these Terms of Service, please contact us:
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
