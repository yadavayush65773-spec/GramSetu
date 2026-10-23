import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getAssistantResponse, ChatMessage } from '../services/aiService';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  CreditCard 
} from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { 
    schemes, 
    beneficiaries, 
    inspections, 
    installments, 
    riskCases, 
    selectedDistrict, 
    language,
    setActivePage 
  } = useApp();

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-full',
      sender: 'assistant',
      text: language === 'hi'
        ? `नमस्ते! मैं **ग्रामसेतु सहायक** हूँ, आपका आधिकारिक AI सह-पायलट।\n\nमैं ग्रामसेतु प्लेटफ़ॉर्म के सभी 6 योजनाओं, 35+ लाभार्थियों, स्थलीय निरीक्षणों एवं क्रिप्टोग्राफिक साक्ष्य रिकॉर्ड्स का वास्तविक समय में विश्लेषण कर सकता हूँ। आप नीचे दिए गए त्वरित प्रश्नों में से चुन सकते हैं या अपना प्रश्न टाइप कर सकते हैं।`
        : `Hello! I am **GramSetu Sahayak**, your digital co-pilot for rural scheme administration and beneficiary accountability.\n\nI have real-time visibility into all 6 flagship schemes, beneficiary eligibility checks, field inspection proofs, and fraud detection indicators. Select a prompt below or type your query in English or Hindi.`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isHi = language === 'hi';

  const suggestedPrompts = [
    { en: 'Show high-risk cases awaiting review.', hi: 'उच्च जोखिम वाले मामलों की सूची दिखाएं।' },
    { en: 'How many applications are pending in my block?', hi: 'मेरे ब्लॉक में कितने आवेदन लंबित हैं?' },
    { en: 'Which scheme installments need approval?', hi: 'इस योजना में कौन-सी किश्तें लंबित हैं?' },
    { en: 'Summarize today\'s field inspections.', hi: 'आज के निरीक्षणों का सारांश दें।' },
    { en: 'How can I resolve a beneficiary verification issue?', hi: 'लाभार्थी सत्यापन समस्या का समाधान कैसे करें?' },
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await getAssistantResponse(textToSend, {
        schemes,
        beneficiaries,
        inspections,
        installments,
        riskCases,
        selectedDistrict,
        language,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedAction: response.relatedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-[#E99A36] px-2 py-0.5 rounded font-mono border border-[#E99A36]/30">
              GramSetu Sahayak • Bilingual AI
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'ग्रामसेतु सहायक (डिजिटल प्रशासनिक परामर्शदाता)' : 'GramSetu Sahayak — Administrative AI Co-pilot'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'प्राकृतिक भाषा में योजनाओं की स्थिति, लंबित किश्तों व निरीक्षणों की त्वरित जानकारी' : 'Query scheme data, pending approvals, inspection milestones, and fraud alerts in plain Hindi or English'}
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] shadow-2xs overflow-hidden flex flex-col h-[600px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F7F6F0]/40 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#0D3B2E] text-[#E99A36] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`
                  max-w-[80%] rounded-2xl p-4 leading-relaxed
                  ${msg.sender === 'user' 
                    ? 'bg-[#174C3C] text-white rounded-tr-xs shadow-xs' 
                    : 'bg-white text-[#192D3A] rounded-tl-xs border border-gray-200 shadow-2xs'}
                `}
              >
                <div className="whitespace-pre-line text-xs font-normal">
                  {msg.text}
                </div>

                {msg.relatedAction && (
                  <button
                    onClick={() => setActivePage(msg.relatedAction!.targetPage)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3B2E] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <span>{msg.relatedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#23865B]" />
                  </button>
                )}

                <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-[#789B82]' : 'text-gray-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 py-3 pl-2">
              <Bot className="w-4 h-4 animate-bounce text-[#174C3C]" />
              <span className="italic">{isHi ? 'ग्रामसेतु सहायक विश्लेषण कर रहा है...' : 'GramSetu Sahayak is analyzing records...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Buttons */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(isHi ? p.hi : p.en)}
              className="shrink-0 text-xs bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#174C3C] border border-[#C4D1C9] px-3 py-1.5 rounded-full transition-colors font-medium"
            >
              {isHi ? p.hi : p.en}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isHi ? 'अपना प्रश्न या आदेश यहां टाइप करें...' : 'Ask question about schemes, pending verifications, or fraud cases...'}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#192D3A] outline-hidden focus:border-[#174C3C] focus:bg-white transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || loading}
            className="px-5 py-2.5 bg-[#174C3C] hover:bg-[#0D3B2E] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
