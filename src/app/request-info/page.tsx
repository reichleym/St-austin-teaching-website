"use client";

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import BannerSection from '@/components/sections/BannerSection';
import { FaAngleRight } from 'react-icons/fa6';
import { useTranslations } from '@/lib/useTranslations';

export default function RequestInfoPage() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    program: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const programs = [
    { value: '', label: 'Select a program...' },
    { value: 'business-administration', label: 'Business Administration' },
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'mba', label: 'Master of Business Administration' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    setFormSuccess(false);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.program) {
      setFormError('Please fill all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/request-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setFormSuccess(true);
        setFormData({ fullName: '', email: '', phone: '', program: '', message: '' });
      } else {
        setFormError(data.error || 'Submission failed. Please try again.');
      }
    } catch (error) {
      setFormError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bannerContent = {
    title: t('requestInfo.title'),
    description: t('requestInfo.subtitle'),
    bgImg: '/bannerImg.jpg'
  };

  if (formSuccess) {
    return (
      <section className="min-h-screen flex items-center justify-center py-25">
        <div className="container text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#1E73BE]">{t('requestInfo.success')}</h1>
          <p className="text-xl mb-8">{t('requestInfo.desc')}</p>
          <Link href="/">
            <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
              Back to Home <FaAngleRight />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <BannerSection {...bannerContent}>
        <p className="text-lg mb-6 max-w-md">{t('requestInfo.desc')}</p>
      </BannerSection>
      <section className="py-25">
        <div className="container">
          <div className="max-w-[700px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('requestInfo.title')}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{formError}</div>}
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  labelText="Full Name *"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
                <Input
                  labelText="Email *"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  labelText="Phone *"
                  name="phone"
                  prependText="📞"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  required
                />
                <Select
                  labelText="Program Interest *"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  required
                >
                  {programs.map((prog) => (
                    <option key={prog.value} value={prog.value}>
                      {prog.label}
                    </option>
                  ))}
                </Select>
              </div>
              
              <label className="mb-2 block text-sm font-medium text-[#333333]">Message (Optional)</label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your educational goals..."
                className="border border-[#BDBDBD] h-[120px] rounded-md p-2.5 w-full bg-white outline-none placeholder:text-[18px] placeholder:font-normal placeholder:text-[#33333380]"
              />
              
              <Button type="submit" variant="primary" className="w-full md:w-auto mx-auto md:ml-0" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Request Information'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

