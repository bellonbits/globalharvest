import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import { LegalPage } from './Legal'

export default function Privacy() {
  useSeo({ title: 'Privacy Policy', description: 'How Global Harvest collects, uses and protects your personal information.' })
  return (
    <LegalPage title="Privacy Policy" updated="[Date to be confirmed]">
      <p>
        Global Harvest (“we”, “us”) respects your privacy. This policy explains what personal information we collect through this website, why we collect it, and the choices you have.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Registration:</strong> name, email, phone number, country, city, age range, preferred language, how you heard about us, your interests and optional details you choose to share.</li>
        <li><strong>Event registration:</strong> name, contact details, country, number of attendees and any special requirements.</li>
        <li><strong>Prayer requests:</strong> your name, email, country and the request itself.</li>
        <li><strong>Contact messages:</strong> your name, email, optional phone number and your message.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To welcome you and connect you with groups, studies and events.</li>
        <li>To send information about Global Harvest activities you agreed to receive.</li>
        <li>To manage event registrations and respond to your messages.</li>
        <li>To pray for requests you submit and, if you ask, to follow up with you.</li>
      </ul>

      <h2>Prayer requests are confidential</h2>
      <p>
        Prayer requests are shared only with the Global Harvest prayer team. They are never published on this website or shared publicly. Stories of answered prayer are only ever published with the explicit written permission of the person involved.
      </p>

      <h2>Legal basis and consent</h2>
      <p>We process your information on the basis of your consent, which you give when you submit a form. You can withdraw consent at any time.</p>

      <h2>Sharing</h2>
      <p>We do not sell your personal information. We share it only with trusted service providers who help us run this website and communicate with you, and only as needed to provide those services.</p>

      <h2>Retention</h2>
      <p>We keep your information only for as long as it is needed for the purposes above, or as required by law.</p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, delete or export your information, and to object to certain processing. To make a request, please use our <Link to="/contact">contact form</Link>.
      </p>

      <h2>Children</h2>
      <p>If you are under 18, please ask a parent or guardian before submitting any personal information.</p>

      <h2>Changes</h2>
      <p>We may update this policy from time to time. The “last updated” date above shows when it last changed.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Please <Link to="/contact">contact us</Link>. [Legal entity name, registered address and data-protection contact to be added.]
      </p>
    </LegalPage>
  )
}
