"use client";

import {useState} from "react";

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [userType, setUserType] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState({
        // Basic user info from schema
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        organizationName: '',
        organizationType: '',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        profileImage: '',

        // Authentication
        password: '',
        confirmPassword: '',

        // Role-specific fields
        verifierSpecialty: [] as string[], // For verifiers

        // Additional fields
        website: '',
        description: '',
        location: '' // For backward compatibility
    });

    const steps = [
        {number: 1, title: "Choose Account Type", description: "Select your role in the carbon credit ecosystem"},
        {number: 2, title: "Basic Information", description: "Tell us about your organization"},
        {number: 3, title: "Verification Documents", description: "Upload required documents for verification"},
        {number: 4, title: "Review & Complete", description: "Review your information and complete registration"}
    ];

    const userTypes = [
        {
            id: 'project_creator',
            title: 'Project Creator',
            description: 'Develop and manage carbon credit projects',
            features: [
                'Register and manage carbon projects',
                'Submit progress reports and updates',
                'Set carbon credit pricing',
                'Monitor project verification'
            ],
            icon: '🌱'
        },
        {
            id: 'credit_buyer',
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

    const verifierSpecialties = [
        'solar',
        'reforestation',
        'wind',
        'biogas',
        'waste_management',
        'mangrove_restoration'
    ];

    const organizationTypes = [
        'Corporation',
        'Non-Profit',
        'Government Agency',
        'Educational Institution',
        'Individual',
        'Startup',
        'Other'
    ];

    // Validation function
    const validateStep = (step: number): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (step === 1) {
            if (!userType) {
                newErrors.userType = 'Please select an account type';
            }
        }

        if (step === 2) {
            if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
            if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Please enter a valid email';
            }
            if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
            if (!formData.address.trim()) newErrors.address = 'Address is required';
            if (!formData.city.trim()) newErrors.city = 'City is required';
            if (!formData.country.trim()) newErrors.country = 'Country is required';

            // Role-specific validation
            if (userType !== 'credit_buyer' && !formData.organizationName.trim()) {
                newErrors.organizationName = 'Organization name is required for this account type';
            }
            if (userType === 'verifier' && formData.verifierSpecialty.length === 0) {
                newErrors.verifierSpecialty = 'Please select at least one specialty area';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
            setErrors({}); // Clear errors when moving to next step
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrors({}); // Clear errors when moving to previous step
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        try {
            // Here you would integrate with Clerk and Convex
            // For now, just show success
            alert('Registration completed! Please check your email for verification.');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    };

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
                                        onClick={() => {
                                            setUserType(type.id);
                                            setFormData({...formData, role: type.id});
                                            if (errors.userType) setErrors({...errors, userType: ''});
                                        }}
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                            userType === type.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : errors.userType ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
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
                            {errors.userType && (
                                <p className="text-red-600 text-sm mt-2">{errors.userType}</p>
                            )}
                        </div>
                    )}

                    {/* Step 2: Basic Information */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {/* Personal Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">First Name *</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                className="w-full p-3 border rounded"
                                                placeholder="John"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Last Name *</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                className="w-full p-3 border rounded"
                                                placeholder="Doe"
                                                required
                                            />
                                        </div>
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
                                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                            className="w-full p-3 border rounded"
                                            placeholder="+1 (555) 123-4567"
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
                                    {/* Organization Information */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Organization Name {userType !== 'credit_buyer' ? '*' : ''}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.organizationName}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                organizationName: e.target.value
                                            })}
                                            className="w-full p-3 border rounded"
                                            placeholder="Your organization name"
                                            required={userType !== 'credit_buyer'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Organization Type</label>
                                        <select
                                            value={formData.organizationType}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                organizationType: e.target.value
                                            })}
                                            className="w-full p-3 border rounded"
                                        >
                                            <option value="">Select organization type</option>
                                            {organizationTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Address Information */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Address *</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full p-3 border rounded"
                                            placeholder="Street address"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">City *</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                className="w-full p-3 border rounded"
                                                placeholder="City"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Country *</label>
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                                className="w-full p-3 border rounded"
                                                placeholder="Country"
                                                required
                                            />
                                        </div>
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
                                </div>
                            </div>

                            {/* Role-specific fields */}
                            {userType === 'verifier' && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-lg font-semibold mb-4">Verifier Specialties</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {verifierSpecialties.map(specialty => (
                                            <label key={specialty} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.verifierSpecialty.includes(specialty)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                verifierSpecialty: [...formData.verifierSpecialty, specialty]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                verifierSpecialty: formData.verifierSpecialty.filter(s => s !== specialty)
                                                            });
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                                <span
                                                    className="text-sm capitalize">{specialty.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Select the project types you have expertise in verifying
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full h-32 p-3 border rounded"
                                        placeholder={
                                            userType === 'project_creator' ? "Describe your organization and your experience with environmental projects..." :
                                                userType === 'verifier' ? "Describe your qualifications and experience in environmental verification..." :
                                                    "Tell us about your organization and sustainability goals..."
                                        }
                                    ></textarea>
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
                                            <p><span
                                                className="font-medium">Location:</span> {formData.city}, {formData.country}
                                            </p>
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
                            onClick={currentStep === steps.length ? handleSubmit : nextStep}
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