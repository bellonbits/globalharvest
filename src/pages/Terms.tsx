import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import { LegalPage } from './Legal'

export default function Terms() {
  useSeo({ title: 'Terms', description: 'Terms of use for the Global Harvest website.' })
  return (
    <LegalPage title="Terms of Use" updated="[Date to be confirmed]">
      <p>By using the Global Harvest website you agree to these terms. If you do not agree, please do not use the site.</p>

      <h2>Use of the website</h2>
      <p>You agree to use this website lawfully and respectfully, and not to submit false information, spam or harmful content through any form.</p>

      <h2>Events and groups</h2>
      <p>
        Event details, schedules and group times may change. Where content on this site is marked as a sample or placeholder, it is illustrative only and does not represent a confirmed event, schedule or commitment.
      </p>

      <h2>Content</h2>
      <p>
        Text, graphics and the Global Harvest name and SENT mark belong to Global Harvest unless otherwise stated. You are welcome to share our promotional templates to invite others to Global Harvest activities, but please don’t alter the mark or use it to imply endorsement.
      </p>
      <p>Scripture quotations are from widely available English translations and remain the property of their respective copyright holders.</p>

      <h2>Photography credits</h2>
      <p>
        Photography on this site is sourced from Freepik (freepik.com) under the Freepik free licence, which requires attribution. Images include coastal and ocean landscapes, Bible study groups, prayer, worship and community scenes. Replace these with Global Harvest’s own photography where possible.
      </p>

      <h2>Third-party links</h2>
      <p>We are not responsible for the content of external websites linked from this site.</p>

      <h2>Limitation of liability</h2>
      <p>This website is provided “as is”. To the extent permitted by law, Global Harvest is not liable for any loss arising from your use of it.</p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time. Continued use of the site means you accept the updated terms.</p>

      <h2>Contact</h2>
      <p>
        Questions? Please <Link to="/contact">contact us</Link>. [Legal entity name and governing law to be added.]
      </p>
    </LegalPage>
  )
}
