'use client';

import { useUser } from '@clerk/nextjs';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

import {
  UserRegistrationData,
  validateRegistrationStep1,
  validateRegistrationStep2,
  validateRegistrationStep3,
} from '@/lib/validation/user-schema';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const { user: clerkUser, isLoaded } = useUser();
  const upgradeToProjectCreator = useMutation(
    api.users.upgradeToProjectCreator
  );

  // Get existing user data
  const currentUser = useQuery(api.users.getCurrentUser);
  const [formData, setFormData] = useState<UserRegistrationData>({
    // Basic user info from schema
    email: '',
    firstName: '',
    lastName: '',
    role: 'credit_buyer',
    organizationName: '',
    organizationType: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    profileImage: '',

    // Additional fields
    website: '',
    description: '',
    location: '', // For backward compatibility
  });

  // Pre-populate form data with existing user information
  useEffect(() => {
    if (isLoaded && clerkUser) {
      const userData = {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        role: 'credit_buyer' as const,
        organizationName: '',
        organizationType: '',
        phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || '',
        address: '',
        city: '',
        country: '',
        profileImage: clerkUser.imageUrl || '',
        website: '',
        description: '',
        location: '',
      };

      // If we have existing user data from the database, use that instead
      if (currentUser) {
        userData.firstName = currentUser.firstName || userData.firstName;
        userData.lastName = currentUser.lastName || userData.lastName;
        userData.email = currentUser.email || userData.email;
        userData.phoneNumber = currentUser.phoneNumber || userData.phoneNumber;
        userData.address = currentUser.address || userData.address;
        userData.city = currentUser.city || userData.city;
        userData.country = currentUser.country || userData.country;
        userData.organizationName =
          currentUser.organizationName || userData.organizationName;
        userData.organizationType =
          currentUser.organizationType || userData.organizationType;
        userData.profileImage =
          currentUser.profileImage || userData.profileImage;
        userData.role = (currentUser.role as any) || userData.role;
        userData.organizationType =
          (currentUser.organizationType as any) || userData.organizationType;
      }

      setFormData(userData);
    }
  }, [isLoaded, clerkUser, currentUser]);

  const steps = [
    {
      number: 1,
      title: 'Basic Information',
      description: 'Tell us about yourself',
    },
    {
      number: 2,
      title: 'Verification Documents',
      description: 'Upload required documents for verification',
    },
    {
      number: 3,
      title: 'Review & Complete',
      description: 'Review your information and complete registration',
    },
  ];

  const organizationTypes = [
    'Corporation',
    'Non-Profit',
    'Government Agency',
    'Educational Institution',
    'Individual',
    'Startup',
    'Other',
  ];

  // Zod validation function
  const validateStep = (step: number): boolean => {
    let validationResult;
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      validationResult = validateRegistrationStep1(formData);
    } else if (step === 2) {
      validationResult = validateRegistrationStep2({ documentsUploaded: true });
    } else if (step === 3) {
      // Check if terms are accepted (this would need a separate state)
      validationResult = validateRegistrationStep3({ termsAccepted: true });
    }

    if (validationResult && !validationResult.success) {
      validationResult.error.issues.forEach((error: any) => {
        newErrors[error.path[0] as string] = error.message;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setErrors({}); // Clear errors when moving to next step
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({}); // Clear errors when moving to previous step
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      await handleUpgradeToCreator();
      alert(
        'Registration completed! Please check your email for verification.'
      );
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const handleUpgradeToCreator = async () => {
    try {
      setUpgradeLoading(true);
      const result = await upgradeToProjectCreator();
      setShowUpgradeSuccess(true);
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
      console.log('Upgrade successful:', result.message);
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join EcoSprout
          </h1>
          <p className="text-lg text-gray-600">
            Create your account and start making environmental impact
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <span className="text-4xl mr-3">🏢</span>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-blue-900">
                  Credit Buyer Account
                </h3>
                <p className="text-sm text-blue-700">
                  You'll start as a Credit Buyer with access to purchase carbon
                  credits and track your environmental impact.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-semibold ${
                    currentStep >= step.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {step.number}
                </div>
                <div className="text-center mt-2">
                  <p
                    className={`font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}
                  >
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
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className={`w-full p-3 border rounded ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="John"
                        required
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className={`w-full p-3 border rounded ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Doe"
                        required
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className={`w-full p-3 border rounded bg-gray-100 cursor-not-allowed ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="your@email.com"
                      title="Email cannot be modified"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email is pre-filled from your account and cannot be
                      modified
                    </p>
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className={`w-full p-3 border rounded ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Organization Information */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizationName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded"
                      placeholder="Your organization name (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Organization Type
                    </label>
                    <select
                      value={formData.organizationType || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizationType: e.target.value as any,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded"
                    >
                      <option value="">Select organization type</option>
                      {organizationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address Information */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className={`w-full p-3 border rounded ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Street address"
                      required
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className={`w-full p-3 border rounded ${errors.city ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="City"
                        required
                      />
                      {errors.city && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className={`w-full p-3 border rounded ${errors.country ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Country"
                        required
                      />
                      {errors.country && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full h-32 p-3 border border-gray-300 rounded"
                    placeholder="Tell us about yourself or your organization..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Verification Documents */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                Verification Documents
              </h2>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Required Documents
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Business registration or incorporation certificate
                    </li>
                    <li>• Government-issued ID of authorized representative</li>
                    <li>• Proof of address (utility bill or bank statement)</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Business Registration
                    </label>
                    <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded">
                      <p className="text-gray-600 mb-2">
                        Upload business registration
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                      <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm">
                        Choose File
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Government ID
                    </label>
                    <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded">
                      <p className="text-gray-600 mb-2">
                        Upload government-issued ID
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                      <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm">
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded">
                    <p className="text-gray-600 mb-2">
                      Upload additional supporting documents
                    </p>
                    <p className="text-sm text-gray-500">
                      Drag and drop files here or click to browse
                    </p>
                    <button className="mt-4 bg-gray-600 text-white px-6 py-2 rounded">
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Complete */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                Review & Complete Registration
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold mb-3">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Type:</span> Credit Buyer
                      </p>
                      <p>
                        <span className="font-medium">Organization:</span>{' '}
                        {formData.organizationName || 'Individual'}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        {formData.email}
                      </p>
                      <p>
                        <span className="font-medium">Location:</span>{' '}
                        {formData.city}, {formData.country}
                      </p>
                      {formData.website && (
                        <p>
                          <span className="font-medium">Website:</span>{' '}
                          {formData.website}
                        </p>
                      )}
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

                {/* Upgrade to Project Creator Section */}
                {/*<div className="border-t pt-6">*/}
                {/*  <div className="bg-green-50 border border-green-200 rounded-lg p-6">*/}
                {/*    <div className="flex items-start">*/}
                {/*      <span className="text-3xl mr-4">🌱</span>*/}
                {/*      <div className="flex-1">*/}
                {/*        <h3 className="text-lg font-semibold text-green-900 mb-2">*/}
                {/*          Want to Create Carbon Credit Projects?*/}
                {/*        </h3>*/}
                {/*        <p className="text-green-700 mb-4">*/}
                {/*          Upgrade to a Project Creator account to develop and*/}
                {/*          manage your own carbon credit projects. You can*/}
                {/*          upgrade anytime after registration.*/}
                {/*        </p>*/}
                {/*        <button*/}
                {/*          onClick={handleUpgradeToCreator}*/}
                {/*          disabled={upgradeLoading}*/}
                {/*          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"*/}
                {/*        >*/}
                {/*          {upgradeLoading*/}
                {/*            ? 'Upgrading...'*/}
                {/*            : 'Upgrade to Project Creator'}*/}
                {/*        </button>*/}
                {/*        {showUpgradeSuccess && (*/}
                {/*          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded text-green-800 text-sm">*/}
                {/*            ✅ Upgrade request submitted! You'll receive an*/}
                {/*            email with next steps.*/}
                {/*          </div>*/}
                {/*        )}*/}
                {/*      </div>*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*</div>*/}

                <div className="border-t pt-6">
                  <label className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-3" required />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Terms of Service
                      </a>{' '}
                      and
                      <a
                        href="#"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        Privacy Policy
                      </a>
                      . I understand that my account will be subject to
                      verification and may take 2-3 business days to activate.
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
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep === steps.length ? 'Complete Registration' : 'Next'}
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?
            <a
              href="/auth/login"
              className="text-blue-600 hover:underline ml-1"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
