import { z } from 'zod';

export const punchItemSchema = z.object({
  task: z
    .string()
    .min(3, 'Punch item description must be at least 3 characters')
    .max(300, 'Punch item description too long')
    .transform((val) => val.trim()),
  trade: z.string().min(2, 'Trade is required').max(60).default('General Construction'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium')
});

export type PunchItemInput = z.infer<typeof punchItemSchema>;

export const signatureSignOffSchema = z.object({
  signerName: z
    .string()
    .min(2, 'Signer name is required (min 2 characters)')
    .max(100, 'Signer name too long')
    .transform((val) => val.trim()),
  hasDrawn: z.boolean().refine((val) => val === true, {
    message: 'Please provide an authentic digital signature on the glass canvas'
  })
});

export type SignatureSignOffInput = z.infer<typeof signatureSignOffSchema>;

export const jobContractorSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  clientName: z.string().min(2, 'Client name is required (min 2 characters)'),
  clientPhone: z.string().min(7, 'Valid contact phone number required'),
  clientEmail: z.string().email('Valid email address required'),
  locationAddress: z.string().min(5, 'Physical jobsite address is required'),
  currency: z.enum(['USD', 'INR']).default('USD'),
  totalAmount: z.coerce.number().positive('Total contract value must be greater than zero')
});

export type JobContractorInput = z.infer<typeof jobContractorSchema>;

export const milestoneFormSchema = z.object({
  title: z.string().min(3, 'Milestone stage title must be at least 3 characters'),
  description: z.string().max(1000).default(''),
  amount: z.coerce.number().positive('Milestone draw amount must be greater than zero')
});

export type MilestoneFormInput = z.infer<typeof milestoneFormSchema>;
