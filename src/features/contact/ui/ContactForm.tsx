'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import { Button, Input, Textarea, toast } from '@/shared/ui/design-system'
import { useRouter } from 'next/navigation'
import { type SubmitEvent, useEffect, useMemo, useState } from 'react'

type ContactFormProps = {
	recipientEmail: string
}

export function ContactForm({ recipientEmail }: ContactFormProps) {
	const router = useRouter()
	const { user, loading } = useAuth()
	const [email, setEmail] = useState('')
	const [subject, setSubject] = useState('')
	const [description, setDescription] = useState('')
	const [hasPrefilledEmail, setHasPrefilledEmail] = useState(false)

	useEffect(() => {
		if (hasPrefilledEmail || !user?.email) return
		setEmail(user.email)
		setHasPrefilledEmail(true)
	}, [hasPrefilledEmail, user?.email])

	const canSubmit = useMemo(() => {
		return Boolean(email.trim() && subject.trim() && description.trim())
	}, [email, subject, description])

	function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
		e.preventDefault()

		if (!canSubmit) {
			toast.error('Please fill in email, subject, and description.')
			return
		}

		if (subject.length <= 100) {
			toast.error(
				'Subject should be 100 characters or less for better email formatting.',
			)
			return
		}

		const body = `From: ${email.trim()}\n\n${description.trim()}`
		const encodedSubject = encodeURIComponent(subject.trim())
		const encodedBody = encodeURIComponent(body.replace(/\n/g, '\r\n'))

		globalThis.location.href = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				type="email"
				label="Your Email"
				placeholder="you@example.com"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				loading={loading}
				required
			/>
			<Input
				type="text"
				label="Subject"
				placeholder="Feature request, feedback, bug report..."
				value={subject}
				onChange={(e) => setSubject(e.target.value)}
				required
			/>
			<Textarea
				label="Description"
				placeholder="Share details so we can help quickly..."
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				rows={5}
				className="field-sizing-content min-h-32"
				required
			/>
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					size="sm"
					variant="outline"
					onClick={() => router.back()}
				>
					Cancel
				</Button>
				<Button type="submit" size="sm" disabled={!canSubmit} variant="primary">
					Open Email Draft
				</Button>
			</div>
		</form>
	)
}
