import React, { useState, useEffect } from 'react';
import './App.css';

interface VerificationResult {
  filename: string;
  format: string;
  tables: string[];
  details: {
    family?: string;
    style?: string;
    fullname?: string;
  };
}

function FontPreview({ 
  originalFont, 
  convertedFontUrl, 
  verificationResult 
}: { 
  originalFont: File | null;
  convertedFontUrl: string | null;
  verificationResult: VerificationResult | null;
}) {
  const [previewText, setPreviewText] = useState("こんにちは、世界！\nThe quick brown fox jumps over the lazy dog\n1234567890");
  const [originalFontUrl, setOriginalFontUrl] = useState<string | null>(null);

  useEffect(() => {
    if (originalFont) {
      const url = URL.createObjectURL(originalFont);
      setOriginalFontUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [originalFont]);

  return (
    <div className="font-preview">
      <h2>フォントプレビュー</h2>
      <div className="preview-input">
        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="プレビューテキストを入力..."
          rows={3}
        />
      </div>
      <div className="preview-container">
        <div className="preview-section">
          <h3>変換前 (OTF)</h3>
          <div 
            className="preview-text"
            style={{
              fontFamily: originalFontUrl ? "'PreviewFontOriginal'" : 'inherit',
            }}
          >
            {previewText}
          </div>
          {originalFontUrl && (
            <style>
              {`
                @font-face {
                  font-family: 'PreviewFontOriginal';
                  src: url(${originalFontUrl}) format('opentype');
                }
              `}
            </style>
          )}
        </div>
        <div className="preview-section">
          <h3>変換後 (TTF)</h3>
          <div 
            className="preview-text"
            style={{
              fontFamily: convertedFontUrl ? "'PreviewFontConverted'" : 'inherit',
            }}
          >
            {previewText}
          </div>
          {convertedFontUrl && (
            <style>
              {`
                @font-face {
                  font-family: 'PreviewFontConverted';
                  src: url(${convertedFontUrl}) format('truetype');
                }
              `}
            </style>
          )}
        </div>
      </div>
    </div>
  );
}

function FontVerification({ verification }: { verification: VerificationResult }) {
  return (
    <div className="verification-result">
      <h2>フォント検証結果</h2>
      <div className="verification-details">
        <div className="verification-section">
          <h3>基本情報</h3>
          <p><strong>ファイル名:</strong> {verification.filename}</p>
          <p><strong>フォーマット:</strong> {verification.format}</p>
          {verification.details.family && <p><strong>フォントファミリー:</strong> {verification.details.family}</p>}
          {verification.details.style && <p><strong>スタイル:</strong> {verification.details.style}</p>}
          {verification.details.fullname && <p><strong>フルネーム:</strong> {verification.details.fullname}</p>}
        </div>
        <div className="verification-section">
          <h3>フォントテーブル</h3>
          <ul>
            {verification.tables.map((table, index) => (
              <li key={index}>{table}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [convertedFontUrl, setConvertedFontUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.otf')) {
      setFile(selectedFile);
      setError(null);
      setVerificationResult(null);
      setConvertedFontUrl(null);
    } else {
      setFile(null);
      setError('Please select an OTF file.');
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setVerificationResult(null);
    setConvertedFontUrl(null);

    const formData = new FormData();
    formData.append('font', file);

    try {
      const response = await fetch('http://localhost:3001/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Conversion failed');
      }

      // Get verification data from header
      const verificationHeader = response.headers.get('X-Font-Verification');
      if (verificationHeader) {
        const verification = JSON.parse(verificationHeader);
        setVerificationResult(verification);
      }

      // Create URL for the converted font
      const blob = await response.blob();
      const fontUrl = URL.createObjectURL(blob);
      setConvertedFontUrl(fontUrl);

      // Download the converted file
      const link = document.createElement('a');
      link.href = fontUrl;
      link.download = file.name.replace('.otf', '.ttf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert the font. Please try again.');
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OTF to TTF Converter</h1>
        <div className="converter-container">
          <div className="file-input-container">
            <label htmlFor="font-file" className="file-input-label">
              Select OTF Font File
            </label>
            <input
              id="font-file"
              type="file"
              accept=".otf"
              onChange={handleFileChange}
              className="file-input"
              aria-label="Select OTF font file"
            />
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          {file && (
            <div className="file-info">
              <p>Selected file: {file.name}</p>
              <button
                onClick={handleConvert}
                disabled={loading}
                className="convert-button"
                aria-label={loading ? "Converting font file..." : "Convert to TTF"}
              >
                {loading ? 'Converting...' : 'Convert to TTF'}
              </button>
            </div>
          )}
          <FontPreview 
            originalFont={file}
            convertedFontUrl={convertedFontUrl}
            verificationResult={verificationResult}
          />
          {verificationResult && <FontVerification verification={verificationResult} />}
        </div>
      </header>
    </div>
  );
}

export default App;
