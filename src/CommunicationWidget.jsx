import React, { useState, useEffect } from 'react';

const CommunicationWidget = ({ language = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('chat');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', message: 'Hello! How can I assist you today?', timestamp: new Date() }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isPhoneCall, setIsPhoneCall] = useState(false);

  const translations = {
    en: {
      chat: 'Chat',
      phone: 'Phone',
      video: 'Video',
      social: 'Social Media',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      wechat: 'WeChat',
      messenger: 'Messenger',
      startChat: 'Start Chat',
      callUs: 'Call Us',
      videoCall: 'Video Call',
      scheduleCall: 'Schedule Call',
      sendMessage: 'Send Message',
      typeMessage: 'Type your message...',
      connecting: 'Connecting...',
      connected: 'Connected',
      endCall: 'End Call',
      minimize: 'Minimize',
      close: 'Close'
    },
    es: {
      chat: 'Chat',
      phone: 'Teléfono',
      video: 'Video',
      social: 'Redes Sociales',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      wechat: 'WeChat',
      messenger: 'Messenger',
      startChat: 'Iniciar Chat',
      callUs: 'Llamanos',
      videoCall: 'Videollamada',
      scheduleCall: 'Programar Llamada',
      sendMessage: 'Enviar Mensaje',
      typeMessage: 'Escribe tu mensaje...',
      connecting: 'Conectando...',
      connected: 'Conectado',
      endCall: 'Finalizar Llamada',
      minimize: 'Minimizar',
      close: 'Cerrar'
    },
    ar: {
      chat: 'دردشة',
      phone: 'هاتف',
      video: 'فيديو',
      social: 'وسائل التواصل',
      whatsapp: 'واتساب',
      telegram: 'تيليجرام',
      wechat: 'وي تشات',
      messenger: 'ماسنجر',
      startChat: 'بدء الدردشة',
      callUs: 'اتصل بنا',
      videoCall: 'مكالمة فيديو',
      scheduleCall: 'جدولة مكالمة',
      sendMessage: 'إرسال رسالة',
      typeMessage: 'اكتب رسالتك...',
      connecting: 'جاري الاتصال...',
      connected: 'متصل',
      endCall: 'إنهاء المكالمة',
      minimize: 'تصغير',
      close: 'إغلاق'
    },
    zh: {
      chat: '聊天',
      phone: '电话',
      video: '视频',
      social: '社交媒体',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      wechat: '微信',
      messenger: 'Messenger',
      startChat: '开始聊天',
      callUs: '致电我们',
      videoCall: '视频通话',
      scheduleCall: '预约通话',
      sendMessage: '发送消息',
      typeMessage: '输入您的消息...',
      connecting: '连接中...',
      connected: '已连接',
      endCall: '结束通话',
      minimize: '最小化',
      close: '关闭'
    }
  };

  const t = translations[language] || translations.en;

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages(prev => [...prev, {
        type: 'user',
        message: currentMessage,
        timestamp: new Date()
      }]);
      
      // Simulate bot response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'bot',
          message: 'Thank you for your message. A representative will be with you shortly.',
          timestamp: new Date()
        }]);
      }, 1000);
      
      setCurrentMessage('');
    }
  };

  const handlePhoneCall = () => {
    setIsPhoneCall(true);
    // Simulate phone call connection
    setTimeout(() => {
      alert('Connecting you to our customer service team...');
    }, 1000);
  };

  const handleVideoCall = () => {
    setIsVideoCall(true);
    // Simulate video call setup
    setTimeout(() => {
      alert('Starting video call with our representative...');
    }, 1000);
  };

  const handleSocialMediaClick = (platform) => {
    const contacts = {
      whatsapp: 'https://wa.me/13451234567',
      telegram: 'https://t.me/alhambrabank',
      wechat: 'AlhambraBank_Official',
      messenger: 'https://m.me/alhambrabank'
    };

    if (platform === 'wechat') {
      alert(`WeChat ID: ${contacts.wechat}`);
    } else {
      window.open(contacts[platform], '_blank');
    }
  };

  const renderChatInterface = () => (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`mb-3 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-xs p-3 rounded-lg ${
              msg.type === 'user' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-800 border'
            }`}>
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.typeMessage}
            className="flex-1 p-2 border rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );

  const renderPhoneInterface = () => (
    <div className="p-6 text-center">
      <div className="mb-6">
        <div className="text-6xl mb-4">📞</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t.callUs}</h3>
        <p className="text-gray-600 mb-4">+1 (345) 949-8066</p>
      </div>
      
      {isPhoneCall ? (
        <div className="space-y-4">
          <div className="text-green-600 font-semibold">{t.connecting}</div>
          <button
            onClick={() => setIsPhoneCall(false)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t.endCall}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handlePhoneCall}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📞 {t.callUs}
          </button>
          <button
            onClick={() => setActiveMode('video')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📹 {t.videoCall}
          </button>
          <button
            onClick={() => alert('Scheduling system will open...')}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📅 {t.scheduleCall}
          </button>
        </div>
      )}
    </div>
  );

  const renderVideoInterface = () => (
    <div className="p-6 text-center">
      <div className="mb-6">
        <div className="text-6xl mb-4">📹</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t.videoCall}</h3>
      </div>
      
      {isVideoCall ? (
        <div className="space-y-4">
          <div className="bg-gray-900 h-48 rounded-lg flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-2">👤</div>
              <p>{t.connected}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <button className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700">
              🎤
            </button>
            <button className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700">
              📹
            </button>
            <button
              onClick={() => setIsVideoCall(false)}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              📞
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleVideoCall}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📹 {t.videoCall}
          </button>
          <button
            onClick={() => setActiveMode('phone')}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📞 {t.callUs}
          </button>
        </div>
      )}
    </div>
  );

  const renderSocialInterface = () => (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{t.social}</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSocialMediaClick('whatsapp')}
          className="flex items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <span className="text-2xl mr-2">💬</span>
          {t.whatsapp}
        </button>
        <button
          onClick={() => handleSocialMediaClick('telegram')}
          className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <span className="text-2xl mr-2">✈️</span>
          {t.telegram}
        </button>
        <button
          onClick={() => handleSocialMediaClick('wechat')}
          className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <span className="text-2xl mr-2">💬</span>
          {t.wechat}
        </button>
        <button
          onClick={() => handleSocialMediaClick('messenger')}
          className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-2xl mr-2">💬</span>
          {t.messenger}
        </button>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Choose your preferred communication method
        </p>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all hover:scale-110"
        >
          <span className="text-2xl">💬</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-w-[90vw]">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="font-semibold">Alhambra Bank Support</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ➖
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b">
          {[
            { key: 'chat', icon: '💬', label: t.chat },
            { key: 'phone', icon: '📞', label: t.phone },
            { key: 'video', icon: '📹', label: t.video },
            { key: 'social', icon: '🌐', label: t.social }
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => setActiveMode(mode.key)}
              className={`flex-1 p-3 text-center transition-colors ${
                activeMode === mode.key
                  ? 'bg-red-50 text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg">{mode.icon}</div>
              <div className="text-xs">{mode.label}</div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg">
          {activeMode === 'chat' && renderChatInterface()}
          {activeMode === 'phone' && renderPhoneInterface()}
          {activeMode === 'video' && renderVideoInterface()}
          {activeMode === 'social' && renderSocialInterface()}
        </div>
      </div>
    </div>
  );
};

export default CommunicationWidget;
