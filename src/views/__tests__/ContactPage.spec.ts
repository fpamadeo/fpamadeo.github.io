import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ContactPage from '../ContactPage.vue'
import aboutData from '@/data/about.json'
import contactData from '@/data/contact.json'

describe('ContactPage', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(ContactPage)
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  describe('Desktop Layout', () => {
    it('renders the profile name', () => {
      expect(wrapper.find('.profile-name').text()).toBe(aboutData.name)
    })

    it('renders the profile image when provided', () => {
      const img = wrapper.find('.profile-img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe(aboutData.profileImage)
    })

    it('renders the email section with an obfuscated display and real mailto href', () => {
      const emailLink = wrapper.find('.contact-section a.contact-email')
      expect(emailLink.text()).toContain('[firstname][secondname].dev(at)')
      expect(emailLink.attributes('href')).toBe('mailto:' + contactData.email.local + '@' + contactData.email.domain)
    })

    it('renders the LinkedIn section with correct link attributes', () => {
      const sections = wrapper.findAll('.contact-section')
      const linkedinSection = sections.find((s) => s.find('.section-heading').text() === 'LinkedIn')!
      const link = linkedinSection.find('a')

      expect(link.attributes('href')).toBe(contactData.linkedin.url)
      expect(link.text()).toBe(contactData.linkedin.display)
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })

    it('renders the GitHub section with correct link attributes', () => {
      const sections = wrapper.findAll('.contact-section')
      const githubSection = sections.find((s) => s.find('.section-heading').text() === 'GitHub')!
      const link = githubSection.find('a')

      expect(link.attributes('href')).toBe(contactData.github.url)
      expect(link.text()).toBe(contactData.github.display)
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })

    it('renders the resume CTA as a mailto with a subject', () => {
      const sections = wrapper.findAll('.contact-section')
      const resumeSection = sections.find((s) => s.find('.section-heading').text() === 'Résumé by request')!
      const cta = resumeSection.find('a.resume-cta')

      expect(cta.exists()).toBe(true)
      expect(cta.text()).toBe(contactData.resume.display)
      expect(cta.attributes('href')).toBe(
        'mailto:' + contactData.email.local + '@' + contactData.email.domain
          + '?subject=' + encodeURIComponent(contactData.resume.subject),
      )
    })

    it('renders the resume by-request copy', () => {
      const sections = wrapper.findAll('.contact-section')
      const resumeSection = sections.find((s) => s.find('.section-heading').text() === 'Résumé by request')!
      expect(resumeSection.text()).toContain('I no longer post a generic résumé')
    })
  })

  describe('Mobile Layout', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 667,
      })

      wrapper = mount(ContactPage)
    })

    it('renders all contact sections on mobile viewport', () => {
      const headings = wrapper.findAll('.section-heading').map((h) => h.text())
      expect(headings).toContain('Email')
      expect(headings).toContain('LinkedIn')
      expect(headings).toContain('GitHub')
      expect(headings).toContain('Résumé by request')
    })

    it('keeps external links target and rel on mobile', () => {
      const sections = wrapper.findAll('.contact-section')
      const linkedinLink = sections.find((s) => s.find('.section-heading').text() === 'LinkedIn')!.find('a')
      expect(linkedinLink.attributes('target')).toBe('_blank')
      expect(linkedinLink.attributes('rel')).toBe('noopener noreferrer')
    })
  })
})
