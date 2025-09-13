import React, { useState, useEffect } from 'react';
import './App.css';
import { individualFormFields, corporateFormFields, formSubmissionInstructions } from './formFields.js';
import CommunicationWidget from './CommunicationWidget.jsx';
import EnhancedServices from './EnhancedServices.jsx';
import SocialMediaIntegration from './SocialMediaIntegration.jsx';
import OriginalContent from './OriginalContent.jsx';
import StockTicker from './StockTicker.jsx';
import NewsScroller from './NewsScroller.jsx';
import { multiLanguageContent, blogContent, marketInsightsContent } from './multiLanguageContent.js';

const AlhambraBankApp = () => {
  // Core state management
  const [currentTab, setCurrentTab] = useState('home');
  const [language, setLanguage] = useState('en');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [accountType, setAccountType] = useState('individual');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  // Slideshow states
  const [currentSlide, setCurrentSlide] = useState(0);
  const [caymanSlide, setCaymanSlide] = useState(0);

  // Alhambra Palace images - Authentic images from Granada, Spain
  const alhambraImages = [
    { src: '/images/alhambra/2ifBxNBK7uoj.jpg', title: 'Court of the Lions' },
    { src: '/images/alhambra/GgvjCNfklBIz.jpg', title: 'Court of the Lions - Detail' },
    { src: '/images/alhambra/BIaA83jfMqEC.jpg', title: 'Palace Courtyard' },
    { src: '/images/alhambra/5x24DQqcgFKU.jpg', title: 'Architectural Marvel' },
    { src: '/images/alhambra/BoDCpkXLqd4X.jpg', title: 'Islamic Architecture' },
    { src: '/images/alhambra/hXRYB0t5qXOn.jpg', title: 'Palace Gardens' },
    { src: '/images/alhambra/8zSX0ZmtLvaE.jpg', title: 'Artistic Details' },
    { src: '/images/alhambra/GH2oInCpezGO.jpeg', title: 'Historical Grandeur' }
  ];

  // Cayman Islands images - Authentic images from Grand Cayman
  const caymanImages = [
    { src: '/images/cayman/QQDNcVkOCLhf.jpg', title: 'Seven Mile Beach Paradise' },
    { src: '/images/cayman/G3wwKTwzXWE9.jpg', title: 'Grand Cayman Beach' },
    { src: '/images/cayman/XOKAmns42iuM.jpg', title: 'Seven Mile Beach' },
    { src: '/images/cayman/uvhjaEVHEcmU.jpg', title: 'Financial District' },
    { src: '/images/cayman/ZwS9Weot45dz.jpg', title: 'Banking Hub' },
    { src: '/images/cayman/tRrXLk1YNwjW.jpg', title: 'Cayman Coastline' }
  ];

  // Auto-advance slideshows
  useEffect(() => {
    const alhambraTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % alhambraImages.length);
    }, 10000); // 10 seconds

    const caymanTimer = setInterval(() => {
      setCaymanSlide((prev) => (prev + 1) % caymanImages.length);
    }, 6000); // 6 seconds for Cayman Islands

    return () => {
      clearInterval(alhambraTimer);
      clearInterval(caymanTimer);
    };
  }, []);

  // Use comprehensive multi-language content
  const t = multiLanguageContent[language];
  const blogData = blogContent[language];
  const marketData = marketInsightsContent[language];

  // Form handling functions
  const updateFormField = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleDocumentUpload = (docType, file) => {
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const reader = new FileReader();
      reader.onload = (e) => {
        updateFormField(`documents.${docType}`, {
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('File size must be less than 5MB');
    }
  };

  const generateQRCode = () => {
    const sessionData = {
      accountType,
      currentStep,
      formData,
      language,
      timestamp: Date.now()
    };
    const qrData = btoa(JSON.stringify(sessionData));
    alert(`QR Code Generated! Data: ${qrData.substring(0, 50)}...`);
  };

  const printPaperForm = () => {
    // Use authentic PDF forms
    const pdfUrl = accountType === 'individual' 
      ? '/2025ABTIndividualFormApplication.pdf'
      : '/2025ABTcORPORATEFormApplication.pdf';
    
    // Open the authentic PDF form in a new window for printing
    window.open(pdfUrl, '_blank');
  };

  const saveProgress = () => {
    const progressData = {
      accountType,
      currentStep,
      formData,
      language,
      timestamp: Date.now()
    };
    
    // Save to localStorage for automatic recovery
    localStorage.setItem(`alhambra_${accountType}_progress`, JSON.stringify(progressData));
    
    // Also provide download option
    const dataStr = JSON.stringify(progressData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alhambra-bank-application-${Date.now()}.json`;
    link.click();
    
    alert('Progress saved! You can return later to continue your application.');
  };

  const loadProgress = () => {
    const savedData = localStorage.getItem(`alhambra_${accountType}_progress`);
    if (savedData) {
      try {
        const progressData = JSON.parse(savedData);
        setFormData(progressData.formData || {});
        setCurrentStep(progressData.currentStep || 1);
        setLanguage(progressData.language || 'en');
        alert('Previous progress loaded successfully!');
        return true;
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
    return false;
  };

  const clearProgress = () => {
    localStorage.removeItem(`alhambra_${accountType}_progress`);
    setFormData({});
    setCurrentStep(1);
    alert('Progress cleared. Starting fresh application.');
  };

  // Individual form steps
  const individualSteps = [
    {
      title: "Personal Information",
      fields: [
        { name: "firstName", label: "First Name", type: "text", required: true },
        { name: "lastName", label: "Last Name", type: "text", required: true },
        { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
        { name: "nationality", label: "Nationality", type: "text", required: true },
        { name: "placeOfBirth", label: "Place of Birth", type: "text", required: true }
      ]
    },
    {
      title: "Contact Information",
      fields: [
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel", required: true },
        { name: "residentialAddress", label: "Residential Address", type: "textarea", required: true },
        { name: "mailingAddress", label: "Mailing Address", type: "textarea", required: false }
      ]
    },
    {
      title: "Financial Information",
      fields: [
        { name: "occupation", label: "Occupation", type: "text", required: true },
        { name: "employer", label: "Employer", type: "text", required: true },
        { name: "annualIncome", label: "Annual Income", type: "number", required: true },
        { name: "sourceOfFunds", label: "Source of Funds", type: "text", required: true },
        { name: "netWorth", label: "Estimated Net Worth", type: "number", required: true }
      ]
    },
    {
      title: "Document Upload",
      fields: [
        { name: "primaryId", label: "Primary ID (Passport/Driver's License)", type: "file", required: true },
        { name: "proofOfAddress", label: "Proof of Address", type: "file", required: true },
        { name: "bankReference", label: "Bank Reference Letter", type: "file", required: false },
        { name: "sourceOfFundsDocs", label: "Source of Funds Documentation", type: "file", required: true }
      ]
    },
    {
      title: "Account Preferences",
      fields: [
        { name: "accountCurrency", label: "Preferred Account Currency", type: "select", options: ["USD", "EUR", "GBP", "CAD"], required: true },
        { name: "initialDeposit", label: "Initial Deposit Amount", type: "number", required: true },
        { name: "onlineBanking", label: "Enable Online Banking", type: "checkbox", required: false },
        { name: "mobileAlerts", label: "Enable Mobile Alerts", type: "checkbox", required: false }
      ]
    },
    {
      title: "Review & Submit",
      fields: [
        { name: "declaration", label: "I declare that all information provided is true and accurate", type: "checkbox", required: true },
        { name: "termsAccepted", label: "I accept the Terms and Conditions", type: "checkbox", required: true },
        { name: "privacyAccepted", label: "I accept the Privacy Policy", type: "checkbox", required: true }
      ]
    }
  ];

  // Corporate form steps
  const corporateSteps = [
    {
      title: "Company Information",
      fields: [
        { name: "companyName", label: "Company Name", type: "text", required: true },
        { name: "registrationNumber", label: "Registration Number", type: "text", required: true },
        { name: "incorporationDate", label: "Date of Incorporation", type: "date", required: true },
        { name: "jurisdiction", label: "Jurisdiction of Incorporation", type: "text", required: true },
        { name: "businessType", label: "Type of Business", type: "text", required: true }
      ]
    },
    {
      title: "Business Address",
      fields: [
        { name: "registeredAddress", label: "Registered Address", type: "textarea", required: true },
        { name: "businessAddress", label: "Principal Business Address", type: "textarea", required: true },
        { name: "mailingAddress", label: "Mailing Address", type: "textarea", required: false },
        { name: "website", label: "Company Website", type: "url", required: false }
      ]
    },
    {
      title: "Beneficial Ownership",
      fields: [
        { name: "beneficialOwner1", label: "Beneficial Owner 1 (25%+ ownership)", type: "text", required: true },
        { name: "ownership1", label: "Ownership Percentage", type: "number", required: true },
        { name: "beneficialOwner2", label: "Beneficial Owner 2", type: "text", required: false },
        { name: "ownership2", label: "Ownership Percentage", type: "number", required: false }
      ]
    },
    {
      title: "Authorized Signatories",
      fields: [
        { name: "signatory1Name", label: "Primary Signatory Name", type: "text", required: true },
        { name: "signatory1Title", label: "Title/Position", type: "text", required: true },
        { name: "signatory1DOB", label: "Date of Birth", type: "date", required: true },
        { name: "signatory2Name", label: "Secondary Signatory Name", type: "text", required: false },
        { name: "signatory2Title", label: "Title/Position", type: "text", required: false }
      ]
    },
    {
      title: "Financial Information",
      fields: [
        { name: "annualRevenue", label: "Annual Revenue", type: "number", required: true },
        { name: "expectedTransactionVolume", label: "Expected Monthly Transaction Volume", type: "number", required: true },
        { name: "sourceOfFunds", label: "Primary Source of Funds", type: "text", required: true },
        { name: "businessPurpose", label: "Purpose of Account", type: "textarea", required: true }
      ]
    },
    {
      title: "Document Upload",
      fields: [
        { name: "certificateOfIncorporation", label: "Certificate of Incorporation", type: "file", required: true },
        { name: "articlesOfAssociation", label: "Articles of Association", type: "file", required: true },
        { name: "boardResolution", label: "Board Resolution", type: "file", required: true },
        { name: "beneficialOwnership", label: "Beneficial Ownership Declaration", type: "file", required: true }
      ]
    },
    {
      title: "Review & Submit",
      fields: [
        { name: "declaration", label: "I declare that all information provided is true and accurate", type: "checkbox", required: true },
        { name: "termsAccepted", label: "I accept the Terms and Conditions", type: "checkbox", required: true },
        { name: "privacyAccepted", label: "I accept the Privacy Policy", type: "checkbox", required: true }
      ]
    }
  ];

  const getCurrentSteps = () => {
    return accountType === 'individual' ? individualFormFields : corporateFormFields;
  };

  const validateCurrentStep = () => {
    // Allow progression even with partial completion
    // Users can save progress and return later
    return true;
  };

  const validateRequiredFields = () => {
    // Only validate required fields for final submission
    const currentStepData = getCurrentSteps()[currentStep - 1];
    if (!currentStepData) return false;

    return currentStepData.fields.every(field => {
      if (!field.required) return true;
      const value = formData[field.name];
      if (field.type === 'checkbox') return value === true;
      return value && value.toString().trim() !== '';
    });
  };

  const handleNextStep = () => {
    // Save current progress to localStorage
    saveProgress();
    
    if (currentStep < getCurrentSteps().length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission - validate required fields
      if (validateRequiredFields()) {
        handleSubmitApplication();
      } else {
        alert('Please fill in all required fields before submitting.');
      }
    }
  };

  const handleSubmitApplication = () => {
    alert(`${accountType === 'individual' ? 'Individual' : 'Corporate'} account application submitted successfully! You will receive a confirmation email shortly.`);
    // Reset form
    setFormData({});
    setCurrentStep(1);
    setShowOnboarding(false);
    // Clear saved progress
    localStorage.removeItem(`alhambra_${accountType}_progress`);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderFormField = (field) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
            rows="3"
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => updateFormField(field.name, e.target.checked)}
              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              required={field.required}
            />
            <span className="text-gray-700">{field.label}</span>
          </label>
        );
      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => handleDocumentUpload(field.name, e.target.files[0])}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
            accept=".pdf,.jpg,.jpeg,.png"
            required={field.required}
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
            required={field.required}
          />
        );
    }
  };

  const renderOnboardingStep = () => {
    const currentStepData = getCurrentSteps()[currentStep - 1];
    if (!currentStepData) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-red-700 mb-4">{currentStepData.title}</h3>
        
        {/* Workflow Display */}
        <div className="mb-8 bg-gray-50 rounded-lg p-6 border-2 border-red-100">
          <h4 className="text-lg font-semibold text-red-700 mb-4">
            📋 Account Opening Workflow ({language === 'en' ? 'English' : language === 'es' ? 'Español' : language === 'ar' ? 'العربية' : '中文'})
          </h4>
          
          {/* Workflow Diagram */}
          <div className="mb-6 text-center">
            <img 
              src="/images/workflow/AX0r36A0vspe.jpg" 
              alt="Digital Bank Client Onboarding Process Flow"
              className="mx-auto max-w-full h-auto rounded-lg shadow-md border border-gray-200"
              style={{ maxHeight: '300px' }}
            />
            <p className="text-sm text-gray-600 mt-2">Digital Banking Onboarding Process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 1, title: language === 'en' ? 'Application' : language === 'es' ? 'Aplicación' : language === 'ar' ? 'التطبيق' : '申请', desc: language === 'en' ? 'Complete digital form' : language === 'es' ? 'Completar formulario digital' : language === 'ar' ? 'إكمال النموذج الرقمي' : '完成数字表格' },
              { step: 2, title: language === 'en' ? 'Documentation' : language === 'es' ? 'Documentación' : language === 'ar' ? 'التوثيق' : '文档', desc: language === 'en' ? 'Upload required documents' : language === 'es' ? 'Subir documentos requeridos' : language === 'ar' ? 'تحميل الوثائق المطلوبة' : '上传所需文件' },
              { step: 3, title: language === 'en' ? 'Review' : language === 'es' ? 'Revisión' : language === 'ar' ? 'المراجعة' : '审查', desc: language === 'en' ? 'Bank review (2-3 days)' : language === 'es' ? 'Revisión bancaria (2-3 días)' : language === 'ar' ? 'مراجعة البنك (2-3 أيام)' : '银行审查（2-3天）' },
              { step: 4, title: language === 'en' ? 'Activation' : language === 'es' ? 'Activación' : language === 'ar' ? 'التفعيل' : '激活', desc: language === 'en' ? 'Account activation' : language === 'es' ? 'Activación de cuenta' : language === 'ar' ? 'تفعيل الحساب' : '账户激活' }
            ].map((item, i) => (
              <div key={i} className={`text-center p-4 rounded-lg border-2 ${currentStep >= item.step ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}>
                <div className={`text-2xl font-bold mb-2 ${currentStep >= item.step ? 'text-red-600' : 'text-gray-400'}`}>{item.step}</div>
                <h5 className={`font-semibold mb-1 ${currentStep >= item.step ? 'text-red-700' : 'text-gray-500'}`}>{item.title}</h5>
                <p className={`text-sm ${currentStep >= item.step ? 'text-red-600' : 'text-gray-400'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={printPaperForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🖨️ Print Paper Form
          </button>
          <button 
            onClick={generateQRCode}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📱 Generate QR Code
          </button>
          <button 
            onClick={saveProgress}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            💾 Save Progress
          </button>
          <button 
            onClick={loadProgress}
            className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
          >
            📂 Load Progress
          </button>
          <button 
            onClick={clearProgress}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🗑️ Clear Progress
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentStepData.fields.map((field, index) => (
            <div key={index} className={field.type === 'textarea' || field.type === 'checkbox' ? 'md:col-span-2' : ''}>
              {field.type !== 'checkbox' && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
              )}
              {renderFormField(field)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Slideshow components
  const AlhambraSlideshow = () => (
    <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border-4 border-red-800">
      <div className="relative h-96">
        <img
          src={alhambraImages[currentSlide]?.src}
          alt={alhambraImages[currentSlide]?.title}
          className="w-full h-full object-cover transition-opacity duration-1000"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+CjwvZz4KPC9zdmc+';
          }}
        />
        
        {/* Navigation arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + alhambraImages.length) % alhambraImages.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          ←
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % alhambraImages.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          →
        </button>

        {/* Pause button */}
        <button 
          onClick={() => {
            // Toggle slideshow pause functionality
            alert('Slideshow paused/resumed');
          }}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          ⏸️
        </button>

        {/* Image counter */}
        <div className="absolute top-4 right-16 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentSlide + 1} / {alhambraImages.length}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center space-x-2 py-4 bg-white">
        {alhambraImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index ? 'bg-red-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            title={alhambraImages[index]?.title}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1">
        <div 
          className="bg-red-800 h-1 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / alhambraImages.length) * 100}%` }}
        />
      </div>
    </div>
  );

  const CaymanSlideshow = () => (
    <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden border-4 border-blue-400">
      <div className="relative h-64">
        <img
          src={caymanImages[caymanSlide]?.src}
          alt={caymanImages[caymanSlide]?.title}
          className="w-full h-full object-cover transition-opacity duration-1000"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+CjwvZz4KPC9zdmc+';
          }}
        />
        
        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {caymanSlide + 1} / {caymanImages.length}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center space-x-2 py-3 bg-white">
        {caymanImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCaymanSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              caymanSlide === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            title={caymanImages[index]?.title}
          />
        ))}
      </div>
    </div>
  );

  // Content rendering functions
  const renderHome = () => (
    <div className="bg-gradient-to-br from-red-50 to-red-100 min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-3xl md:text-5xl font-bold text-red-600 mb-4">{t.title}</h1>
        <h2 className="text-xl md:text-3xl font-semibold text-red-500 mb-2">{t.tagline1}</h2>
        <h3 className="text-xl md:text-3xl font-semibold text-red-500 mb-8">{t.tagline2}</h3>
        
        {/* Alhambra Palace Slideshow */}
        <AlhambraSlideshow />
        
        <button 
          onClick={() => {
            // Navigate to contact section or open scheduling modal
            setCurrentTab('contact');
          }}
          className="mt-8 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
        >
          {t.scheduleCall}
        </button>
      </div>

      {/* Why Alhambra Bank & Trust */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">Why Alhambra Bank & Trust</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🏛️", title: "Regulatory Excellence", desc: "Fully licensed and regulated by CIMA" },
              { icon: "🌍", title: "Global Reach", desc: "Serving clients worldwide with local expertise" },
              { icon: "🔒", title: "Privacy & Security", desc: "Bank-grade security and confidentiality" },
              { icon: "🤖", title: "AI-Enhanced Banking", desc: "Cutting-edge technology for modern banking" }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-red-700 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Cayman Islands */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-2/3">
              <h2 className="text-3xl font-bold text-red-700 mb-8">Why Choose Cayman Islands</h2>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed">
                  <strong>The Cayman Islands</strong> is one of the world's premier international financial centers, hosting 40 of the world's largest 50 banks. 
                  With an AAA sovereign credit rating and decades of regulatory excellence, it offers unparalleled advantages for global banking and wealth management.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: "🏛️", title: "Regulatory Excellence", desc: "Licensed by CIMA (Cayman Islands Monetary Authority) with world-class regulatory framework" },
                  { icon: "💰", title: "Tax Neutrality", desc: "No direct taxation on individuals or corporations - optimal for wealth preservation" },
                  { icon: "🔒", title: "Asset Protection", desc: "Robust asset protection laws and banking secrecy provisions" },
                  { icon: "🌍", title: "Global Connectivity", desc: "Strategic location between Americas, Europe, and Asia with excellent infrastructure" },
                  { icon: "⚖️", title: "Legal Framework", desc: "English common law system with sophisticated financial legislation" },
                  { icon: "🏦", title: "Banking Hub", desc: "Home to 40 of the world's top 50 banks and leading financial institutions" },
                  { icon: "📈", title: "Economic Stability", desc: "AAA sovereign credit rating and stable political environment" },
                  { icon: "🛡️", title: "Privacy Protection", desc: "Strong confidentiality laws protecting client information and transactions" }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{item.icon}</span>
                      <h3 className="text-lg font-semibold text-red-700">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/3">
              <CaymanSlideshow />
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">{t.visionTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-red-200 text-red-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4 text-red-700">{t.visionStatement}</h3>
              <p className="text-lg leading-relaxed">
                {t.visionText}
              </p>
            </div>
            <div className="bg-white border-2 border-red-200 text-red-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4 text-red-700">{t.missionStatement}</h3>
              <p className="text-lg leading-relaxed">
                {t.missionText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Founder's Message */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-red-700 text-center mb-8">{t.founderTitle}</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3">
                <img 
                  src="/images/founder_ali_alsari.webp" 
                  alt="Ali Alsari - Non-Executive Board Director" 
                  className="w-full max-w-xs mx-auto rounded-lg shadow-lg border-2 border-red-200"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzlCOUJBMyIvPgo8cGF0aCBkPSJNNTAgMTgwQzUwIDE1MCA3MyAxMjAgMTAwIDEyMEMxMjcgMTIwIDE1MCAxNTAgMTUwIDE4MEgxNTBWMjQwSDUwVjE4MFoiIGZpbGw9IiM5QjlCQTMiLz4KPC9zdmc+';
                  }}
                />
              </div>
              <div className="md:w-2/3">
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-500">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {t.founderMessage}
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {t.founderMessage2}
                  </p>
                  <blockquote className="border-l-4 border-red-500 pl-4 italic text-gray-700 mb-6">
                    "{t.founderQuote}"
                  </blockquote>
                  <div className="text-right">
                    <p className="font-semibold text-red-700">{t.founderName}</p>
                    <p className="text-gray-600">{t.founderTitle2}</p>
                    <p className="text-gray-600">{t.founderCompany}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Words of Wisdom */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">Words of Wisdom</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-red-200 text-red-800 p-8 rounded-lg text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <blockquote className="text-xl italic mb-4 text-red-700">
                "Every battle is won or lost before it is fought."
              </blockquote>
              <p className="font-semibold text-red-700">Sun Tzu</p>
            </div>
            <div className="bg-white border-2 border-red-200 text-red-800 p-8 rounded-lg text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <blockquote className="text-xl italic mb-4 text-red-700">
                "Take calculated risks. That is quite different from being rash."
              </blockquote>
              <p className="font-semibold text-red-700">George S. Patton</p>
              <p className="text-sm text-red-600">U.S. Army General</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => <EnhancedServices language={language} />;

  const renderAbout = () => (
    <div className="bg-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-700 text-center mb-12">About Alhambra Bank & Trust</h1>
        
        {/* Original Content from alhambrabank.ky */}
        <OriginalContent language={language} />
        
        {/* Company Overview */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white border-2 border-red-200 text-red-800 shadow-lg hover:shadow-xl transition-shadow p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-lg leading-relaxed mb-4">
              Alhambra Bank & Trust was founded with a vision to create a financial institution that serves everyone with dignity, respect, and fairness. We believe in breaking down barriers and providing equal access to world-class banking services.
            </p>
            <p className="text-lg leading-relaxed">
              Licensed and regulated by the Cayman Islands Monetary Authority (CIMA), we combine traditional banking excellence with innovative technology to serve our global clientele.
            </p>
          </div>
        </div>

        {/* Fundamental Principles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-12">Our Fundamental Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Integrity",
                description: "We conduct all business with the highest ethical standards and transparency."
              },
              {
                title: "Excellence",
                description: "We strive for excellence in every service we provide to our valued clients."
              },
              {
                title: "Innovation",
                description: "We embrace cutting-edge technology to enhance our banking services."
              },
              {
                title: "Inclusivity",
                description: "We welcome clients from all backgrounds and treat everyone with equal respect."
              },
              {
                title: "Security",
                description: "We maintain the highest standards of security and confidentiality."
              },
              {
                title: "Global Perspective",
                description: "We understand the needs of international clients and global markets."
              }
            ].map((principle, index) => (
              <div key={index} className="bg-white border-2 border-red-200 text-red-800 shadow-lg hover:shadow-xl transition-shadow p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Information */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-8">Regulatory Information</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-4">
              Alhambra Bank & Trust is fully licensed and regulated by the Cayman Islands Monetary Authority (CIMA) under license number [License Number].
            </p>
            <p className="text-lg text-gray-700">
              We adhere to international banking standards and maintain the highest levels of compliance with anti-money laundering (AML) and know-your-customer (KYC) regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrading = () => (
    <div className="bg-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-700 text-center mb-12">Trading Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Forex Trading",
              description: "Access global currency markets with competitive spreads and advanced trading platforms.",
              features: ["Major & Minor Currency Pairs", "24/5 Market Access", "Advanced Charting Tools", "Risk Management"]
            },
            {
              title: "Commodities Trading",
              description: "Trade precious metals, energy, and agricultural commodities with institutional-grade execution.",
              features: ["Gold & Silver", "Oil & Gas", "Agricultural Products", "Real-time Pricing"]
            },
            {
              title: "Equity Markets",
              description: "Invest in global equity markets with access to major stock exchanges worldwide.",
              features: ["Global Stock Exchanges", "Blue-chip Stocks", "Growth Opportunities", "Dividend Stocks"]
            }
          ].map((service, index) => (
            <div key={index} className="bg-white border-2 border-red-200 text-red-800 shadow-lg hover:shadow-xl transition-shadow p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-red-800 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarketInsights = () => (
    <div className="bg-gradient-to-br from-red-50 to-red-100 min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-900 text-center mb-12">{marketData.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marketData.insights.map((insight, index) => (
            <div key={index} className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 shadow-lg hover:shadow-xl transition-all duration-300 p-6 rounded-lg hover:border-red-400">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">{insight.category}</span>
                <span className="text-sm text-red-600 font-medium">{insight.date}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-red-900 hover:text-red-700 transition-colors">{insight.title}</h3>
              <p className="mb-4 text-gray-700 leading-relaxed">{insight.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{insight.readTime}</span>
                <button 
                  onClick={() => {
                    alert(`Reading: ${insight.title}\n\nThis would open the full market insight in a production environment.`);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  {t.readMore} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIServices = () => (
    <div className="bg-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-700 text-center mb-12">AI-Powered Banking Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI Financial Advisor",
              description: "Personalized investment advice powered by artificial intelligence and machine learning.",
              icon: "🤖",
              action: "Get AI Advice"
            },
            {
              title: "Voice Banking",
              description: "Conduct banking transactions and get account information using voice commands.",
              icon: "🎤",
              action: "Try Voice Banking"
            },
            {
              title: "Real-time Translation",
              description: "Communicate with our team in your preferred language with AI-powered translation.",
              icon: "🌐",
              action: "Start Translation"
            },
            {
              title: "Fraud Detection",
              description: "Advanced AI algorithms protect your accounts from fraudulent activities 24/7.",
              icon: "🛡️",
              action: "Learn More"
            },
            {
              title: "Smart Analytics",
              description: "Get insights into your spending patterns and financial behavior with AI analysis.",
              icon: "📊",
              action: "View Analytics"
            },
            {
              title: "Automated Compliance",
              description: "AI-powered compliance monitoring ensures all transactions meet regulatory requirements.",
              icon: "⚖️",
              action: "Check Compliance"
            }
          ].map((service, index) => (
            <div key={index} className="bg-white border-2 border-red-200 text-red-800 shadow-lg hover:shadow-xl transition-shadow p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="mb-4">{service.description}</p>
              <button
                onClick={() => {
                  alert(`${service.title} - This AI service would be activated. In production, this would connect to our AI systems.`);
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                {service.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBlog = () => (
    <div className="bg-gradient-to-br from-red-50 to-red-100 min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-900 text-center mb-12">{blogData.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogData.posts.map((post, index) => (
            <div key={index} className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 shadow-lg hover:shadow-xl transition-all duration-300 p-6 rounded-lg hover:border-red-400">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">{blogData.categories[post.category]}</span>
                <span className="text-sm text-red-600 font-medium">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-red-900 hover:text-red-700 transition-colors">{post.title}</h3>
              <p className="mb-4 text-gray-700 leading-relaxed">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{post.readTime}</span>
                <button 
                  onClick={() => {
                    alert(`Reading: ${post.title}\n\nThis would open the full article in a production environment.`);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  {t.readMore} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="bg-white min-h-screen">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-red-700 text-center mb-12">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-red-700 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: "📍",
                    title: "Address",
                    info: "Alhambra Bank & Trust\nCayman Islands\nBritish West Indies"
                  },
                  {
                    icon: "📞",
                    title: "Phone",
                    info: "+1 (345) 949-8066"
                  },
                  {
                    icon: "📧",
                    title: "Email",
                    info: "info@alhambrabank.ky"
                  },
                  {
                    icon: "🕒",
                    title: "Business Hours",
                    info: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed"
                  }
                ].map((contact, index) => (
                  <div key={index} className="bg-white border-2 border-red-200 text-red-800 shadow-lg hover:shadow-xl transition-shadow p-4 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-2xl mr-4">{contact.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{contact.title}</h3>
                        <p className="whitespace-pre-line">{contact.info}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-red-700 mb-6">Send us a Message</h2>
              <form 
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = Object.fromEntries(formData.entries());
                  alert(`Thank you for your message! We will respond to ${data.email || 'your inquiry'} within 24 hours.`);
                  e.target.reset();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <select 
                  name="inquiryType"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Select Inquiry Type</option>
                  <option value="account">Account Opening</option>
                  <option value="services">Banking Services</option>
                  <option value="support">Customer Support</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="5"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Social Media Integration */}
      <SocialMediaIntegration language={language} />
    </div>
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return renderHome();
      case 'about': return renderAbout();
      case 'services': return renderServices();
      case 'trading': return renderTrading();
      case 'marketInsights': return renderMarketInsights();
      case 'aiServices': return renderAIServices();
      case 'blog': return renderBlog();
      case 'contact': return renderContact();
      default: return renderHome();
    }
  };

  // Navigation tabs
  const tabs = [
    { id: 'home', label: t.home },
    { id: 'about', label: t.about },
    { id: 'services', label: t.services },
    { id: 'trading', label: t.trading },
    { id: 'marketInsights', label: t.marketInsights },
    { id: 'aiServices', label: t.aiServices },
    { id: 'blog', label: t.blog },
    { id: 'contact', label: t.contact }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Stock Market Ticker */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <StockTicker />
      </div>
      
      {/* Navigation Header */}
      <nav className="bg-white text-red-800 py-3 px-4 fixed top-12 left-0 right-0 z-50 shadow-lg border-b border-red-200">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-red-600 text-white border border-red-600 rounded px-3 py-1 text-sm"
          >
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="zh">🇨🇳 中文</option>
          </select>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center space-x-1">
            {/* Open Account Dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 rounded hover:bg-red-100 transition-colors text-sm font-medium">
                {t.openAccount} ▼
              </button>
              <div className="absolute top-full left-0 bg-white text-gray-800 rounded-lg shadow-lg py-2 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => {
                    setAccountType('individual');
                    setCurrentStep(1);
                    setShowOnboarding(true);
                    // Check for saved progress after modal opens
                    setTimeout(() => {
                      const savedData = localStorage.getItem('alhambra_individual_progress');
                      if (savedData) {
                        if (confirm('You have a saved individual application. Would you like to continue where you left off?')) {
                          loadProgress();
                        }
                      }
                    }, 100);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  {t.openIndividual}
                </button>
                <button
                  onClick={() => {
                    setAccountType('corporate');
                    setCurrentStep(1);
                    setShowOnboarding(true);
                    // Check for saved progress after modal opens
                    setTimeout(() => {
                      const savedData = localStorage.getItem('alhambra_corporate_progress');
                      if (savedData) {
                        if (confirm('You have a saved corporate application. Would you like to continue where you left off?')) {
                          loadProgress();
                        }
                      }
                    }, 100);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  {t.openCorporate}
                </button>
              </div>
            </div>

            {/* Regular Navigation Tabs */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-2 rounded transition-colors text-sm font-medium ${
                  currentTab === tab.id ? 'bg-red-600 text-white' : 'hover:bg-red-100'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Customer Login */}
            <button 
              onClick={() => {
                // Simulate customer login functionality
                alert('Customer Login Portal - This would redirect to secure login page');
                // In production, this would redirect to actual login portal
                // window.open('https://portal.alhambrabank.ky/login', '_blank');
              }}
              className="px-3 py-2 bg-red-800 text-white rounded hover:bg-red-900 transition-colors text-sm font-medium"
            >
              {t.customerLogin}
            </button>
          </div>
        </div>
      </nav>

      {/* Economic News Scroller */}
      <div className="fixed top-20 left-0 right-0 z-30">
        <NewsScroller />
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-red-700">
                {accountType === 'individual' ? t.openIndividual : t.openCorporate}
              </h2>
              <button 
                onClick={() => setShowOnboarding(false)}
                className="text-red-600 hover:text-red-800 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Progress Indicator */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                {Array.from({ length: getCurrentSteps().length }, (_, i) => (
                  <div key={i} className={`flex items-center ${i < getCurrentSteps().length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep > i + 1 ? 'bg-green-600 text-white' : 
                      currentStep === i + 1 ? 'bg-red-600 text-white' : 
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {i + 1}
                    </div>
                    {i < getCurrentSteps().length - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        currentStep > i + 1 ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center text-gray-600">
                Step {currentStep} of {getCurrentSteps().length}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {renderOnboardingStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between p-6 border-t border-gray-200">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium ${
                  currentStep === 1 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                } transition-all duration-300`}
              >
                Previous
              </button>
              
              <button
                onClick={handleNextStep}
                className="px-6 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-all duration-300"
              >
                {currentStep === getCurrentSteps().length ? 'Submit Application' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-32 bg-gradient-to-br from-red-50 to-red-100 min-h-screen">
        {renderContent()}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-red-200 text-red-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">© 2025 {t.title}. All Rights Reserved to alhambrabank.ky</p>
          <p className="text-red-600">Excellence in Corporate Banking | Cayman Islands</p>
        </div>
      </footer>

      {/* Communication Widget */}
      <CommunicationWidget language={language} />
    </div>
  );
};

export default AlhambraBankApp;

