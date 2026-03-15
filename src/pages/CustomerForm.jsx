import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Package, Loader2, ChevronsUpDown } from "lucide-react";
import { firebaseApi } from "@/lib/firebaseApi";
import { QUESTION_OPTIONS } from "@/utils/scoring";

const STEPS = [
  { id: 1, title: "Personal Info", fields: ["full_name", "active_phone", "alternative_phone"] },
  { id: 2, title: "Delivery Address", fields: ["state", "address", "landmark"] },
  { id: 3, title: "Order Details", fields: ["shoe_size"] },
  { id: 4, title: "Shopping Profile", fields: ["buying_for", "shopping_frequency", "bought_shoes_online"] },
  { id: 5, title: "Payment Preferences", fields: ["buying_behavior", "payment_readiness", "delivery_availability", "commitment_preference", "confirmation"] }
];

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara"
];

const initialFormData = {
  full_name: "",
  active_phone: "",
  alternative_phone: "",
  state: "",
  address: "",
  landmark: "",
  shoe_size: "",
  buying_for: "",
  shopping_frequency: "",
  bought_shoes_online: "",
  buying_behavior: "",
  payment_readiness: "",
  delivery_availability: "",
  commitment_preference: "",
  confirmation: false
};

const REQUIRED_FIELD_ERRORS = {
  full_name: "Full name is required.",
  active_phone: "Active phone number is required.",
  state: "Please select your state.",
  address: "Delivery address is required.",
  landmark: "Nearest landmark is required.",
  shoe_size: "Shoe size is required.",
  buying_for: "Please select who you are buying for.",
  shopping_frequency: "Please select how often you shop online.",
  bought_shoes_online: "Please select if you have bought shoes online before.",
  buying_behavior: "Please select the buying behavior that suits you.",
  payment_readiness: "Please select your payment readiness.",
  delivery_availability: "Please select your delivery availability.",
  commitment_preference: "Please select your commitment fee preference.",
  confirmation: "Please confirm your commitment to proceed."
};

const neutralInputClass = "mt-1.5 h-12 rounded-lg border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 shadow-none focus-visible:ring-2 focus-visible:ring-zinc-200";
const neutralTextAreaClass = "mt-1.5 min-h-[100px] rounded-lg border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-none focus-visible:ring-2 focus-visible:ring-zinc-200";
const neutralStateComboboxTriggerClass = "mt-1.5 flex h-12 w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200";
const questionLabelClass = "text-zinc-800 font-semibold";
const questionPromptClass = "text-zinc-800 font-semibold mb-3 block";

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

export default function CustomerForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = () => {
    const step = STEPS[currentStep - 1];
    const stepErrors = {};

    for (const field of step.fields) {
      if (field === "alternative_phone") continue;

      const value = formData[field];
      const isEmpty = field === "confirmation"
        ? !Boolean(value)
        : typeof value === "string"
        ? value.trim() === ""
        : !value;

      if (isEmpty) {
        stepErrors[field] = REQUIRED_FIELD_ERRORS[field] || "This field is required.";
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      step.fields.forEach((field) => {
        delete next[field];
      });

      return { ...next, ...stepErrors };
    });

    return Object.keys(stepErrors).length === 0;
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
    if (!validateStep()) {
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
                setErrors({});
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-100 via-stone-50 to-amber-100/70">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/80 blur-3xl" />
        <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-slate-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(24,24,27,0.08)_1px,transparent_0)] [background-size:20px_20px] opacity-20" />
      </div>

      <div className="relative">
      {/* Header */}
      <header className="bg-white/85 border-b border-zinc-200/70 backdrop-blur-md sticky top-0 z-40">
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
        <Card className="bg-white/90 border-white/70 shadow-[0_24px_60px_-35px_rgba(24,24,27,0.6)] backdrop-blur-md overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="animate-fadeIn">
              {currentStep === 1 && (
                <StepPersonalInfo formData={formData} updateField={updateField} errors={errors} />
              )}
              {currentStep === 2 && (
                <StepDeliveryAddress formData={formData} updateField={updateField} errors={errors} />
              )}
              {currentStep === 3 && (
                <StepOrderDetails formData={formData} updateField={updateField} errors={errors} />
              )}
              {currentStep === 4 && (
                <StepShoppingProfile formData={formData} updateField={updateField} errors={errors} />
              )}
              {currentStep === 5 && (
                <StepPaymentPreferences formData={formData} updateField={updateField} errors={errors} />
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
    </div>
  );
}

