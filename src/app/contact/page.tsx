import { ContactForm } from '@/features/contact/ui/ContactForm'
import type { Metadata } from 'next'

const CONTACT_EMAIL = 'namandeepsp@gmail.com'

export const metadata: Metadata = {
	title: 'Contact DevSnippets',
	description:
		'Reach out to the DevSnippets team with feedback, feature requests, or support questions.',
	alternates: {
		canonical: '/contact',
	},
}

export default function ContactPage() {
	return (
		<main className="mx-auto max-w-3xl px-4 py-12">
			<section className="rounded-2xl border border-default/70 bg-background p-6 sm:p-8">
				<div className="mb-6 space-y-2">
					<p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
						Contact
					</p>
					<h1 className="text-3xl font-bold tracking-tight">Email Us</h1>
				</div>
				<ContactForm recipientEmail={CONTACT_EMAIL} />
			</section>
		</main>
	)
}
