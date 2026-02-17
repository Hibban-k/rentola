"use client";

import { useState, useRef } from "react";
import { IKContext, IKUpload } from "imagekitio-react";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";

interface UploadedFile {
    url: string;
    fileId: string;
    name: string;
}

interface ImageUploadProps {
    folder: "vehicles" | "profiles" | "documents";
    onUploadSuccess: (file: UploadedFile) => void;
    onUploadError?: (error: string) => void;
    accept?: string;
    maxFiles?: number;
    label?: string;
}

const authenticator = async () => {
    const response = await fetch("/api/imagekit-auth");
    if (!response.ok) throw new Error("Auth failed");
    return response.json();
};

export default function ImageUpload({
    folder,
    onUploadSuccess,
    onUploadError,
    accept = "image/*",
    maxFiles = 5,
    label = "Upload Image",
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const uploadRef = useRef<HTMLInputElement>(null);

    const handleUploadStart = () => {
        setIsUploading(true);
        setError(null);
    };

    const handleUploadSuccess = (res: { url: string; fileId: string; name: string }) => {
        setIsUploading(false);
        const file: UploadedFile = {
            url: res.url,
            fileId: res.fileId,
            name: res.name,
        };
        setUploadedFiles((prev) => [...prev, file]);
        onUploadSuccess(file);
    };

    const handleUploadError = (err: { message: string }) => {
        setIsUploading(false);
        setError(err.message || "Upload failed");
        onUploadError?.(err.message);
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    };

    console.log("ImageKit Config:", {
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    return (
        <IKContext
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            authenticator={authenticator}
        >
            <div className="space-y-3">
                {/* Upload Button */}
                <div
                    onClick={() => uploadRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isUploading
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">
                                Click to select or drag and drop
                            </p>
                        </div>
                    )}

                    <IKUpload
                        ref={uploadRef}
                        folder={`/rentola/${folder}`}
                        onUploadStart={handleUploadStart}
                        onSuccess={handleUploadSuccess}
                        onError={handleUploadError}
                        accept={accept}
                        className="hidden"
                    />
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {uploadedFiles.map((file) => (
                            <div
                                key={file.fileId}
                                className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border"
                            >
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile(file.fileId)}
                                    className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <div className="absolute bottom-1 right-1">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {uploadedFiles.length >= maxFiles && (
                    <p className="text-xs text-muted-foreground">
                        Maximum {maxFiles} files reached
                    </p>
                )}
            </div>
        </IKContext>
    );
}
