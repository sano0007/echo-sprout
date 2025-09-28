'use client';

import React from 'react';

interface CertificateData {
  certificateId: string;
  buyerName: string;
  projectName: string;
  projectType: string;
  credits: number;
  co2Offset: number;
  purchaseDate: string;
  transactionReference: string;
  projectLocation?: string;
  verificationStandard?: string;
}

interface CertificateTemplateProps {
  data: CertificateData;
  className?: string;
}

export default function CertificateTemplate({
  data,
  className = '',
}: CertificateTemplateProps) {
  const {
    certificateId,
    buyerName,
    projectName,
    projectType,
    credits,
    co2Offset,
    purchaseDate,
    transactionReference,
    projectLocation = 'Global',
    verificationStandard = 'Verified Carbon Standard (VCS)',
  } = data;

  const formattedDate = new Date(purchaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`bg-white w-[800px] h-[600px] mx-auto relative overflow-hidden ${className}`}
      style={{ fontFamily: 'serif' }}
    >
      {/* Decorative border */}
      <div className="absolute inset-4 border-4 border-emerald-600 rounded-lg">
        <div className="absolute inset-2 border-2 border-emerald-300 rounded-lg">
          {/* Header */}
          <div className="text-center pt-8 pb-4">
            <div className="mb-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-full mx-auto flex items-center justify-center mb-3">
                <span className="text-white text-2xl font-bold">🌱</span>
              </div>
              <h1 className="text-3xl font-bold text-emerald-800 mb-1">
                ECHO SPROUT
              </h1>
              <p className="text-sm text-gray-600 uppercase tracking-wider">
                Carbon Credit Marketplace
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              CERTIFICATE OF CONTRIBUTION
            </h2>
            <p className="text-lg text-gray-600">
              Carbon Credit Offset Achievement
            </p>
          </div>

          {/* Certificate Body */}
          <div className="px-12 py-6">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                This certifies that
              </p>
              <div className="my-4 py-2 border-b-2 border-emerald-600">
                <p className="text-2xl font-bold text-emerald-800">
                  {buyerName}
                </p>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                has successfully contributed to environmental sustainability by
                purchasing
              </p>
            </div>

            {/* Credit Details */}
            <div className="bg-emerald-50 rounded-lg p-6 mb-6 border border-emerald-200">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {credits}
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">
                    Carbon Credits
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {co2Offset.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">
                    Tons CO₂ Offset
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700 mb-2">from the project</p>
              <p className="text-xl font-bold text-gray-800">{projectName}</p>
              <p className="text-sm text-gray-600 capitalize">
                {projectType.replace('_', ' ')} • {projectLocation}
              </p>
            </div>

            {/* Environmental Impact */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Environmental Impact Equivalent
                </p>
                <div className="flex justify-center space-x-8 text-xs text-blue-700">
                  <div>🌳 {Math.round(co2Offset * 40)} trees planted</div>
                  <div>🚗 {Math.round(co2Offset / 4.6)} cars off road/year</div>
                  <div>⚡ {Math.round(co2Offset * 3000)} kWh clean energy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
              <div>
                <p className="font-medium">Certificate ID</p>
                <p className="font-mono text-xs">{certificateId}</p>
              </div>
              <div>
                <p className="font-medium">Purchase Date</p>
                <p>{formattedDate}</p>
              </div>
              <div>
                <p className="font-medium">Issue Date</p>
                <p>{currentDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-600">
              <div>
                <p className="font-medium">Transaction Reference</p>
                <p className="font-mono text-xs">{transactionReference}</p>
              </div>
              <div>
                <p className="font-medium">Verification Standard</p>
                <p>{verificationStandard}</p>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="flex justify-between items-end mt-6">
              <div className="text-center">
                <div className="w-32 border-b border-gray-400 mb-1"></div>
                <p className="text-xs text-gray-600">Echo Sprout Platform</p>
                <p className="text-xs text-gray-500">Digital Certificate</p>
              </div>

              <div className="text-right">
                <div className="w-20 h-16 bg-emerald-100 rounded border border-emerald-300 flex items-center justify-center mb-1">
                  <span className="text-xs text-emerald-700 font-bold">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-gray-500">Blockchain Verified</p>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="absolute bottom-2 right-2">
              <div className="w-12 h-12 bg-gray-200 border border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-500">QR</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-emerald-400 rounded-tl-lg opacity-50"></div>
          <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-emerald-400 rounded-tr-lg opacity-50"></div>
          <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-emerald-400 rounded-bl-lg opacity-50"></div>
          <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-emerald-400 rounded-br-lg opacity-50"></div>
        </div>
      </div>
    </div>
  );
}

// Component for generating certificate as image/PDF
export function CertificateGenerator({ data }: { data: CertificateData }) {
  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      <CertificateTemplate data={data} />
    </div>
  );
}
