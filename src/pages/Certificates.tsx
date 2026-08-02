import React, { useState, useEffect } from 'react';
import { Medal, Download, CheckCircle2, Search, ShieldCheck, Printer } from 'lucide-react';
import api from '../services/api';

export const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/certificates');
        if (res.data.success) {
          setCertificates(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;

    try {
      const res = await api.get(`/certificates/verify/${encodeURIComponent(verifyCode.trim())}`);
      setVerifyResult(res.data);
    } catch (err: any) {
      setVerifyResult({ success: false, message: 'Invalid or unverified certificate code' });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Certificate Repository...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-teal-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-amber-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-3">
            <Medal className="w-3.5 h-3.5" /> Official OKGIP Credentials & Certifications
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Certificate Management & Verification
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Access verified credentials earned from completed upskilling programs and validate authenticity codes.
          </p>
        </div>
      </div>

      {/* Code Verification Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Public Certificate Verification Lookup
        </h3>
        <form onSubmit={handleVerify} className="flex gap-2">
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="Enter Certificate Number or Verification Code (e.g. VER-88392-CLOUD)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-2xl shadow-xs cursor-pointer transition-all shrink-0"
          >
            Verify Authenticity
          </button>
        </form>

        {verifyResult && (
          <div className={`p-4 rounded-2xl text-xs font-bold border ${verifyResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
            {verifyResult.message}
            {verifyResult.data && (
              <div className="mt-2 text-[11px] font-medium text-slate-700">
                Issued to <span className="font-bold">{verifyResult.data.employee_name}</span> for program <span className="font-bold">{verifyResult.data.program_title}</span> on {verifyResult.data.issued_date}.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No certificates earned yet. Complete assigned training programs to generate credentials!
          </div>
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className="bg-gradient-to-b from-amber-50/50 via-white to-white p-6 rounded-3xl border-2 border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
                    OKGIP Certified
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{cert.issued_date}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">{cert.program_title}</h3>
                <p className="text-xs text-slate-600 font-medium mt-2">Awarded to: <span className="font-bold text-slate-900">{cert.employee_name}</span></p>

                <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-mono text-slate-500 space-y-1">
                  <p>Cert #: <span className="font-bold text-slate-800">{cert.cert_number}</span></p>
                  <p>Code: <span className="font-bold text-emerald-700">{cert.verification_code}</span></p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCert(cert)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> View Official Certificate
              </button>
            </div>
          ))
        )}
      </div>

      {/* Certificate Print View Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 border-4 border-amber-400 shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              ✕ Close
            </button>

            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold mx-auto border-2 border-amber-300">
                <Medal className="w-8 h-8" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-800">Certificate of Completion</p>
              <h2 className="text-xl font-black text-slate-900">Organizational Knowledge Gap Intelligence Platform</h2>
            </div>

            <div className="py-4 space-y-2 border-y border-amber-200">
              <p className="text-xs text-slate-500 font-medium">This hereby certifies that</p>
              <p className="text-2xl font-black text-slate-900 underline decoration-amber-400 decoration-2">{selectedCert.employee_name}</p>
              <p className="text-xs text-slate-500 font-medium pt-2">has successfully demonstrated mastery and completed the program</p>
              <p className="text-base font-bold text-emerald-800">{selectedCert.program_title}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2">
              <div>
                <p>Issue Date: {selectedCert.issued_date}</p>
                <p>Cert ID: {selectedCert.cert_number}</p>
              </div>
              <div>
                <p className="text-emerald-700 font-bold">Verified Code: {selectedCert.verification_code}</p>
                <p>OKGIP Platform Security Seal</p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs cursor-pointer shadow-md"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
