import React, { useState } from 'react';

interface RegisterFormProps {
  onComplete: (details: RegistrationDetails) => void;
}

export interface RegistrationDetails {
  firstName: string;
  lastName: string;
  address: string;
  postcode: string;
  phone: string;
  age: string;
}

const Field: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'tel';
}> = ({ label, value, placeholder, onChange, type = 'text', inputMode }) => (
  <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-md">
    <span className="font-serif font-bold text-black text-lg whitespace-nowrap">
      {label}:
    </span>
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent outline-none font-serif font-bold text-black placeholder:text-black/80 placeholder:font-bold text-base min-w-0"
    />
  </div>
);

const RegisterForm: React.FC<RegisterFormProps> = ({ onComplete }) => {
  const [d, setD] = useState<RegistrationDetails>({
    firstName: '', lastName: '', address: '', postcode: '', phone: '', age: '',
  });
  const [agreed, setAgreed] = useState(false);

  const canSubmit =
    agreed &&
    d.firstName.trim() &&
    d.lastName.trim() &&
    d.address.trim() &&
    d.postcode.trim() &&
    d.phone.trim() &&
    d.age.trim();

  return (
    <div className="min-h-screen w-full bg-black flex flex-col px-4 pt-6 pb-28">
      <div className="flex flex-col gap-5 flex-1">
        <Field label="First Name" placeholder="Enter your First Name"
          value={d.firstName} onChange={(v) => setD({ ...d, firstName: v })} />
        <Field label="Last Name" placeholder="Enter your Last Name"
          value={d.lastName} onChange={(v) => setD({ ...d, lastName: v })} />
        <Field label="Address" placeholder="Enter your Address"
          value={d.address} onChange={(v) => setD({ ...d, address: v })} />
        <Field label="Postcode" placeholder="Enter your Postcode"
          value={d.postcode} onChange={(v) => setD({ ...d, postcode: v })} />
        <Field label="Phone Number" placeholder="Enter your Phone Number"
          value={d.phone} onChange={(v) => setD({ ...d, phone: v })} type="tel" inputMode="tel" />
        <Field label="Age" placeholder="Enter your Age"
          value={d.age} onChange={(v) => setD({ ...d, age: v })} inputMode="numeric" />

        <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => setAgreed((a) => !a)}
            className={`mt-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 ${agreed ? 'bg-white' : 'bg-transparent'}`}
            aria-pressed={agreed}
            aria-label="Agree to terms"
          >
            {agreed && <span className="w-3 h-3 rounded-full bg-black" />}
          </button>
          <span className="text-white font-serif font-bold text-base leading-snug">
            I have read and agree{' '}
            <span className="text-blue-400 underline">Nurture App's Terms of Service</span>{' '}
            <span className="font-bold">and</span>{' '}
            <span className="text-blue-400 underline">Privacy Notice</span>
          </span>
        </label>
      </div>

      <div className="fixed left-0 right-0 bottom-4 px-6 flex justify-center pointer-events-none">
        <button
          disabled={!canSubmit}
          onClick={() => canSubmit && onComplete(d)}
          className={`pointer-events-auto w-full max-w-md py-5 rounded-2xl font-serif font-bold text-2xl shadow-lg transition ${
            canSubmit
              ? 'bg-[#3a5a8a] text-white active:scale-[0.98]'
              : 'bg-[#3a5a8a]/60 text-white/70 cursor-not-allowed'
          }`}
        >
          Confirm Details
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
