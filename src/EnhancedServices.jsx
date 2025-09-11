import React, { useState } from 'react';

const EnhancedServices = ({ language = 'en' }) => {
  const [expandedService, setExpandedService] = useState(null);

  const translations = {
    en: {
      services: 'Our Services',
      scheduleCall: 'Schedule a Call',
      chat: 'Chat Now',
      videoCall: 'Video Call',
      learnMore: 'Learn More',
      showLess: 'Show Less',
      contactUs: 'Contact Us',
      getStarted: 'Get Started'
    },
    es: {
      services: 'Nuestros Servicios',
      scheduleCall: 'Programar Llamada',
      chat: 'Chat Ahora',
      videoCall: 'Videollamada',
      learnMore: 'Saber Más',
      showLess: 'Mostrar Menos',
      contactUs: 'Contáctanos',
      getStarted: 'Comenzar'
    },
    ar: {
      services: 'خدماتنا',
      scheduleCall: 'جدولة مكالمة',
      chat: 'دردشة الآن',
      videoCall: 'مكالمة فيديو',
      learnMore: 'اعرف أكثر',
      showLess: 'إظهار أقل',
      contactUs: 'اتصل بنا',
      getStarted: 'ابدأ'
    },
    zh: {
      services: '我们的服务',
      scheduleCall: '预约通话',
      chat: '立即聊天',
      videoCall: '视频通话',
      learnMore: '了解更多',
      showLess: '显示更少',
      contactUs: '联系我们',
      getStarted: '开始'
    }
  };

  const t = translations[language] || translations.en;

  const servicesData = [
    {
      id: 'asset-protection',
      title: 'Asset Protection & Private Wealth Planning',
      icon: '🏛️',
      shortDesc: 'Comprehensive wealth management and asset protection strategies for high-net-worth individuals and families.',
      fullContent: `
        <div class="space-y-6">
          <h3 class="text-xl font-semibold text-red-700 mb-4">Comprehensive Wealth Management Solutions</h3>
          
          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
            <h4 class="font-semibold text-red-700 mb-2">Asset Protection Strategies</h4>
            <p class="text-gray-700 mb-3">Our expert team develops sophisticated asset protection structures designed to safeguard your wealth from potential risks while maintaining accessibility and growth potential.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Offshore trust structures and foundations</li>
              <li>International diversification strategies</li>
              <li>Legal entity optimization</li>
              <li>Risk assessment and mitigation planning</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 class="font-semibold text-red-700 mb-2">Private Wealth Planning</h4>
            <p class="text-gray-700 mb-3">Tailored wealth planning services that align with your personal and family objectives, ensuring sustainable growth and legacy preservation.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Estate planning and succession strategies</li>
              <li>Tax-efficient investment structures</li>
              <li>Multi-generational wealth transfer</li>
              <li>Philanthropic planning and charitable giving</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 class="font-semibold text-red-700 mb-2">Investment Management</h4>
            <p class="text-gray-700 mb-3">Professional portfolio management with access to global markets and alternative investments, customized to your risk profile and objectives.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Discretionary portfolio management</li>
              <li>Alternative investment opportunities</li>
              <li>ESG and sustainable investing options</li>
              <li>Regular performance reporting and reviews</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: 'shariah-compliant',
      title: 'Shariah Compliant Investments',
      icon: '☪️',
      shortDesc: 'Islamic banking and investment solutions that adhere to Shariah principles while delivering competitive returns.',
      fullContent: `
        <div class="space-y-6">
          <h3 class="text-xl font-semibold text-red-700 mb-4">Islamic Banking Excellence</h3>
          
          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 class="font-semibold text-red-700 mb-2">Shariah-Compliant Investment Products</h4>
            <p class="text-gray-700 mb-3">Our Islamic banking division offers a comprehensive range of Shariah-compliant financial products and services, ensuring your investments align with Islamic principles.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Mudarabah and Musharakah investment structures</li>
              <li>Sukuk (Islamic bonds) portfolio management</li>
              <li>Shariah-compliant equity investments</li>
              <li>Islamic real estate investment opportunities</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 class="font-semibold text-red-700 mb-2">Islamic Wealth Management</h4>
            <p class="text-gray-700 mb-3">Comprehensive wealth management services designed specifically for Muslim clients, combining traditional Islamic finance principles with modern investment strategies.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Zakat calculation and planning services</li>
              <li>Waqf (endowment) establishment and management</li>
              <li>Islamic estate planning and inheritance solutions</li>
              <li>Halal investment screening and monitoring</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
            <h4 class="font-semibold text-red-700 mb-2">Shariah Advisory Board</h4>
            <p class="text-gray-700 mb-3">Our dedicated Shariah Advisory Board ensures all Islamic banking products and services comply with Islamic law and principles.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Continuous Shariah compliance monitoring</li>
              <li>Product development oversight</li>
              <li>Religious guidance and consultation</li>
              <li>Regular audits and certifications</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: 'citizenship-investment',
      title: 'Citizenship by Investment Programs',
      icon: '🌍',
      shortDesc: 'Expert guidance through citizenship and residency by investment programs worldwide, opening doors to global mobility.',
      fullContent: `
        <div class="space-y-6">
          <h3 class="text-xl font-semibold text-red-700 mb-4">Global Citizenship Solutions</h3>
          
          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
            <h4 class="font-semibold text-red-700 mb-2">Citizenship by Investment Programs</h4>
            <p class="text-gray-700 mb-3">Access to premier citizenship programs that offer visa-free travel, business opportunities, and enhanced global mobility for you and your family.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Caribbean citizenship programs (St. Kitts, Dominica, Antigua)</li>
              <li>European citizenship options (Malta, Cyprus)</li>
              <li>Investment threshold guidance and planning</li>
              <li>Due diligence and application support</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 class="font-semibold text-red-700 mb-2">Residency by Investment</h4>
            <p class="text-gray-700 mb-3">Golden visa and residency programs that provide pathways to permanent residency and eventual citizenship in desirable jurisdictions.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>European Golden Visa programs (Portugal, Spain, Greece)</li>
              <li>US EB-5 investor visa program</li>
              <li>Canadian investor immigration programs</li>
              <li>Australian significant investor visa options</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 class="font-semibold text-red-700 mb-2">Comprehensive Support Services</h4>
            <p class="text-gray-700 mb-3">End-to-end support throughout your citizenship or residency journey, from initial consultation to final approval and beyond.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Eligibility assessment and program selection</li>
              <li>Investment structuring and funding solutions</li>
              <li>Legal documentation and application preparation</li>
              <li>Ongoing compliance and renewal support</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: 'corporate-banking',
      title: 'Corporate & Institutional Services',
      icon: '🏢',
      shortDesc: 'Comprehensive corporate banking solutions for businesses, institutions, and multinational corporations.',
      fullContent: `
        <div class="space-y-6">
          <h3 class="text-xl font-semibold text-red-700 mb-4">Corporate Banking Excellence</h3>
          
          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
            <h4 class="font-semibold text-red-700 mb-2">Corporate Account Services</h4>
            <p class="text-gray-700 mb-3">Tailored banking solutions for corporations of all sizes, from startups to multinational enterprises, with dedicated relationship management.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Multi-currency corporate accounts</li>
              <li>International wire transfer services</li>
              <li>Trade finance and letters of credit</li>
              <li>Cash management and liquidity solutions</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 class="font-semibold text-red-700 mb-2">Treasury and Risk Management</h4>
            <p class="text-gray-700 mb-3">Advanced treasury services and risk management solutions to optimize your corporate financial operations and protect against market volatility.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Foreign exchange hedging strategies</li>
              <li>Interest rate risk management</li>
              <li>Commodity price hedging</li>
              <li>Corporate investment solutions</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 class="font-semibold text-red-700 mb-2">Institutional Services</h4>
            <p class="text-gray-700 mb-3">Specialized services for institutional clients including pension funds, insurance companies, and investment managers.</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Custody and safekeeping services</li>
              <li>Fund administration and reporting</li>
              <li>Securities lending and borrowing</li>
              <li>Regulatory compliance support</li>
            </ul>
          </div>
        </div>
      `
    }
  ];

  const handleCommunicationClick = (type, serviceTitle) => {
    switch (type) {
      case 'schedule':
        alert(`Scheduling a call for ${serviceTitle}. Our representative will contact you within 24 hours.`);
        break;
      case 'chat':
        alert(`Starting chat session for ${serviceTitle}. Please wait while we connect you to a specialist.`);
        break;
      case 'video':
        alert(`Initiating video call for ${serviceTitle}. Please ensure your camera and microphone are ready.`);
        break;
      default:
        break;
    }
  };

  const toggleExpanded = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-700 text-center mb-12">{t.services}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {servicesData.map((service) => (
            <div key={service.id} className="bg-white border-2 border-red-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Service Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{service.icon}</span>
                  <h2 className="text-2xl font-bold text-red-700">{service.title}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{service.shortDesc}</p>
              </div>

              {/* Expanded Content */}
              {expandedService === service.id && (
                <div className="p-6 border-b border-gray-200">
                  <div 
                    className="prose prose-red max-w-none"
                    dangerouslySetInnerHTML={{ __html: service.fullContent }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-6 bg-gray-50">
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => toggleExpanded(service.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {expandedService === service.id ? t.showLess : t.learnMore}
                  </button>
                  <button
                    onClick={() => handleCommunicationClick('schedule', service.title)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📅 {t.scheduleCall}
                  </button>
                </div>

                {/* Communication Options */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCommunicationClick('chat', service.title)}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💬 {t.chat}
                  </button>
                  <button
                    onClick={() => handleCommunicationClick('video', service.title)}
                    className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    📹 {t.videoCall}
                  </button>
                  <button
                    onClick={() => alert(`Getting started with ${service.title}. Redirecting to application form...`)}
                    className="px-3 py-2 bg-red-800 text-white text-sm rounded-lg hover:bg-red-900 transition-colors"
                  >
                    🚀 {t.getStarted}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-8">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🛡️", title: "Insurance & Risk Management", desc: "Comprehensive insurance solutions and risk assessment services" },
              { icon: "🏦", title: "Trade Finance", desc: "Letters of credit, trade guarantees, and international trade support" },
              { icon: "💱", title: "Foreign Exchange", desc: "Competitive FX rates and currency hedging solutions" },
              { icon: "📊", title: "Investment Advisory", desc: "Professional investment advice and portfolio management services" }
            ].map((item, index) => (
              <div key={index} className="bg-white border border-red-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3 text-center">{item.icon}</div>
                <h3 className="text-lg font-semibold text-red-700 mb-2 text-center">{item.title}</h3>
                <p className="text-gray-600 text-sm text-center mb-4">{item.desc}</p>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleCommunicationClick('schedule', item.title)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    {t.contactUs}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedServices;
