"use client";

import {useState} from "react";

export default function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isGuest, setIsGuest] = useState(false);

    const orderSummary = {
        projectName: "Amazon Rainforest Conservation",
        quantity: 10,
        pricePerCredit: 15,
        subtotal: 150,
        fees: 7.50,
        total: 157.50
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Checkout Form */}
                <div className="space-y-6">
                    {/* Guest/Login Toggle */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center space-x-4 mb-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={!isGuest}
                                    onChange={() => setIsGuest(false)}
                                    className="mr-2"
                                />
                                Continue as logged in user
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={isGuest}
                                    onChange={() => setIsGuest(true)}
                                    className="mr-2"
                                />
                                Checkout as guest
                            </label>
                        </div>

                        {isGuest && (
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full p-3 border rounded"
                            />
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="First Name" className="p-3 border rounded"/>
                            <input type="text" placeholder="Last Name" className="p-3 border rounded"/>
                            <input type="email" placeholder="Email" className="p-3 border rounded col-span-2"/>
                            <input type="tel" placeholder="Phone" className="p-3 border rounded col-span-2"/>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Address" className="w-full p-3 border rounded"/>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="City" className="p-3 border rounded"/>
                                <input type="text" placeholder="State/Province" className="p-3 border rounded"/>
                                <input type="text" placeholder="Postal Code" className="p-3 border rounded"/>
                                <select className="p-3 border rounded">
                                    <option>Select Country</option>
                                    <option>United States</option>
                                    <option>Canada</option>
                                    <option>United Kingdom</option>
                                    <option>Germany</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

                        <div className="space-y-3 mb-4">
                            <label className="flex items-center p-3 border rounded cursor-pointer">
                                <input
                                    type="radio"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-3"
                                />
                                <span>Credit/Debit Card</span>
                            </label>

                            <label className="flex items-center p-3 border rounded cursor-pointer">
                                <input
                                    type="radio"
                                    value="paypal"
                                    checked={paymentMethod === 'paypal'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-3"
                                />
                                <span>PayPal</span>
                            </label>

                            <label className="flex items-center p-3 border rounded cursor-pointer">
                                <input
                                    type="radio"
                                    value="bank"
                                    checked={paymentMethod === 'bank'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-3"
                                />
                                <span>Bank Transfer</span>
                            </label>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="space-y-4">
                                <input type="text" placeholder="Card Number" className="w-full p-3 border rounded"/>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="MM/YY" className="p-3 border rounded"/>
                                    <input type="text" placeholder="CVV" className="p-3 border rounded"/>
                                </div>
                                <input type="text" placeholder="Name on Card" className="w-full p-3 border rounded"/>
                            </div>
                        )}

                        {paymentMethod === 'bank' && (
                            <div className="bg-blue-50 p-4 rounded">
                                <p className="text-sm">Bank transfer instructions will be provided after order
                                    confirmation.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:sticky lg:top-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between">
                                <span>{orderSummary.projectName}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{orderSummary.quantity} credits × ${orderSummary.pricePerCredit}</span>
                                <span>${orderSummary.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Processing fees</span>
                                <span>${orderSummary.fees}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>${orderSummary.total}</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-start">
                                <input type="checkbox" className="mr-2 mt-1"/>
                                <span className="text-sm text-gray-600">
                  I agree to the terms and conditions and privacy policy
                </span>
                            </label>
                        </div>

                        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 mb-3">
                            Complete Purchase
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">🔒 Secure checkout</p>
                            <p className="text-xs text-gray-500">
                                Your payment information is encrypted and secure
                            </p>
                        </div>
                    </div>

                    {/* Certificate Preview */}
                    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                        <h4 className="font-semibold mb-3">Your Certificate</h4>
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded border">
                            <p className="text-sm text-gray-600 mb-2">Carbon Credit Certificate</p>
                            <p className="font-medium">10 Carbon Credits</p>
                            <p className="text-sm text-gray-600">Amazon Rainforest Conservation</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Automatically generated after purchase
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}