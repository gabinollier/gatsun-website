'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = 'contact@gatsun.asso-insa-lyon.fr'; 

export interface FormState {
  message: string;
  success: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
    availability?: string[];
    _form?: string[];
  };
}

const ContactFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Le nom est requis.' }),
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
  availability: z.string().trim().optional(), 
  message: z.string().trim().min(1, { message: 'Le message ne peut pas être vide.' }),
});

export async function sendEmail(prevState: FormState, formData: FormData): Promise<FormState> {
  console.debug('sendEmail');
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    availability: formData.get('availability'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: 'La validation du formulaire a échoué.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, availability, message } = validatedFields.data;

  try {
    const { data, error } = await resend.emails.send({
      from: `${name} via gatsun.fr <no-reply@gatsun.fr>`,
      to: [toEmail],
      subject: `[Formulaire de contact] Nouveau message de ${name} via gatsun.fr`,
      replyTo: email, 
      text: `Message envoyé depuis le formulaire de contact de gatsun.fr : \n\nNom: ${name}\nEmail: ${email}\nDisponibilités: ${availability || ''}\n\nMessage:\n${message}`,
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