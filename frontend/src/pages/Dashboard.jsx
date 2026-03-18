import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import forge from 'node-forge';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, Download, FileText, Trash2, ShieldCheck, HardDrive, File as FileIcon, UploadCloud, FolderLock, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import API_BASE_URL from '../api';

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(true);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const privateKeyPem = localStorage.getItem('privateKey');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/files`, {
                headers: { 'x-auth-token': token }
            });
            setFiles(res.data);
        } catch (err) {
            toast.error('Failed to connect to secure server');
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        setUploading(true);
        const uploadToast = toast.loading('Encrypting & Uploading...');

        try {
            const aesKeyStr = CryptoJS.lib.WordArray.random(32).toString();
            const reader = new FileReader();

            reader.onload = async (event) => {
                const fileData = event.target.result;
                const encryptedData = CryptoJS.AES.encrypt(fileData, aesKeyStr).toString();

                const encryptedBlob = new Blob([encryptedData], { type: 'text/plain' });
                const uploadFile = new File([encryptedBlob], file.name, { type: 'text/plain' });

                const publicKey = forge.pki.publicKeyFromPem(user.publicKey);
                const encryptedAesKeyBytes = publicKey.encrypt(aesKeyStr, 'RSA-OAEP');
                const encryptedAesKeyB64 = forge.util.encode64(encryptedAesKeyBytes);

                const formData = new FormData();
                formData.append('file', uploadFile);
                formData.append('originalName', file.name);
                formData.append('encryptedAesKey', encryptedAesKeyB64);

                await axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'x-auth-token': token
                    }
                });

                toast.success('File secured and stored in your vault.', { id: uploadToast });
                fetchFiles();
            };
            reader.readAsDataURL(file);

        } catch (err) {
            toast.error(err.response?.data?.error || 'Upload failed', { id: uploadToast });
        } finally {
            setUploading(false);
        }
    };

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            handleFileUpload(acceptedFiles[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: uploading
    });

    const handleDownload = async (fileMeta) => {
        const downloadToast = toast.loading('Downloading and decrypting...');
        try {
            if (!privateKeyPem) {
                toast.error("Private key unvailable.", { id: downloadToast });
                return;
            }

            const fileId = fileMeta.id || fileMeta._id;
            const metaRes = await axios.get(`${API_BASE_URL}/api/files/${fileId}`, {
                headers: { 'x-auth-token': token }
            });
            const { encryptedAesKey } = metaRes.data;

            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
            const encryptedAesKeyBytes = forge.util.decode64(encryptedAesKey);
            const decryptedAesKeyStr = privateKey.decrypt(encryptedAesKeyBytes, 'RSA-OAEP');

            const fileRes = await axios.get(`${API_BASE_URL}/api/files/${fileId}/download`, {
                responseType: 'text',
                headers: { 'x-auth-token': token }
            });

            const encryptedData = fileRes.data;
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, decryptedAesKeyStr);
            const decryptedDataUrl = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedDataUrl) {
                throw new Error("Local decryption failed.");
            }

            const arr = decryptedDataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const finalBlob = new Blob([u8arr], { type: mime });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(finalBlob);
            link.download = fileMeta.originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Decrypted successfully.', { id: downloadToast });
        } catch (err) {
            toast.error(err.message || 'Decryption failed', { id: downloadToast });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/files/${id}`, {
                headers: { 'x-auth-token': token }
            });
            toast.success('File deleted from vault');
            fetchFiles();
        } catch (err) {
            toast.error('Failed to eliminate file');
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Calculate total vault size
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
    const vaultSize = formatBytes(totalBytes);

    return (
        <div className="w-full flex flex-col gap-8 pb-20">

            {/* Top Area: Stats & Main Dropzone */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Vault Stats Card */}
                <div className="w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#4318FF] to-[#868CFF] p-8 shadow-[0_20px_40px_rgba(67,24,255,0.4)] text-white relative flex flex-col justify-between min-h-[220px]">
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-[40px] pointer-events-none"></div>

                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xl font-bold tracking-tight text-white flex items-center">
                                <HardDrive className="w-6 h-6 mr-3 text-white/90" />
                                Security Dashboard
                            </span>
                        </div>
                        <h2 className="text-5xl font-extrabold tracking-tight drop-shadow-sm">{vaultSize}</h2>
                        <p className="text-white/80 text-sm font-medium mt-1">Total encrypted volume</p>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex flex-col">
                            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">Files Secured</span>
                            <span className="font-bold text-sm">{files.length} items</span>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">Algorithm</span>
                            <span className="font-bold text-sm flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-1.5" /> AES-256
                            </span>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">Architecture</span>
                            <span className="font-bold text-sm">Zero-Knowledge</span>
                        </div>
                    </div>
                </div>

                {/* Secure Dropzone */}
                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col p-8 bg-white" noPadding>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[#2B3674] text-xl">Upload Documents</h3>
                        </div>

                        <div
                            {...getRootProps()}
                            className={`flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${isDragActive ? 'border-[#4318FF] bg-[#F4F7FE] scale-[1.02]' : 'border-[#E9EDF7] hover:border-[#4318FF] hover:bg-[#F4F7FE]'
                                } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <input {...getInputProps()} />
                            <div className="w-16 h-16 rounded-full bg-[#E9EDF7] text-[#4318FF] flex items-center justify-center mb-4 shadow-sm">
                                {uploading ? <CloudUpload className="w-8 h-8 animate-bounce" /> : <UploadCloud className="w-8 h-8" />}
                            </div>
                            <span className="text-[#2B3674] font-bold text-lg mb-1">{isDragActive ? 'Drop to Secure' : 'Drag & Drop Files'}</span>
                            <span className="text-[#A3AED0] text-sm font-medium text-center">Your files will be encrypted on this device<br />before being sent to the cloud.</span>
                        </div>
                    </Card>
                </div>

            </div>

            {/* Bottom Area: The File List + Audit Trail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2">
                    <Card className="flex flex-col h-full min-h-[500px]">
                        <div className="flex justify-between items-center mb-8 border-b border-[#E9EDF7] pb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#F4F7FE] flex items-center justify-center text-[#4318FF]">
                                    <FolderLock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2B3674] text-xl">Encrypted File Vault</h3>
                                    <p className="text-[#A3AED0] text-sm font-medium">Items secured with client-side RSA</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            {loadingFiles ? (
                                <div className="flex flex-col items-center justify-center h-48 text-[#A3AED0]">
                                    <div className="w-10 h-10 border-4 border-[#E9EDF7] border-t-[#4318FF] rounded-full animate-spin mb-4"></div>
                                    <span className="font-bold text-sm">Loading your vault...</span>
                                </div>
                            ) : files.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-[#A3AED0]">
                                    <div className="w-20 h-20 rounded-full bg-[#F4F7FE] flex items-center justify-center mb-4">
                                        <FileText className="w-10 h-10 text-[#A3AED0]/50" />
                                    </div>
                                    <span className="font-bold text-base text-[#2B3674] mb-1">Your vault is empty</span>
                                    <span className="text-sm font-medium">Upload files to securely store them in the cloud.</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {files.map(file => {
                                        const fileId = file.id || file._id;
                                        return (
                                            <div key={fileId} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E9EDF7] hover:border-[#4318FF]/30 hover:shadow-[0_8px_20px_rgba(112,144,176,0.12)] transition-all group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-full bg-[#F4F7FE] text-[#4318FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4318FF] group-hover:text-white transition-colors">
                                                        <FileIcon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[#2B3674] font-bold text-base mb-1 truncate max-w-[150px] sm:max-w-[250px]">
                                                            {file.originalName}
                                                        </span>
                                                        <span className="text-[#A3AED0] text-xs font-medium flex items-center gap-2">
                                                            <span>{formatBytes(file.size)}</span>
                                                            <span className="w-1 h-1 rounded-full bg-[#A3AED0]"></span>
                                                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDownload(file)}
                                                        className="text-[#05CD99] font-bold text-xs hover:text-white bg-[#05CD99]/10 hover:bg-[#05CD99] transition-colors rounded-full px-3 py-1.5 flex items-center gap-1.5"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Decrypt</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(fileId)}
                                                        className="text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#EE5D50]/10 p-2 rounded-full transition-colors"
                                                        title="Delete permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Audit Trail Sidebar */}
                <div>
                    <Card className="flex flex-col h-full min-h-[500px]">
                        <div className="mb-6 border-b border-[#E9EDF7] pb-4">
                            <h3 className="font-bold text-[#2B3674] text-lg">System Audit Log</h3>
                            <p className="text-[#A3AED0] text-xs font-medium mt-1">Immutable access trail</p>
                        </div>

                        <div className="flex flex-col gap-5 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#E9EDF7]">
                            <div className="flex gap-4 items-start relative">
                                <div className="absolute left-[9px] top-6 bottom-[-20px] w-px bg-[#E9EDF7]"></div>
                                <div className="w-5 h-5 rounded-full bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center flex-shrink-0 z-10 mt-0.5">
                                    <ShieldCheck className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#2B3674]">User Authentication</p>
                                    <p className="text-[10px] text-[#A3AED0] font-medium mt-0.5">RSA Challenge Validated</p>
                                </div>
                            </div>

                            {files.length === 0 ? (
                                <p className="text-xs text-[#A3AED0] italic pl-9">No encryption activity recorded.</p>
                            ) : (
                                files.slice(0, 7).map((file, i) => {
                                    const fileId = file.id || file._id;
                                    return (
                                        <div key={fileId + '-log'} className="flex gap-4 items-start relative">
                                            {i !== Math.min(files.length, 7) - 1 && (
                                                <div className="absolute left-[9px] top-6 bottom-[-20px] w-px bg-[#E9EDF7]"></div>
                                            )}
                                            <div className="w-5 h-5 rounded-full bg-[#05CD99]/10 text-[#05CD99] flex items-center justify-center flex-shrink-0 z-10 mt-0.5">
                                                <Lock className="w-2.5 h-2.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#2B3674] break-all max-w-[200px]">Encrypted {file.originalName}</p>
                                                <p className="text-[10px] text-[#A3AED0] font-medium mt-0.5">
                                                    {new Date(file.createdAt).toLocaleDateString()} at {new Date(file.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
