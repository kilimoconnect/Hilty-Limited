import type { CollectionBeforeChangeHook, Field } from 'payload'

/**
 * Shared, reusable field groups applied across collections to satisfy the
 * Portion 2 requirements: audit timestamps + responsible staff, verification
 * status for claimed/technical info, and consent + retention for personal data.
 */

// ---- Audit (responsible staff member) ----
// Payload adds createdAt/updatedAt automatically; these add WHO.
export const auditFields: Field[] = [
  {
    name: 'createdBy',
    type: 'relationship',
    relationTo: 'users',
    admin: {
      readOnly: true,
      position: 'sidebar',
      description: 'Set automatically to the staff member who created this record.',
    },
  },
  {
    name: 'updatedBy',
    type: 'relationship',
    relationTo: 'users',
    admin: {
      readOnly: true,
      position: 'sidebar',
      description: 'Set automatically to the staff member who last updated this record.',
    },
  },
]

/** beforeChange hook that stamps createdBy / updatedBy from the request user. */
export const setResponsibleStaff: CollectionBeforeChangeHook = ({ req, operation, data }) => {
  if (req.user) {
    if (operation === 'create' && !data.createdBy) data.createdBy = req.user.id
    data.updatedBy = req.user.id
  }
  return data
}

// ---- Verification (for technical / claimed information) ----
export const verificationField: Field = {
  name: 'verification',
  type: 'group',
  admin: {
    position: 'sidebar',
    description:
      'Verification of the information in this record. Unverified content must not be presented to customers as fact.',
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'unverified',
      required: true,
      options: [
        { label: '⚠ Unverified', value: 'unverified' },
        { label: '⏳ Pending review', value: 'pending_review' },
        { label: '✓ Verified', value: 'verified' },
      ],
    },
    { name: 'verifiedBy', type: 'relationship', relationTo: 'users' },
    { name: 'verifiedAt', type: 'date' },
    { name: 'notes', type: 'textarea', admin: { description: 'Source / discrepancy notes.' } },
  ],
}

// ---- Consent (personal-data collections) ----
export const consentField: Field = {
  name: 'consent',
  type: 'group',
  admin: {
    description: 'Record of the consent under which this personal data was collected.',
  },
  fields: [
    { name: 'given', type: 'checkbox', defaultValue: false, label: 'Consent given' },
    {
      name: 'purpose',
      type: 'select',
      defaultValue: 'service_request',
      options: [
        { label: 'Service / quotation request', value: 'service_request' },
        { label: 'Marketing communications', value: 'marketing' },
        { label: 'Painter / contractor registration', value: 'registration' },
        { label: 'Support / complaint handling', value: 'support' },
      ],
    },
    {
      name: 'channel',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Website form', value: 'website' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'AI advisor', value: 'ai_advisor' },
        { label: 'In person', value: 'in_person' },
        { label: 'Phone', value: 'phone' },
        { label: 'Imported', value: 'import' },
      ],
    },
    { name: 'timestamp', type: 'date' },
    { name: 'notes', type: 'textarea' },
  ],
}

// ---- Retention (personal-data collections) ----
export const retentionField: Field = {
  name: 'retention',
  type: 'group',
  admin: {
    position: 'sidebar',
    description: 'Data-retention controls. Records past their retain-until date should be reviewed for deletion.',
  },
  fields: [
    { name: 'retainUntil', type: 'date' },
    {
      name: 'legalBasis',
      type: 'select',
      defaultValue: 'consent',
      options: [
        { label: 'Consent', value: 'consent' },
        { label: 'Contract', value: 'contract' },
        { label: 'Legitimate interest', value: 'legitimate_interest' },
        { label: 'Legal obligation', value: 'legal_obligation' },
      ],
    },
    { name: 'notes', type: 'textarea' },
  ],
}
