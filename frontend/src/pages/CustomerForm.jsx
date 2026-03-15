import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Package, Loader2 } from "lucide-react";
import { firebaseApi } from "@/lib/firebaseApi";
import { QUESTION_OPTIONS } from "@/utils/scoring";

const STEPS = [
  { id: 1, title: "Personal Info", fields: ["full_name", "active_phone", "alternative_phone"] },
  { id: 2, title: "Delivery Address", fields: ["address", "landmark"] },
  { id: 3, title: "Order Details", fields: ["shoe_model", "shoe_size", "shoe_color"] },
  { id: 4, title: "Shopping Profile", fields: ["buying_for", "shopping_frequency", "bought_shoes_online"] },
  { id: 5, title: "Payment Preferences", fields: ["buying_behavior", "payment_readiness", "delivery_availability", "commitment_preference", "confirmation"] }
];

const initialFormData = {
  full_name: "",
  active_phone: "",
  alternative_phone: "",
  address: "",
  landmark: "",
  shoe_model: "",
  shoe_size: "",
  shoe_color: "",
  buying_for: "",
  shopping_frequency: "",
  bought_shoes_online: "",
  buying_behavior: "",
  payment_readiness: "",
  delivery_availability: "",
  commitment_preference: "",
  confirmation: false
};

