import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, AlertCircle, CheckCircle } from 'lucide-react';
import { BlockType } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, type: BlockType) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<BlockType>(BlockType.FILE);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    // Limit to 50MB for this example
    if (file.size > 50 * 1024 * 1024) {
      setError("Arquivo muito grande. O limite é 50MB.");
      return;
    }

    setSelectedFile(file);
    
    // Auto-detect type
    if (file.type.startsWith('image/')) setUploadType(BlockType.IMAGE);
    else if (file.type.startsWith('video/')) setUploadType(BlockType.VIDEO);
    else setUploadType(BlockType.FILE);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onUpload(selectedFile, uploadType);
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
        onClose();
      }, 500);
    } catch (err) {
      setError("Falha no upload. Tente novamente.");
      setUploading(false);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Upload size={24} className="text-blue-600" />
            Upload de Arquivo
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {!selectedFile ? (
            <div 
              className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
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
              <p className="text-slate-900 font-bold text-lg mb-2">Clique ou arraste um arquivo</p>
              <p className="text-slate-400 text-sm">Suporta Imagens, Vídeos, PDFs e Docs (Max 50MB)</p>
              <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                  {uploadType === BlockType.IMAGE ? <Image size={24} /> : 
                   uploadType === BlockType.VIDEO ? <Video size={24} /> : 
                   <File size={24} />}
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

              {/* Type Selector */}
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setUploadType(BlockType.IMAGE)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${uploadType === BlockType.IMAGE ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                  Imagem
                </button>
                <button 
                  onClick={() => setUploadType(BlockType.VIDEO)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${uploadType === BlockType.VIDEO ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                  Vídeo
                </button>
                <button 
                  onClick={() => setUploadType(BlockType.FILE)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${uploadType === BlockType.FILE ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                  Arquivo
                </button>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>{progress < 100 ? 'Enviando...' : 'Concluído!'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

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
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 ${
              !selectedFile || uploading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
            }`}
          >
            {uploading ? (
              <>Enviando...</>
            ) : (
              <>
                Confirmar Upload
                <CheckCircle size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
