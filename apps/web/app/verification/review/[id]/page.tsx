'use client';

import { useCallback, useState } from 'react';

import { PDFViewer } from '../../../../components/pdf';
import type { Annotation } from '../../../../components/pdf/types';

export default function ProjectReview() {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [documentAnnotations, setDocumentAnnotations] = useState<
    Record<string, Annotation[]>
  >({});

  const project = {
    id: 1,
    name: 'Solar Farm Project',
    creator: 'SolarTech Inc',
    type: 'Solar Energy',
    submitted: '2024-01-15',
    location: 'Nevada, USA',
    description: 'Large-scale solar installation with 500MW capacity',
    documents: [
      {
        name: 'Project Proposal.pdf',
        size: '2.4 MB',
        pages: 45,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        id: 'project-proposal',
      },
      {
        name: 'Environmental Impact.pdf',
        size: '1.8 MB',
        pages: 32,
        url: '/sample-documents/project-proposal.pdf', // Using same sample for demo
        id: 'environmental-impact',
      },
      {
        name: 'Site Photos.pdf',
        size: '5.2 MB',
        pages: 15,
        url: '/sample-documents/project-proposal.pdf', // Using same sample for demo
        id: 'site-photos',
      },
      {
        name: 'Technical Specifications.pdf',
        size: '890 KB',
        pages: 12,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        id: 'technical-specs',
      },
    ],
  };

  const checklist = [
    {
      id: 1,
      category: 'Documentation',
      item: 'Project proposal completeness',
      status: 'pending',
      score: null,
    },
    {
      id: 2,
      category: 'Documentation',
      item: 'Environmental impact assessment',
      status: 'approved',
      score: 9,
    },
    {
      id: 3,
      category: 'Technical',
      item: 'Technical feasibility analysis',
      status: 'pending',
      score: null,
    },
    {
      id: 4,
      category: 'Technical',
      item: 'Equipment specifications review',
      status: 'pending',
      score: null,
    },
    {
      id: 5,
      category: 'Financial',
      item: 'Budget and cost analysis',
      status: 'pending',
      score: null,
    },
    {
      id: 6,
      category: 'Financial',
      item: 'Financial sustainability assessment',
      status: 'pending',
      score: null,
    },
    {
      id: 7,
      category: 'Compliance',
      item: 'Regulatory compliance check',
      status: 'approved',
      score: 8,
    },
    {
      id: 8,
      category: 'Compliance',
      item: 'Carbon credit calculation methodology',
      status: 'pending',
      score: null,
    },
  ];

  // Annotation handling functions
  const handleAnnotationChange = useCallback(
    (documentId: string, annotations: Annotation[]) => {
      setDocumentAnnotations((prev) => ({
        ...prev,
        [documentId]: annotations,
      }));
    },
    []
  );

  const handleDocumentSelect = useCallback((doc: any) => {
    setSelectedDocument(doc.id);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-600">Review Session - {project.creator}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Approve Project
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded">
            Request Revision
          </button>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
            Save Progress
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left p-3 rounded ${activeSection === 'overview' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Project Overview
              </button>
              <button
                onClick={() => setActiveSection('documents')}
                className={`w-full text-left p-3 rounded ${activeSection === 'documents' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Document Review
              </button>
              <button
                onClick={() => setActiveSection('checklist')}
                className={`w-full text-left p-3 rounded ${activeSection === 'checklist' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Verification Checklist
              </button>
              <button
                onClick={() => setActiveSection('communication')}
                className={`w-full text-left p-3 rounded ${activeSection === 'communication' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Communication
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Project Overview */}
          {activeSection === 'overview' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Project Overview</h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Project Type</p>
                  <p className="font-medium">{project.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium">{project.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Submitted Date</p>
                  <p className="font-medium">
                    {new Date(project.submitted).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Creator</p>
                  <p className="font-medium">{project.creator}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Project Description
                </p>
                <p className="text-gray-700">{project.description}</p>
              </div>

              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Review Notes
                </label>
                <textarea
                  className="w-full h-32 p-3 border rounded"
                  placeholder="Add your review notes here..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Document Review */}
          {activeSection === 'documents' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">Document Review</h2>

                {/* Document List */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    Project Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {project.documents.map((doc, index) => (
                      <div
                        key={index}
                        onClick={() => handleDocumentSelect(doc)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedDocument === doc.id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1 line-clamp-2">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {doc.size} • {doc.pages} pages
                            </p>
                            {(documentAnnotations[doc.id] || []).length > 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                {documentAnnotations[doc.id]?.length} annotation
                                {documentAnnotations[doc.id]?.length !== 1
                                  ? 's'
                                  : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="h-[800px]">
                {selectedDocument ? (
                  (() => {
                    const selectedDoc = project.documents.find(
                      (doc) => doc.id === selectedDocument
                    );
                    if (!selectedDoc) return null;

                    return (
                      <PDFViewer
                        url={selectedDoc.url}
                        fileName={selectedDoc.name}
                        annotations={documentAnnotations[selectedDoc.id] || []}
                        onAnnotationChange={(annotations) =>
                          handleAnnotationChange(selectedDoc.id, annotations)
                        }
                      />
                    );
                  })()
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a Document
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Choose a document from the list above to view and
                        annotate
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                          <span>Highlight</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-200 rounded"></div>
                          <span>Note</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-200 rounded"></div>
                          <span>Issue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Checklist */}
          {activeSection === 'checklist' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">
                Verification Checklist
              </h2>

              <div className="space-y-6">
                {['Documentation', 'Technical', 'Financial', 'Compliance'].map(
                  (category) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium mb-3 text-blue-700">
                        {category}
                      </h3>
                      <div className="space-y-3 ml-4">
                        {checklist
                          .filter((item) => item.category === category)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 border rounded"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{item.item}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <select
                                  className="border rounded px-2 py-1 text-sm"
                                  defaultValue={item.status}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">
                                    Needs Revision
                                  </option>
                                </select>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  placeholder="Score"
                                  defaultValue={item.score || ''}
                                  className="w-16 border rounded px-2 py-1 text-sm"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Overall Assessment */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Overall Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Overall Score (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Recommendation
                    </label>
                    <select className="w-full p-2 border rounded">
                      <option>Select recommendation</option>
                      <option>Approve</option>
                      <option>Approve with conditions</option>
                      <option>Request revisions</option>
                      <option>Reject</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Final Comments
                  </label>
                  <textarea
                    className="w-full h-24 p-3 border rounded"
                    placeholder="Provide detailed feedback and recommendations..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Communication */}
          {activeSection === 'communication' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Communication</h2>

              {/* Message Thread */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">SolarTech Inc</span>
                    <span className="text-sm text-gray-500">
                      Jan 15, 2024 10:30 AM
                    </span>
                  </div>
                  <p className="text-gray-700">
                    We have submitted our solar farm project for verification.
                    Please let us know if you need any additional documentation.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">John Smith (Verifier)</span>
                    <span className="text-sm text-gray-500">
                      Jan 16, 2024 2:15 PM
                    </span>
                  </div>
                  <p className="text-gray-700">
                    Thank you for the submission. I have reviewed the initial
                    documents and have some questions about the environmental
                    impact assessment. Could you provide more details on the
                    biodiversity impact study?
                  </p>
                </div>
              </div>

              {/* Send Message */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium mb-2">
                  Send Message
                </label>
                <textarea
                  className="w-full h-24 p-3 border rounded mb-3"
                  placeholder="Type your message here..."
                ></textarea>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Send email notification</span>
                    </label>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