export default function CustomerForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    const step = STEPS[currentStep - 1];
    for (const field of step.fields) {
      if (field === "alternative_phone" || field === "confirmation") continue;
      if (!formData[field]) {
        toast.error("Please fill in all required fields");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.confirmation) {
      toast.error("Please confirm the commitment to proceed");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await firebaseApi.createSubmission(formData);
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl shadow-zinc-200/50 border-zinc-100 animate-slideUp">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Application Received
            </h2>
            <p className="text-zinc-600 mb-6">
              Thank you for submitting your POD verification request. We will review your application and get back to you shortly.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setFormData(initialFormData);
                setCurrentStep(1);
              }}
              variant="outline"
              className="w-full"
              data-testid="submit-another-btn"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-zinc-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Smart Stores
            </span>
          </div>
          <span className="text-sm text-zinc-500">POD Verification</span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  currentStep > step.id
                    ? "bg-zinc-900 text-white"
                    : currentStep === step.id
                    ? "bg-zinc-900 text-white ring-4 ring-zinc-200"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
                    currentStep > step.id ? "bg-zinc-900" : "bg-zinc-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-500 text-center mt-4">
          Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-xl shadow-zinc-200/50 border-zinc-100 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="animate-fadeIn">
              {currentStep === 1 && (
                <StepPersonalInfo formData={formData} updateField={updateField} />
              )}
              {currentStep === 2 && (
                <StepDeliveryAddress formData={formData} updateField={updateField} />
              )}
              {currentStep === 3 && (
                <StepOrderDetails formData={formData} updateField={updateField} />
              )}
              {currentStep === 4 && (
                <StepShoppingProfile formData={formData} updateField={updateField} />
              )}
              {currentStep === 5 && (
                <StepPaymentPreferences formData={formData} updateField={updateField} />
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-zinc-100">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
                data-testid="prev-step-btn"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button onClick={nextStep} className="gap-2 bg-zinc-900 hover:bg-zinc-800" data-testid="next-step-btn">
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 bg-zinc-900 hover:bg-zinc-800"
                  data-testid="submit-form-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Step Components
function StepPersonalInfo({ formData, updateField }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Personal Information
        </h3>
        <p className="text-sm text-zinc-500">Let us know how to reach you</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name" className="text-zinc-700">Full Name *</Label>
          <Input
            id="full_name"
            name="full_name"
            aria-label="Full Name"
            value={formData.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            placeholder="Enter your full name"
            className="mt-1.5 h-12"
            data-testid="full-name-input"
          />
        </div>
        
        <div>
          <Label htmlFor="active_phone" className="text-zinc-700">Active Phone Number *</Label>
          <Input
            id="active_phone"
            name="active_phone"
            aria-label="Active Phone Number"
            value={formData.active_phone}
            onChange={(e) => updateField("active_phone", e.target.value)}
            placeholder="+234 800 000 0000"
            className="mt-1.5 h-12"
            data-testid="active-phone-input"
          />
        </div>
        
        <div>
          <Label htmlFor="alternative_phone" className="text-zinc-700">Alternative Phone Number</Label>
          <Input
            id="alternative_phone"
            name="alternative_phone"
            aria-label="Alternative Phone Number"
            value={formData.alternative_phone}
            onChange={(e) => updateField("alternative_phone", e.target.value)}
            placeholder="Optional backup number"
            className="mt-1.5 h-12"
            data-testid="alternative-phone-input"
          />
        </div>
      </div>
    </div>
  );
}

function StepDeliveryAddress({ formData, updateField }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Delivery Address
        </h3>
        <p className="text-sm text-zinc-500">Where should we deliver your order?</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="address" className="text-zinc-700">Full Delivery Address *</Label>
          <textarea
            id="address"
            name="address"
            aria-label="Full Delivery Address"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Enter your complete delivery address"
            className="mt-1.5 w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            data-testid="address-input"
          />
        </div>
        
        <div>
          <Label htmlFor="landmark" className="text-zinc-700">Nearest Landmark *</Label>
          <Input
            id="landmark"
            name="landmark"
            aria-label="Nearest Landmark"
            value={formData.landmark}
            onChange={(e) => updateField("landmark", e.target.value)}
            placeholder="E.g., Near GTBank, Opposite City Mall"
            className="mt-1.5 h-12"
            data-testid="landmark-input"
          />
        </div>
      </div>
    </div>
  );
}

function StepOrderDetails({ formData, updateField }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Order Details
        </h3>
        <p className="text-sm text-zinc-500">Tell us about the shoes you want</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="shoe_model" className="text-zinc-700">Shoe Model *</Label>
          <Input
            id="shoe_model"
            name="shoe_model"
            aria-label="Shoe Model"
            value={formData.shoe_model}
            onChange={(e) => updateField("shoe_model", e.target.value)}
            placeholder="E.g., Nike Air Max, Adidas Superstar"
            className="mt-1.5 h-12"
            data-testid="shoe-model-input"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shoe_size" className="text-zinc-700">Size *</Label>
            <Input
              id="shoe_size"
              name="shoe_size"
              aria-label="Shoe Size"
              value={formData.shoe_size}
              onChange={(e) => updateField("shoe_size", e.target.value)}
              placeholder="E.g., 42, US 9"
              className="mt-1.5 h-12"
              data-testid="shoe-size-input"
            />
          </div>
          
          <div>
            <Label htmlFor="shoe_color" className="text-zinc-700">Color *</Label>
            <Input
              id="shoe_color"
              name="shoe_color"
              aria-label="Shoe Color"
              value={formData.shoe_color}
              onChange={(e) => updateField("shoe_color", e.target.value)}
              placeholder="E.g., Black, White"
              className="mt-1.5 h-12"
              data-testid="shoe-color-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShoppingProfile({ formData, updateField }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Shopping Profile
        </h3>
        <p className="text-sm text-zinc-500">Help us understand your shopping habits</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-zinc-700 mb-3 block">Who are you buying for? *</Label>
          <RadioGroup
            value={formData.buying_for}
            onValueChange={(value) => updateField("buying_for", value)}
            className="space-y-2"
          >
            {QUESTION_OPTIONS.buying_for.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.buying_for === option
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <RadioGroupItem value={option} id={`buying_for_${option}`} data-testid={`buying-for-${option.toLowerCase().replace(/\//g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        
        <div>
          <Label className="text-zinc-700 mb-3 block">How often do you shop online? *</Label>
          <RadioGroup
            value={formData.shopping_frequency}
            onValueChange={(value) => updateField("shopping_frequency", value)}
            className="space-y-2"
          >
            {QUESTION_OPTIONS.shopping_frequency.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.shopping_frequency === option
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <RadioGroupItem value={option} id={`shopping_frequency_${option}`} data-testid={`shopping-frequency-${option.toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        
        <div>
          <Label className="text-zinc-700 mb-3 block">Have you bought shoes online before? *</Label>
          <RadioGroup
            value={formData.bought_shoes_online}
            onValueChange={(value) => updateField("bought_shoes_online", value)}
            className="space-y-2"
          >
            {QUESTION_OPTIONS.bought_shoes_online.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.bought_shoes_online === option
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <RadioGroupItem value={option} id={`bought_shoes_online_${option}`} data-testid={`bought-shoes-online-${option.toLowerCase()}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

function StepPaymentPreferences({ formData, updateField }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Payment Preferences
        </h3>
        <p className="text-sm text-zinc-500">Final step - tell us about your payment preferences</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-zinc-700 mb-3 block">When buying shoes online, which describes you best? *</Label>
          <RadioGroup
            value={formData.buying_behavior}
            onValueChange={(value) => updateField("buying_behavior", value)}
            className="space-y-2"
          >
            {QUESTION_OPTIONS.buying_behavior.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.buying_behavior === option
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <RadioGroupItem value={option} id={`buying_behavior_${option}`} data-testid={`buying-behavior-${option.substring(0, 20).toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        
        <div>
          <Label className="text-zinc-700 mb-3 block">When the shoes arrive, how do you plan to pay? *</Label>
          <RadioGroup
            value={formData.payment_readiness}
            onValueChange={(value) => updateField("payment_readiness", value)}
            className="space-y-2"
          >
            {QUESTION_OPTIONS.payment_readiness.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.payment_readiness === option
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <RadioGroupItem value={option} id={`payment_readiness_${option}`} data-testid={`payment-readiness-${option.substring(0, 15).toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        
        <div>
          <Label className="text-zinc-700 mb-3 block">Will you personally be available to receive the package? *</Label>
          <RadioGroup
            value={formData.delivery_availability}
            onValueChange={(value) => updateField("delivery_availability", value)}
            className="space-y-2"
          >
            {QUESTION_OPTIONS.delivery_availability.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.delivery_availability === option
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <RadioGroupItem value={option} id={`delivery_availability_${option}`} data-testid={`delivery-availability-${option.substring(0, 10).toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        
        <div>
          <Label className="text-zinc-700 mb-3 block">Commitment fee preference *</Label>
          <RadioGroup
            value={formData.commitment_preference}
            onValueChange={(value) => updateField("commitment_preference", value)}
            className="space-y-2"
          >
            {QUESTION_OPTIONS.commitment_preference.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.commitment_preference === option
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <RadioGroupItem value={option} id={`commitment_preference_${option}`} data-testid={`commitment-${option.substring(0, 15).toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        
        {/* Confirmation */}
        <div className="pt-4 border-t border-zinc-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={formData.confirmation}
              onCheckedChange={(checked) => updateField("confirmation", checked)}
              className="mt-0.5"
              data-testid="confirmation-checkbox"
            />
            <span className="text-sm text-zinc-700 leading-relaxed">
              I confirm that I will receive and pay for my Smart Stores order when it arrives. *
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
