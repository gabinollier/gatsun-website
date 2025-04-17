'use server';

import { Resend } from 'resend';
import { z } from 'zod';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = 'ollier.gabin@gmail.com'; // Destination email address

// Define the shape of the form state
export interface FormState {
  message: string;
  success: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
    availability?: string[]; // Added availability field
    _form?: string[]; // General form errors
  };
}

// Define the validation schema using Zod
const ContactFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Le nom est requis.' }),
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
  availability: z.string().trim().optional(), // Availability is optional
  message: z.string().trim().min(1, { message: 'Le message ne peut pas être vide.' }),
});

// Server action to handle form submission
export async function sendEmail(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Validate form fields
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    availability: formData.get('availability'),
    message: formData.get('message'),
  });

  // If validation fails, return errors
  if (!validatedFields.success) {
    return {
      message: 'La validation du formulaire a échoué.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, availability, message } = validatedFields.data;

  // Send email using Resend
  try {
    const { data, error } = await resend.emails.send({
      from: 'Site Gatsun <onboarding@resend.dev>', // Must be a verified domain in Resend (or onboarding@resend.dev for testing) like no-reply@gatsun.fr
      to: [toEmail],
      subject: `[Site Gatsun] Nouveau message de ${name} via le formulaire de contact`,
      replyTo: email, 
      text: `Nom: ${name}\nEmail: ${email}\nDisponibilités: ${availability || 'Non spécifiées'}\n\nMessage:\n${message}\n Ne pas répondre à cet email.`,
      // react: <EmailTemplate name={name} email={email} message={message} availability={availability} />,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        message: `Erreur lors de l'envoi de l'email: ${error.message}`,
        success: false,
        errors: { _form: [error.message] },
      };
    }

    console.log('Email sent successfully:', data);
    return { message: 'Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.', success: true };

  } catch (e) {
    console.error('Error sending email:', e);
    const errorMessage = e instanceof Error ? e.message : 'Une erreur inconnue est survenue.';
    return {
      message: `Erreur serveur lors de l'envoi de l'email: ${errorMessage}`,
      success: false,
      errors: { _form: [errorMessage] },
    };
  }
}