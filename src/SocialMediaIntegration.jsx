import React, { useState } from 'react';

const SocialMediaIntegration = ({ language = 'en' }) => {
  const [activeChat, setActiveChat] = useState(null);

  const translations = {
    en: {
      connectWithUs: 'Connect With Us',
      socialMedia: 'Social Media Channels',
      instantMessaging: 'Instant Messaging',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      wechat: 'WeChat',
      messenger: 'Messenger',
      whatsappDesc: 'Chat with us instantly on WhatsApp for quick support',
      telegramDesc: 'Join our Telegram channel for updates and support',
      wechatDesc: 'Connect with us on WeChat for personalized service',
      messengerDesc: 'Message us on Facebook Messenger for assistance',
      startChat: 'Start Chat',
      joinChannel: 'Join Channel',
      addContact: 'Add Contact',
      sendMessage: 'Send Message',
      followUs: 'Follow Us',
      stayConnected: 'Stay Connected'
    },
    es: {
      connectWithUs: 'Conéctate Con Nosotros',
      socialMedia: 'Canales de Redes Sociales',
      instantMessaging: 'Mensajería Instantánea',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      wechat: 'WeChat',
      messenger: 'Messenger',
      whatsappDesc: 'Chatea con nosotros instantáneamente en WhatsApp para soporte rápido',
      telegramDesc: 'Únete a nuestro canal de Telegram para actualizaciones y soporte',
      wechatDesc: 'Conéctate con nosotros en WeChat para servicio personalizado',
      messengerDesc: 'Envíanos un mensaje en Facebook Messenger para asistencia',
      startChat: 'Iniciar Chat',
      joinChannel: 'Unirse al Canal',
      addContact: 'Agregar Contacto',
      sendMessage: 'Enviar Mensaje',
      followUs: 'Síguenos',
      stayConnected: 'Mantente Conectado'
    },
    ar: {
      connectWithUs: 'تواصل معنا',
      socialMedia: 'قنوات وسائل التواصل الاجتماعي',
      instantMessaging: 'المراسلة الفورية',
      whatsapp: 'واتساب',
      telegram: 'تيليجرام',
      wechat: 'وي تشات',
      messenger: 'ماسنجر',
      whatsappDesc: 'تحدث معنا فوراً على واتساب للحصول على دعم سريع',
      telegramDesc: 'انضم إلى قناة تيليجرام للحصول على التحديثات والدعم',
      wechatDesc: 'تواصل معنا على وي تشات للحصول على خدمة شخصية',
      messengerDesc: 'أرسل لنا رسالة على فيسبوك ماسنجر للمساعدة',
      startChat: 'بدء الدردشة',
      joinChannel: 'انضم للقناة',
      addContact: 'إضافة جهة اتصال',
      sendMessage: 'إرسال رسالة',
      followUs: 'تابعنا',
      stayConnected: 'ابق متصلاً'
    },
    zh: {
      connectWithUs: '与我们联系',
      socialMedia: '社交媒体渠道',
      instantMessaging: '即时通讯',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      wechat: '微信',
      messenger: 'Messenger',
      whatsappDesc: '在WhatsApp上与我们即时聊天获取快速支持',
      telegramDesc: '加入我们的Telegram频道获取更新和支持',
      wechatDesc: '在微信上与我们联系获取个性化服务',
      messengerDesc: '在Facebook Messenger上给我们发消息寻求帮助',
      startChat: '开始聊天',
      joinChannel: '加入频道',
      addContact: '添加联系人',
      sendMessage: '发送消息',
      followUs: '关注我们',
      stayConnected: '保持联系'
    }
  };

  const t = translations[language] || translations.en;

  const socialPlatforms = [
    {
      id: 'whatsapp',
      name: t.whatsapp,
      description: t.whatsappDesc,
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
      url: 'https://wa.me/13451234567',
      action: t.startChat,
      type: 'external'
    },
    {
      id: 'telegram',
      name: t.telegram,
      description: t.telegramDesc,
      icon: '✈️',
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500',
      url: 'https://t.me/alhambrabank',
      action: t.joinChannel,
      type: 'external'
    },
    {
      id: 'wechat',
      name: t.wechat,
      description: t.wechatDesc,
      icon: '💬',
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-green-700',
      borderColor: 'border-green-600',
      url: 'AlhambraBank_Official',
      action: t.addContact,
      type: 'wechat'
    },
    {
      id: 'messenger',
      name: t.messenger,
      description: t.messengerDesc,
      icon: '💬',
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-600',
      url: 'https://m.me/alhambrabank',
      action: t.sendMessage,
      type: 'external'
    }
  ];

  const additionalSocialMedia = [
    {
      name: 'LinkedIn',
      icon: '💼',
      url: 'https://linkedin.com/company/alhambra-bank-trust',
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'Twitter/X',
      icon: '🐦',
      url: 'https://twitter.com/alhambrabank',
      color: 'bg-black hover:bg-gray-800'
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: 'https://facebook.com/alhambrabank',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: 'https://instagram.com/alhambrabank',
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      name: 'YouTube',
      icon: '📺',
      url: 'https://youtube.com/@alhambrabank',
      color: 'bg-red-600 hover:bg-red-700'
    }
  ];

  const handlePlatformClick = (platform) => {
    if (platform.type === 'wechat') {
      // Show WeChat QR code or ID
      alert(`WeChat ID: ${platform.url}\n\nPlease add this WeChat ID to connect with us.`);
    } else if (platform.type === 'external') {
      // Open external link
      window.open(platform.url, '_blank');
    }
  };

  const handleSocialMediaClick = (platform) => {
    window.open(platform.url, '_blank');
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-red-700 text-center mb-4">{t.connectWithUs}</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          {t.stayConnected} - Choose your preferred communication channel for instant support and updates.
        </p>

        {/* Instant Messaging Platforms */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-red-700 text-center mb-8">{t.instantMessaging}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialPlatforms.map((platform) => (
              <div
                key={platform.id}
                className={`bg-white border-2 ${platform.borderColor} rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">{platform.icon}</div>
                  <h4 className={`text-xl font-bold ${platform.textColor} mb-2`}>{platform.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{platform.description}</p>
                </div>
                
                <button
                  onClick={() => handlePlatformClick(platform)}
                  className={`w-full ${platform.color} text-white py-3 px-4 rounded-lg transition-colors font-semibold`}
                >
                  {platform.icon} {platform.action}
                </button>

                {/* Platform-specific features */}
                {platform.id === 'whatsapp' && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">Available 24/7</p>
                    <p className="text-xs text-green-600">+1 (345) 123-4567</p>
                  </div>
                )}

                {platform.id === 'telegram' && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">@alhambrabank</p>
                    <p className="text-xs text-blue-600">Daily updates & news</p>
                  </div>
                )}

                {platform.id === 'wechat' && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">WeChat ID:</p>
                    <p className="text-xs text-green-700 font-mono">AlhambraBank_Official</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Traditional Social Media */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-red-700 text-center mb-8">{t.followUs}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {additionalSocialMedia.map((platform, index) => (
              <button
                key={index}
                onClick={() => handleSocialMediaClick(platform)}
                className={`${platform.color} text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2`}
              >
                <span className="text-xl">{platform.icon}</span>
                <span className="font-semibold">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">📧</div>
              <h4 className="font-bold text-red-700 mb-2">Email</h4>
              <p className="text-gray-600">info@alhambrabank.ky</p>
              <p className="text-gray-600">support@alhambrabank.ky</p>
            </div>
            <div>
              <div className="text-3xl mb-3">📞</div>
              <h4 className="font-bold text-red-700 mb-2">Phone</h4>
              <p className="text-gray-600">+1 (345) 949-8066</p>
              <p className="text-gray-600">24/7 Support Available</p>
            </div>
            <div>
              <div className="text-3xl mb-3">📍</div>
              <h4 className="font-bold text-red-700 mb-2">Address</h4>
              <p className="text-gray-600">Cayman Islands</p>
              <p className="text-gray-600">British West Indies</p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handlePlatformClick(socialPlatforms[0])} // WhatsApp
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              💬 Quick WhatsApp Chat
            </button>
            <button
              onClick={() => handlePlatformClick(socialPlatforms[1])} // Telegram
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              ✈️ Join Telegram
            </button>
            <button
              onClick={() => alert('Scheduling system opening...')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              📅 Schedule Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaIntegration;
