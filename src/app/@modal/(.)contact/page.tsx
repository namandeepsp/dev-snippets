import { ContactForm } from '@/features/contact/ui/ContactForm'
import { ContactModal } from '@/features/contact/ui/ContactModal'

const CONTACT_EMAIL = 'namandeepsp@gmail.com'

export default function ContactModalPage() {
	return (
		<ContactModal>
			<ContactForm recipientEmail={CONTACT_EMAIL} />
		</ContactModal>
	)
}
