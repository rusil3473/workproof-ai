/**
 * WorkProof Form Schemas
 * Standardized using @packages/standards composable template builders and primitives.
 */

import {
  createFormSchema,
  nameField,
  emailField,
  phoneField,
  moneyField,
  registerDomainError,
  z,
} from '@packages/standards';

// Register WorkProof Domain Errors into RFC 7807 Catalog
registerDomainError('PROOF_VERIFICATION_FAILED', {
  status: 422,
  title: 'Cryptographic Proof Verification Failed',
  userHint: 'The ghost overlay pixel delta exceeds the tolerance threshold or the SHA-256 hash was tampered.',
});

registerDomainError('SIGNATURE_CANVAS_EMPTY', {
  status: 400,
  title: 'Signature Required',
  userHint: 'Please provide an authentic digital signature on the glass canvas before submitting sign-off.',
});

registerDomainError('CONTRACTOR_DRAW_EXCEEDED', {
  status: 409,
  title: 'Milestone Draw Exceeds Contract Total',
  userHint: 'Requested draw amount exceeds remaining balance on this contractor agreement.',
});

export const punchItemSchema = createFormSchema({
  task: z
    .string()
    .min(3, 'Punch item description must be at least 3 characters')
    .max(300, 'Punch item description too long')
    .transform((val: string) => val.trim()),
  trade: z.string().min(2, 'Trade is required').max(60).default('General Construction'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
});

export type PunchItemInput = z.infer<typeof punchItemSchema>;

export const signatureSignOffSchema = createFormSchema({
  signerName: nameField('Signer name'),
  hasDrawn: z.boolean().refine((val: boolean) => val === true, {
    message: 'Please provide an authentic digital signature on the glass canvas',
  }),
});

export type SignatureSignOffInput = z.infer<typeof signatureSignOffSchema>;

export const jobContractorSchema = createFormSchema({
  title: nameField('Project title',).min(3, 'Project title must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  clientName: nameField('Client name'),
  clientPhone: phoneField(),
  clientEmail: emailField(),
  locationAddress: z.string().min(5, 'Physical jobsite address is required'),
  currency: z.enum(['USD', 'INR']).default('USD'),
  totalAmount: moneyField(),
});

export type JobContractorInput = z.infer<typeof jobContractorSchema>;

export const milestoneFormSchema = createFormSchema({
  title: nameField('Milestone stage title').min(3, 'Milestone stage title must be at least 3 characters'),
  description: z.string().max(1000).default(''),
  amount: moneyField(),
});

export type MilestoneFormInput = z.infer<typeof milestoneFormSchema>;
