import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  X, 
  Maximize2, 
  Minimize2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Layers, 
  Download, 
  HelpCircle, 
  RefreshCw, 
  ShieldAlert,
  ChevronLeft,
  Calendar,
  DollarSign,
  Truck,
  Users,
  Package
} from 'lucide-react';
import { aiAssistantService, AIQueryResult, AIActionPayload } from '../../services/aiAssistantService';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  queryResult?: AIQueryResult;
}

export const FloatingAIAssistant: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'مرحبًا بك! أنا **مساعد ريجين الذكي (Rejeen AI)**. يمكنك سؤالي عن العمولات، الأسطول، الموظفين، المخزون، أو طلب تسجيل وتعديل العمليات وإصدار التقارير.',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Preview / Confirmation Modal State
  const [pendingAction, setPendingAction] = useState<AIActionPayload | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction]);

  // Speech to Text initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-SA';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('التعرف الصوتي غير مدعوم في هذا المتصفح. يمكنك الكتابة مباشرة.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic error', err);
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || inputText).trim();
    if (!query || isProcessing) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Determine context from URL
      let currentVehicleId: string | undefined;
      let currentEmployeeId: string | undefined;

      const path = location.pathname;
      if (path.includes('/fleet/')) {
        const parts = path.split('/fleet/');
        if (parts[1]) currentVehicleId = parts[1];
      }

      const result = await aiAssistantService.processQuery(query, {
        currentVehicleId,
        currentEmployeeId
      });

      const assistantMsg: Message = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: result.summaryText,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        queryResult: result
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If action preview is required
      if (result.previewAction) {
        setPendingAction(result.previewAction);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: `عذرًا، حدث خطأ أثناء معالجة طلبك: ${err.message || 'تعذر الاتصال ببيانات النظام'}`,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setIsExecuting(true);
    try {
      const execResult = await aiAssistantService.executeAction(pendingAction, {
        userName: 'مستخدم ريجين AI'
      });

      if (execResult.success) {
        setActionSuccessMsg(execResult.message);
        setMessages(prev => [
          ...prev,
          {
            id: 'conf-' + Date.now(),
            sender: 'assistant',
            text: execResult.message,
            timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setTimeout(() => {
          setPendingAction(null);
          setActionSuccessMsg(null);
        }, 1200);
      } else {
        alert(execResult.message);
      }
    } catch (err: any) {
      alert(`فشلت العملية: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportExcel = (tableData: { headers: string[]; rows: (string | number)[][] }, title: string = 'تقرير ريجين AI') => {
    try {
      const wsData = [tableData.headers, ...tableData.rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تقرير');
      XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
    } catch (err) {
      console.error('Excel Export Error', err);
      alert('حدث خطأ أثناء تنزيل ملف الإكسل.');
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 start-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 group border border-white/20 ${isOpen ? 'hidden' : 'flex'}`}
        title="مساعد ريجين الذكي"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <span className="font-bold text-sm tracking-wide">مساعد ريجين الذكي</span>
      </button>

      {/* Floating Assistant Drawer / Dialog */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden ${
            isExpanded 
              ? 'inset-4 md:inset-10' 
              : 'bottom-6 start-6 w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight flex items-center gap-2">
                  مساعد ريجين الذكي
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-medium">متصل ومباشر</span>
                </h3>
                <p className="text-xs text-indigo-100/80">طبقة الأوامر والتحليلات لجميع أقسام ERP</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-white/80">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-assistant');
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="فتح في صفحة كاملة"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">صفحة كاملة</span>
              </button>

              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={isExpanded ? 'تصغير' : 'تكبير'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Shortcuts */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs text-slate-600 dark:text-slate-300 shrink-0">
            <span className="font-medium text-slate-400 shrink-0">اقتراحات سريعة:</span>
            <button 
              onClick={() => handleSendMessage('اعرض تقرير المركبات التي ينتهي تأمينها خلال 60 يوم')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 shrink-0 transition-colors"
            >
              🚗 انتهاء التأمينات
            </button>
            <button 
              onClick={() => handleSendMessage('تقرير عمولات ومستحقات المناديب لهذا الشهر')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 shrink-0 transition-colors"
            >
              💰 عمولات الشهر
            </button>
            <button 
              onClick={() => handleSendMessage('ما المركبات الموجودة في الصيانة؟')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 shrink-0 transition-colors"
            >
              🛠️ سيارات في الصيانة
            </button>
            <button 
              onClick={() => handleSendMessage('ما المنتجات الحرجة في المستودع؟')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 shrink-0 transition-colors"
            >
              📦 المخزون الحرج
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/70 dark:border-slate-700/60 shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-normal">{msg.text}</div>

                  {/* Render KPI Widgets if available */}
                  {msg.queryResult?.kpis && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      {msg.queryResult.kpis.map((kpi, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{kpi.label}</div>
                          <div className={`text-base font-bold mt-0.5 ${kpi.color || 'text-slate-900 dark:text-white'}`}>{kpi.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Table Data if available */}
                  {msg.queryResult?.tableData && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">البيانات التفصيلية:</span>
                        <button
                          onClick={() => handleExportExcel(msg.queryResult!.tableData!, msg.queryResult?.title)}
                          className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          تصدير Excel
                        </button>
                      </div>
                      <div className="overflow-x-auto max-h-48 rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-start text-xs border-collapse">
                          <thead className="bg-slate-200/70 dark:bg-slate-900 sticky top-0 font-bold">
                            <tr>
                              {msg.queryResult.tableData.headers.map((h, i) => (
                                <th key={i} className="p-2 text-start border-b border-slate-300 dark:border-slate-700">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                            {msg.queryResult.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 whitespace-nowrap">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Ambiguity Resolution Options */}
                  {msg.queryResult?.ambiguityChoices && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        اختر السجل المقصود للمتابعة:
                      </div>
                      <div className="space-y-1.5">
                        {msg.queryResult.ambiguityChoices.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => handleSendMessage(choice.onSelectQuery)}
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-start transition-all hover:shadow-xs group"
                          >
                            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">{choice.title}</div>
                            {choice.subtitle && <div className="text-[11px] text-slate-500 dark:text-slate-400">{choice.subtitle}</div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 px-2 mt-1">{msg.timestamp}</span>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-2xl w-fit">
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري فحص البيانات وتنفيذ الاستعلام...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Action Preview Modal (Write Confirmation Layer) */}
          {pendingAction && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900/60 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  تأكيد تنفيذ العملية على النظام (Preview Before Execute)
                </div>
                <button 
                  onClick={() => setPendingAction(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  إلغاء
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  السجل المستهدف: {pendingAction.targetRecordLabel || pendingAction.targetRecordId}
                </div>
                
                {pendingAction.changes && (
                  <div className="space-y-1">
                    {pendingAction.changes.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <span className="text-slate-500">{c.fieldLabel}:</span>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-slate-400">{c.previousValue}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">← {c.newValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {actionSuccessMsg ? (
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {actionSuccessMsg}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirmAction}
                    disabled={isExecuting}
                    className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    تأكيد وحفظ التغييرات
                  </button>
                  <button
                    onClick={() => setPendingAction(null)}
                    disabled={isExecuting}
                    className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors"
                  >
                    تراجع
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600'
                }`}
                title={isListening ? 'جاري الاستماع... اضغط للإيقاف' : 'تحدث بالصوت'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? 'استمع لصوتك الآن...' : 'اكتب أمرك أو سؤالك هنا (مثال: كم عمولة أحمد؟)'}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isProcessing}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                title="إرسال"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
