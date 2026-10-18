import { useState, useEffect } from 'react'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'

const STAGES = [
  'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'
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
        experience_years: initialData.experience_years ?? '',
        skills: Array.isArray(initialData.skills) ? initialData.skills.join(', ') : (initialData.skills || ''),
        stage: initialData.stage || 'APPLIED',
        resume_url: initialData.resume_url || '',
        notes: initialData.notes || '',
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.applied_role.trim()) newErrors.applied_role = 'Applied role is required'
    if (form.experience_years !== '' && form.experience_years !== null) {
      const exp = Number(form.experience_years)
      if (isNaN(exp) || exp < 0) newErrors.experience_years = 'Experience must be non-negative'
    }
    if (form.resume_url && !/^https?:\/\//i.test(form.resume_url)) newErrors.resume_url = 'Invalid URL'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = {
      ...form,
      experience_years: form.experience_years === '' ? null : Number(form.experience_years),
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      phone: form.phone || null,
      resume_url: form.resume_url || null,
      notes: form.notes || null,
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name *" name="full_name" value={form.full_name} onChange={handleChange} error={errors.full_name} />
        <Input label="Email *" name="email" value={form.email} onChange={handleChange} error={errors.email} />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <Input label="Applied Role *" name="applied_role" value={form.applied_role} onChange={handleChange} error={errors.applied_role} />
        <Input label="Experience (years)" name="experience_years" type="number" step="0.01" min="0" value={form.experience_years} onChange={handleChange} error={errors.experience_years} />
        <Input label="Skills (comma separated)" name="skills" value={form.skills} onChange={handleChange} />
        <Select label="Stage" name="stage" value={form.stage} onChange={handleChange}>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Input label="Resume URL" name="resume_url" value={form.resume_url} onChange={handleChange} error={errors.resume_url} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  )
}
