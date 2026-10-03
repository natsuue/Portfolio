import { useState } from 'react';
import Reveal from './Reveal.jsx';
import { ArrowRight, ArrowUpRight, Check, Copy, GitHub, LinkedIn, Mail, Phone } from './Icons.jsx';
import { contact } from '../data/site.js';
import { emphasize } from '../utils/emphasize.jsx';

const EMPTY = { name: '', email: '', message: '' };

function validate(v) {
  const errors = {};
  if (!v.name.trim()) errors.name = 'Please add your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errors.email = 'Please enter a valid email address.';
  if (v.message.trim().length < 10) errors.message = 'A sentence or two helps — at least 10 characters.';
  return errors;
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const links = [
    { label: 'Email', value: contact.email, href: `mailto:${contact.email}`, Icon: Mail },
    contact.linkedin && { label: 'LinkedIn', value: contact.linkedin.label, href: contact.linkedin.href, Icon: LinkedIn, external: true },
    contact.github && { label: 'GitHub', value: contact.github.label, href: contact.github.href, Icon: GitHub, external: true },
    contact.phone?.public && { label: 'Phone', value: contact.phone.label, href: contact.phone.href, Icon: Phone },
  ].filter(Boolean);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the address is still visible to copy by hand */
    }
  };

  const openMailApp = () => {
    const subject = encodeURIComponent(`Portfolio inquiry from ${values.name.trim()}`);
    const body = encodeURIComponent(`${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`);
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    setStatus({ type: 'info', text: `Your email app should open with the message ready to send. If it doesn’t, write to ${contact.email}.` });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(EMPTY).find((k) => found[k]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    if (!contact.formEndpoint) return openMailApp();

    setSending(true);
    setStatus(null);
    try {
      const res = await fetch(contact.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setValues(EMPTY);
      setStatus({ type: 'success', text: 'Thanks — your message is on its way. I’ll get back to you soon.' });
    } catch {
      setStatus({ type: 'error', text: `Something went wrong sending that. Please email me directly at ${contact.email}.` });
    } finally {
      setSending(false);
    }
  };

  const field = (name, label, props = {}) => {
    const Tag = props.as ?? 'input';
    const { as, ...rest } = props;
    return (
      <div className="field">
        <label htmlFor={`contact-${name}`} className="mono">
          {label}
        </label>
        <Tag
          id={`contact-${name}`}
          name={name}
          value={values[name]}
          onChange={onChange}
          aria-invalid={errors[name] ? 'true' : undefined}
          aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
          {...rest}
        />
        {errors[name] && (
          <p id={`contact-${name}-error`} className="field__error">
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <Reveal className="contact__intro">
          <p className="section-head__label mono">
            <span className="section-head__index">06</span>
            <span className="section-head__rule" aria-hidden="true" />
            Contact
          </p>
          <h2 id="contact-title" className="contact__title">
            {emphasize(contact.title)}
          </h2>
          <p className="contact__blurb">{contact.blurb}</p>

          <ul className="contact__links">
            {links.map(({ label, value, href, Icon, external }) => (
              <li key={label}>
                <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  <span className="contact__link-label mono">
                    <Icon /> {label}
                  </span>
                  <span className="contact__link-value">{value}</span>
                  <ArrowUpRight className="contact__link-arrow" />
                </a>
                {label === 'Email' && (
                  <button type="button" className="copy-btn" onClick={copyEmail}>
                    {copied ? <Check /> : <Copy />}
                    <span className="sr-only">{copied ? 'Email address copied' : 'Copy email address'}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p className="sr-only" aria-live="polite">
            {copied ? 'Email address copied to clipboard.' : ''}
          </p>
        </Reveal>

        <Reveal as="form" className="contact__form" delay={120} onSubmit={onSubmit} noValidate aria-labelledby="form-title">
          <h3 id="form-title" className="contact__form-title">
            Send a message
          </h3>
          {field('name', 'Name', { type: 'text', autoComplete: 'name', required: true })}
          {field('email', 'Email', { type: 'email', autoComplete: 'email', required: true })}
          {field('message', 'Message', { as: 'textarea', rows: 6, required: true, placeholder: 'What are you building?' })}
          <button type="submit" className="btn btn--primary contact__submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send message'} <ArrowRight />
          </button>
          <p className={`form-status${status ? ` form-status--${status.type}` : ''}`} role="status">
            {status?.text}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