// Step Components
function StepPersonalInfo({ formData, updateField, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Personal Information
        </h3>
        <p className="text-sm text-zinc-500">Let us know how to reach you</p>
      </div>
      
      <div className="space-y-4 form-question-stack">
        <div>
          <Label htmlFor="full_name" className={questionLabelClass}>Full Name *</Label>
          <Input
            id="full_name"
            name="full_name"
            aria-label="Full Name"
            value={formData.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            placeholder="Enter your full name"
            className={`${neutralInputClass} ${errors.full_name ? "border-red-400 focus-visible:ring-red-100" : ""}`}
            data-testid="full-name-input"
          />
          <FieldError message={errors.full_name} />
        </div>
        
        <div>
          <Label htmlFor="active_phone" className={questionLabelClass}>Active Phone Number *</Label>
          <Input
            id="active_phone"
            name="active_phone"
            aria-label="Active Phone Number"
            value={formData.active_phone}
            onChange={(e) => updateField("active_phone", e.target.value)}
            placeholder="+234 800 000 0000"
            className={`${neutralInputClass} ${errors.active_phone ? "border-red-400 focus-visible:ring-red-100" : ""}`}
            data-testid="active-phone-input"
          />
          <FieldError message={errors.active_phone} />
        </div>
        
        <div>
          <Label htmlFor="alternative_phone" className={questionLabelClass}>Alternative Phone Number</Label>
          <Input
            id="alternative_phone"
            name="alternative_phone"
            aria-label="Alternative Phone Number"
            value={formData.alternative_phone}
            onChange={(e) => updateField("alternative_phone", e.target.value)}
            placeholder="Optional backup number"
            className={neutralInputClass}
            data-testid="alternative-phone-input"
          />
        </div>
      </div>
    </div>
  );
}

function StepDeliveryAddress({ formData, updateField, errors }) {
  const [isStatePopoverOpen, setIsStatePopoverOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Delivery Address
        </h3>
        <p className="text-sm text-zinc-500">Where should we deliver your order?</p>
      </div>
      
      <div className="space-y-4 form-question-stack">
        <div>
          <Label htmlFor="state" className={questionLabelClass}>State *</Label>
          <Popover open={isStatePopoverOpen} onOpenChange={setIsStatePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                id="state"
                type="button"
                role="combobox"
                aria-expanded={isStatePopoverOpen}
                className={`${neutralStateComboboxTriggerClass} ${formData.state ? "" : "text-zinc-500"} ${errors.state ? "border-red-400 focus-visible:ring-red-100" : ""}`}
                data-testid="state-select"
              >
                <span className="truncate">{formData.state || "Search and select your state"}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search state..." data-testid="state-search-input" />
                <CommandList>
                  <CommandEmpty>No state found.</CommandEmpty>
                  <CommandGroup>
                    {NIGERIAN_STATES.map((state) => (
                      <CommandItem
                        key={state}
                        value={state}
                        onSelect={() => {
                          updateField("state", state);
                          setIsStatePopoverOpen(false);
                        }}
                        data-testid={`state-option-${state.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Check className={`mr-2 h-4 w-4 ${formData.state === state ? "opacity-100" : "opacity-0"}`} />
                        {state}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FieldError message={errors.state} />
        </div>

        <div>
          <Label htmlFor="address" className={questionLabelClass}>Full Delivery Address *</Label>
          <Textarea
            id="address"
            name="address"
            aria-label="Full Delivery Address"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Enter your complete delivery address"
            className={`${neutralTextAreaClass} ${errors.address ? "border-red-400 focus-visible:ring-red-100" : ""}`}
            data-testid="address-input"
          />
          <FieldError message={errors.address} />
        </div>
        
        <div>
          <Label htmlFor="landmark" className={questionLabelClass}>Nearest Landmark *</Label>
          <Input
            id="landmark"
            name="landmark"
            aria-label="Nearest Landmark"
            value={formData.landmark}
            onChange={(e) => updateField("landmark", e.target.value)}
            placeholder="E.g., Near GTBank, Opposite City Mall"
            className={`${neutralInputClass} ${errors.landmark ? "border-red-400 focus-visible:ring-red-100" : ""}`}
            data-testid="landmark-input"
          />
          <FieldError message={errors.landmark} />
        </div>
      </div>
    </div>
  );
}

function StepOrderDetails({ formData, updateField, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Order Details
        </h3>
        <p className="text-sm text-zinc-500">Tell us about the shoes you want</p>
      </div>
      
      <div className="space-y-4 form-question-stack">
        <div>
          <Label htmlFor="shoe_size" className={questionLabelClass}>Size *</Label>
          <Select value={formData.shoe_size} onValueChange={(val) => updateField("shoe_size", val)}>
            <SelectTrigger
              id="shoe_size"
              aria-label="Shoe Size"
              data-testid="shoe-size-input"
              className={`mt-1.5 h-12 rounded-lg border-zinc-300 bg-white text-zinc-900 ${errors.shoe_size ? "border-red-400 focus:ring-red-100" : ""}`}
            >
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              {[40, 41, 42, 43, 44, 45, 46].map((size) => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.shoe_size} />
        </div>
      </div>
    </div>
  );
}

function StepShoppingProfile({ formData, updateField, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Shopping Profile
        </h3>
        <p className="text-sm text-zinc-500">Help us understand your shopping habits</p>
      </div>
      
      <div className="rounded-xl border border-zinc-200 overflow-hidden form-question-stack">
        <div className="p-5 bg-white">
          <Label className={questionPromptClass}>Who are you buying for? *</Label>
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
                    ? "border-zinc-900 bg-zinc-50 shadow-sm"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
                }`}
              >
                <RadioGroupItem value={option} id={`buying_for_${option}`} data-testid={`buying-for-${option.toLowerCase().replace(/\//g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
          <FieldError message={errors.buying_for} />
        </div>

        <div className="p-5 bg-zinc-50 border-t border-zinc-200">
          <Label className={questionPromptClass}>How often do you shop online? *</Label>
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
                    ? "border-zinc-900 bg-white shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                <RadioGroupItem value={option} id={`shopping_frequency_${option}`} data-testid={`shopping-frequency-${option.toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
          <FieldError message={errors.shopping_frequency} />
        </div>

        <div className="p-5 bg-white border-t border-zinc-200">
          <Label className={questionPromptClass}>Have you bought shoes online before? *</Label>
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
                    ? "border-zinc-900 bg-zinc-50 shadow-sm"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
                }`}
              >
                <RadioGroupItem value={option} id={`bought_shoes_online_${option}`} data-testid={`bought-shoes-online-${option.toLowerCase()}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
          <FieldError message={errors.bought_shoes_online} />
        </div>
      </div>
    </div>
  );
}

function StepPaymentPreferences({ formData, updateField, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Payment Preferences
        </h3>
        <p className="text-sm text-zinc-500">Final step - tell us about your payment preferences</p>
      </div>
      
      <div className="rounded-xl border border-zinc-200 overflow-hidden form-question-stack">
        <div className="p-5 bg-white">
          <Label className={questionPromptClass}>When buying shoes online, which describes you best? *</Label>
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
                    ? "border-zinc-900 bg-zinc-50 shadow-sm"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
                }`}
              >
                <RadioGroupItem value={option} id={`buying_behavior_${option}`} data-testid={`buying-behavior-${option.substring(0, 20).toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
          <FieldError message={errors.buying_behavior} />
        </div>

        <div className="p-5 bg-zinc-50 border-t border-zinc-200">
          <Label className={questionPromptClass}>When the shoes arrive, how do you plan to pay? *</Label>
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
                    ? "border-zinc-900 bg-white shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                <RadioGroupItem value={option} id={`payment_readiness_${option}`} data-testid={`payment-readiness-${option.substring(0, 15).toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
          <FieldError message={errors.payment_readiness} />
        </div>

        <div className="p-5 bg-white border-t border-zinc-200">
          <Label className={questionPromptClass}>Will you personally be available to receive the package? *</Label>
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
                    ? "border-zinc-900 bg-zinc-50 shadow-sm"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
                }`}
              >
                <RadioGroupItem value={option} id={`delivery_availability_${option}`} data-testid={`delivery-availability-${option.substring(0, 10).toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
          <FieldError message={errors.delivery_availability} />
        </div>

        <div className="p-5 bg-zinc-50 border-t border-zinc-200">
          <Label className={questionPromptClass}>Commitment fee preference *</Label>
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
                    ? "border-zinc-900 bg-white shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                <RadioGroupItem value={option} id={`commitment_preference_${option}`} data-testid={`commitment-${option.substring(0, 15).toLowerCase().replace(/ /g, '-')}`} />
                <span className="text-sm text-zinc-700">{option}</span>
              </label>
            ))}
          </RadioGroup>
          <FieldError message={errors.commitment_preference} />
        </div>

        <div className="p-5 bg-white border-t border-zinc-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={formData.confirmation}
              onCheckedChange={(checked) => updateField("confirmation", checked)}
              className={`mt-0.5 ${errors.confirmation ? "border-red-500" : ""}`}
              data-testid="confirmation-checkbox"
            />
            <span className="text-sm font-semibold text-zinc-800 leading-relaxed">
              I confirm that I will receive and pay for my Smart Stores order when it arrives. *
            </span>
          </label>
          <FieldError message={errors.confirmation} />
        </div>
      </div>
    </div>
  );
}
