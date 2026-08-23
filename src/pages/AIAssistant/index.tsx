import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  FileText, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  Bookmark, 
  Trash2, 
  ShieldAlert, 
  Layers, 
  TrendingUp, 
  Truck, 
  Users, 
  Package, 
  DollarSign,
  HelpCircle,
  Clock,
  ClipboardList
} from 'lucide-react';
import { aiAssistantService, AIQueryResult, AIActionPayload, SavedReportItem } from '../../services/aiAssistantService';
import * as XLSX from 'xlsx';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  queryResult?: AIQueryResult;
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-page',
      sender: 'assistant',
      text: 'مرحبًا بك في **مركز مساعد ريجين الذكي (Rejeen AI Assistant)**.\nهنا يمكنك إدارة الاستعلامات المعقدة، طلب تقارير متعددة الأقسام (Cross-Module Reports)، فحص العمولات، الأسطول، والمخزون، إضافة لجدولة العمليات وتأكيد التعديلات.',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'SAVED_REPORTS' | 'PROMPT_LIBRARY'>('CHAT');

  // Preview / Confirmation Action State
  const [pendingAction, setPendingAction] = useState<AIActionPayload | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSavedReports(aiAssistantService.getSavedReports());

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

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('التعرف الصوتي غير مدعوم في هذا المتصفح.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
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
      const result = await aiAssistantService.processQuery(query);

      const assistantMsg: Message = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: result.summaryText,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        queryResult: result
      };

      setMessages(prev => [...prev, assistantMsg]);
      setSavedReports(aiAssistantService.getSavedReports());

      if (result.previewAction) {
        setPendingAction(result.previewAction);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: `فشلت معالجة الطلب: ${err.message || 'خطأ في جلب بيانات الـ ERP'}`,
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
        userName: 'مدير النظام (ريجين AI)'
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
        }, 1500);
      } else {
        alert(execResult.message);
      }
    } catch (err: any) {
      alert(`فشلت العملية: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportExcel = (tableData: { headers: string[]; rows: (string | number)[][] }, title: string = 'تقرير ريجين') => {
    try {
      const wsData = [tableData.headers, ...tableData.rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تقرير ريجين');
      XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
    } catch (e) {
      console.error(e);
      alert('خطأ أثناء تصدير ملف الإكسل.');
    }
  };

  const handleDeleteSavedReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    aiAssistantService.deleteSavedReport(id);
    setSavedReports(aiAssistantService.getSavedReports());
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>مساعد ريجين الذكي الموحد (Rejeen AI Command Layer)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              الاستعلام والتحليل الذكي لكافة أقسام NMO ERP
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              نفّذ أوامر اللغة الطبيعية، استخرج تقارير الأسطول والعمولات، واطلع على المؤشرات الحية والتعديل الآمن مع نظام التأكيد وسجل التدقيق.
            </p>
          </div>

          {/* Tab Navigation in Banner */}
          <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'CHAT' ? 'bg-white text-indigo-900 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              المحادثة والأوامر
            </button>
            <button
              onClick={() => setActiveTab('SAVED_REPORTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'SAVED_REPORTS' ? 'bg-white text-indigo-900 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              التقارير المحفوظة ({savedReports.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'CHAT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Prompts Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                نماذج أوامر شائعة
              </h3>
              <p className="text-xs text-slate-500">اضغط على أي أمر لتنفيذه مباشرة:</p>

              <div className="space-y-2 text-xs">
                <button
                  onClick={() => handleSendMessage('كم عمولة الموظف 1058 هذا الشهر؟')}
                  className="w-full text-start p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  💰 عمولة الموظف 1058
                </button>
                <button
                  onClick={() => handleSendMessage('كم المبالغ المستحقة ولم تصرف؟')}
                  className="w-full text-start p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  ⏳ المبالغ المستحقة والمعلقة
                </button>
                <button
                  onClick={() => handleSendMessage('اعرض تقرير المركبات التي ينتهي تأمينها خلال 30 يوم')}
                  className="w-full text-start p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  🚗 تأمينات تنتهي قريباً
                </button>
                <button
                  onClick={() => handleSendMessage('ما المركبات الموجودة في الصيانة؟')}
                  className="w-full text-start p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  🛠️ مركبات في الصيانة
                </button>
                <button
                  onClick={() => handleSendMessage('سجل حادث خفيف اليوم للمركبة رقم 1 بتكلفة 800 ريال')}
                  className="w-full text-start p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  📝 تسجيل حادث جديد
                </button>
                <button
                  onClick={() => handleSendMessage('ما المنتجات الحرجة في المستودع؟')}
                  className="w-full text-start p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  📦 أصناف المخزون الحرجة
                </button>
              </div>
            </div>
          </div>

          {/* Central Chat Stream */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[700px] overflow-hidden">
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-3xl p-5 text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-normal">{msg.text}</div>

                    {/* KPIs */}
                    {msg.queryResult?.kpis && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {msg.queryResult.kpis.map((kpi, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                            <div className="text-[11px] text-slate-500 font-medium">{kpi.label}</div>
                            <div className={`text-lg font-bold mt-0.5 ${kpi.color || 'text-slate-900 dark:text-white'}`}>{kpi.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Table View */}
                    {msg.queryResult?.tableData && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">الجدول التحليلي:</span>
                          <button
                            onClick={() => handleExportExcel(msg.queryResult!.tableData!, msg.queryResult?.title)}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                          >
                            <Download className="w-4 h-4" />
                            تصدير Excel
                          </button>
                        </div>
                        <div className="overflow-x-auto max-h-64 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <table className="w-full text-start text-xs border-collapse">
                            <thead className="bg-slate-200/80 dark:bg-slate-900 sticky top-0 font-bold">
                              <tr>
                                {msg.queryResult.tableData.headers.map((h, i) => (
                                  <th key={i} className="p-2.5 text-start border-b border-slate-300 dark:border-slate-700">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                              {msg.queryResult.tableData.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2.5 whitespace-nowrap">{cell}</td>
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
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" />
                          اختر السجل المقصود للمتابعة:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.queryResult.ambiguityChoices.map((choice) => (
                            <button
                              key={choice.id}
                              onClick={() => handleSendMessage(choice.onSelectQuery)}
                              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-start transition-all hover:shadow-xs group"
                            >
                              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">{choice.title}</div>
                              {choice.subtitle && <div className="text-[11px] text-slate-500">{choice.subtitle}</div>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 px-3 mt-1.5">{msg.timestamp}</span>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl w-fit">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري جلب وتحليل البيانات عبر طبقة NMO ERP...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Action Preview Modal */}
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

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    السجل المستهدف: {pendingAction.targetRecordLabel || pendingAction.targetRecordId}
                  </div>
                  
                  {pendingAction.changes && (
                    <div className="space-y-1">
                      {pendingAction.changes.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
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
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {actionSuccessMsg}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConfirmAction}
                      disabled={isExecuting}
                      className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      تأكيد وحفظ التغييرات
                    </button>
                    <button
                      onClick={() => setPendingAction(null)}
                      disabled={isExecuting}
                      className="py-2.5 px-5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors"
                    >
                      إلغاء العملية
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl transition-all ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600'
                  }`}
                  title={isListening ? 'اضغط للإيقاف' : 'إدخال صوتي'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening ? 'استمع لصوتك الآن...' : 'اكتب أمرك هنا أو الصق تقريرًا لاستخراج البيانات...'}
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isProcessing}
                  className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                >
                  <span>إرسال</span>
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Saved Reports Tab */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">التقارير والاستعلامات المحفوظة</h2>
              <p className="text-xs text-slate-500">يمكنك تشغيل أي تقرير محفوظ مسبقًا بنقرة واحدة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => {
                  setActiveTab('CHAT');
                  handleSendMessage(report.query);
                }}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {report.category}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSavedReport(report.id, e)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="حذف من المحفوظات"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 group-hover:text-indigo-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{report.query}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>تشغيل التقرير الآن ←</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
