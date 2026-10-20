import { useState, useEffect } from 'react'
import { User, Mail, Phone, Briefcase, Award, Link as LinkIcon, FileText, Tag } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'

const STAGES = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
]

export default function CandidateForm({ initialData = null, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    applied_role: '',
    experience_years: '',
    skills: '',
    stage: 'APPLIED',
    resume_url: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        applied_role: initialData.applied_role || '',
        experience_years: initialData.experience_years !== null && initialData.experience_years !== undefined
          ? String(initialData.experience_years)
          : '',
        skills: Array.isArray(initialData.skills)
          ? initialData.skills.join(', ')
          : initialData.skills || '',
        stage: initialData.stage || 'APPLIED',
        resume_url: initialData.resume_url || '',
        notes: initialData.notes || '',
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required.'
    if (!form.email.trim()) newErrors.email = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please provide a valid email address.'
    }
    if (!form.applied_role.trim()) newErrors.applied_role = 'Target job role is required.'
    if (form.experience_years !== '' && form.experience_years !== null) {
      const exp = Number(form.experience_years)
      if (isNaN(exp) || exp < 0) newErrors.experience_years = 'Experience must be 0 or greater.'
    }
    if (form.resume_url && !/^https?:\/\//i.test(form.resume_url.trim())) {
      newErrors.resume_url = 'URL must start with http:// or https://'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      applied_role: form.applied_role.trim(),
      experience_years: form.experience_years === '' ? null : Number(form.experience_years),
      skills: form.skills
        ? form.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      stage: form.stage,
      resume_url: form.resume_url.trim() || null,
      notes: form.notes.trim() || null,
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Candidate Contact Info */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-indigo-500" />
          <span>Contact Information</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            name="full_name"
            placeholder="e.g. Priya Sharma"
            value={form.full_name}
            onChange={handleChange}
            error={errors.full_name}
          />
          <Input
            label="Email Address *"
            name="email"
            type="email"
            placeholder="e.g. priya@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={handleChange}
            className="sm:col-span-2"
          />
        </div>
      </div>

      {/* Section 2: Role, Experience & Stage */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
          <span>Application & Evaluation</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Applied Role *"
            name="applied_role"
            placeholder="e.g. Senior Frontend Engineer"
            value={form.applied_role}
            onChange={handleChange}
            error={errors.applied_role}
            className="sm:col-span-2"
          />
          <Input
            label="Experience (years)"
            name="experience_years"
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 4.5"
            value={form.experience_years}
            onChange={handleChange}
            error={errors.experience_years}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Select
            label="Hiring Stage"
            name="stage"
            value={form.stage}
            onChange={handleChange}
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Input
            label="Skills (comma separated)"
            name="skills"
            placeholder="React, TypeScript, Tailwind"
            value={form.skills}
            onChange={handleChange}
            helperText="Separate multiple skills with commas"
          />
        </div>
      </div>

      {/* Section 3: Resume & Notes */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-indigo-500" />
          <span>Resume & Recruiter Notes</span>
        </h4>
        <div className="space-y-4">
          <Input
            label="Resume or Portfolio URL"
            name="resume_url"
            type="url"
            placeholder="https://drive.google.com/file/... or LinkedIn"
            value={form.resume_url}
            onChange={handleChange}
            error={errors.resume_url}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Internal Evaluation Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Candidate feedback, interview highlights, salary expectations, notice period..."
              className="block w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {initialData ? 'Save Changes' : 'Create Candidate'}
        </Button>
      </div>
    </form>
  )
}

