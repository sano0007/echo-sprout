'use client';

import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import type { VerificationCertificate, VerificationReport } from './types';

export class PDFExportService {
  // Safe date formatting helper
  private static formatDate(
    date: string | number | Date | null | undefined,
    formatString: string = 'PPP'
  ): string {
    if (!date) return 'Not specified';

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      return format(dateObj, formatString);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  }

  // Generate PDF report from verification report data
  static async generateReportPDF(report: VerificationReport): Promise<Blob> {
    try {
      // Create a temporary container for HTML content
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = this.generateReportHTML(report);
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.style.background = 'white';
      document.body.appendChild(tempContainer);

      // Generate canvas from HTML
      const canvas = await html2canvas(tempContainer, {
        useCORS: true,
        allowTaint: true
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      // Fallback to text-based PDF
      return this.generateFallbackPDF(
        'Verification Report',
        report.projectName
      );
    }
  }

  // Generate PDF certificate from certificate data
  static async generateCertificatePDF(
    certificate: VerificationCertificate
  ): Promise<Blob> {
    try {
      // Create a temporary container for HTML content
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = this.generateCertificateHTML(certificate);
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.style.background = 'white';
      document.body.appendChild(tempContainer);

      // Generate canvas from HTML
      const canvas = await html2canvas(tempContainer, {
        useCORS: true,
        allowTaint: true
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for certificate
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF certificate:', error);
      // Fallback to text-based PDF
      return this.generateFallbackPDF(
        'Verification Certificate',
        certificate.projectName
      );
    }
  }

  // Fallback PDF generation for errors
  private static generateFallbackPDF(title: string, projectName: string): Blob {
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text(title, 20, 30);
    pdf.setFontSize(14);
    pdf.text(`Project: ${projectName}`, 20, 50);
    pdf.text('Generated on: ' + new Date().toLocaleDateString(), 20, 70);
    pdf.text(
      'Note: This is a simplified PDF due to generation issues.',
      20,
      90
    );
    return pdf.output('blob');
  }

  // Generate comprehensive HTML report
  public static generateReportHTML(report: VerificationReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Report - ${report.projectName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #2563eb;
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header .subtitle {
            color: #6b7280;
            font-size: 1.2em;
        }

        .report-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
        }

        .section {
            margin-bottom: 40px;
            break-inside: avoid;
        }

        .section h2 {
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .section h3 {
            color: #374151;
            margin-bottom: 15px;
        }

        .score-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }

        .score-card .score {
            font-size: 4em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .score-card .status {
            font-size: 1.5em;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
        }

        .card h4 {
            margin-top: 0;
            color: #374151;
        }

        .metric {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .metric .value {
            font-size: 2em;
            font-weight: bold;
            color: #2563eb;
        }

        .metric .label {
            color: #6b7280;
            font-size: 0.9em;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .table th,
        .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        .table th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
        }

        .status-approved { color: #059669; font-weight: bold; }
        .status-rejected { color: #dc2626; font-weight: bold; }
        .status-partial { color: #d97706; font-weight: bold; }

        .recommendations {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
        }

        .recommendations h4 {
            color: #92400e;
            margin-top: 0;
        }

        .recommendations ul {
            margin: 10px 0;
            padding-left: 20px;
        }

        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
        }

        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
        }

        .signature-box {
            border: 1px solid #d1d5db;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #374151;
            margin-top: 40px;
            padding-top: 10px;
        }

        @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
            .score-card { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Verification Report</h1>
        <div class="subtitle">Project Verification and Compliance Assessment</div>
        <div style="margin-top: 20px; color: #6b7280;">
            Report ID: ${report.id} | Generated: ${this.formatDate(report.generatedAt, 'PPP')}
        </div>
    </div>

    <div class="report-meta">
        <div>
            <h3>Project Information</h3>
            <p><strong>Project Name:</strong> ${report.projectName}</p>
            <p><strong>Creator:</strong> ${report.projectCreatorInfo.name}</p>
            ${report.projectCreatorInfo.organization ? `<p><strong>Organization:</strong> ${report.projectCreatorInfo.organization}</p>` : ''}
            <p><strong>Submitted:</strong> ${this.formatDate(report.submittedAt, 'PPP')}</p>
            <p><strong>Verified:</strong> ${this.formatDate(report.verifiedAt, 'PPP')}</p>
        </div>
        <div>
            <h3>Verifier Information</h3>
            <p><strong>Verifier:</strong> ${report.verifierInfo.name}</p>
            <p><strong>Organization:</strong> ${report.verifierInfo.organization}</p>
            <p><strong>Role:</strong> ${report.verifierInfo.role}</p>
            <p><strong>Credentials:</strong></p>
            <ul>
                ${report.verifierInfo.credentials.map((cred) => `<li>${cred}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="score-card">
        <div class="score">${report.verificationResults.overallScore}/100</div>
        <div class="status">${report.verificationResults.status.replace('_', ' ')}</div>
        <div style="margin-top: 15px; font-size: 1.1em;">
            ${report.verificationResults.summary}
        </div>
    </div>

    <div class="section">
        <h2>Verification Metrics</h2>
        <div class="grid">
            <div class="metric">
                <div class="value">${report.documents.length}</div>
                <div class="label">Total Documents</div>
            </div>
            <div class="metric">
                <div class="value">${report.documents.filter((d) => d.status === 'verified').length}</div>
                <div class="label">Verified Documents</div>
            </div>
            <div class="metric">
                <div class="value">${report.communications.totalMessages}</div>
                <div class="label">Messages Exchanged</div>
            </div>
            <div class="metric">
                <div class="value">${report.auditTrail.totalEvents}</div>
                <div class="label">Audit Events</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Verification Categories</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Weight</th>
                    <th>Status</th>
                    <th>Comments</th>
                </tr>
            </thead>
            <tbody>
                ${report.verificationResults.categories
                  .map(
                    (cat) => `
                    <tr>
                        <td>${cat.name}</td>
                        <td>${cat.score}/${cat.maxScore}</td>
                        <td>${cat.weight}%</td>
                        <td class="status-${cat.status}">${cat.status.replace('_', ' ').toUpperCase()}</td>
                        <td>${cat.comments}</td>
                    </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Document Review</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Annotations</th>
                    <th>Comments</th>
                </tr>
            </thead>
            <tbody>
                ${report.documents
                  .map(
                    (doc) => `
                    <tr>
                        <td>${doc.name}</td>
                        <td>${doc.type}</td>
                        <td class="status-${doc.status.replace('_', '-')}">${doc.status.replace('_', ' ').toUpperCase()}</td>
                        <td>${doc.annotations}</td>
                        <td>${doc.comments.join('; ')}</td>
                    </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>
    </div>

    ${
      report.verificationResults.recommendations.length > 0
        ? `
    <div class="recommendations">
        <h4>Key Recommendations</h4>
        <ul>
            ${report.verificationResults.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    `
        : ''
    }

    ${
      report.verificationResults.strengths.length > 0
        ? `
    <div class="section">
        <h2>Project Strengths</h2>
        <ul>
            ${report.verificationResults.strengths.map((strength) => `<li>${strength}</li>`).join('')}
        </ul>
    </div>
    `
        : ''
    }

    ${
      report.verificationResults.weaknesses.length > 0
        ? `
    <div class="section">
        <h2>Areas for Improvement</h2>
        <ul>
            ${report.verificationResults.weaknesses.map((weakness) => `<li>${weakness}</li>`).join('')}
        </ul>
    </div>
    `
        : ''
    }

    <div class="section">
        <h2>Metadata</h2>
        <div class="grid">
            <div class="card">
                <h4>Project Complexity</h4>
                <p>${report.metadata.complexity.toUpperCase()}</p>
            </div>
            <div class="card">
                <h4>Risk Level</h4>
                <p>${report.metadata.riskLevel.toUpperCase()}</p>
            </div>
            <div class="card">
                <h4>Verification Duration</h4>
                <p>${Math.round(report.metadata.duration / (1000 * 60 * 60 * 24))} days</p>
            </div>
            <div class="card">
                <h4>Compliance Standards</h4>
                <p>${report.metadata.compliance.join(', ') || 'Standard verification'}</p>
            </div>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <h4>Verified By</h4>
            <div style="margin: 20px 0;">
                <strong>${report.verifierInfo.name}</strong><br>
                ${report.verifierInfo.role}<br>
                ${report.verifierInfo.organization}
            </div>
            <div class="signature-line">Digital Signature</div>
        </div>
        <div class="signature-box">
            <h4>Report Details</h4>
            <div style="margin: 20px 0;">
                <strong>Report Version:</strong> ${report.reportVersion}<br>
                <strong>Generated:</strong> ${this.formatDate(report.generatedAt, 'PPpp')}<br>
                <strong>Verification ID:</strong> ${report.verificationId}
            </div>
            <div class="signature-line">Official Report</div>
        </div>
    </div>

    <div class="footer">
        <p>This report was generated electronically and is valid without physical signature.</p>
        <p>For verification of authenticity, please visit the project verification portal.</p>
    </div>
</body>
</html>
    `;
  }

  // Generate certificate HTML
  public static generateCertificateHTML(
    certificate: VerificationCertificate
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Certificate - ${certificate.projectName}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .certificate {
            width: 800px;
            background: white;
            border: 8px solid #2563eb;
            border-radius: 20px;
            padding: 60px;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #93c5fd;
            border-radius: 12px;
        }

        .header {
            margin-bottom: 40px;
        }

        .certificate-title {
            font-size: 3em;
            color: #1e40af;
            margin-bottom: 20px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .subtitle {
            font-size: 1.2em;
            color: #374151;
            margin-bottom: 30px;
        }

        .project-name {
            font-size: 2.2em;
            color: #1e40af;
            margin: 30px 0;
            font-weight: bold;
            text-decoration: underline;
        }

        .creator-info {
            font-size: 1.3em;
            color: #374151;
            margin: 20px 0;
        }

        .score-section {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 40px 0;
        }

        .score {
            font-size: 4em;
            font-weight: bold;
            margin: 10px 0;
        }

        .verification-details {
            margin: 40px 0;
            font-size: 1.1em;
            color: #374151;
        }

        .verifier-info {
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 10px;
        }

        .certificate-number {
            position: absolute;
            top: 30px;
            right: 30px;
            font-size: 0.9em;
            color: #6b7280;
            font-family: 'Courier New', monospace;
        }

        .security-features {
            position: absolute;
            bottom: 30px;
            left: 30px;
            font-size: 0.8em;
            color: #6b7280;
        }

        .date-info {
            position: absolute;
            bottom: 30px;
            right: 30px;
            font-size: 0.9em;
            color: #6b7280;
            text-align: right;
        }

        .scope-badges {
            margin: 20px 0;
        }

        .scope-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 5px 15px;
            border-radius: 20px;
            margin: 5px;
            font-size: 0.9em;
        }

        .blockchain-info {
            background: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            font-size: 0.9em;
        }

        @media print {
            body { background: white; padding: 0; }
            .certificate { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-number">
            Certificate No: ${certificate.certificateNumber}
        </div>

        <div class="header">
            <div class="certificate-title">CERTIFICATE OF VERIFICATION</div>
            <div class="subtitle">This certifies that the project</div>
        </div>

        <div class="project-name">${certificate.projectName}</div>

        <div class="creator-info">
            Created by <strong>${certificate.projectCreator.name}</strong>
            ${certificate.projectCreator.organization ? `<br>from <strong>${certificate.projectCreator.organization}</strong>` : ''}
        </div>

        <div class="score-section">
            <div>has achieved a verification score of</div>
            <div class="score">${certificate.overallScore}/100</div>
            <div style="font-size: 1.2em; text-transform: uppercase; letter-spacing: 2px;">
                ${certificate.status}
            </div>
        </div>

        <div class="verification-details">
            <div><strong>Certificate Type:</strong> ${certificate.certificateType.replace('_', ' ').toUpperCase()}</div>

            <div class="scope-badges">
                <div style="margin-bottom: 10px;"><strong>Verification Scope:</strong></div>
                ${certificate.scope.map((item) => `<span class="scope-badge">${item}</span>`).join('')}
            </div>
        </div>

        <div class="verifier-info">
            <div><strong>Verified by:</strong></div>
            <div style="font-size: 1.2em; margin: 10px 0;"><strong>${certificate.verifier.name}</strong></div>
            <div>${certificate.verifier.organization}</div>
            <div style="margin-top: 10px; font-size: 0.9em;">
                <strong>Credentials:</strong> ${certificate.verifier.credentials.join(', ')}
            </div>
        </div>

        ${
          certificate.metadata.blockchain
            ? `
        <div class="blockchain-info">
            <strong>🔗 Blockchain Verified</strong><br>
            This certificate is immutably recorded on the ${certificate.metadata.blockchain.network} blockchain<br>
            <strong>Transaction:</strong> ${certificate.metadata.blockchain.txHash}
        </div>
        `
            : ''
        }

        <div class="security-features">
            Security Features:
            ${certificate.digitalSignature ? '🔐 Digital Signature' : ''}
            ${certificate.metadata.blockchain ? ' 🔗 Blockchain' : ''}
            🔍 Hash: ${certificate.securityHash.substring(0, 8)}...
        </div>

        <div class="date-info">
            Issued: ${this.formatDate(certificate.issuedAt, 'PPP')}<br>
            ${certificate.expiresAt ? `Expires: ${this.formatDate(certificate.expiresAt, 'PPP')}` : 'No Expiration'}
        </div>
    </div>
</body>
</html>
    `;
  }

  // Export to JSON format
  static exportToJSON(
    data: VerificationReport | VerificationCertificate
  ): Blob {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  // Trigger download of blob
  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
