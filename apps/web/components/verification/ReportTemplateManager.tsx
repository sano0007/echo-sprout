'use client';

import {
  Copy,
  Download,
  Edit,
  Eye,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';

import type { ReportContent, ReportSection, ReportTemplate } from './types';

interface ReportTemplateManagerProps {
  templates: ReportTemplate[];
  onCreateTemplate: (template: ReportTemplate) => void;
  onUpdateTemplate: (template: ReportTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onDuplicateTemplate: (template: ReportTemplate) => void;
  className?: string;
}

export function ReportTemplateManager({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  className = '',
}: ReportTemplateManagerProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(
    null
  );
  const [viewMode, setViewMode] = useState<'list' | 'preview' | 'edit'>('list');

  const defaultTemplate: ReportTemplate = {
    id: '',
    name: 'New Template',
    description: 'Custom report template',
    type: 'standard',
    sections: [
      {
        id: 'overview',
        title: 'Project Overview',
        order: 1,
        required: true,
        type: 'overview',
        content: [
          { type: 'text', data: 'Project information and summary' },
          { type: 'score_card', data: 'overall_score' },
        ],
      },
      {
        id: 'results',
        title: 'Verification Results',
        order: 2,
        required: true,
        type: 'results',
        content: [
          { type: 'table', data: 'categories_table' },
          { type: 'chart', data: 'score_breakdown' },
        ],
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        order: 3,
        required: false,
        type: 'recommendations',
        content: [
          { type: 'list', data: 'recommendations_list' },
          { type: 'text', data: 'action_items' },
        ],
      },
    ],
    styling: {
      theme: 'professional',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#10b981',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        monospace: 'JetBrains Mono',
      },
    },
  };

  const createNewTemplate = () => {
    const newTemplate = {
      ...defaultTemplate,
      id: `template_${Date.now()}`,
    };
    setEditingTemplate(newTemplate);
    setIsEditing(true);
    setViewMode('edit');
  };

  const editTemplate = (template: ReportTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditing(true);
    setViewMode('edit');
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;

    if (
      editingTemplate.id &&
      templates.find((t) => t.id === editingTemplate.id)
    ) {
      onUpdateTemplate(editingTemplate);
    } else {
      if (!editingTemplate.id) {
        editingTemplate.id = `template_${Date.now()}`;
      }
      onCreateTemplate(editingTemplate);
    }

    setIsEditing(false);
    setEditingTemplate(null);
    setViewMode('list');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingTemplate(null);
    setViewMode('list');
  };

  const duplicateTemplate = (template: ReportTemplate) => {
    const duplicated = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
    };
    onDuplicateTemplate(duplicated);
  };

  const addSection = () => {
    if (!editingTemplate) return;

    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      order: editingTemplate.sections.length + 1,
      required: false,
      type: 'appendix',
      content: [{ type: 'text', data: 'Section content' }],
    };

    setEditingTemplate({
      ...editingTemplate,
      sections: [...editingTemplate.sections, newSection],
    });
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<ReportSection>
  ) => {
    if (!editingTemplate) return;

    setEditingTemplate({
      ...editingTemplate,
      sections: editingTemplate.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    });
  };

  const removeSection = (sectionId: string) => {
    if (!editingTemplate) return;

    setEditingTemplate({
      ...editingTemplate,
      sections: editingTemplate.sections.filter(
        (section) => section.id !== sectionId
      ),
    });
  };

  const addContentToSection = (sectionId: string) => {
    if (!editingTemplate) return;

    const newContent: ReportContent = {
      type: 'text',
      data: 'New content',
    };

    setEditingTemplate({
      ...editingTemplate,
      sections: editingTemplate.sections.map((section) =>
        section.id === sectionId
          ? { ...section, content: [...section.content, newContent] }
          : section
      ),
    });
  };

  const exportTemplate = (template: ReportTemplate) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}_template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(
          e.target?.result as string
        ) as ReportTemplate;
        template.id = `template_${Date.now()}`;
        template.name = `${template.name} (Imported)`;
        onCreateTemplate(template);
      } catch (error) {
        console.error('Error importing template:', error);
      }
    };
    reader.readAsText(file);
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'professional':
        return { primary: '#2563eb', secondary: '#64748b', accent: '#10b981' };
      case 'academic':
        return { primary: '#1e40af', secondary: '#475569', accent: '#059669' };
      case 'minimal':
        return { primary: '#374151', secondary: '#6b7280', accent: '#f59e0b' };
      default:
        return { primary: '#7c3aed', secondary: '#64748b', accent: '#dc2626' };
    }
  };

  const contentTypeOptions = [
    { value: 'text', label: 'Text Content' },
    { value: 'table', label: 'Data Table' },
    { value: 'chart', label: 'Chart/Graph' },
    { value: 'image', label: 'Image' },
    { value: 'list', label: 'Bullet List' },
    { value: 'score_card', label: 'Score Card' },
  ];

  const sectionTypeOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'results', label: 'Results' },
    { value: 'documents', label: 'Documents' },
    { value: 'communications', label: 'Communications' },
    { value: 'audit', label: 'Audit Trail' },
    { value: 'recommendations', label: 'Recommendations' },
    { value: 'appendix', label: 'Appendix' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Report Template Manager
            </h3>
            <p className="text-sm text-gray-500">
              Create and manage custom report templates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
              <Upload className="h-4 w-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importTemplate}
                className="hidden"
              />
            </label>
            <button
              onClick={createNewTemplate}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-3 text-sm font-medium ${
              viewMode === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates List
          </button>
          {selectedTemplate && (
            <button
              onClick={() => setViewMode('preview')}
              className={`px-6 py-3 text-sm font-medium ${
                viewMode === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
          )}
          {isEditing && (
            <button
              onClick={() => setViewMode('edit')}
              className={`px-6 py-3 text-sm font-medium ${
                viewMode === 'edit'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Edit Template
            </button>
          )}
        </nav>
      </div>

      {/* Templates List */}
      {viewMode === 'list' && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setViewMode('preview');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => editTemplate(template)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => duplicateTemplate(template)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => exportTemplate(template)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="capitalize font-medium">
                      {template.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Sections:</span>
                    <span className="font-medium">
                      {template.sections.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Theme:</span>
                    <span className="capitalize font-medium">
                      {template.styling.theme}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.styling.colors.primary }}
                  ></div>
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: template.styling.colors.secondary,
                    }}
                  ></div>
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.styling.colors.accent }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Preview */}
      {viewMode === 'preview' && selectedTemplate && (
        <div className="p-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {selectedTemplate.name}
              </h4>
              <p className="text-gray-600">{selectedTemplate.description}</p>
            </div>

            <div className="space-y-6">
              {selectedTemplate.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div
                    key={section.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">
                      {section.title}
                    </h5>
                    <div className="space-y-2">
                      {section.content.map((content, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {content.type}
                            </span>
                            {section.required && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {content.data}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Editor */}
      {viewMode === 'edit' && editingTemplate && (
        <div className="p-6">
          <div className="space-y-6">
            {/* Template Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <select
                  value={editingTemplate.type}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="summary">Summary</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editingTemplate.description}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Styling Options */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">
                Styling Options
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={editingTemplate.styling.theme}
                    onChange={(e) => {
                      const newColors = getThemeColors(e.target.value);
                      setEditingTemplate({
                        ...editingTemplate,
                        styling: {
                          ...editingTemplate.styling,
                          theme: e.target.value as any,
                          colors: newColors,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="default">Default</option>
                    <option value="professional">Professional</option>
                    <option value="academic">Academic</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={editingTemplate.styling.colors.primary}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        styling: {
                          ...editingTemplate.styling,
                          colors: {
                            ...editingTemplate.styling.colors,
                            primary: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Sections Editor */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900">Template Sections</h5>
                <button
                  onClick={addSection}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </button>
              </div>

              <div className="space-y-4">
                {editingTemplate.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                              updateSection(section.id, {
                                title: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Type
                          </label>
                          <select
                            value={section.type}
                            onChange={(e) =>
                              updateSection(section.id, {
                                type: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {sectionTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={section.required}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  required: e.target.checked,
                                })
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Required
                            </span>
                          </label>
                          <button
                            onClick={() => removeSection(section.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Content Elements
                          </span>
                          <button
                            onClick={() => addContentToSection(section.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Add Content
                          </button>
                        </div>
                        {section.content.map((content, contentIndex) => (
                          <div
                            key={contentIndex}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <select
                              value={content.type}
                              onChange={(e) => {
                                const updatedContent = [...section.content];
                                updatedContent[contentIndex] = {
                                  ...content,
                                  type: e.target.value as any,
                                };
                                updateSection(section.id, {
                                  content: updatedContent,
                                });
                              }}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                            >
                              {contentTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={content.data}
                              onChange={(e) => {
                                const updatedContent = [...section.content];
                                updatedContent[contentIndex] = {
                                  ...content,
                                  data: e.target.value,
                                };
                                updateSection(section.id, {
                                  content: updatedContent,
                                });
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="Content data or description"
                            />
                            <button
                              onClick={() => {
                                const updatedContent = section.content.filter(
                                  (_, i) => i !== contentIndex
                                );
                                updateSection(section.id, {
                                  content: updatedContent,
                                });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={saveTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                Save Template
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
