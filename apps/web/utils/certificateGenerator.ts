import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface CertificateData {
  certificateId: string;
  buyerName: string;
  projectName: string;
  projectType: string;
  credits: number;
  co2Offset: number;
  purchaseDate: string;
  transactionReference: string;
  projectLocation?: {
    lat: number
    lon: number
    name: string
  };
  verificationStandard?: string;
}

/**
 * Generate a certificate PDF from HTML element
 */
export async function generateCertificatePDF(
  element: HTMLElement,
  filename: string = 'certificate.pdf'
): Promise<Blob> {
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      width: 800,
      height: 600,
      useCORS: true,
      allowTaint: false,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 600],
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);

    // Return as blob for upload
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error('Failed to generate certificate PDF');
  }
}

/**
 * Generate and download certificate PDF
 */
export async function downloadCertificate(
  certificateData: CertificateData,
  filename?: string
): Promise<void> {
  try {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px';
    container.style.height = '600px';

    // Create certificate HTML
    container.innerHTML = createCertificateHTML(certificateData);
    document.body.appendChild(container);

    // Wait for fonts and styles to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate PDF
    const pdfBlob = await generateCertificatePDF(
      container.firstElementChild as HTMLElement,
      filename
    );

    // Download the PDF
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      filename || `certificate-${certificateData.certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Clean up
    document.body.removeChild(container);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
}

/**
 * Generate certificate for upload to storage
 */
export async function generateCertificateForUpload(
  certificateData: CertificateData
): Promise<{ blob: Blob; filename: string }> {
  try {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px';
    container.style.height = '600px';

    // Create certificate HTML
    container.innerHTML = createCertificateHTML(certificateData);
    document.body.appendChild(container);

    // Wait for fonts and styles to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate PDF blob
    const pdfBlob = await generateCertificatePDF(
      container.firstElementChild as HTMLElement
    );

    // Clean up
    document.body.removeChild(container);

    const filename = `certificate-${certificateData.certificateId}-${Date.now()}.pdf`;

    return { blob: pdfBlob, filename };
  } catch (error) {
    console.error('Error generating certificate for upload:', error);
    throw error;
  }
}

/**
 * View certificate in browser's native PDF viewer
 */
export async function viewCertificateInBrowser(
  certificateData: CertificateData
): Promise<void> {
  try {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px';
    container.style.height = '600px';

    // Create certificate HTML
    container.innerHTML = createCertificateHTML(certificateData);
    document.body.appendChild(container);

    // Wait for fonts and styles to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate PDF blob
    const pdfBlob = await generateCertificatePDF(
      container.firstElementChild as HTMLElement
    );

    // Clean up
    document.body.removeChild(container);

    // Create object URL and open in new tab
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const newWindow = window.open(pdfUrl, '_blank');

    if (!newWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    // Clean up the URL after a delay to allow the PDF to load
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 10000);
  } catch (error) {
    console.error('Error viewing certificate:', error);
    throw error;
  }
}

/**
 * View existing certificate from storage URL in browser
 */
export async function viewStoredCertificateInBrowser(
  certificateUrl: string
): Promise<void> {
  try {
    const newWindow = window.open(certificateUrl, '_blank');

    if (!newWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
  } catch (error) {
    console.error('Error viewing stored certificate:', error);
    throw error;
  }
}

/**
 * Create certificate HTML string
 */
function createCertificateHTML(data: CertificateData): string {
  const {
    certificateId,
    buyerName,
    projectName,
    projectType,
    credits,
    co2Offset,
    purchaseDate,
    transactionReference,
    projectLocation = { name: 'Unknown Location', lat: 0, lon: 0 },
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

  return `
    <div style="
      background: white;
      width: 800px;
      height: 600px;
      position: relative;
      overflow: hidden;
      font-family: serif;
      padding: 12px;
      box-sizing: border-box;
    ">
      <!-- Decorative border -->
      <div style="
        border: 4px solid #059669;
        border-radius: 8px;
        height: 100%;
        position: relative;
        padding: 8px;
        box-sizing: border-box;
      ">
        <div style="
          border: 2px solid #86efac;
          border-radius: 8px;
          height: 100%;
          padding: 24px;
          box-sizing: border-box;
          position: relative;
        ">

          <!-- Header -->
          <div style="text-align: center; padding-bottom: 10px;">
            <div style="margin-bottom: 16px;">
            <h2 style="
              font-size: 24px;
              font-weight: bold;
              color: #374151;
              margin: 0 0 5px 0;
            ">CERTIFICATE OF CONTRIBUTION</h2>
            <p style="
              font-size: 18px;
              color: #6b7280;
              margin: 0;
            ">Carbon Credit Offset Achievement</p>
          </div>

          <!-- Certificate Body -->
          <div style="padding: 0 20px">
            <div style="text-align: center">
              <p style="
                font-size: 18px;
                color: #374151;
                line-height: 1.6;
                margin: 0 0 5px 0;
              ">
                This certifies that
              </p>
              <div style="
                margin: 10px 0;
                padding: 6px 0;
                border-bottom: 2px solid #059669;
              ">
                <p style="
                  font-size: 18px;
                  font-weight: bold;
                  color: #065f46;
                  margin-bottom: 0;
                ">${buyerName}</p>
              </div>
              <p style="
                font-size: 14px;
                color: #374151;
                line-height: 1.6;
                margin-bottom: 10px;
              ">
                has successfully contributed to environmental sustainability by purchasing
              </p>
            </div>

            <!-- Credit Details -->
            <div style="
              background: #ecfdf5;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 10px;
              border: 1px solid #bbf7d0;
              display: flex;
              justify-content: space-around;
            ">
              <div style="text-align: center;">
                <div style="
                  font-size: 20px;
                  font-weight: bold;
                  color: #059669;
                ">${credits}</div>
                <div style="
                  font-size: 12px;
                  color: #6b7280;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                ">Carbon Credits</div>
              </div>
              <div style="text-align: center;">
                <div style="
                  font-size: 20px;
                  font-weight: bold;
                  color: #059669;
                ">${co2Offset.toFixed(1)}</div>
                <div style="
                  font-size: 12px;
                  color: #6b7280;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                ">Tons CO₂ Offset</div>
              </div>
            </div>

            <!-- Project Details -->
            <div style="text-align: center; margin-bottom: 24px;">
              <p style="
                font-size: 14px;
                color: #374151;
                margin: 0 0 8px 0;
              ">from the project</p>
              <p style="
                font-size: 16px;
                font-weight: bold;
                color: #374151;
                margin: 0 0 4px 0;
              ">${projectName}</p>
              <p style="
                font-size: 14px;
                color: #6b7280;
                text-transform: capitalize;
                margin: 0;
              ">${projectType.replace('_', ' ')} • ${projectLocation.name}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="
            bottom: 32px;
            left: 32px;
            right: 32px;
            margin-top: 20px;
          ">
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 16px;
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 16px;
            ">
              <div>
                <p style="font-weight: 500; margin: 0 0 4px 0;">Certificate ID</p>
                <p style="font-family: monospace; font-size: 10px; margin: 0;">${certificateId}</p>
              </div>
              <div>
                <p style="font-weight: 500; margin: 0 0 4px 0;">Purchase Date</p>
                <p style="margin: 0;">${formattedDate}</p>
              </div>
              <div>
                <p style="font-weight: 500; margin: 0 0 4px 0;">Issue Date</p>
                <p style="margin: 0;">${currentDate}</p>
              </div>
            </div>

            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 24px;
            ">
              <div>
                <p style="font-weight: 500; margin: 0 0 4px 0;">Transaction Reference</p>
                <p style="font-family: monospace; font-size: 10px; margin: 0;">${transactionReference}</p>
              </div>
              <div>
                <p style="font-weight: 500; margin: 0 0 4px 0;">Verification Standard</p>
                <p style="margin: 0;">${verificationStandard}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
