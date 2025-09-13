import React, { useState, useEffect, useRef } from 'react';
import { useLanguageManager } from './LanguageManager.jsx';

const CoBrowsingManager = ({ isActive, onClose, documents = [] }) => {
  const { language, content } = useLanguageManager();
  const [sessionId, setSessionId] = useState(null);
  const [agentConnected, setAgentConnected] = useState(false);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [agentCursor, setAgentCursor] = useState({ x: 0, y: 0, visible: false });
  const [annotations, setAnnotations] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Multi-language content for co-browsing
  const coBrowsingContent = {
    en: {
      title: 'Agent Assistance - Co-browsing Session',
      sessionStatus: 'Session Status',
      agentStatus: {
        connecting: 'Connecting to agent...',
        connected: 'Agent connected',
        disconnected: 'Agent disconnected',
        waiting: 'Waiting for agent to join'
      },
      controls: {
        shareScreen: 'Share Screen',
        stopSharing: 'Stop Sharing',
        shareDocument: 'Share Document',
        endSession: 'End Session',
        requestControl: 'Request Control',
        grantControl: 'Grant Control',
        sendMessage: 'Send Message',
        clearAnnotations: 'Clear Annotations'
      },
      documentSharing: {
        title: 'Document Sharing',
        shareSelected: 'Share Selected Documents',
        sharedDocs: 'Shared Documents',
        noDocuments: 'No documents available to share',
        selectAll: 'Select All',
        unselectAll: 'Unselect All'
      },
      chat: {
        title: 'Chat with Agent',
        placeholder: 'Type your message...',
        agentTyping: 'Agent is typing...',
        you: 'You',
        agent: 'Agent'
      },
      annotations: {
        title: 'Screen Annotations',
        draw: 'Draw',
        highlight: 'Highlight',
        text: 'Add Text',
        arrow: 'Add Arrow',
        clear: 'Clear All'
      },
      privacy: {
        title: 'Privacy Notice',
        message: 'This session is encrypted and recorded for quality assurance. Your agent can see your screen and shared documents only.',
        understood: 'I Understand'
      }
    },
    es: {
      title: 'Asistencia de Agente - Sesión de Co-navegación',
      sessionStatus: 'Estado de la Sesión',
      agentStatus: {
        connecting: 'Conectando con el agente...',
        connected: 'Agente conectado',
        disconnected: 'Agente desconectado',
        waiting: 'Esperando que se una el agente'
      },
      controls: {
        shareScreen: 'Compartir Pantalla',
        stopSharing: 'Detener Compartir',
        shareDocument: 'Compartir Documento',
        endSession: 'Finalizar Sesión',
        requestControl: 'Solicitar Control',
        grantControl: 'Otorgar Control',
        sendMessage: 'Enviar Mensaje',
        clearAnnotations: 'Limpiar Anotaciones'
      },
      documentSharing: {
        title: 'Compartir Documentos',
        shareSelected: 'Compartir Documentos Seleccionados',
        sharedDocs: 'Documentos Compartidos',
        noDocuments: 'No hay documentos disponibles para compartir',
        selectAll: 'Seleccionar Todo',
        unselectAll: 'Deseleccionar Todo'
      },
      chat: {
        title: 'Chat con Agente',
        placeholder: 'Escribe tu mensaje...',
        agentTyping: 'El agente está escribiendo...',
        you: 'Tú',
        agent: 'Agente'
      },
      annotations: {
        title: 'Anotaciones de Pantalla',
        draw: 'Dibujar',
        highlight: 'Resaltar',
        text: 'Agregar Texto',
        arrow: 'Agregar Flecha',
        clear: 'Limpiar Todo'
      },
      privacy: {
        title: 'Aviso de Privacidad',
        message: 'Esta sesión está encriptada y grabada para asegurar la calidad. Su agente puede ver su pantalla y documentos compartidos únicamente.',
        understood: 'Entiendo'
      }
    },
    ar: {
      title: 'مساعدة الوكيل - جلسة التصفح المشترك',
      sessionStatus: 'حالة الجلسة',
      agentStatus: {
        connecting: 'جاري الاتصال بالوكيل...',
        connected: 'الوكيل متصل',
        disconnected: 'الوكيل غير متصل',
        waiting: 'في انتظار انضمام الوكيل'
      },
      controls: {
        shareScreen: 'مشاركة الشاشة',
        stopSharing: 'إيقاف المشاركة',
        shareDocument: 'مشاركة المستند',
        endSession: 'إنهاء الجلسة',
        requestControl: 'طلب التحكم',
        grantControl: 'منح التحكم',
        sendMessage: 'إرسال رسالة',
        clearAnnotations: 'مسح التعليقات التوضيحية'
      },
      documentSharing: {
        title: 'مشاركة المستندات',
        shareSelected: 'مشاركة المستندات المحددة',
        sharedDocs: 'المستندات المشتركة',
        noDocuments: 'لا توجد مستندات متاحة للمشاركة',
        selectAll: 'تحديد الكل',
        unselectAll: 'إلغاء تحديد الكل'
      },
      chat: {
        title: 'محادثة مع الوكيل',
        placeholder: 'اكتب رسالتك...',
        agentTyping: 'الوكيل يكتب...',
        you: 'أنت',
        agent: 'الوكيل'
      },
      annotations: {
        title: 'تعليقات الشاشة التوضيحية',
        draw: 'رسم',
        highlight: 'تمييز',
        text: 'إضافة نص',
        arrow: 'إضافة سهم',
        clear: 'مسح الكل'
      },
      privacy: {
        title: 'إشعار الخصوصية',
        message: 'هذه الجلسة مشفرة ومسجلة لضمان الجودة. يمكن للوكيل رؤية شاشتك والمستندات المشتركة فقط.',
        understood: 'فهمت'
      }
    },
    zh: {
      title: '代理协助 - 协同浏览会话',
      sessionStatus: '会话状态',
      agentStatus: {
        connecting: '正在连接代理...',
        connected: '代理已连接',
        disconnected: '代理已断开',
        waiting: '等待代理加入'
      },
      controls: {
        shareScreen: '共享屏幕',
        stopSharing: '停止共享',
        shareDocument: '共享文档',
        endSession: '结束会话',
        requestControl: '请求控制',
        grantControl: '授予控制',
        sendMessage: '发送消息',
        clearAnnotations: '清除标注'
      },
      documentSharing: {
        title: '文档共享',
        shareSelected: '共享选定文档',
        sharedDocs: '已共享文档',
        noDocuments: '没有可共享的文档',
        selectAll: '全选',
        unselectAll: '取消全选'
      },
      chat: {
        title: '与代理聊天',
        placeholder: '输入您的消息...',
        agentTyping: '代理正在输入...',
        you: '您',
        agent: '代理'
      },
      annotations: {
        title: '屏幕标注',
        draw: '绘制',
        highlight: '高亮',
        text: '添加文本',
        arrow: '添加箭头',
        clear: '清除全部'
      },
      privacy: {
        title: '隐私声明',
        message: '此会话已加密并录制以确保质量。您的代理只能看到您的屏幕和共享文档。',
        understood: '我理解'
      }
    }
  };

  const t = coBrowsingContent[language] || coBrowsingContent.en;

  // Initialize co-browsing session
  useEffect(() => {
    if (isActive) {
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      
      // Simulate agent connection
      setTimeout(() => {
        setAgentConnected(true);
        addChatMessage('agent', 'Hello! I\'m here to assist you with your account opening. I can see your screen and help you with any questions.');
      }, 3000);

      // Initialize shared documents from props
      if (documents.length > 0) {
        setSharedDocuments(documents.map(doc => ({ ...doc, selected: false })));
      }
    }

    return () => {
      // Cleanup when component unmounts
      if (screenShareActive) {
        stopScreenShare();
      }
    };
  }, [isActive]);

  // Add chat message
  const addChatMessage = (sender, message) => {
    const newMessage = {
      id: Date.now(),
      sender,
      message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  // Handle screen sharing
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setScreenShareActive(true);
      addChatMessage('system', 'Screen sharing started. Agent can now see your screen.');
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      alert('Unable to start screen sharing. Please check your browser permissions.');
    }
  };

  const stopScreenShare = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScreenShareActive(false);
    addChatMessage('system', 'Screen sharing stopped.');
  };

  // Handle document sharing
  const toggleDocumentSelection = (docId) => {
    setSharedDocuments(prev => 
      prev.map(doc => 
        doc.id === docId 
          ? { ...doc, selected: !doc.selected }
          : doc
      )
    );
  };

  const shareSelectedDocuments = () => {
    const selectedDocs = sharedDocuments.filter(doc => doc.selected);
    if (selectedDocs.length === 0) {
      alert('Please select at least one document to share.');
      return;
    }
    
    // Simulate document sharing
    addChatMessage('system', `Shared ${selectedDocs.length} document(s) with agent.`);
    addChatMessage('agent', 'Thank you for sharing the documents. I can now review them to assist you better.');
  };

  // Handle chat
  const sendChatMessage = () => {
    if (currentMessage.trim()) {
      addChatMessage('you', currentMessage);
      setCurrentMessage('');
      
      // Simulate agent response
      setTimeout(() => {
        const responses = [
          'I understand. Let me help you with that.',
          'That looks good. Please proceed to the next step.',
          'I can see the document you\'re referring to. Let me review it.',
          'Perfect! Your information has been verified.',
          'I\'ll need to check that with our compliance team. One moment please.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage('agent', randomResponse);
      }, 2000);
    }
  };

  // Handle annotations
  const addAnnotation = (type, position) => {
    const newAnnotation = {
      id: Date.now(),
      type,
      position,
      timestamp: new Date()
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  // Handle mouse movement for agent cursor simulation
  useEffect(() => {
    if (agentConnected) {
      const interval = setInterval(() => {
        // Simulate agent cursor movement
        setAgentCursor({
          x: Math.random() * 800,
          y: Math.random() * 600,
          visible: Math.random() > 0.7
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [agentConnected]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">{t.title}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${agentConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-sm">
                  {agentConnected ? t.agentStatus.connected : t.agentStatus.connecting}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:text-red-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-gray-100 p-3 border-b flex flex-wrap gap-2">
            <button 
              onClick={screenShareActive ? stopScreenShare : startScreenShare}
              className={`px-4 py-2 rounded text-sm font-medium ${
                screenShareActive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {screenShareActive ? t.controls.stopSharing : t.controls.shareScreen}
            </button>
            
            <button 
              onClick={shareSelectedDocuments}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
            >
              {t.controls.shareDocument}
            </button>
            
            <button 
              onClick={clearAnnotations}
              className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700"
            >
              {t.controls.clearAnnotations}
            </button>
            
            <button 
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 ml-auto"
            >
              {t.controls.endSession}
            </button>
          </div>

          {/* Screen Share Area */}
          <div className="flex-1 bg-gray-900 relative overflow-hidden">
            {screenShareActive ? (
              <div className="relative w-full h-full">
                <video 
                  ref={videoRef}
                  autoPlay
                  className="w-full h-full object-contain"
                />
                
                {/* Agent Cursor */}
                {agentCursor.visible && (
                  <div 
                    className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white pointer-events-none z-10"
                    style={{ 
                      left: agentCursor.x, 
                      top: agentCursor.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="absolute -top-6 left-2 text-xs text-white bg-red-500 px-1 rounded">
                      Agent
                    </div>
                  </div>
                )}
                
                {/* Annotations Canvas */}
                <canvas 
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
                  width="800"
                  height="600"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg mb-2">Screen sharing not active</p>
                  <p className="text-sm text-gray-400">Click "Share Screen" to start sharing your screen with the agent</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-l flex flex-col">
          
          {/* Document Sharing */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800 mb-3">{t.documentSharing.title}</h3>
            {sharedDocuments.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sharedDocuments.map((doc) => (
                  <label key={doc.id} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={doc.selected}
                      onChange={() => toggleDocumentSelection(doc.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t.documentSharing.noDocuments}</p>
            )}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">{t.chat.title}</h3>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.sender === 'you' 
                      ? 'bg-red-600 text-white' 
                      : msg.sender === 'agent'
                      ? 'bg-blue-100 text-gray-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <div className="font-medium text-xs mb-1">
                      {msg.sender === 'you' ? t.chat.you : msg.sender === 'agent' ? t.chat.agent : 'System'}
                    </div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input 
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder={t.chat.placeholder}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button 
                  onClick={sendChatMessage}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
                >
                  {t.controls.sendMessage}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice (shown on first load) */}
      {sessionId && !localStorage.getItem(`privacy_accepted_${sessionId}`) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-3">{t.privacy.title}</h3>
            <p className="text-sm text-gray-700 mb-4">{t.privacy.message}</p>
            <button 
              onClick={() => {
                localStorage.setItem(`privacy_accepted_${sessionId}`, 'true');
                // Force re-render by updating a state
                setSessionId(sessionId + '_accepted');
              }}
              className="w-full bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700"
            >
              {t.privacy.understood}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoBrowsingManager;
