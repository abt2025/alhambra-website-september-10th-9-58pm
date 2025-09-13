import React, { useState, useEffect } from 'react';
import { useLanguageManager } from './LanguageManager.jsx';

const EnhancedOnboarding = ({ isOpen, onClose, accountType = 'individual' }) => {
  const { language, content } = useLanguageManager();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [agentAssistanceRequested, setAgentAssistanceRequested] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [kycStatus, setKycStatus] = useState('pending');

  // Multi-language onboarding content
  const onboardingContent = {
    en: {
      title: 'Account Opening - Digital Onboarding',
      steps: [
        'Personal Information',
        'Document Upload',
        'Video KYC Verification',
        'Account Setup',
        'Completion'
      ],
      personalInfo: {
        title: 'Personal Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        dateOfBirth: 'Date of Birth',
        nationality: 'Nationality',
        address: 'Address',
        city: 'City',
        country: 'Country',
        postalCode: 'Postal Code'
      },
      documents: {
        title: 'Document Upload',
        passport: 'Passport/ID Document',
        proofOfAddress: 'Proof of Address',
        bankStatement: 'Bank Statement',
        sourceOfFunds: 'Source of Funds Declaration',
        uploadButton: 'Upload Document',
        dragDrop: 'Drag and drop files here or click to browse'
      },
      videoKyc: {
        title: 'Video KYC Verification',
        description: 'Complete your identity verification through our secure video call system',
        startVideo: 'Start Video Verification',
        scheduleCall: 'Schedule Video Call',
        agentAssistance: 'Request Agent Assistance'
      },
      buttons: {
        next: 'Next Step',
        previous: 'Previous',
        submit: 'Submit Application',
        requestAgent: 'Request Agent Help',
        uploadDocument: 'Upload Document',
        startKyc: 'Start KYC Process',
        scheduleCall: 'Schedule Call with Agent',
        printForms: 'Print Manual Forms',
        shareScreen: 'Share Screen with Agent',
        coBrowse: 'Start Co-browsing Session'
      },
      agentHelp: {
        title: 'Agent Assistance Available',
        description: 'Our banking specialists are available to help you through the onboarding process',
        requestHelp: 'Request Help Now',
        scheduleCall: 'Schedule a Call',
        chatNow: 'Chat with Agent',
        videoCall: 'Video Call with Agent'
      }
    },
    es: {
      title: 'Apertura de Cuenta - Incorporación Digital',
      steps: [
        'Información Personal',
        'Carga de Documentos',
        'Verificación KYC por Video',
        'Configuración de Cuenta',
        'Finalización'
      ],
      personalInfo: {
        title: 'Información Personal',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo Electrónico',
        phone: 'Número de Teléfono',
        dateOfBirth: 'Fecha de Nacimiento',
        nationality: 'Nacionalidad',
        address: 'Dirección',
        city: 'Ciudad',
        country: 'País',
        postalCode: 'Código Postal'
      },
      documents: {
        title: 'Carga de Documentos',
        passport: 'Pasaporte/Documento de Identidad',
        proofOfAddress: 'Comprobante de Domicilio',
        bankStatement: 'Estado de Cuenta Bancario',
        sourceOfFunds: 'Declaración de Origen de Fondos',
        uploadButton: 'Cargar Documento',
        dragDrop: 'Arrastra y suelta archivos aquí o haz clic para explorar'
      },
      videoKyc: {
        title: 'Verificación KYC por Video',
        description: 'Complete su verificación de identidad a través de nuestro sistema seguro de videollamada',
        startVideo: 'Iniciar Verificación por Video',
        scheduleCall: 'Programar Videollamada',
        agentAssistance: 'Solicitar Asistencia de Agente'
      },
      buttons: {
        next: 'Siguiente Paso',
        previous: 'Anterior',
        submit: 'Enviar Solicitud',
        requestAgent: 'Solicitar Ayuda de Agente',
        uploadDocument: 'Cargar Documento',
        startKyc: 'Iniciar Proceso KYC',
        scheduleCall: 'Programar Llamada con Agente',
        printForms: 'Imprimir Formularios Manuales',
        shareScreen: 'Compartir Pantalla con Agente',
        coBrowse: 'Iniciar Sesión de Co-navegación'
      },
      agentHelp: {
        title: 'Asistencia de Agente Disponible',
        description: 'Nuestros especialistas bancarios están disponibles para ayudarle en el proceso de incorporación',
        requestHelp: 'Solicitar Ayuda Ahora',
        scheduleCall: 'Programar una Llamada',
        chatNow: 'Chatear con Agente',
        videoCall: 'Videollamada con Agente'
      }
    },
    ar: {
      title: 'فتح حساب - الإعداد الرقمي',
      steps: [
        'المعلومات الشخصية',
        'رفع المستندات',
        'التحقق من الهوية بالفيديو',
        'إعداد الحساب',
        'الإنجاز'
      ],
      personalInfo: {
        title: 'المعلومات الشخصية',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        email: 'عنوان البريد الإلكتروني',
        phone: 'رقم الهاتف',
        dateOfBirth: 'تاريخ الميلاد',
        nationality: 'الجنسية',
        address: 'العنوان',
        city: 'المدينة',
        country: 'البلد',
        postalCode: 'الرمز البريدي'
      },
      documents: {
        title: 'رفع المستندات',
        passport: 'جواز السفر/وثيقة الهوية',
        proofOfAddress: 'إثبات العنوان',
        bankStatement: 'كشف حساب مصرفي',
        sourceOfFunds: 'إقرار مصدر الأموال',
        uploadButton: 'رفع المستند',
        dragDrop: 'اسحب وأفلت الملفات هنا أو انقر للتصفح'
      },
      videoKyc: {
        title: 'التحقق من الهوية بالفيديو',
        description: 'أكمل التحقق من هويتك من خلال نظام المكالمات المرئية الآمن',
        startVideo: 'بدء التحقق بالفيديو',
        scheduleCall: 'جدولة مكالمة فيديو',
        agentAssistance: 'طلب مساعدة الوكيل'
      },
      buttons: {
        next: 'الخطوة التالية',
        previous: 'السابق',
        submit: 'إرسال الطلب',
        requestAgent: 'طلب مساعدة الوكيل',
        uploadDocument: 'رفع المستند',
        startKyc: 'بدء عملية التحقق من الهوية',
        scheduleCall: 'جدولة مكالمة مع الوكيل',
        printForms: 'طباعة النماذج اليدوية',
        shareScreen: 'مشاركة الشاشة مع الوكيل',
        coBrowse: 'بدء جلسة التصفح المشترك'
      },
      agentHelp: {
        title: 'مساعدة الوكيل متاحة',
        description: 'متخصصو البنك متاحون لمساعدتك في عملية الإعداد',
        requestHelp: 'طلب المساعدة الآن',
        scheduleCall: 'جدولة مكالمة',
        chatNow: 'محادثة مع الوكيل',
        videoCall: 'مكالمة فيديو مع الوكيل'
      }
    },
    zh: {
      title: '开户 - 数字化入职',
      steps: [
        '个人信息',
        '文件上传',
        '视频身份验证',
        '账户设置',
        '完成'
      ],
      personalInfo: {
        title: '个人信息',
        firstName: '名',
        lastName: '姓',
        email: '电子邮箱',
        phone: '电话号码',
        dateOfBirth: '出生日期',
        nationality: '国籍',
        address: '地址',
        city: '城市',
        country: '国家',
        postalCode: '邮政编码'
      },
      documents: {
        title: '文件上传',
        passport: '护照/身份证件',
        proofOfAddress: '地址证明',
        bankStatement: '银行对账单',
        sourceOfFunds: '资金来源声明',
        uploadButton: '上传文件',
        dragDrop: '拖拽文件到此处或点击浏览'
      },
      videoKyc: {
        title: '视频身份验证',
        description: '通过我们安全的视频通话系统完成身份验证',
        startVideo: '开始视频验证',
        scheduleCall: '预约视频通话',
        agentAssistance: '请求代理协助'
      },
      buttons: {
        next: '下一步',
        previous: '上一步',
        submit: '提交申请',
        requestAgent: '请求代理帮助',
        uploadDocument: '上传文件',
        startKyc: '开始身份验证流程',
        scheduleCall: '与代理预约通话',
        printForms: '打印手动表格',
        shareScreen: '与代理共享屏幕',
        coBrowse: '开始协同浏览会话'
      },
      agentHelp: {
        title: '代理协助可用',
        description: '我们的银行专家可协助您完成入职流程',
        requestHelp: '立即请求帮助',
        scheduleCall: '预约通话',
        chatNow: '与代理聊天',
        videoCall: '与代理视频通话'
      }
    }
  };

  const t = onboardingContent[language] || onboardingContent.en;

  // Handle document upload
  const handleDocumentUpload = (event, docType) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const newDoc = {
        id: Date.now() + Math.random(),
        type: docType,
        name: file.name,
        size: file.size,
        status: 'uploaded',
        file: file
      };
      setDocuments(prev => [...prev, newDoc]);
    });
  };

  // Handle agent assistance request
  const handleAgentAssistance = (type) => {
    setAgentAssistanceRequested(true);
    console.log(`Agent assistance requested: ${type}`);
    // In real implementation, this would connect to agent system
    alert(`${type} request sent. An agent will assist you shortly.`);
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    console.log('Documents:', documents);
    alert('Application submitted successfully! You will receive confirmation shortly.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t.title}</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-red-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-4 flex justify-between items-center">
            {t.steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index + 1 <= currentStep ? 'bg-white text-red-600' : 'bg-red-400 text-white'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm hidden md:block">{step}</span>
                {index < t.steps.length - 1 && (
                  <div className={`w-8 h-1 mx-2 ${
                    index + 1 < currentStep ? 'bg-white' : 'bg-red-400'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Agent Assistance Panel */}
          {agentAssistanceRequested && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">{t.agentHelp.title}</h3>
              <p className="text-blue-700 mb-4">{t.agentHelp.description}</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleAgentAssistance('Chat')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {t.agentHelp.chatNow}
                </button>
                <button 
                  onClick={() => handleAgentAssistance('Video Call')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {t.agentHelp.videoCall}
                </button>
                <button 
                  onClick={() => handleAgentAssistance('Screen Share')}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  {t.buttons.shareScreen}
                </button>
                <button 
                  onClick={() => handleAgentAssistance('Co-browse')}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  {t.buttons.coBrowse}
                </button>
              </div>
            </div>
          )}

          {/* Step Content */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">{t.personalInfo.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder={t.personalInfo.firstName}
                  className="border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder={t.personalInfo.lastName}
                  className="border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder={t.personalInfo.email}
                  className="border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="tel" 
                  placeholder={t.personalInfo.phone}
                  className="border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <input 
                  type="date" 
                  placeholder={t.personalInfo.dateOfBirth}
                  className="border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder={t.personalInfo.nationality}
                  className="border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder={t.personalInfo.address}
                  className="border border-gray-300 rounded px-3 py-2 md:col-span-2"
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder={t.personalInfo.city}
                  className="border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder={t.personalInfo.country}
                  className="border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">{t.documents.title}</h3>
              <div className="space-y-4">
                {['passport', 'proofOfAddress', 'bankStatement', 'sourceOfFunds'].map((docType) => (
                  <div key={docType} className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <h4 className="font-semibold mb-2">{t.documents[docType]}</h4>
                    <div className="flex items-center justify-center">
                      <label className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        {t.documents.uploadButton}
                        <input 
                          type="file" 
                          className="hidden" 
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentUpload(e, docType)}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">{t.documents.dragDrop}</p>
                  </div>
                ))}
                
                {/* Document List */}
                {documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Uploaded Documents:</h4>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{doc.name}</span>
                          <span className="text-xs text-green-600">✓ Uploaded</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">{t.videoKyc.title}</h3>
              <p className="text-gray-700 mb-6">{t.videoKyc.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAgentAssistance('Video KYC')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  {t.videoKyc.startVideo}
                </button>
                <button 
                  onClick={() => handleAgentAssistance('Schedule KYC')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {t.videoKyc.scheduleCall}
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">KYC Requirements:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Valid government-issued ID</li>
                  <li>• Good lighting and stable internet connection</li>
                  <li>• Quiet environment for video call</li>
                  <li>• Have your documents ready</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Account Setup</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <select className="border border-gray-300 rounded px-3 py-2 w-full">
                    <option value="individual">Individual Account</option>
                    <option value="corporate">Corporate Account</option>
                    <option value="trust">Trust Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Deposit</label>
                  <input 
                    type="number" 
                    placeholder="Minimum $10,000"
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency Preference</label>
                  <select className="border border-gray-300 rounded px-3 py-2 w-full">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Application Complete!</h3>
                <p className="text-gray-700">Your account opening application has been submitted successfully.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-2">Next Steps:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Review and verification (1-2 business days)</li>
                  <li>• Account activation notification</li>
                  <li>• Welcome package and banking credentials</li>
                  <li>• Initial deposit instructions</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setAgentAssistanceRequested(!agentAssistanceRequested)}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              {t.buttons.requestAgent}
            </button>
            <button 
              onClick={() => handleAgentAssistance('Print Forms')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              {t.buttons.printForms}
            </button>
          </div>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                {t.buttons.previous}
              </button>
            )}
            {currentStep < 5 ? (
              <button 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {t.buttons.next}
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {t.buttons.submit}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboarding;
