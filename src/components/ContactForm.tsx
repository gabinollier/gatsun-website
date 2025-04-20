"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { sendEmail, FormState } from '@/actions/formAction'; 

const initialFormState: FormState = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-orange-600 active:bg-orange-700 hover:-translate-y-1 text-white font-bold py-3 w-full px-6 rounded-full transition duration-300 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
    >
      {pending ? 'Envoi en cours...' : 'Envoyer la demande'}
    </button>
  );
}

export default function ContactForm() {
  const [formState, formAction] = useActionState(sendEmail, initialFormState);

  return (
    <form action={formAction}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium mb-1">Nom<span className="text-orange-500">*</span></label>
        <input type="text" id="name" name="name" required className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-orange-500"/>
        {formState.errors?.name && <p className="text-red-500 text-xs mt-1">{formState.errors.name.join(', ')}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email<span className="text-orange-500">*</span></label>
        <input type="email" id="email" name="email" required className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-orange-500"/>
         {formState.errors?.email && <p className="text-red-500 text-xs mt-1">{formState.errors.email.join(', ')}</p>}
      </div>
       <div className="mb-4">
        <label htmlFor="availability" className="block text-sm font-medium mb-1">Quelles sont vos disponibilités ?</label>
        <input type="text" id="availability" name="availability" className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-orange-500"/>
      </div>
      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium mb-1">Quel est votre projet ?<span className="text-orange-500">*</span></label>
        <textarea id="message" name="message" rows={4} required className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-orange-500"></textarea>
         {formState.errors?.message && <p className="text-red-500 text-xs mt-1">{formState.errors.message.join(', ')}</p>}
      </div>
      <SubmitButton />
      {formState.message && (
        <p className={`mt-4 text-sm ${formState.success ? 'text-green-500' : 'text-red-500'}`}>
          {formState.message}
        </p>
      )}
    </form>
  );
}