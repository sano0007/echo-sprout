'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What are carbon credits?',
      answer:
        'Carbon credits are tradable certificates that represent the removal or reduction of one metric ton of carbon dioxide equivalent (CO2e) from the atmosphere. Organizations can purchase these credits to offset their carbon emissions and work toward carbon neutrality.',
    },
    {
      question: 'How does the verification process work?',
      answer:
        'Our certified verifiers review projects against international standards including VCS (Verified Carbon Standard), Gold Standard, and CCBS (Climate, Community & Biodiversity Standards). The process typically takes 4-8 weeks and includes documentation review, site visits, and compliance verification.',
    },
    {
      question: 'Who can register a carbon credit project?',
      answer:
        'Anyone with an environmental project that reduces or removes greenhouse gas emissions can register. This includes reforestation projects, renewable energy initiatives, methane capture programs, and other qualifying environmental projects. You\'ll need detailed documentation of your project\'s expected impact.',
    },
    {
      question: 'What fees does EcoSprout charge?',
      answer:
        'EcoSprout charges a small transaction fee of 2-3% on credit sales in the marketplace. Project registration and verification costs vary based on project size and complexity. There are no upfront fees to browse projects or create an account.',
    },
    {
      question: 'How long does it take to sell carbon credits?',
      answer:
        'The timeline varies based on market demand, credit pricing, and project type. Some credits sell within days, while others may take several weeks. Our transparent marketplace provides real-time analytics to help you price competitively and track buyer interest.',
    },
    {
      question: 'Are the carbon credits blockchain-verified?',
      answer:
        'Yes, all transactions on EcoSprout are recorded on blockchain for complete transparency and immutability. This ensures that credits cannot be double-counted and provides a permanent, auditable record of ownership and transfer.',
    },
    {
      question: 'Can I track the environmental impact of my purchases?',
      answer:
        'Absolutely! Our monitoring dashboard provides real-time impact metrics including CO2 reduced, projects supported, and geographic distribution. You can generate detailed impact reports for stakeholder communication and ESG reporting.',
    },
    {
      question: 'What makes EcoSprout different from other platforms?',
      answer:
        'EcoSprout combines rigorous verification standards with complete transparency through blockchain technology. We offer comprehensive project monitoring, real-time analytics, and a user-friendly marketplace that connects all stakeholders in the carbon credit ecosystem.',
    },
    {
      question: 'How do I get started as a buyer?',
      answer:
        'Simply create an account, browse our marketplace of verified projects, and select credits that align with your sustainability goals. You can filter by project type, location, certification standard, and price. Payment is secure, and you\'ll receive instant confirmation of your purchase.',
    },
    {
      question: 'What support is available for project creators?',
      answer:
        'We provide comprehensive support including documentation templates, verification guidance, marketplace listing optimization, and ongoing project monitoring tools. Our team is available via email, chat, and our community forum to help you succeed.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about carbon credits and our platform
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Answer Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2 bg-gray-50">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help you get started with carbon credits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Contact Support
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
            <a
              href="/learn"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200"
            >
              Visit Learning Hub
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
