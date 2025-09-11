import React from 'react';

const OriginalContent = ({ language = 'en' }) => {
  const translations = {
    en: {
      whyAlhambra: 'Why Alhambra Bank & Trust',
      visionMission: 'Our Vision & Mission',
      principles: 'Our Fundamental Principles',
      founderMessage: 'Message from Our Founder',
      regulatoryInfo: 'Regulatory Information'
    },
    es: {
      whyAlhambra: 'Por qué Alhambra Bank & Trust',
      visionMission: 'Nuestra Visión y Misión',
      principles: 'Nuestros Principios Fundamentales',
      founderMessage: 'Mensaje de Nuestro Fundador',
      regulatoryInfo: 'Información Regulatoria'
    },
    ar: {
      whyAlhambra: 'لماذا بنك الحمراء والثقة',
      visionMission: 'رؤيتنا ورسالتنا',
      principles: 'مبادئنا الأساسية',
      founderMessage: 'رسالة من مؤسسنا',
      regulatoryInfo: 'المعلومات التنظيمية'
    },
    zh: {
      whyAlhambra: '为什么选择阿尔罕布拉银行信托',
      visionMission: '我们的愿景和使命',
      principles: '我们的基本原则',
      founderMessage: '创始人致辞',
      regulatoryInfo: '监管信息'
    }
  };

  const t = translations[language] || translations.en;

  return (
    <div className="space-y-16">
      {/* Why Alhambra Bank & Trust */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">{t.whyAlhambra}</h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-red-500">
              <h3 className="text-2xl font-semibold text-red-700 mb-4">Alhambra Bank & Trust: Your Caring Partner in Wealth Management and Private Banking</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                At Alhambra Bank & Trust, we recognize that high-net-worth individuals seek more than just financial services; they seek a trusted partner who can guide them with empathy and expertise. We take pride in crafting personalized financial solutions that align with your unique aspirations, always prioritizing accountability, transparency, and integrity to help you preserve and grow your estate.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-2xl font-semibold text-red-700 mb-4">Why Choose Alhambra Bank & Trust?</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Situated in the stunning Cayman Islands, we offer you the ideal blend of global reach and local insight. With decades of experience, our team expertly navigates the complexities of the financial landscape to provide you with exceptional, individualized service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                At Alhambra Bank & Trust, we believe in nurturing lasting relationships that extend beyond transactions. Our white-glove service is centered on fostering sustainable growth while ensuring you receive the personalized attention you deserve. Our dedicated advisors are committed to offering clear, educational guidance, empowering you to make informed decisions at every stage of your financial journey. As a regulated entity under the Cayman Islands Monetary Authority, we uphold the highest standards of compliance and discretion, building trust and loyalty among our clients.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-green-500">
              <h3 className="text-2xl font-semibold text-red-700 mb-4">Generational Wealth Stewardship</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                For generations, Alhambra Bank & Trust has been a devoted steward of wealth, embracing adaptive strategies and innovative solutions rooted in integrity. We invite you to partner with us to enhance your financial future, leveraging our global network, tailored wealth management expertise, and legacy planning services designed to safeguard your family's prosperity.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-purple-500">
              <h3 className="text-2xl font-semibold text-red-700 mb-4">Start Your Financial Journey Today</h3>
              <p className="text-gray-700 leading-relaxed">
                Imagine transforming your assets into a lasting legacy for future generations. We warmly invite you to connect with Alhambra Bank & Trust today and take that meaningful first step toward a brighter and more prosperous financial future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">{t.visionMission}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-red-800 text-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-white">Vision Statement</h3>
              <p className="text-lg leading-relaxed">
                We envision ourselves as a trusted global partner in wealth management, devoted to guiding individuals, corporations, and institutions on their paths to sustainable financial prosperity and stability, even as the economic landscape continues to evolve.
              </p>
            </div>
            <div className="bg-red-800 text-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-white">Mission Statement</h3>
              <p className="text-lg leading-relaxed">
                We are dedicated to delivering impartial financial solutions and diversification strategies designed to protect and enhance your wealth. By emphasizing geopolitical neutrality and cross-border resilience, we develop flexible strategies that empower you to navigate market fluctuations with confidence, securing your financial future. Our mission is to equip you with the tools and insights necessary to thrive in today's dynamic economic environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fundamental Principles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">{t.principles}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-red-700 mb-4">Client-Centered Integrity</h3>
              <p className="text-gray-700 leading-relaxed">
                At the core of our mission lies an unwavering dedication to our clients. We prioritize integrity, transparency, and ethical conduct, ensuring that every decision we make is focused on building trust and delivering genuine, meaningful value to those we serve.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-bold text-red-700 mb-4">Facilitating Financial Access</h3>
              <p className="text-gray-700 leading-relaxed">
                We recognize the challenges many individuals face in accessing financial services, and we are resolutely committed to dismantling these obstacles. Through innovation and collaboration, we aim to empower individuals and communities, enabling them to thrive and realize their aspirations.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-green-500">
              <h3 className="text-xl font-bold text-red-700 mb-4">Global Stewardship and Human Rights</h3>
              <p className="text-gray-700 leading-relaxed">
                We embrace our responsibilities as global citizens, standing resolutely for human rights and sustainable practices in all our endeavors. Our commitment to dignity, equity, and compliance with international legal standards drives us to foster positive change in the communities we engage with.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-purple-500">
              <h3 className="text-xl font-bold text-red-700 mb-4">Promoting Inclusive Diversity</h3>
              <p className="text-gray-700 leading-relaxed">
                Diversity is more than a value; it is a fundamental aspect of our culture. We are dedicated to cultivating an environment where every voice is valued and respected. By embracing a rich array of ethnicities, genders, beliefs, and perspectives, we promote innovation and ensure that all stakeholders have equal opportunities to thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Message */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">{t.founderMessage}</h2>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/3">
                <img 
                  src="/images/founder_ali_alsari.webp" 
                  alt="Ali Alsari - Non-Executive Board Director" 
                  className="w-full max-w-sm mx-auto rounded-lg shadow-lg border-4 border-red-200"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzlCOUJBMyIvPgo8cGF0aCBkPSJNNTAgMTgwQzUwIDE1MCA3MyAxMjAgMTAwIDEyMEMxMjcgMTIwIDE1MCAxNTAgMTUwIDE4MEgxNTBWMjQwSDUwVjE4MFoiIGZpbGw9IiM5QjlCQTMiLz4KPC9zdmc+';
                  }}
                />
              </div>
              <div className="lg:w-2/3">
                <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-red-500">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    The decision to start Alhambra Bank was rooted in a fundamental belief that everyone deserves to be treated with dignity, respect, and fairness, regardless of their skin color, religion, sexual orientation, or any other defining trait. Traditional banking systems have often been criticized for perpetuating inequality, whether through discriminatory practices, restricted access for underserved groups, lack of access for marginalized communities, or biases in decision-making. Alhambra Bank was established to disrupt these conventions and forge a financial institution that genuinely serves everyone on equal terms.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Our mission is to create a secure, inclusive, and empowering environment where both individuals and businesses can flourish without the threat of discrimination or exclusion. We firmly believe that banking should serve as a means of empowerment rather than a hindrance. By extending respect to all and providing equitable access to financial services, we strive to cultivate trust, fortify communities, and advance a society that is more just and inclusive.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Alhambra Bank is not merely a financial institution; it represents a movement toward a future where financial entities embody the principles of fairness, equality, and respect for all. We are committed to redefining the essence of banking, one that prioritizes people over profit and inclusion over exclusion.
                  </p>
                  <blockquote className="text-lg italic text-red-700 border-l-4 border-red-300 pl-4 mb-6">
                    "Alhambra Bank is more than just a bank—it's a movement toward a world where financial institutions reflect the values of fairness, equality, and respect for all. We are here to redefine what it means to be a bank, one that prioritizes people over profit and inclusion over exclusion."
                  </blockquote>
                  <div className="text-right">
                    <p className="font-semibold text-red-700 text-lg">Ali Alsari</p>
                    <p className="text-gray-600">Non-Executive Board Director</p>
                    <p className="text-gray-600">Alhambra Bank</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">{t.regulatoryInfo}</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-700 leading-relaxed mb-6">
                AB&T is a leading regulated financial institution, holding a comprehensive full banking license and trust license under the oversight of internationally recognized financial authorities. Our operations adhere to the highest global regulatory standards, ensuring unparalleled transparency and security.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our robust compliance framework is fortified by independent financial audits and certified legal counsel, guaranteeing adherence to stringent international protocols. This commitment ensures clients benefit from transparent, secure financial services while maintaining alignment with global regulatory standards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OriginalContent;
