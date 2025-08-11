"use client";

import {useState} from "react";

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [userType, setUserType] = useState('');
    const [formData, setFormData] = useState({
        organizationName: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
        website: '',
        description: ''
    });

    const steps = [
        {number: 1, title: "Choose Account Type", description: "Select your role in the carbon credit ecosystem"},
        {number: 2, title: "Basic Information", description: "Tell us about your organization"},
        {number: 3, title: "Verification Documents", description: "Upload required documents for verification"},
        {number: 4, title: "Review & Complete", description: "Review your information and complete registration"}
    ];

    const userTypes = [
        {
            id: 'creator',
            title: 'Project Creator',
            description: 'Develop and manage carbon credit projects',
            features: [
                'Register and manage carbon projects',
                'Submit progress reports and updates',
                'Access verification tools',
                'Generate carbon credits'
            ],
            icon: '🌱'
        },
        {
            id: 'buyer',
            title: 'Credit Buyer',
            description: 'Purchase carbon credits for offsetting',
            features: [
                'Browse and purchase carbon credits',
                'Track environmental impact',
                'Download certificates',
                'Monitor project progress'
            ],
            icon: '🏢'
        },
        {
            id: 'verifier',
            title: 'Project Verifier',
            description: 'Verify and validate carbon projects',
            features: [
                'Review project documentation',
                'Conduct verification assessments',
                'Access advanced verification tools',
                'Manage verification workflows'
            ],
            icon: '✅'
        }
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Join EcoSprout</h1>
                    <p className="text-lg text-gray-600">Create your account and start making environmental impact</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        {steps.map(step => (
                            <div key={step.number} className="flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-semibold ${
                                        currentStep >= step.number
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                    {step.number}
                                </div>
                                <div className="text-center mt-2">
                                    <p className={`font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-sm text-gray-500">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                            style={{width: `${(currentStep / steps.length) * 100}%`}}
                        ></div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    {/* Step 1: Choose Account Type */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6">Choose Your Account Type</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {userTypes.map(type => (
                                    <div
                                        key={type.id}
                                        onClick={() => setUserType(type.id)}
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                            userType === type.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="text-center mb-4">
                                            <div className="text-4xl mb-2">{type.icon}</div>
                                            <h3 className="text-xl font-semibold">{type.title}</h3>
                                            <p className="text-gray-600">{type.description}</p>
                                        </div>
                                        <ul className="space-y-2">
                                            {type.features.map((feature, index) => (
                                                <li key={index} className="flex items-center text-sm">
                                                    <span className="text-green-500 mr-2">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Basic Information */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Organization Name *</label>
                                        <input
                                            type="text"
                                            value={formData.organizationName}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                organizationName: e.target.value
                                            })}
                                            className="w-full p-3 border rounded"
                                            placeholder="Your organization name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full p-3 border rounded"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Password *</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full p-3 border rounded"
                                            placeholder="Create a strong password"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                confirmPassword: e.target.value
                                            })}
                                            className="w-full p-3 border rounded"
                                            placeholder="Confirm your password"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Location *</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            className="w-full p-3 border rounded"
                                            placeholder="City, Country"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Website</label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                                            className="w-full p-3 border rounded"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="w-full h-32 p-3 border rounded"
                                            placeholder="Tell us about your organization and goals..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Verification Documents */}
                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6">Verification Documents</h2>
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-blue-900 mb-2">Required Documents</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Business registration or incorporation certificate</li>
                                        <li>• Government-issued ID of authorized representative</li>
                                        <li>• Proof of address (utility bill or bank statement)</li>
                                        {userType === 'verifier' &&
                                            <li>• Professional certifications and qualifications</li>}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Business Registration</label>
                                        <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded">
                                            <p className="text-gray-600 mb-2">Upload business registration</p>
                                            <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                                            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                                Choose File
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Government ID</label>
                                        <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded">
                                            <p className="text-gray-600 mb-2">Upload government-issued ID</p>
                                            <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                                            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                                Choose File
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Additional Documents</label>
                                    <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded">
                                        <p className="text-gray-600 mb-2">Upload additional supporting documents</p>
                                        <p className="text-sm text-gray-500">Drag and drop files here or click to
                                            browse</p>
                                        <button className="mt-4 bg-gray-600 text-white px-6 py-2 rounded">
                                            Browse Files
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Complete */}
                    {currentStep === 4 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6">Review & Complete Registration</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded">
                                        <h3 className="font-semibold mb-3">Account Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span
                                                className="font-medium">Type:</span> {userTypes.find(t => t.id === userType)?.title}
                                            </p>
                                            <p><span
                                                className="font-medium">Organization:</span> {formData.organizationName}
                                            </p>
                                            <p><span className="font-medium">Email:</span> {formData.email}</p>
                                            <p><span className="font-medium">Location:</span> {formData.location}</p>
                                            {formData.website &&
                                                <p><span className="font-medium">Website:</span> {formData.website}</p>}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded">
                                        <h3 className="font-semibold mb-3">Next Steps</h3>
                                        <div className="space-y-2 text-sm">
                                            <p>✅ Email verification link will be sent</p>
                                            <p>✅ Documents will be reviewed (2-3 business days)</p>
                                            <p>✅ Account activation upon approval</p>
                                            <p>✅ Welcome email with getting started guide</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <label className="flex items-start">
                                        <input type="checkbox" className="mt-1 mr-3" required/>
                                        <span className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and 
                      <a href="#" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>. 
                      I understand that my account will be subject to verification and may take 2-3 business days to activate.
                    </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={currentStep === steps.length ? () => alert('Registration completed!') : nextStep}
                            disabled={currentStep === 1 && !userType}
                            className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                        >
                            {currentStep === steps.length ? 'Complete Registration' : 'Next'}
                        </button>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Already have an account?
                        <a href="/auth/login" className="text-blue-600 hover:underline ml-1">Sign in here</a>
                    </p>
                </div>
            </div>
        </div>
    );
}