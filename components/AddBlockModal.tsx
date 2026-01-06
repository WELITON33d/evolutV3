import React, { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, Image, Video, AlertCircle, CheckCircle, Type, Link as LinkIcon, Bell, CheckSquare, Plus } from 'lucide-react';
import { BlockType } from '../types';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (type: BlockType, content?: string, file?: File) => Promise<void>;
}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({ isOpen, onClose, onAddBlock }) => {
  const [step, setStep] = useState<'type-selection' | 'content-input'>('type-selection');
  const [selectedType, setSelectedType] = useState<BlockType | null>(null);
  
  // File Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text/Link Input State
  const [textContent, setTextContent] = useState('');

  if (!isOpen) return null;

  const resetState = () => {
    setStep('type-selection');
    setSelectedType(null);
    setSelectedFile(null);
    setTextContent('');
    setError(null);
    setUploading(false);
    setProgress(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleTypeSelect = (type: BlockType) => {
    setSelectedType(type);
    setStep('content-input');
  };

  // --- File Handling Logic ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.size > 50 * 1024 * 1024) {
      setError("Arquivo muito grande. O limite é 50MB.");
      return;
    }
    // Type validation based on selectedType
    if (selectedType === BlockType.IMAGE && !file.type.startsWith('image/')) {
        setError("Por favor, selecione uma imagem.");
        return;
    }
    if (selectedType === BlockType.VIDEO && !file.type.startsWith('video/')) {
        setError("Por favor, selecione um vídeo.");
        return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedType) return;

    setUploading(true);
    setError(null);

    try {
        if (selectedType === BlockType.IMAGE || selectedType === BlockType.VIDEO || selectedType === BlockType.FILE) {
            if (!selectedFile) {
                setError("Selecione um arquivo para continuar.");
                setUploading(false);
                return;
            }
            
            // Simulate upload progress
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            await onAddBlock(selectedType, undefined, selectedFile);
            
            clearInterval(interval);
            setProgress(100);
        } else {
            // Text, Link, Task, Reminder
            await onAddBlock(selectedType, textContent);
        }
        
        setTimeout(() => {
            handleClose();
        }, 300);
    } catch (err) {
        setError("Ocorreu um erro ao adicionar o bloco.");
    } finally {
        setUploading(false);
    }
  };

  const renderContentInput = () => {
    switch (selectedType) {
        case BlockType.TEXT:
        case BlockType.TODO:
        case BlockType.REMINDER:
            return (
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">
                        {selectedType === BlockType.TEXT ? 'Conteúdo do Texto' : 
                         selectedType === BlockType.TODO ? 'Descrição da Tarefa' : 'Lembrete'}
                    </label>
                    <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                        rows={4}
                        placeholder="Digite aqui..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        autoFocus
                    />
                </div>
            );
        case BlockType.LINK:
            return (
                <div className="space-y-4">
                     <label className="block text-sm font-bold text-slate-700">URL do Link</label>
                     <input 
                        type="url"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="https://exemplo.com"
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        autoFocus
                     />
                </div>
            );
        case BlockType.IMAGE:
        case BlockType.VIDEO:
        case BlockType.FILE:
            return (
                <div className="space-y-6">
                    {!selectedFile ? (
                        <div 
                        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
                            dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        >
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={32} />
                        </div>
                        <p className="text-slate-900 font-bold text-lg mb-2">Clique ou arraste seu arquivo</p>
                        <p className="text-slate-400 text-sm">
                            {selectedType === BlockType.IMAGE ? 'JPG, PNG, WEBP (Max 50MB)' :
                             selectedType === BlockType.VIDEO ? 'MP4, MOV, WEBM (Max 50MB)' :
                             'PDF, DOCX, XLSX, ZIP (Max 50MB)'}
                        </p>
                        <input 
                            ref={fileInputRef}
                            type="file"
                            accept={selectedType === BlockType.IMAGE ? "image/*" : selectedType === BlockType.VIDEO ? "video/*" : "*/*"}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                                {selectedType === BlockType.IMAGE ? <Image size={24} /> : 
                                 selectedType === BlockType.VIDEO ? <Video size={24} /> : 
                                 <FileIcon size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button 
                            onClick={() => setSelectedFile(null)}
                            className="text-slate-400 hover:text-red-500 p-2"
                            disabled={uploading}
                            >
                            <X size={20} />
                            </button>
                        </div>
                        {uploading && (
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Enviando...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
  };

  const blockTypes = [
    { type: BlockType.TEXT, label: 'Texto', icon: Type, color: 'text-slate-600 bg-slate-50 hover:bg-slate-100' },
    { type: BlockType.IMAGE, label: 'Imagem', icon: Image, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
    { type: BlockType.VIDEO, label: 'Vídeo', icon: Video, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
    { type: BlockType.LINK, label: 'Link', icon: LinkIcon, color: 'text-sky-600 bg-sky-50 hover:bg-sky-100' },
    { type: BlockType.FILE, label: 'Arquivo', icon: FileIcon, color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
    { type: BlockType.TODO, label: 'Tarefa', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { type: BlockType.REMINDER, label: 'Alerta', icon: Bell, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Plus size={24} className="text-blue-600" />
            {step === 'type-selection' ? 'Adicionar Novo Bloco' : 'Detalhes do Bloco'}
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
            {step === 'type-selection' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {blockTypes.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => handleTypeSelect(item.type)}
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all group ${item.color}`}
                        >
                            <item.icon size={28} className="transition-transform group-hover:scale-110" />
                            <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="animate-fade-in">
                    {renderContentInput()}
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm font-bold mt-4 bg-red-50 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Footer */}
        {step === 'content-input' && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <button 
                    onClick={() => setStep('type-selection')}
                    className="text-sm font-bold text-slate-500 hover:text-slate-900"
                >
                    Voltar
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={handleClose}
                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        disabled={uploading}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={uploading || (
                            (selectedType === BlockType.TEXT || selectedType === BlockType.LINK || selectedType === BlockType.TODO || selectedType === BlockType.REMINDER) && !textContent
                        ) || (
                            (selectedType === BlockType.IMAGE || selectedType === BlockType.VIDEO || selectedType === BlockType.FILE) && !selectedFile
                        )}
                        className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 ${
                        uploading 
                            ? 'bg-slate-300 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                        }`}
                    >
                        {uploading ? 'Salvando...' : 'Adicionar Bloco'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
