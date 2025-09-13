import React, { useState, useRef, useCallback } from 'react';
import { useLanguageManager } from './LanguageManager.jsx';

const DocumentUploadManager = ({ onDocumentUploaded, onKycStatusChange }) => {
  const { language, content } = useLanguageManager();
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [kycStatus, setKycStatus] = useState('pending');
  const fileInputRef = useRef(null);

  // Multi-language content for document upload
  const uploadContent = {
    en: {
      title: 'Document Upload & KYC Verification',
      dragDrop: 'Drag and drop files here or click to browse',
      supportedFormats: 'Supported formats: PDF, JPG, PNG (Max 10MB each)',
      requiredDocs: 'Required Documents',
      optionalDocs: 'Optional Documents',
      uploadButton: 'Upload Documents',
      removeButton: 'Remove',
      viewButton: 'View',
      shareButton: 'Share with Agent',
      kycVerification: 'KYC Verification Status',
      documentTypes: {
        passport: 'Passport/Government ID',
        proofOfAddress: 'Proof of Address (Utility Bill, Bank Statement)',
        bankStatement: 'Bank Statement (Last 3 months)',
        sourceOfFunds: 'Source of Funds Declaration',
        businessLicense: 'Business License (Corporate accounts)',
        articlesOfIncorporation: 'Articles of Incorporation',
        beneficialOwnership: 'Beneficial Ownership Declaration',
        taxCertificate: 'Tax Residency Certificate',
        financialStatements: 'Financial Statements',
        referenceLetters: 'Professional Reference Letters'
      },
      status: {
        pending: 'Pending Review',
        reviewing: 'Under Review',
        approved: 'Approved',
        rejected: 'Requires Attention',
        incomplete: 'Incomplete - Additional Documents Required'
      },
      actions: {
        startKyc: 'Start KYC Process',
        scheduleCall: 'Schedule KYC Call',
        requestAgent: 'Request Agent Assistance',
        shareDocument: 'Share with Agent',
        downloadDocument: 'Download',
        replaceDocument: 'Replace Document'
      }
    },
    es: {
      title: 'Carga de Documentos y Verificación KYC',
      dragDrop: 'Arrastra y suelta archivos aquí o haz clic para explorar',
      supportedFormats: 'Formatos soportados: PDF, JPG, PNG (Máximo 10MB cada uno)',
      requiredDocs: 'Documentos Requeridos',
      optionalDocs: 'Documentos Opcionales',
      uploadButton: 'Cargar Documentos',
      removeButton: 'Eliminar',
      viewButton: 'Ver',
      shareButton: 'Compartir con Agente',
      kycVerification: 'Estado de Verificación KYC',
      documentTypes: {
        passport: 'Pasaporte/ID Gubernamental',
        proofOfAddress: 'Comprobante de Domicilio (Factura, Estado de Cuenta)',
        bankStatement: 'Estado de Cuenta Bancario (Últimos 3 meses)',
        sourceOfFunds: 'Declaración de Origen de Fondos',
        businessLicense: 'Licencia Comercial (Cuentas corporativas)',
        articlesOfIncorporation: 'Acta Constitutiva',
        beneficialOwnership: 'Declaración de Beneficiario Final',
        taxCertificate: 'Certificado de Residencia Fiscal',
        financialStatements: 'Estados Financieros',
        referenceLetters: 'Cartas de Referencia Profesional'
      },
      status: {
        pending: 'Pendiente de Revisión',
        reviewing: 'En Revisión',
        approved: 'Aprobado',
        rejected: 'Requiere Atención',
        incomplete: 'Incompleto - Documentos Adicionales Requeridos'
      },
      actions: {
        startKyc: 'Iniciar Proceso KYC',
        scheduleCall: 'Programar Llamada KYC',
        requestAgent: 'Solicitar Asistencia de Agente',
        shareDocument: 'Compartir con Agente',
        downloadDocument: 'Descargar',
        replaceDocument: 'Reemplazar Documento'
      }
    },
    ar: {
      title: 'رفع المستندات والتحقق من الهوية',
      dragDrop: 'اسحب وأفلت الملفات هنا أو انقر للتصفح',
      supportedFormats: 'الصيغ المدعومة: PDF, JPG, PNG (حد أقصى 10 ميجابايت لكل ملف)',
      requiredDocs: 'المستندات المطلوبة',
      optionalDocs: 'المستندات الاختيارية',
      uploadButton: 'رفع المستندات',
      removeButton: 'إزالة',
      viewButton: 'عرض',
      shareButton: 'مشاركة مع الوكيل',
      kycVerification: 'حالة التحقق من الهوية',
      documentTypes: {
        passport: 'جواز السفر/الهوية الحكومية',
        proofOfAddress: 'إثبات العنوان (فاتورة، كشف حساب)',
        bankStatement: 'كشف حساب مصرفي (آخر 3 أشهر)',
        sourceOfFunds: 'إقرار مصدر الأموال',
        businessLicense: 'رخصة تجارية (الحسابات المؤسسية)',
        articlesOfIncorporation: 'عقد التأسيس',
        beneficialOwnership: 'إقرار المالك المستفيد',
        taxCertificate: 'شهادة الإقامة الضريبية',
        financialStatements: 'البيانات المالية',
        referenceLetters: 'خطابات مرجعية مهنية'
      },
      status: {
        pending: 'في انتظار المراجعة',
        reviewing: 'قيد المراجعة',
        approved: 'موافق عليه',
        rejected: 'يتطلب انتباه',
        incomplete: 'غير مكتمل - مستندات إضافية مطلوبة'
      },
      actions: {
        startKyc: 'بدء عملية التحقق من الهوية',
        scheduleCall: 'جدولة مكالمة التحقق',
        requestAgent: 'طلب مساعدة الوكيل',
        shareDocument: 'مشاركة مع الوكيل',
        downloadDocument: 'تحميل',
        replaceDocument: 'استبدال المستند'
      }
    },
    zh: {
      title: '文件上传和身份验证',
      dragDrop: '拖拽文件到此处或点击浏览',
      supportedFormats: '支持格式：PDF, JPG, PNG（每个文件最大10MB）',
      requiredDocs: '必需文件',
      optionalDocs: '可选文件',
      uploadButton: '上传文件',
      removeButton: '删除',
      viewButton: '查看',
      shareButton: '与代理共享',
      kycVerification: '身份验证状态',
      documentTypes: {
        passport: '护照/政府身份证',
        proofOfAddress: '地址证明（水电费账单、银行对账单）',
        bankStatement: '银行对账单（最近3个月）',
        sourceOfFunds: '资金来源声明',
        businessLicense: '营业执照（企业账户）',
        articlesOfIncorporation: '公司章程',
        beneficialOwnership: '受益所有权声明',
        taxCertificate: '税务居民证明',
        financialStatements: '财务报表',
        referenceLetters: '专业推荐信'
      },
      status: {
        pending: '待审核',
        reviewing: '审核中',
        approved: '已批准',
        rejected: '需要关注',
        incomplete: '不完整 - 需要额外文件'
      },
      actions: {
        startKyc: '开始身份验证流程',
        scheduleCall: '预约身份验证通话',
        requestAgent: '请求代理协助',
        shareDocument: '与代理共享',
        downloadDocument: '下载',
        replaceDocument: '替换文件'
      }
    }
  };

  const t = uploadContent[language] || uploadContent.en;

  // Required documents for different account types
  const requiredDocuments = [
    'passport',
    'proofOfAddress',
    'bankStatement',
    'sourceOfFunds'
  ];

  const optionalDocuments = [
    'businessLicense',
    'articlesOfIncorporation',
    'beneficialOwnership',
    'taxCertificate',
    'financialStatements',
    'referenceLetters'
  ];

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Process uploaded files
  const handleFiles = (files) => {
    Array.from(files).forEach((file) => {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format. Please use PDF, JPG, or PNG.`);
        return;
      }

      const newDocument = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: determineDocumentType(file.name),
        size: file.size,
        file: file,
        status: 'uploading',
        uploadedAt: new Date(),
        shared: false
      };

      setDocuments(prev => [...prev, newDocument]);
      simulateUpload(newDocument.id);
    });
  };

  // Determine document type based on filename
  const determineDocumentType = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes('passport') || name.includes('id')) return 'passport';
    if (name.includes('address') || name.includes('utility')) return 'proofOfAddress';
    if (name.includes('bank') || name.includes('statement')) return 'bankStatement';
    if (name.includes('source') || name.includes('funds')) return 'sourceOfFunds';
    if (name.includes('license')) return 'businessLicense';
    if (name.includes('incorporation')) return 'articlesOfIncorporation';
    if (name.includes('beneficial')) return 'beneficialOwnership';
    if (name.includes('tax')) return 'taxCertificate';
    if (name.includes('financial')) return 'financialStatements';
    if (name.includes('reference')) return 'referenceLetters';
    return 'other';
  };

  // Simulate file upload progress
  const simulateUpload = (documentId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'uploaded' }
              : doc
          )
        );
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[documentId];
          return newProgress;
        });
        
        // Trigger KYC status update
        updateKycStatus();
        
        // Notify parent component
        if (onDocumentUploaded) {
          onDocumentUploaded(documentId);
        }
      } else {
        setUploadProgress(prev => ({ ...prev, [documentId]: progress }));
      }
    }, 200);
  };

  // Update KYC status based on uploaded documents
  const updateKycStatus = () => {
    const uploadedTypes = documents
      .filter(doc => doc.status === 'uploaded')
      .map(doc => doc.type);
    
    const hasAllRequired = requiredDocuments.every(type => 
      uploadedTypes.includes(type)
    );

    let newStatus = 'pending';
    if (hasAllRequired) {
      newStatus = 'reviewing';
    } else if (uploadedTypes.length > 0) {
      newStatus = 'incomplete';
    }

    setKycStatus(newStatus);
    if (onKycStatusChange) {
      onKycStatusChange(newStatus);
    }
  };

  // Handle document actions
  const handleDocumentAction = (action, documentId) => {
    const document = documents.find(doc => doc.id === documentId);
    
    switch (action) {
      case 'remove':
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        updateKycStatus();
        break;
      case 'view':
        // In real implementation, this would open a document viewer
        window.open(URL.createObjectURL(document.file), '_blank');
        break;
      case 'share':
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, shared: true }
              : doc
          )
        );
        alert(`Document "${document.name}" has been shared with your agent.`);
        break;
      case 'download':
        const url = URL.createObjectURL(document.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.name;
        a.click();
        URL.revokeObjectURL(url);
        break;
      default:
        break;
    }
  };

  // Handle KYC actions
  const handleKycAction = (action) => {
    switch (action) {
      case 'startKyc':
        alert('Starting KYC process. You will be redirected to the video verification.');
        break;
      case 'scheduleCall':
        alert('KYC call scheduled. You will receive a confirmation email shortly.');
        break;
      case 'requestAgent':
        alert('Agent assistance requested. An agent will contact you within 15 minutes.');
        break;
      default:
        break;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'reviewing': return 'text-blue-600 bg-blue-50';
      case 'incomplete': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-red-800 mb-6">{t.title}</h2>

      {/* KYC Status */}
      <div className="mb-6 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">{t.kycVerification}</h3>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kycStatus)}`}>
          {t.status[kycStatus]}
        </div>
        
        {/* KYC Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button 
            onClick={() => handleKycAction('startKyc')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {t.actions.startKyc}
          </button>
          <button 
            onClick={() => handleKycAction('scheduleCall')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t.actions.scheduleCall}
          </button>
          <button 
            onClick={() => handleKycAction('requestAgent')}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            {t.actions.requestAgent}
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 hover:border-red-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">{t.dragDrop}</p>
        <p className="text-sm text-gray-500 mb-4">{t.supportedFormats}</p>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
        >
          {t.uploadButton}
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Document Lists */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Documents */}
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-4">{t.requiredDocs}</h3>
          <div className="space-y-2">
            {requiredDocuments.map((docType) => {
              const uploadedDoc = documents.find(doc => doc.type === docType && doc.status === 'uploaded');
              return (
                <div key={docType} className={`p-3 rounded border ${uploadedDoc ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.documentTypes[docType]}</span>
                    {uploadedDoc ? (
                      <span className="text-green-600 text-sm">✓ Uploaded</span>
                    ) : (
                      <span className="text-red-600 text-sm">Required</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Documents */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t.optionalDocs}</h3>
          <div className="space-y-2">
            {optionalDocuments.map((docType) => {
              const uploadedDoc = documents.find(doc => doc.type === docType && doc.status === 'uploaded');
              return (
                <div key={docType} className={`p-3 rounded border ${uploadedDoc ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.documentTypes[docType]}</span>
                    {uploadedDoc ? (
                      <span className="text-blue-600 text-sm">✓ Uploaded</span>
                    ) : (
                      <span className="text-gray-500 text-sm">Optional</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {doc.status === 'uploading' ? (
                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm">✓</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {t.documentTypes[doc.type]} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                        {doc.shared && <span className="ml-2 text-blue-600">• Shared with Agent</span>}
                      </p>
                      {doc.status === 'uploading' && uploadProgress[doc.id] && (
                        <div className="mt-1 w-32 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-red-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[doc.id]}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {doc.status === 'uploaded' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleDocumentAction('view', doc.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {t.viewButton}
                    </button>
                    <button 
                      onClick={() => handleDocumentAction('share', doc.id)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                      disabled={doc.shared}
                    >
                      {doc.shared ? 'Shared' : t.shareButton}
                    </button>
                    <button 
                      onClick={() => handleDocumentAction('download', doc.id)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      {t.actions.downloadDocument}
                    </button>
                    <button 
                      onClick={() => handleDocumentAction('remove', doc.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      {t.removeButton}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadManager;
